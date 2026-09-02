import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Building2, 
  Briefcase, 
  Send, 
  FileText, 
  Sparkles, 
  BarChart3, 
  Settings, 
  Search, 
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Cpu
} from 'lucide-react';
import { AppStoreState, generateDailyPlan } from '../../lib/storage';
import { STORAGE_KEY_GEMINI_API, STORAGE_KEY_GEMINI_MODEL } from '../../lib/api';

interface ShellProps {
  currentRoute: string;
  onNavigate: (route: string, id?: string) => void;
  breadcrumbs: string[];
  state: AppStoreState;
  onToggleTheme: () => void;
  isDark: boolean;
  onOpenCommandPalette: () => void;
  onToggleAskCaos: () => void;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({
  currentRoute,
  onNavigate,
  breadcrumbs,
  state,
  onToggleTheme,
  isDark,
  onOpenCommandPalette,
  onToggleAskCaos,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('auto');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = localStorage.getItem(STORAGE_KEY_GEMINI_API);
      setHasCustomKey(!!key && key.trim().length > 0);
      const mod = localStorage.getItem(STORAGE_KEY_GEMINI_MODEL) || 'auto';
      setSelectedModel(mod);
    }
  }, [currentRoute]);

  const plannedList = generateDailyPlan(state, state.todayTimeBudgetMinutes);
  const hours = Math.floor(state.todayTimeBudgetMinutes / 60);
  const mins = state.todayTimeBudgetMinutes % 60;
  const timeFormatted = `${hours}h ${mins > 0 ? `${mins}m` : ''}`;

  // Progressive disclosure: Opportunities item only rendered when at least 1 opportunity exists
  const hasOpportunities = state.opportunities.length > 0;
  const overdueFollowupsCount = state.sequenceStepInstances.filter(
    (s) => s.status === 'pending' && new Date(s.dueDate) < new Date()
  ).length;

  // Notice: "Ask CAOS" removed from sidebar as requested. Kept in top bar & command palette.
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'prospects', label: 'Prospects', icon: Building2 },
    ...(hasOpportunities ? [{ id: 'opportunities', label: 'Opportunities', icon: Briefcase }] : []),
    { 
      id: 'outreach', 
      label: 'Outreach & Queue', 
      icon: Send,
      badge: overdueFollowupsCount > 0 ? overdueFollowupsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    },
    { id: 'content', label: 'Authority & Content', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-screen h-[100dvh] bg-stone-100/70 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans antialiased overflow-hidden selection:bg-teal-500/20">
      {/* Top Bar (48px) */}
      <header className="h-12 shrink-0 border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-4 flex items-center justify-between z-30 shadow-2xs">
        {/* Left: Brand + Breadcrumbs */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2 cursor-pointer group select-none"
            title="MAC TECH - CAOS (Client Acquisition Operating System)"
          >
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <span className="font-bold text-sm tracking-tight text-stone-900 dark:text-stone-100">
                CAOS
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                MAC TECH
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 mx-1 hidden sm:block" />

          {/* Breadcrumb trail */}
          <nav className="flex items-center gap-1.5 text-xs text-stone-500">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-stone-400">/</span>}
                <span className={idx === breadcrumbs.length - 1 ? 'font-semibold text-stone-900 dark:text-stone-200 truncate max-w-[200px]' : 'hover:text-stone-700 dark:hover:text-stone-300'}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-2">
          {/* Active Session Indicator if active */}
          {state.activeSession && (
            <button
              onClick={() => onNavigate('session')}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800 animate-pulse"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Session in progress</span>
            </button>
          )}

          {/* AI Model / Key Indicator pill */}
          <button
            onClick={() => onNavigate('settings')}
            title="Configure AI API Key & Model Settings"
            className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
          >
            <Cpu className={`w-3 h-3 ${hasCustomKey ? 'text-teal-600 dark:text-teal-400' : 'text-stone-400'}`} />
            <span>AI: {selectedModel === 'auto' ? 'Auto Free-Tier' : selectedModel.replace('gemini-', '')}</span>
            {hasCustomKey && (
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" title="Custom Key Active" />
            )}
          </button>

          {/* Search Trigger (⌘K) */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-md text-xs text-stone-500 bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700/60 transition-colors shadow-2xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="font-mono text-[10px] bg-white dark:bg-stone-900 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle (Light / Dark Mode) */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-1.5 rounded-md text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>

          {/* Ask CAOS Drawer Toggle (⌘J) */}
          <button
            onClick={onToggleAskCaos}
            aria-label="Ask CAOS Copilot"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/70 transition-colors shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden sm:inline">Ask CAOS</span>
          </button>
        </div>
      </header>

      {/* Body: Sidebar (Full Screen Height Fit) + Main scrollable viewport */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`h-full shrink-0 border-r border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/60 backdrop-blur-xs flex flex-col justify-between overflow-y-auto transition-all duration-200 z-10 shadow-xs ${
            isSidebarCollapsed ? 'w-16' : 'w-60'
          }`}
        >
          {/* Navigation links */}
          <div className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id || (item.id === 'prospects' && currentRoute === 'prospect-detail') || (item.id === 'opportunities' && currentRoute === 'opportunity-detail');

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group cursor-pointer ${
                    isActive
                      ? 'text-teal-800 dark:text-teal-200 bg-teal-50/80 dark:bg-teal-950/50 border border-teal-200/70 dark:border-teal-800/50 font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100/80 dark:hover:bg-stone-800/50'
                  }`}
                >
                  {/* Left accent line for active state */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-teal-600 dark:bg-teal-400" />
                  )}

                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300'}`} />

                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {!isSidebarCollapsed && item.badge && (
                    <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded font-semibold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer of Sidebar: Quick session CTA & collapse toggle */}
          <div className="p-3 border-t border-stone-200 dark:border-stone-800/80 space-y-2 mt-auto">
            {!isSidebarCollapsed ? (
              <div className="px-3 py-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/50">
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                  <span>Today's Target</span>
                  <span className="font-mono text-teal-600 dark:text-teal-400 font-semibold">{timeFormatted}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (state.streakCount > 0 ? (1 / plannedList.length || 1) * 100 : 0))}%` }} 
                    />
                  </div>
                  <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">{plannedList.length} items</span>
                </div>
              </div>
            ) : null}

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              aria-label="Toggle Sidebar Collapse"
              className="w-full flex items-center justify-center p-1.5 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer text-xs"
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <div className="flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Collapse rail</div>}
            </button>
          </div>
        </aside>

        {/* Main Content Viewport (Centered, scrollable, max-w-1280px) */}
        <main className="flex-1 overflow-y-auto min-w-0 h-full bg-stone-100/50 dark:bg-stone-950 p-3 sm:p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

