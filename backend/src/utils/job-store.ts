import type { ProcessingJob } from '../types.js';

// In-memory job store (in production, use Redis or a database)
const jobs = new Map<string, ProcessingJob>();

export function createJob(id: string): ProcessingJob {
    const job: ProcessingJob = {
        id,
        status: 'pending',
        progress: 0,
        currentStep: 'Initializing...',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    jobs.set(id, job);
    return job;
}

export function updateJob(id: string, updates: Partial<ProcessingJob>): ProcessingJob | undefined {
    const job = jobs.get(id);
    if (!job) {
        return undefined;
    }

    Object.assign(job, updates, { updatedAt: new Date() });
    jobs.set(id, job);
    return job;
}

export function getJob(id: string): ProcessingJob | undefined {
    return jobs.get(id);
}

export function deleteJob(id: string): boolean {
    return jobs.delete(id);
}
