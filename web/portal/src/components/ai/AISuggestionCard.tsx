import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bot, Check, X, Edit3, AlertTriangle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { type AiAssessmentSuggestion, recordAiFeedback } from '../../api/ai';
import { useAuth } from 'react-oidc-context';

interface AISuggestionCardProps {
    suggestion: AiAssessmentSuggestion;
    breachCaseId: string;
}

export const AISuggestionCard: React.FC<AISuggestionCardProps> = ({ suggestion, breachCaseId }) => {
    const queryClient = useQueryClient();
    const auth = useAuth();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isModifying, setIsModifying] = useState(false);
    const [feedback, setFeedback] = useState('');

    const feedbackMutation = useMutation({
        mutationFn: (data: { status: 'accepted' | 'modified' | 'rejected', feedback?: string }) =>
            recordAiFeedback(suggestion.id, data.status, data.feedback, auth.user?.access_token || ''),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-suggestion', breachCaseId] });
            setIsModifying(false);
            setFeedback('');
        },
    });

    const getScoreColor = (score: number) => {
        if (score >= 4) return 'bg-red-100 text-red-700 border-red-200';
        if (score >= 3) return 'bg-orange-100 text-orange-700 border-orange-200';
        return 'bg-blue-100 text-blue-700 border-blue-200';
    };

    if (suggestion.status === 'failed') {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 transition-all animate-fade-in shadow-sm">
                <div className="flex items-start space-x-3">
                    <div className="rounded-full bg-amber-100 p-2 text-amber-600 flex-shrink-0">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-amber-900">AI Assessment Unavailable</h4>
                        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                            {suggestion.justification || "The AI assessment could not be generated due to system limits. Please review this breach manually."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }


    if (suggestion.status !== 'pending') {
        return (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all animate-fade-in">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-full bg-slate-200 p-2 text-slate-500">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900">AI Assessment {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}</h4>
                            <p className="text-xs text-slate-500">Processed by Gemini 2.0 Flash</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border-2 border-crm-accent/30 bg-white shadow-sm overflow-hidden transition-all animate-fade-up">
            {/* Header */}
            <div className="bg-crm-accent/5 p-4 flex items-center justify-between border-b border-crm-accent/10">
                <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-crm-accent p-2 text-white shadow-sm">
                        <Bot className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">AI Risk Suggestion</h3>
                            <span className="badge bg-slate-200 text-slate-600 border-none text-[10px] py-0">{suggestion.model_version}</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-0.5">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] text-slate-400 italic">Generated {new Date(suggestion.created_at).toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
            </div>

            {isExpanded && (
                <div className="p-5 space-y-6">
                    {/* Scores Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`rounded-lg border p-3 flex flex-col items-center justify-center space-y-1 ${getScoreColor(suggestion.impact)}`}>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Impact</span>
                            <span className="text-2xl font-black">{suggestion.impact} / 5</span>
                        </div>
                        <div className={`rounded-lg border p-3 flex flex-col items-center justify-center space-y-1 ${getScoreColor(suggestion.likelihood)}`}>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Likelihood</span>
                            <span className="text-2xl font-black">{suggestion.likelihood} / 5</span>
                        </div>
                    </div>

                    {/* Quality Warning for Criticals */}
                    {suggestion.risk_score >= 12 && (
                        <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <p className="font-medium">
                                <span className="font-bold">CAUTION:</span> This assessment indicates High Risk. Please verify the justification thoroughly before accepting.
                            </p>
                        </div>
                    )}

                    {/* Justification */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                            <Edit3 className="h-3 w-3 mr-1.5 text-crm-accent" />
                            Justification
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                            {suggestion.justification}
                        </p>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                            <Check className="h-3 w-3 mr-1.5 text-green-500" />
                            Security Recommendations
                        </h4>
                        <ul className="grid grid-cols-1 gap-2">
                            {suggestion.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start bg-green-50/50 p-2.5 rounded-md border border-green-100/50">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 mr-2.5 flex-shrink-0" />
                                    <span className="text-xs text-slate-700">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Decisioning Console */}
                    <div className="pt-4 border-t border-slate-100">
                        {isModifying ? (
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase">Human Modification Rationale (Required)</label>
                                <textarea
                                    className="w-full rounded-lg border-slate-200 bg-white text-slate-900 text-sm p-3 focus:ring-crm-accent focus:border-crm-accent"
                                    placeholder="Explain why the AI's assessment was modified..."
                                    rows={3}
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                />
                                <div className="flex space-x-2">
                                    <button
                                        disabled={!feedback.trim() || feedbackMutation.isPending}
                                        onClick={() => feedbackMutation.mutate({ status: 'modified', feedback })}
                                        className="btn btn-primary flex-1 py-2 text-xs"
                                    >
                                        Confirm Modification
                                    </button>
                                    <button
                                        onClick={() => setIsModifying(false)}
                                        className="btn bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs px-4"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => feedbackMutation.mutate({ status: 'accepted' })}
                                    disabled={feedbackMutation.isPending}
                                    className="btn bg-green-600 hover:bg-green-700 text-white flex-1 py-2 text-xs flex items-center justify-center"
                                >
                                    <Check className="h-3.5 w-3.5 mr-1.5" />
                                    Accept AI Score
                                </button>
                                <button
                                    onClick={() => setIsModifying(true)}
                                    className="btn border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 flex-1 py-2 text-xs flex items-center justify-center"
                                >
                                    <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                                    Modify
                                </button>
                                <button
                                    onClick={() => feedbackMutation.mutate({ status: 'rejected' })}
                                    disabled={feedbackMutation.isPending}
                                    className="btn border-red-200 bg-red-50 text-red-700 hover:bg-red-100 py-2 text-xs flex items-center justify-center px-4 space-x-1.5"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    <span>Reject</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
