export interface BugAnalysis {
    title: string;
    description: string;
    errorMessages: string[];
    urls: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    suggestedLabels: string[];
    uiState: string;
}

export interface BrowserContext {
    pageTitle?: string;
    url?: string;
    version?: string;
    consoleErrors?: string[];
    networkErrors?: string[];
}

export interface ProcessingJob {
    id: string;
    status: 'pending' | 'analyzing' | 'gathering-context' | 'creating-ticket' | 'completed' | 'failed';
    progress: number;
    currentStep: string;
    bugAnalysis?: BugAnalysis;
    browserContext?: BrowserContext;
    ticketUrl?: string;
    ticketId?: string;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface LinearIssue {
    id: string;
    url: string;
    title: string;
    identifier: string;
}
