import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';
import { createSandboxWithMCP, closeSandbox } from './sandbox-manager.js';
import { tools, type AgentContext } from '../agent/tools.js';
import { uploadImage } from './image-uploader.js';
import { updateJob, addJobLog } from '../utils/job-store.js';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

export async function runAgent(
    jobId: string,
    imageBase64: string,
    mimeType: string,
    imagePath: string // We need the path to upload it later
): Promise<void> {
    console.log(`🤖 Starting Agent for job ${jobId}`);

    updateJob(jobId, {
        status: 'analyzing',
        progress: 10,
        currentStep: 'Initializing Agent & Sandbox...',
    });
    addJobLog(jobId, 'Initializing Agent & Sandbox...');

    // 1. Create Sandbox (Agent's Environment)
    const sandboxInstance = await createSandboxWithMCP();

    try {
        // 2. Upload image to get a URL for the ticket
        updateJob(jobId, { progress: 20, currentStep: 'Uploading screenshot...' });
        addJobLog(jobId, 'Uploading screenshot to storage...');
        const uploadResult = await uploadImage(imagePath);
        const screenshotUrl = uploadResult.url;
        addJobLog(jobId, 'Screenshot uploaded successfully.');

        // 3. Initialize Agent Context
        const context: AgentContext = {
            sandbox: sandboxInstance.sandbox,
            screenshotUrl,
        };

        // 4. Initialize Gemini Model with Tools
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            tools: [{
                functionDeclarations: tools.map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters,
                }))
            }]
        });

        // 5. Start Chat Session
        const chat = model.startChat();

        const prompt = `You are an expert QA engineer agent. Your goal is to analyze the provided screenshot, investigate any issues, and create a detailed bug ticket in Linear.

        Here is the plan:
        1. Analyze the screenshot carefully. Look for visual bugs, error messages, and URLs.
        2. If you see a URL, use the 'explore_url' tool to visit it in the sandbox and gather more context (console errors, network logs).
        3. Once you have enough information, use the 'create_linear_ticket' tool to file the bug.
        4. The ticket description should be in Markdown and include:
           - A clear summary of the issue
           - Steps to reproduce (inferred)
           - Any error messages found
           - Context from the sandbox (if any)
        
        Do not ask for clarification. Just proceed with the best course of action.`;

        updateJob(jobId, { progress: 30, currentStep: 'Agent analyzing screenshot...' });
        addJobLog(jobId, 'Agent is analyzing the screenshot...');

        // Send initial message with image
        let result = await chat.sendMessage([
            prompt,
            {
                inlineData: {
                    mimeType,
                    data: imageBase64,
                },
            },
        ]);

        // 6. Agent Loop (Handle Tool Calls)
        let loopCount = 0;
        const MAX_LOOPS = 5;

        while (loopCount < MAX_LOOPS) {
            const response = await result.response;
            const functionCalls = response.functionCalls();

            if (functionCalls && functionCalls.length > 0) {
                // Execute tools
                const functionResponses = [];

                for (const call of functionCalls) {
                    const tool = tools.find(t => t.name === call.name);
                    if (tool) {
                        const stepDescription = `Agent executing tool: ${tool.name}`;
                        updateJob(jobId, {
                            progress: 30 + (loopCount * 10),
                            currentStep: stepDescription
                        });
                        addJobLog(jobId, stepDescription);

                        try {
                            // Update status for frontend stepper
                            if (call.name === 'create_linear_ticket') {
                                updateJob(jobId, {
                                    status: 'creating-ticket',
                                    progress: 85,
                                    currentStep: 'Creating Linear ticket...',
                                });
                                addJobLog(jobId, 'Preparing to create Linear ticket...');
                            }

                            const toolResult = await tool.execute(call.args, context);
                            addJobLog(jobId, `Tool ${tool.name} completed successfully.`);
                            functionResponses.push({
                                functionResponse: {
                                    name: call.name,
                                    response: { result: toolResult }
                                }
                            });

                            // If ticket was created, we are done!
                            if (call.name === 'create_linear_ticket') {
                                updateJob(jobId, {
                                    status: 'completed',
                                    progress: 100,
                                    currentStep: 'Done!',
                                    ticketUrl: toolResult.url,
                                    ticketId: toolResult.identifier,
                                });
                                addJobLog(jobId, `Ticket created: ${toolResult.identifier}`);
                                return; // Exit successfully
                            }

                        } catch (error) {
                            console.error(`Error executing tool ${call.name}:`, error);
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            addJobLog(jobId, `Error executing tool ${call.name}: ${errorMessage}`);
                            functionResponses.push({
                                functionResponse: {
                                    name: call.name,
                                    response: { error: errorMessage }
                                }
                            });
                        }
                    }
                }

                // Send tool outputs back to model
                result = await chat.sendMessage(functionResponses);
            } else {
                // Model didn't call a tool, maybe it's asking a question or done?
                // For this autonomous agent, if it stops calling tools without creating a ticket, we might want to prompt it to finish.
                // But usually it will just output text.
                const text = response.text();
                console.log('Agent response:', text);
                addJobLog(jobId, `Agent thought: ${text.substring(0, 100)}...`);

                // If it didn't create a ticket yet, we prompt it to do so if it seems done
                if (loopCount === MAX_LOOPS - 1) {
                    console.warn('Agent reached max loops without creating ticket.');
                    // Fallback or error handling could go here
                }

                // If it just output text, we continue the loop to see if it wants to do more
                // But we need to send *something* back or just break if it's truly done.
                // For now, let's assume if it stops calling tools, it's waiting for user input (which we don't support yet) or finished.
                // Since we want it to create a ticket, we can check if it thinks it's done.
                break;
            }
            loopCount++;
        }

    } catch (error) {
        console.error('Agent error:', error);
        updateJob(jobId, {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            currentStep: 'Agent failed',
        });
    } finally {
        await closeSandbox(sandboxInstance.sandbox);
    }
}
