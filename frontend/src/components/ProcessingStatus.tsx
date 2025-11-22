import type { ProcessingJob } from '../api/client';

interface ProcessingStatusProps {
    job: ProcessingJob;
}

export function ProcessingStatus({ job }: ProcessingStatusProps) {
    const steps = [
        { key: 'analyzing', label: 'Analyzing screenshot', icon: '🔍' },
        { key: 'creating-ticket', label: 'Creating Linear ticket', icon: '🎫' },
        { key: 'completed', label: 'Done!', icon: '✨' },
    ];

    const getCurrentStepIndex = () => {
        if (job.status === 'completed') return 2;
        if (job.status === 'creating-ticket') return 1;
        return 0;
    };

    const currentStepIndex = getCurrentStepIndex();

    return (
        <div className="glass rounded-2xl p-8 space-y-6">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">
                    {job.status === 'failed' ? '❌ Processing Failed' : '🚀 Processing Screenshot'}
                </h3>
                <p className="text-gray-300">{job.currentStep}</p>
            </div>

            {/* Progress Bar */}
            <div className="relative">
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-purple-600 transition-all duration-500 ease-out"
                        style={{ width: `${job.progress}%` }}
                    />
                </div>
                <div className="absolute -top-1 right-0 text-sm font-semibold text-primary-400">
                    {job.progress}%
                </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isPending = index > currentStepIndex;

                    return (
                        <div
                            key={step.key}
                            className={`
                flex items-center space-x-4 p-4 rounded-lg transition-all duration-300
                ${isCurrent ? 'glass scale-105' : ''}
                ${isCompleted ? 'opacity-75' : ''}
                ${isPending ? 'opacity-40' : ''}
              `}
                        >
                            <div
                                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-xl
                  ${isCompleted ? 'bg-green-500' : ''}
                  ${isCurrent ? 'bg-gradient-to-r from-primary-500 to-purple-600 animate-pulse' : ''}
                  ${isPending ? 'bg-white/10' : ''}
                `}
                            >
                                {isCompleted ? '✓' : step.icon}
                            </div>
                            <div className="flex-1">
                                <p className={`font-semibold ${isCurrent ? 'text-white' : 'text-gray-300'}`}>
                                    {step.label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bug Analysis Preview */}
            {job.bugAnalysis && (
                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="font-semibold mb-2 text-primary-400">📋 Detected Issue:</h4>
                    <p className="text-sm font-medium">{job.bugAnalysis.title}</p>
                    <p className="text-xs text-gray-400 mt-1">Severity: {job.bugAnalysis.severity}</p>
                </div>
            )}

            {/* Error */}
            {job.error && (
                <div className="mt-6 p-4 bg-red-500/20 rounded-lg border border-red-500/50">
                    <h4 className="font-semibold mb-2 text-red-400">Error:</h4>
                    <p className="text-sm">{job.error}</p>
                </div>
            )}
        </div>
    );
}
