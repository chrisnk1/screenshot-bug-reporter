import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, validateConfig } from './config/env.js';
import { registerScreenshotRoutes } from './routes/screenshot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate configuration
try {
    validateConfig();
} catch (error) {
    console.error('❌ Configuration error:', error);
    process.exit(1);
}

const fastify = Fastify({
    logger: config.nodeEnv === 'development',
});

// Register plugins
await fastify.register(fastifyCors);
await fastify.register(fastifyMultipart, {
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});

// Health check
fastify.get('/api/health', async () => {
    return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            gemini: !!config.geminiApiKey,
            e2b: !!config.e2bApiKey,
            linear: !!config.linearApiKey,
            browserbase: !!config.browserbaseApiKey,
            imageUpload: !!config.imgbbApiKey || 'base64 fallback',
        },
    };
});

// Register routes
registerScreenshotRoutes(fastify);

// Serve frontend static files (in production)
if (config.nodeEnv === 'production') {
    const frontendPath = path.join(__dirname, '../../frontend/dist');
    await fastify.register(fastifyStatic, {
        root: frontendPath,
        prefix: '/',
    });

    fastify.setNotFoundHandler((_request, reply) => {
        reply.sendFile('index.html');
    });
}

// Start server
try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });

    console.log('');
    console.log('🚀 Screenshot Bug Reporter Server');
    console.log('================================');
    console.log(`✓ Server running on http://localhost:${config.port}`);
    console.log(`✓ Environment: ${config.nodeEnv}`);
    console.log(`✓ API endpoint: http://localhost:${config.port}/api/screenshot`);
    console.log(`✓ Health check: http://localhost:${config.port}/api/health`);
    console.log('');
    console.log('Ready to convert screenshots to bug tickets! 🎫');
    console.log('');
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}
