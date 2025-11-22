import { useState } from 'react';
import { DropZone } from './components/DropZone';
import { ProcessingStatus } from './components/ProcessingStatus';
import { TicketPreview } from './components/TicketPreview';
import { uploadScreenshot, pollJobStatus, type ProcessingJob } from './api/client';

type AppState = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

function App() {
    const [state, setState] = useState<AppState>('idle');
    const [job, setJob] = useState<ProcessingJob | null>(null);
    const [error, setError] = useState<string | null>(null);

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
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-3xl w-full space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Screenshot → Bug Report
                    </h1>
                    <p className="text-xl text-gray-300">
                        Drop a screenshot, get a perfect Linear ticket. Powered by AI. ✨
                    </p>
                </div>

                {/* Main Content */}
                {state === 'idle' && (
                    <DropZone onFileSelected={handleFileSelected} />
                )}

                {state === 'uploading' && (
                    <div className="glass rounded-2xl p-12 text-center">
                        <div className="animate-spin w-16 h-16 mx-auto mb-4 border-4 border-primary-500 border-t-transparent rounded-full" />
                        <p className="text-xl font-semibold">Uploading screenshot...</p>
                    </div>
                )}

                {state === 'processing' && job && (
                    <ProcessingStatus job={job} />
                )}

                {state === 'completed' && job && (
                    <TicketPreview job={job} onCreateAnother={handleCreateAnother} />
                )}

                {state === 'error' && (
                    <div className="glass rounded-2xl p-8 text-center space-y-4">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-red-400">Something went wrong</h3>
                        <p className="text-gray-300">{error}</p>
                        <button
                            onClick={handleCreateAnother}
                            className="btn-primary"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center text-sm text-gray-400 space-y-2">
                    Powered by <span className="font-semibold text-primary-400">Gemini 2.5 Flash</span> + <span className="font-semibold text-purple-400">E2B Sandboxes</span>
                </p>
                <p className="text-xs">
                    Save 10+ minutes per bug report • Automatic analysis • Perfect formatting
                </p>
            </div>
        </div>
        </div >
    );
}

export default App;
