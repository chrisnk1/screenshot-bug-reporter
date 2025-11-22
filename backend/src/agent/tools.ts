import { Sandbox } from 'e2b';
import { createLinearIssue } from '../services/linear-client.js';
import { gatherBrowserContext } from '../services/browserbase-context.js';
import type { BugAnalysis } from '../types.js';

export interface AgentTool {
    name: string;
    description: string;
    parameters: any;
    execute: (args: any, context: AgentContext) => Promise<any>;
}

export interface AgentContext {
    sandbox: Sandbox;
    screenshotUrl?: string; // URL of the uploaded screenshot
}

export const exploreUrlTool: AgentTool = {
    name: 'explore_url',
    description: 'Use the E2B sandbox to visit a URL and gather context (console errors, network logs, etc). Use this when you see a URL in the screenshot that needs investigation.',
    parameters: {
        type: 'object',
        properties: {
            url: {
                type: 'string',
                description: 'The URL to explore',
            },
        },
        required: ['url'],
    },
    execute: async ({ url }: { url: string }, context: AgentContext) => {
        console.log(`🤖 Agent exploring URL: ${url}`);
        // We wrap the sandbox in the structure expected by gatherBrowserContext
        // In the future, this will include MCP details
        const sandboxInstance = { sandbox: context.sandbox };
        return await gatherBrowserContext(sandboxInstance, url);
    },
};

export const createTicketTool: AgentTool = {
    name: 'create_linear_ticket',
    description: 'Create a bug ticket in Linear. Call this when you have analyzed the screenshot and gathered enough context.',
    parameters: {
        type: 'object',
        properties: {
            title: { type: 'string', description: 'Concise bug title' },
            description: { type: 'string', description: 'Detailed bug description in Markdown' },
            priority: { type: 'number', description: 'Priority (0=No Priority, 1=Urgent, 2=High, 3=Normal, 4=Low)' },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            errorMessages: { type: 'array', items: { type: 'string' } },
            urls: { type: 'array', items: { type: 'string' } },
            suggestedLabels: { type: 'array', items: { type: 'string' } },
            uiState: { type: 'string', description: 'Description of the UI state' },
        },
        required: ['title', 'description', 'priority', 'severity'],
    },
    execute: async (args: any, context: AgentContext) => {
        console.log(`🤖 Agent creating Linear ticket: ${args.title}`);

        // Map agent args to BugAnalysis structure for the formatter/client
        const analysis: BugAnalysis = {
            title: args.title,
            description: args.description, // We might need to parse this if the agent puts the whole body here
            errorMessages: args.errorMessages || [],
            urls: args.urls || [],
            severity: args.severity,
            suggestedLabels: args.suggestedLabels || [],
            uiState: args.uiState || '',
        };

        // We construct the ticket data directly
        const ticketData = {
            title: analysis.title,
            description: analysis.description, // The agent should generate the full markdown description
            priority: args.priority,
            labels: analysis.suggestedLabels,
        };

        // If we have a screenshot URL in the context, append it to the description
        if (context.screenshotUrl) {
            ticketData.description += `\n\n## Screenshot\n![Screenshot](${context.screenshotUrl})`;
        }

        return await createLinearIssue(ticketData);
    },
};

export const tools = [exploreUrlTool, createTicketTool];
