import type { ProcessingJob } from '../api/client';

interface TicketPreviewProps {
    job: ProcessingJob;
    onCreateAnother: () => void;
}

export function TicketPreview({ job, onCreateAnother }: TicketPreviewProps) {
    if (!job.ticketUrl || !job.bugAnalysis) {
        return null;
    }

    return (
        <div className="glass rounded-2xl p-8 space-y-6">
            {/* Success Header */}
            <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-3xl font-bold mb-2">Ticket Created! 🎉</h3>
                <p className="text-gray-300">Your bug report has been submitted to Linear</p>
            </div>

            {/* Ticket Details */}
            <div className="space-y-4">
                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Ticket ID</p>
                            <p className="text-2xl font-bold text-primary-400">{job.ticketId}</p>
                        </div>
                        <div className={`
              px-3 py-1 rounded-full text-xs font-semibold
              ${job.bugAnalysis.severity === 'critical' ? 'bg-red-500/20 text-red-400' : ''}
              ${job.bugAnalysis.severity === 'high' ? 'bg-orange-500/20 text-orange-400' : ''}
              ${job.bugAnalysis.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : ''}
              ${job.bugAnalysis.severity === 'low' ? 'bg-blue-500/20 text-blue-400' : ''}
            `}>
                            {job.bugAnalysis.severity.toUpperCase()}
                        </div>
                    </div>

                    <h4 className="font-semibold text-lg mb-2">{job.bugAnalysis.title}</h4>
                    <p className="text-sm text-gray-300 line-clamp-3">{job.bugAnalysis.description}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <a
                        href={job.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 btn-primary text-center"
                    >
                        <span className="flex items-center justify-center gap-2">
                            View in Linear
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </span>
                    </a>

                    <button
                        onClick={onCreateAnother}
                        className="px-6 py-3 glass hover:bg-white/20 rounded-lg font-semibold transition-all duration-200"
                    >
                        Create Another
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div className="text-center">
                    <p className="text-2xl font-bold text-primary-400">✓</p>
                    <p className="text-xs text-gray-400 mt-1">Auto-analyzed</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-primary-400">✓</p>
                    <p className="text-xs text-gray-400 mt-1">Formatted</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-primary-400">✓</p>
                    <p className="text-xs text-gray-400 mt-1">Submitted</p>
                </div>
            </div>
        </div>
    );
}
