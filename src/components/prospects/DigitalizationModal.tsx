import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Edit2, 
  Trash2, 
  RotateCcw,
  ShieldCheck,
  Award
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { DigitalizationProfile, DigitalizationDimensionScore } from '../../types';

interface DigitalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DigitalizationProfile;
  organizationName: string;
  onUpdateScores: (newScores: DigitalizationDimensionScore[]) => void;
}

export const DigitalizationModal: React.FC<DigitalizationModalProps> = ({
  isOpen,
  onClose,
  profile,
  organizationName,
  onUpdateScores,
}) => {
  const [scores, setScores] = useState<DigitalizationDimensionScore[]>(profile?.scores || []);
  const [editingDimensionId, setEditingDimensionId] = useState<string | null>(null);
  const [tempScoreValue, setTempScoreValue] = useState<number>(5);

  if (!isOpen) return null;

  // Transform for Recharts Radar
  const chartData = scores.map((s) => ({
    subject: s.name,
    score: s.score || 0,
    fullMark: 10,
  }));

  const overallAvg = scores.length > 0
    ? (scores.reduce((sum, s) => sum + (s.score || 0), 0) / scores.length).toFixed(1)
    : '0.0';

  const handleScoreAction = (dimensionId: string, action: 'accept' | 'ignore') => {
    const updated = scores.map((s) => {
      if (s.dimensionId === dimensionId) {
        return {
          ...s,
          confirmed: action === 'accept',
          source: (action === 'accept' ? 'manual' : s.source) as 'manual' | 'ai_suggested',
        };
      }
      return s;
    });
    setScores(updated);
    onUpdateScores(updated);
  };

  const handleSaveEdit = (dimensionId: string) => {
    const updated = scores.map((s) => {
      if (s.dimensionId === dimensionId) {
        return {
          ...s,
          score: tempScoreValue,
          confirmed: true,
          source: 'manual' as const,
        };
      }
      return s;
    });
    setScores(updated);
    onUpdateScores(updated);
    setEditingDimensionId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
          <div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Digitalization Profile: {organizationName}</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              8-Dimension Institutional Maturity Radar. Review & accept AI suggestions individually.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top: Score and Radar Chart */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 p-4 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 text-center space-y-2">
              <span className="text-xs text-stone-500 font-medium">Overall Digital Maturity</span>
              <p className="text-4xl font-bold font-mono text-teal-600 dark:text-teal-400">
                {overallAvg} <span className="text-base font-normal text-stone-400">/ 10</span>
              </p>
              <p className="text-xs text-stone-500">
                {Number(overallAvg) > 6 ? 'Moderate Digitalization' : 'High Modernization Opportunity'}
              </p>
            </div>

            <div className="md:col-span-8 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#e4e2df" strokeOpacity={0.5} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#78716c', fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 10]} stroke="#a8a29e" tick={false} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#0d9488"
                    fill="#0d9488"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dimension Checklist with Independent Accept / Edit / Ignore */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                Dimension Criteria Scoring ({scores.length} dimensions)
              </h4>
              <span className="text-xs text-stone-400 italic">
                Each dimension must be accepted/edited independently per spec
              </span>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
              {scores.map((s) => (
                <div
                  key={s.dimensionId}
                  className="px-4 py-3 bg-white dark:bg-stone-900 flex items-center justify-between gap-4 hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-md bg-stone-100 dark:bg-stone-800 font-mono font-bold text-sm text-stone-800 dark:text-stone-200">
                      {s.score}/10
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                          {s.name}
                        </p>
                        {s.source === 'ai_suggested' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.2 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            <Sparkles className="w-2.5 h-2.5" />
                            AI Suggested
                          </span>
                        )}
                        {s.confirmed && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <ShieldCheck className="w-3 h-3" />
                            Confirmed
                          </span>
                        )}
                      </div>
                      {s.evidence && (
                        <p className="text-xs text-stone-400 truncate mt-0.5">{s.evidence}</p>
                      )}
                    </div>
                  </div>

                  {/* Per-row independent controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {editingDimensionId === s.dimensionId ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={tempScoreValue}
                          onChange={(e) => setTempScoreValue(Number(e.target.value))}
                          className="w-14 px-2 py-1 text-xs font-mono rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                        />
                        <button
                          onClick={() => handleSaveEdit(s.dimensionId)}
                          className="p-1.5 rounded bg-teal-600 text-white text-xs hover:bg-teal-700"
                          title="Save Score"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingDimensionId(null)}
                          className="p-1.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleScoreAction(s.dimensionId, 'accept')}
                          className="px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => {
                            setEditingDimensionId(s.dimensionId);
                            setTempScoreValue(s.score || 5);
                          }}
                          className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                          title="Edit score manually"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleScoreAction(s.dimensionId, 'ignore')}
                          className="p-1 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Reset / Ignore suggestion"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 text-sm font-medium rounded-md bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            Done & Return
          </button>
        </div>
      </div>
    </div>
  );
};
