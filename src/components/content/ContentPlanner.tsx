import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Edit2, 
  Trash2, 
  Share2,
  Copy,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { ContentItem, FreelanceProfile } from '../../types';
import { requestContentIdeas } from '../../lib/api';
import { AiMarking } from '../ui/AiMarking';

interface ContentPlannerProps {
  contentItems: ContentItem[];
  profile?: FreelanceProfile;
  onAddContent: (item: Partial<ContentItem>) => void;
  onUpdateContent: (id: string, patch: Partial<ContentItem>) => void;
  onDeleteContent: (id: string) => void;
}

export const ContentPlanner: React.FC<ContentPlannerProps> = ({
  contentItems,
  profile,
  onAddContent,
  onUpdateContent,
  onDeleteContent,
}) => {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState<ContentItem['contentType']>('article');
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(contentItems[0] || null);

  const handleBrainstorm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBrainstorming(true);

    try {
      const res = await requestContentIdeas({
        profile: profile || {
          name: 'Alexandre Vane',
          businessName: 'Vane Digital Systems',
          niche: 'Higher Education Digitalization',
        },
        topicSeed: topic || 'Campus digitalization in Central Africa',
        contentType,
        count: 1,
      });

      const firstIdea = res.data?.ideas?.[0] || res.data?.[0];
      const newIdea: Partial<ContentItem> = {
        title: firstIdea?.title || topic || 'Institutional Transformation Guide',
        contentType,
        status: 'ready',
        idea: firstIdea?.outline || 'Core outline covering operational bottlenecks and student enrollment...',
        draft: firstIdea?.draft || 'Draft content expanding on operational digitalization for universities...',
        scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      };

      onAddContent(newIdea);
      setTopic('');
    } catch (err: any) {
      onAddContent({
        title: topic || 'Solving Campus Connectivity Challenges',
        contentType: 'article',
        status: 'idea',
        idea: 'Highlighting local offline-first campus caching...',
        draft: 'Many African university campuses suffer from fluctuating bandwidth during registration week...',
      });
    } finally {
      setIsBrainstorming(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>Authority & Content Hub</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Inbound Trust Engine
            </span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Create educational authority assets to nurture high-value institutional relationships
          </p>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: AI Brainstorming & Backlog */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Generator Box */}
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Brainstorm Authority Article</span>
            </h3>

            <form onSubmit={handleBrainstorm} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Topic / Core Insight</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Modernizing examination records without fiber..."
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Asset Format</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="w-full mt-1 px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 cursor-pointer"
                >
                  <option value="article">Technical Deep Dive / Article</option>
                  <option value="case_study">University Case Study</option>
                  <option value="post">LinkedIn Insight Post</option>
                  <option value="whatsapp_status">WhatsApp Broadcast Status</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isBrainstorming}
                className="w-full py-2 px-3 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isBrainstorming ? 'animate-spin' : ''}`} />
                <span>{isBrainstorming ? 'Drafting with Gemini...' : '✨ Generate Outline & Draft'}</span>
              </button>
            </form>
          </div>

          {/* Backlog List */}
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
              Content Pipeline ({contentItems.length})
            </h3>

            <div className="space-y-2.5">
              {contentItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-md border transition-all cursor-pointer space-y-1.5 ${
                    selectedItem?.id === item.id
                      ? 'border-teal-600 bg-teal-50/40 dark:bg-teal-950/30 shadow-2xs'
                      : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {item.contentType}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-1">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Draft Editor & Publisher */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4">
          {selectedItem ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <input
                  type="text"
                  value={selectedItem.title}
                  onChange={(e) => {
                    const updated = { ...selectedItem, title: e.target.value };
                    setSelectedItem(updated);
                    onUpdateContent(selectedItem.id, { title: e.target.value });
                  }}
                  className="text-lg font-bold text-stone-900 dark:text-stone-100 bg-transparent focus:outline-hidden w-full"
                />

                <select
                  value={selectedItem.status}
                  onChange={(e) => {
                    const updated = { ...selectedItem, status: e.target.value as any };
                    setSelectedItem(updated);
                    onUpdateContent(selectedItem.id, { status: e.target.value as any });
                  }}
                  className="text-xs font-mono rounded px-2 py-1 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="idea">Idea</option>
                  <option value="draft">Drafting</option>
                  <option value="ready">Ready</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <AiMarking isAiMarked={true}>
                <textarea
                  rows={14}
                  value={selectedItem.draft || selectedItem.idea || ''}
                  onChange={(e) => {
                    const updated = { ...selectedItem, draft: e.target.value };
                    setSelectedItem(updated);
                    onUpdateContent(selectedItem.id, { draft: e.target.value });
                  }}
                  className="w-full bg-transparent text-sm leading-relaxed focus:outline-hidden resize-y font-sans text-stone-900 dark:text-stone-100"
                />
              </AiMarking>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-400">
                <span>Scheduled: {selectedItem.scheduledDate || 'Not scheduled'}</span>
                <button
                  onClick={() => onDeleteContent(selectedItem.id)}
                  className="text-red-500 hover:underline cursor-pointer"
                >
                  Delete Idea
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-stone-400">
              Select or generate a content idea to begin drafting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
