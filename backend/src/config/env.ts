import dotenv from 'dotenv';

dotenv.config();

export interface Config {
    port: number;
    nodeEnv: string;
    geminiApiKey: string;
    e2bApiKey: string;
    browserbaseApiKey?: string;
    browserbaseProjectId?: string;
    linearApiKey: string;
    linearTeamId?: string;
    imgbbApiKey?: string;
}

function getEnvVar(key: string, required: boolean = true): string {
    const value = process.env[key];
    if (required && !value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || '';
}

export const config: Config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    geminiApiKey: getEnvVar('GEMINI_API_KEY'),
    e2bApiKey: getEnvVar('E2B_API_KEY'),
    browserbaseApiKey: getEnvVar('BROWSERBASE_API_KEY', false),
    browserbaseProjectId: getEnvVar('BROWSERBASE_PROJECT_ID', false),
    linearApiKey: getEnvVar('LINEAR_API_KEY'),
    linearTeamId: getEnvVar('LINEAR_TEAM_ID', false),
    imgbbApiKey: getEnvVar('IMGBB_API_KEY', false),
};

export function validateConfig(): void {
    if (!config.geminiApiKey) {
        throw new Error('GEMINI_API_KEY is required for vision analysis');
    }
    if (!config.e2bApiKey) {
        throw new Error('E2B_API_KEY is required for sandbox creation');
    }
    if (!config.linearApiKey) {
        throw new Error('LINEAR_API_KEY is required for ticket creation');
    }

    console.log('✓ Configuration validated');
    console.log(`✓ Server will run on port ${config.port}`);
    console.log(`✓ E2B sandboxes: enabled`);
    console.log(`✓ Browserbase integration: ${config.browserbaseApiKey ? 'enabled' : 'disabled'}`);
    console.log(`✓ Image upload service: ${config.imgbbApiKey ? 'imgbb.com' : 'base64 fallback'}`);
}
