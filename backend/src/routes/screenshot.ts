import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import sharp from 'sharp';
import { analyzeScreenshot } from '../services/vision-analyzer.js';
import { uploadImage } from '../services/image-uploader.js';
import { createLinearIssue } from '../services/linear-client.js';
import { formatTicket } from '../utils/ticket-formatter.js';
import { createJob, updateJob, getJob } from '../utils/job-store.js';

export function registerScreenshotRoutes(fastify: FastifyInstance) {
    /**
     * POST /api/screenshot
     * Upload a screenshot and start processing
     */
    fastify.post('/api/screenshot', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const data = await request.file();

            if (!data) {
                return reply.code(400).send({ error: 'No screenshot file provided' });
            }

            // Validate file type
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(data.mimetype)) {
                return reply.code(400).send({ error: 'Invalid file type. Only images are allowed.' });
            }

            // Save file to temp location
            const buffer = await data.toBuffer();
            const tempPath = `/tmp/screenshot-${uuidv4()}.${data.mimetype.split('/')[1]}`;
            await fs.writeFile(tempPath, buffer);

            const jobId = uuidv4();
            const job = createJob(jobId);

            // Start processing asynchronously
            processScreenshot(jobId, tempPath, data.mimetype).catch(error => {
                console.error(`Error processing job ${jobId}:`, error);
                updateJob(jobId, {
                    status: 'failed',
                    error: error instanceof Error ? error.message : 'Unknown error',
                    progress: 0,
                });
            });

            return {
                jobId,
                status: job.status,
                message: 'Screenshot uploaded successfully. Processing started.',
            };
        } catch (error) {
            console.error('Error handling upload:', error);
            return reply.code(500).send({
                error: 'Failed to process upload',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    });

    /**
     * GET /api/screenshot/:jobId
     * Get the status of a processing job
     */
    fastify.get<{ Params: { jobId: string } }>(
        '/api/screenshot/:jobId',
        async (request, reply) => {
            const { jobId } = request.params;
            const job = getJob(jobId);

            if (!job) {
                return reply.code(404).send({ error: 'Job not found' });
            }

            return job;
        }
    );
}

/**
 * Process a screenshot through the entire pipeline
 */
async function processScreenshot(jobId: string, imagePath: string, mimeType: string): Promise<void> {
    try {
        // Step 1: Optimize image
        updateJob(jobId, {
            status: 'analyzing',
            progress: 10,
            currentStep: 'Optimizing image...',
        });

        const optimizedPath = await optimizeImage(imagePath);

        // Step 2: Analyze with vision AI
        updateJob(jobId, {
            progress: 20,
            currentStep: 'Analyzing screenshot with AI...',
        });

        const imageBuffer = await fs.readFile(optimizedPath);
        const base64Image = imageBuffer.toString('base64');
        const analysis = await analyzeScreenshot(base64Image, mimeType);

        updateJob(jobId, {
            progress: 50,
            bugAnalysis: analysis,
            currentStep: 'Bug analysis complete',
        });

        // Step 3: Upload screenshot
        updateJob(jobId, {
            status: 'creating-ticket',
            progress: 60,
            currentStep: 'Uploading screenshot...',
        });

        const uploadResult = await uploadImage(optimizedPath);

        // Step 4: Format ticket
        updateJob(jobId, {
            progress: 70,
            currentStep: 'Formatting ticket...',
        });

        const ticketData = formatTicket(analysis, undefined, uploadResult.url);

        // Step 5: Create Linear ticket
        updateJob(jobId, {
            progress: 80,
            currentStep: 'Creating Linear ticket...',
        });

        const linearIssue = await createLinearIssue(ticketData);

        // Step 6: Complete
        updateJob(jobId, {
            status: 'completed',
            progress: 100,
            currentStep: 'Done!',
            ticketUrl: linearIssue.url,
            ticketId: linearIssue.identifier,
        });

        // Cleanup
        await cleanupFiles(imagePath, optimizedPath);

    } catch (error) {
        console.error('Processing error:', error);
        updateJob(jobId, {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            currentStep: 'Failed',
        });

        // Cleanup on error
        try {
            await fs.unlink(imagePath);
        } catch { }
    }
}

async function optimizeImage(imagePath: string): Promise<string> {
    const optimizedPath = imagePath + '_optimized.png';

    await sharp(imagePath)
        .resize(1920, 1080, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .png({ quality: 90 })
        .toFile(optimizedPath);

    return optimizedPath;
}

async function cleanupFiles(...paths: string[]): Promise<void> {
    for (const filePath of paths) {
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.warn(`Failed to cleanup file ${filePath}:`, error);
        }
    }
}
