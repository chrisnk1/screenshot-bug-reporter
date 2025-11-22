import { Sandbox } from 'e2b';
import { config } from '../config/env.js';

export interface SandboxInstance {
    sandbox: Sandbox;
}

/**
 * Creates an E2B sandbox
 * Note: MCP integration with Browserbase will be added when the API is publicly available
 */
export async function createSandboxWithMCP(): Promise<SandboxInstance> {
    console.log('🏗️  Creating E2B sandbox...');

    try {
        const sandbox = await Sandbox.create({
            apiKey: config.e2bApiKey,
            timeoutMs: 600_000, // 10 minutes
        });

        console.log(`✓ Sandbox created: ${sandbox.sandboxId}`);

        return {
            sandbox,
        };
    } catch (error) {
        console.error('Error creating E2B sandbox:', error);
        throw new Error(`Failed to create sandbox: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Closes and cleans up an E2B sandbox
 */
export async function closeSandbox(sandbox: Sandbox): Promise<void> {
    console.log('🧹 Cleaning up sandbox...');
    try {
        await sandbox.kill();
        console.log('✓ Sandbox closed successfully');
    } catch (error) {
        console.error('Error closing sandbox:', error);
        // Don't throw - cleanup errors shouldn't break the flow
    }
}
