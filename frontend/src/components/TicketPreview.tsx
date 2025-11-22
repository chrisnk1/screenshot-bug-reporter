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
        <div className="border border-primary-100 rounded-xl p-8 space-y-8 bg-surface shadow-subtle">
            {/* Success Header */}
            <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-semibold text-primary-900">Ticket Created</h3>
                <p className="text-sm text-primary-500">Your bug report is ready in Linear.</p>
            </div>

            {/* Ticket Details */}
            <div className="space-y-6">
                <div className="p-6 bg-primary-50 rounded-lg border border-primary-100 hover:border-primary-200 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-xs text-primary-400 font-mono mb-1">ID</p>
                            <p className="text-xl font-semibold text-primary-900 tracking-tight">{job.ticketId}</p>
                        </div>
                        <div className={`
              px-2.5 py-1 rounded-full text-xs font-medium border
              ${job.bugAnalysis.severity === 'critical' ? 'bg-red-50 border-red-100 text-red-700' : ''}
              ${job.bugAnalysis.severity === 'high' ? 'bg-orange-50 border-orange-100 text-orange-700' : ''}
              ${job.bugAnalysis.severity === 'medium' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' : ''}
              ${job.bugAnalysis.severity === 'low' ? 'bg-blue-50 border-blue-100 text-blue-700' : ''}
            `}>
                            {job.bugAnalysis.severity.toUpperCase()}
                        </div>
                    </div>

                    <h4 className="font-medium text-primary-900 mb-2 leading-relaxed">{job.bugAnalysis.title}</h4>
                    <p className="text-sm text-primary-500 line-clamp-3 leading-relaxed">{job.bugAnalysis.description}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <a
                        href={job.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                        View Ticket
                        <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>

                    <button
                        onClick={onCreateAnother}
                        className="btn-secondary"
                    >
                        Create Another
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-primary-100">
                <div className="text-center">
                    <div className="text-primary-900 font-semibold">AI</div>
                    <p className="text-[10px] text-primary-400 uppercase tracking-wider mt-1">Analyzed</p>
                </div>
                <div className="text-center border-l border-r border-primary-100">
                    <div className="text-primary-900 font-semibold">MD</div>
                    <p className="text-[10px] text-primary-400 uppercase tracking-wider mt-1">Formatted</p>
                </div>
                <div className="text-center">
                    <div className="text-primary-900 font-semibold">API</div>
                    <p className="text-[10px] text-primary-400 uppercase tracking-wider mt-1">Submitted</p>
                </div>
            </div>
        </div>
    );
}
