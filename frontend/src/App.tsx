import { useState, useEffect } from 'react';
import { DropZone } from './components/DropZone';
import { ProcessingStatus } from './components/ProcessingStatus';
import { TicketPreview } from './components/TicketPreview';
import { uploadScreenshot, pollJobStatus, checkHealth, type ProcessingJob } from './api/client';

type AppState = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

function App() {
    const [state, setState] = useState<AppState>('idle');
    const [job, setJob] = useState<ProcessingJob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

    useEffect(() => {
        const check = async () => {
            const online = await checkHealth();
            setIsBackendOnline(online);
        };

        check();
        const interval = setInterval(check, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleFileSelected = async (file: File) => {
        try {
            setState('uploading');
            setError(null);

            // Upload screenshot
            const { jobId } = await uploadScreenshot(file);

            setState('processing');

            // Poll for status updates
            await pollJobStatus(jobId, (updatedJob) => {
                setJob(updatedJob);

                if (updatedJob.status === 'completed') {
                    setState('completed');
                } else if (updatedJob.status === 'failed') {
                    setState('error');
                    setError(updatedJob.error || 'Processing failed');
                }
            });

        } catch (err) {
            setState('error');
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const handleCreateAnother = () => {
        setState('idle');
        setJob(null);
        setError(null);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-primary-900 font-sans relative">
            {/* Status Indicator */}
            <div className="absolute top-6 right-6 flex items-center gap-2 bg-surface px-3 py-1.5 rounded-full border border-primary-100 shadow-subtle transition-all duration-300">
                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isBackendOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                <span className="text-xs font-medium text-primary-600">
                    {isBackendOnline ? 'System Online' : 'Backend Offline'}
                </span>
            </div>

            <div className="max-w-2xl w-full space-y-12">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-semibold tracking-tight text-primary-900">
                        Report Bug
                    </h1>
                    <p className="text-lg text-primary-500 font-light">
                        Drop a screenshot. We'll handle the rest.
                    </p>
                </div>

                {/* Main Content */}
                <div className="transition-all duration-500 ease-in-out">
                    {!isBackendOnline && state === 'idle' ? (
                        <div className="border border-red-100 rounded-xl p-12 text-center space-y-4 bg-red-50/30">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-red-900">Backend Service Unavailable</h3>
                            <p className="text-sm text-red-600 max-w-xs mx-auto">
                                The backend server appears to be offline. Please ensure it is running.
                            </p>
                        </div>
                    ) : (
                        <>
                            {state === 'idle' && (
                                <DropZone onFileSelected={handleFileSelected} disabled={!isBackendOnline} />
                            )}

                            {state === 'uploading' && (
                                <div className="border border-primary-100 rounded-xl p-12 text-center bg-surface shadow-subtle">
                                    <div className="animate-spin w-8 h-8 mx-auto mb-4 border-2 border-primary-900 border-t-transparent rounded-full" />
                                    <p className="text-sm font-medium text-primary-600">Uploading...</p>
                                </div>
                            )}

                            {state === 'processing' && job && (
                                <ProcessingStatus job={job} />
                            )}

                            {state === 'completed' && job && (
                                <TicketPreview job={job} onCreateAnother={handleCreateAnother} />
                            )}

                            {state === 'error' && (
                                <div className="border border-red-100 rounded-xl p-8 text-center space-y-4 bg-red-50/30">
                                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-red-900">Something went wrong</h3>
                                    <p className="text-sm text-red-600">{error}</p>
                                    <button
                                        onClick={handleCreateAnother}
                                        className="text-sm font-medium text-primary-900 hover:underline"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="pt-12 text-center">
                    <p className="text-xs text-primary-400 font-medium tracking-wide uppercase">
                        Powered by Gemini 2.5 + E2B
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;
