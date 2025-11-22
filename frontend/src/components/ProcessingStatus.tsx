import type { ProcessingJob } from '../api/client';

interface ProcessingStatusProps {
    job: ProcessingJob;
}

export function ProcessingStatus({ job }: ProcessingStatusProps) {
    const steps = [
        { key: 'analyzing', label: 'Analyzing screenshot' },
        { key: 'creating-ticket', label: 'Creating Linear ticket' },
        { key: 'completed', label: 'Done' },
    ];

    const getCurrentStepIndex = () => {
        if (job.status === 'completed') return 2;
        if (job.status === 'creating-ticket') return 1;
        return 0;
    };

    const currentStepIndex = getCurrentStepIndex();

    return (
        <div className="border border-primary-100 rounded-xl p-8 space-y-8 bg-surface shadow-subtle">
            {/* Header */}
            <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-primary-900">
                    {job.status === 'failed' ? 'Processing Failed' : 'Processing...'}
                </h3>
                <p className="text-sm text-primary-500 font-light">{job.currentStep}</p>
            </div>

            {/* Progress Bar */}
            <div className="relative h-1 bg-primary-100 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-primary-900 transition-all duration-500 ease-out"
                    style={{ width: `${job.progress}%` }}
                />
            </div>

            {/* Steps */}
            <div className="space-y-1">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isPending = index > currentStepIndex;

                    return (
                        <div
                            key={step.key}
                            className={`
                flex items-center space-x-3 py-2 px-3 rounded-lg transition-colors duration-300
                ${isCurrent ? 'bg-primary-50' : ''}
              `}
                        >
                            <div
                                className={`
                  w-5 h-5 rounded-full flex items-center justify-center text-xs border transition-colors duration-300
                  ${isCompleted
                                        ? 'bg-primary-900 border-primary-900 text-white'
                                        : isCurrent
                                            ? 'border-primary-900 text-transparent' // In progress circle
                                            : 'border-primary-200 text-transparent'
                                    }
                `}
                            >
                                {isCompleted && (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {isCurrent && (
                                    <div className="w-2 h-2 bg-primary-900 rounded-full animate-pulse" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${isPending ? 'text-primary-300' : 'text-primary-900'}`}>
                                    {step.label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Live Logs */}
            {job.logs && job.logs.length > 0 && (
                <div className="mt-4 bg-gray-900 rounded-lg p-4 font-mono text-xs h-48 overflow-y-auto">
                    <div className="space-y-1">
                        {job.logs.map((log, index) => (
                            <div key={index} className="text-gray-300 border-b border-gray-800 pb-1 last:border-0 last:pb-0">
                                <span className="text-gray-500 mr-2">[{index + 1}]</span>
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bug Analysis Preview */}
            {job.bugAnalysis && (
                <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-900" />
                        <h4 className="text-xs font-semibold text-primary-500 uppercase tracking-wider">Detected Issue</h4>
                    </div>
                    <p className="text-sm font-medium text-primary-900">{job.bugAnalysis.title}</p>
                    <p className="text-xs text-primary-400 mt-1 font-mono">Severity: {job.bugAnalysis.severity}</p>
                </div>
            )}

            {/* Error */}
            {job.error && (
                <div className="mt-6 p-4 bg-red-50/50 rounded-lg border border-red-100">
                    <h4 className="font-semibold mb-1 text-red-900 text-sm">Error</h4>
                    <p className="text-sm text-red-600">{job.error}</p>
                </div>
            )}
        </div>
    );
}
