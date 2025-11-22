import type { BugAnalysis, BrowserContext } from '../types.js';

export interface TicketData {
    title: string;
    description: string;
    priority: number;
    labels: string[];
}

/**
 * Formats bug analysis and browser context into a Linear ticket
 */
export function formatTicket(
    analysis: BugAnalysis,
    browserContext?: BrowserContext,
    screenshotUrl?: string
): TicketData {
    const description = buildDescription(analysis, browserContext, screenshotUrl);
    const priority = severityToPriority(analysis.severity);
    const labels = [...new Set([...analysis.suggestedLabels, 'bug', 'automated'])];

    return {
        title: analysis.title,
        description,
        priority,
        labels,
    };
}

function buildDescription(
    analysis: BugAnalysis,
    browserContext?: BrowserContext,
    screenshotUrl?: string
): string {
    const sections: string[] = [];

    // Bug Description
    sections.push('## Description\n');
    sections.push(analysis.description);
    sections.push('');

    // Error Messages
    if (analysis.errorMessages.length > 0) {
        sections.push('## Error Messages\n');
        analysis.errorMessages.forEach(error => {
            sections.push('```');
            sections.push(error);
            sections.push('```');
        });
        sections.push('');
    }

    // Steps to Reproduce
    sections.push('## Steps to Reproduce\n');
    sections.push(`1. Navigate to: ${browserContext?.url || analysis.urls[0] || 'Unknown URL'}`);
    sections.push(`2. ${analysis.uiState}`);
    sections.push('3. Observe the error shown in the screenshot');
    sections.push('');

    // Expected vs Actual
    sections.push('## Expected Behavior\n');
    sections.push('The application should function without errors.');
    sections.push('');
    sections.push('## Actual Behavior\n');
    sections.push(analysis.description);
    sections.push('');

    // Environment
    sections.push('## Environment\n');
    if (browserContext?.url) {
        sections.push(`- **URL**: ${browserContext.url}`);
    }
    if (browserContext?.pageTitle) {
        sections.push(`- **Page**: ${browserContext.pageTitle}`);
    }
    if (browserContext?.version) {
        sections.push(`- **Version**: ${browserContext.version}`);
    }
    sections.push(`- **Severity**: ${analysis.severity}`);
    sections.push('');

    // Console Errors
    if (browserContext?.consoleErrors && browserContext.consoleErrors.length > 0) {
        sections.push('## Console Errors\n');
        sections.push('```');
        browserContext.consoleErrors.forEach(error => sections.push(error));
        sections.push('```');
        sections.push('');
    }

    // Screenshot
    if (screenshotUrl) {
        sections.push('## Screenshot\n');
        if (screenshotUrl.startsWith('data:')) {
            sections.push('*Screenshot embedded as base64 data*');
        } else {
            sections.push(`![Bug Screenshot](${screenshotUrl})`);
        }
        sections.push('');
    }

    // Footer
    sections.push('---');
    sections.push('*This ticket was automatically generated from a screenshot*');

    return sections.join('\n');
}

function severityToPriority(severity: BugAnalysis['severity']): number {
    // Linear priority: 0 = No priority, 1 = Urgent, 2 = High, 3 = Medium, 4 = Low
    switch (severity) {
        case 'critical':
            return 1; // Urgent
        case 'high':
            return 2; // High
        case 'medium':
            return 3; // Medium
        case 'low':
            return 4; // Low
        default:
            return 3; // Medium (default)
    }
}
