import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';
import type { BugAnalysis } from '../types.js';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

export async function analyzeScreenshot(imageBase64: string, mimeType: string): Promise<BugAnalysis> {
    console.log('🔍 Analyzing screenshot with Gemini 2.5 Flash...');

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
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType,
                    data: imageBase64,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Extract JSON from the response (Gemini might wrap it in markdown)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not extract JSON from Gemini response');
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
