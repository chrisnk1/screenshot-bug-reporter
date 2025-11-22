import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/env.js';
import type { BugAnalysis } from '../types.js';

const anthropic = new Anthropic({
    apiKey: config.anthropicApiKey,
});

export async function analyzeScreenshot(imageBase64: string, mimeType: string): Promise<BugAnalysis> {
    console.log('🔍 Analyzing screenshot with Claude Vision...');

    const prompt = `You are an expert QA engineer analyzing a screenshot for bug reporting. 

Analyze this screenshot and extract the following information:

1. **Bug Title**: A clear, concise title (max 80 chars) describing the issue
2. **Description**: Detailed description of what's wrong in the screenshot
3. **Error Messages**: Any visible error messages, stack traces, or error codes (extract exact text)
4. **URLs**: Any visible URLs in the screenshot (browser address bar, error messages, etc.)
5. **Severity**: Rate as low, medium, high, or critical based on:
   - Critical: System crash, data loss, security issue
   - High: Major feature broken, blocking workflow
   - Medium: Feature partially broken, workaround exists
   - Low: Minor UI issue, cosmetic problem
6. **Suggested Labels**: Relevant labels like "bug", "ui", "frontend", "backend", "crash", etc.
7. **UI State**: Describe the current state of the UI (what page, what action was being performed)

Return your analysis in this exact JSON format:
{
  "title": "Brief bug title",
  "description": "Detailed description of the bug",
  "errorMessages": ["error message 1", "error message 2"],
  "urls": ["https://example.com/page"],
  "severity": "high",
  "suggestedLabels": ["bug", "frontend"],
  "uiState": "Description of UI state"
}

Be thorough and extract as much detail as possible. If you can't find something, use empty arrays or appropriate defaults.`;

    try {
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                                data: imageBase64,
                            },
                        },
                        {
                            type: 'text',
                            text: prompt,
                        },
                    ],
                },
            ],
        });

        const textContent = response.content.find(block => block.type === 'text');
        if (!textContent || textContent.type !== 'text') {
            throw new Error('No text response from Claude');
        }

        // Extract JSON from the response (Claude might wrap it in markdown)
        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not extract JSON from Claude response');
        }

        const analysis = JSON.parse(jsonMatch[0]) as BugAnalysis;

        console.log('✓ Screenshot analysis complete');
        console.log(`  Title: ${analysis.title}`);
        console.log(`  Severity: ${analysis.severity}`);
        console.log(`  URLs found: ${analysis.urls.length}`);
        console.log(`  Error messages: ${analysis.errorMessages.length}`);

        return analysis;
    } catch (error) {
        console.error('Error analyzing screenshot:', error);
        throw new Error(`Vision analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
