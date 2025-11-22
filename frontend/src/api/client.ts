import axios from 'axios';

export interface ProcessingJob {
    id: string;
    status: 'pending' | 'analyzing' | 'gathering-context' | 'creating-ticket' | 'completed' | 'failed';
    progress: number;
    currentStep: string;
    logs?: string[];
    bugAnalysis?: {
        title: string;
        description: string;
        severity: string;
    };
    ticketUrl?: string;
    ticketId?: string;
    error?: string;
}

const API_BASE = '/api';

export async function checkHealth(): Promise<boolean> {
    try {
        await axios.get(`${API_BASE}/health`);
        return true;
    } catch {
        return false;
    }
}

export async function uploadScreenshot(file: File): Promise<{ jobId: string }> {
    const formData = new FormData();
    formData.append('screenshot', file);

    const response = await axios.post(`${API_BASE}/screenshot`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
}

export async function getJobStatus(jobId: string): Promise<ProcessingJob> {
    const response = await axios.get(`${API_BASE}/screenshot/${jobId}`);
    return response.data;
}

export async function pollJobStatus(
    jobId: string,
    onUpdate: (job: ProcessingJob) => void,
    interval: number = 1000
): Promise<ProcessingJob> {
    return new Promise((resolve, reject) => {
        const poll = setInterval(async () => {
            try {
                const job = await getJobStatus(jobId);
                onUpdate(job);

                if (job.status === 'completed' || job.status === 'failed') {
                    clearInterval(poll);
                    resolve(job);
                }
            } catch (error) {
                clearInterval(poll);
                reject(error);
            }
        }, interval);
    });
}
