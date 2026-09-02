import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Sliders, 
  Database, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  ShieldAlert,
  Edit2,
  Cpu,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  MapPin,
  Compass
} from 'lucide-react';
import { AppStoreState, resetStoreToSeed } from '../../lib/storage';
import { CustomFieldDefinition, Playbook, FreelanceProfile } from '../../types';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { 
  STORAGE_KEY_GEMINI_API, 
  STORAGE_KEY_GEMINI_MODEL, 
  STORAGE_KEY_GMAPS_API, 
  testGeminiApiKey,
  getGoogleMapsApiKey
} from '../../lib/api';
import { AVAILABLE_MODELS, getModelMeta } from '../../lib/models';

interface SettingsViewProps {
  state: AppStoreState;
  onUpdateProfile: (patch: Partial<FreelanceProfile>) => void;
  onAddCustomField: (field: Partial<CustomFieldDefinition>) => void;
  onDeleteCustomField: (fieldId: string) => void;
  onImportState: (newState: AppStoreState) => void;
  onResetToSeed: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onUpdateProfile,
  onAddCustomField,
  onDeleteCustomField,
  onImportState,
  onResetToSeed,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'ai_keys' | 'custom_fields' | 'scoring' | 'backup'>('profile');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // API Key & AI Model State
  const [userApiKey, setUserApiKey] = useState('');
  const [modelPref, setModelPref] = useState('auto');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{
    tested: boolean;
    success?: boolean;
    message?: string;
    model?: string;
  }>({ tested: false });

  // Google Maps Key State
  const [gmapsApiKey, setGmapsApiKey] = useState('');
  const [showGmapsKey, setShowGmapsKey] = useState(false);
  const [gmapsSavedNotice, setGmapsSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem(STORAGE_KEY_GEMINI_API) || '';
      setUserApiKey(savedKey);
      const savedModel = localStorage.getItem(STORAGE_KEY_GEMINI_MODEL) || 'auto';
      setModelPref(savedModel);
      const savedGmaps = localStorage.getItem(STORAGE_KEY_GMAPS_API) || '';
      setGmapsApiKey(savedGmaps);
    }
  }, []);

  const handleSaveGmapsKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      if (gmapsApiKey.trim()) {
        localStorage.setItem(STORAGE_KEY_GMAPS_API, gmapsApiKey.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY_GMAPS_API);
      }
    }
    setGmapsSavedNotice('Google Maps Platform configuration updated.');
    setTimeout(() => setGmapsSavedNotice(null), 3000);
  };

  const handleClearGmapsKey = () => {
    setGmapsApiKey('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_GMAPS_API);
    }
    setGmapsSavedNotice('Google Maps key cleared.');
    setTimeout(() => setGmapsSavedNotice(null), 3000);
  };

  const handleSaveAIConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      if (userApiKey.trim()) {
        localStorage.setItem(STORAGE_KEY_GEMINI_API, userApiKey.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY_GEMINI_API);
      }
      localStorage.setItem(STORAGE_KEY_GEMINI_MODEL, modelPref);
    }
    setKeyTestResult({
      tested: true,
      success: true,
      message: 'AI configuration saved to local storage.',
    });
  };

  const handleTestApiKey = async () => {
    setIsTestingKey(true);
    setKeyTestResult({ tested: false });
    try {
      const result = await testGeminiApiKey(userApiKey.trim() || undefined);
      setKeyTestResult({
        tested: true,
        success: result.success,
        message: result.message || result.error || (result.success ? 'API Key validated successfully' : 'Validation failed'),
        model: result.modelTested,
      });
      if (result.success && userApiKey.trim()) {
        localStorage.setItem(STORAGE_KEY_GEMINI_API, userApiKey.trim());
      }
    } catch (err: any) {
      setKeyTestResult({
        tested: true,
        success: false,
        message: err.message || 'Network error while validating key.',
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleClearApiKey = () => {
    setUserApiKey('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_GEMINI_API);
    }
    setKeyTestResult({
      tested: true,
      success: true,
      message: 'Custom key cleared. Default environment settings active.',
    });
  };

  // New Custom Field Form State
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldTarget, setNewFieldTarget] = useState<'organization' | 'opportunity'>('organization');
  const [newFieldType, setNewFieldType] = useState<CustomFieldDefinition['fieldType']>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState('');

  const handleCreateCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;

    onAddCustomField({
      name: newFieldName.trim(),
      entityType: newFieldTarget,
      fieldType: newFieldType,
      isRequired: newFieldRequired,
      options: newFieldType === 'select' || newFieldType === 'multiselect'
        ? newFieldOptions.split(',').map((o) => o.trim()).filter(Boolean)
        : undefined,
      isActive: true,
      sortOrder: state.customFields.length + 1,
    });

    setNewFieldName('');
    setNewFieldOptions('');
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `CAOS_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.organizations && parsed.opportunities) {
          onImportState(parsed);
          alert('Backup data restored successfully!');
        } else {
          alert('Invalid CAOS backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="pb-2 border-b border-stone-200 dark:border-stone-800">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-stone-600 dark:text-stone-400" />
          <span>System Settings & Configuration</span>
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Manage firm profile, dynamic schema fields, scoring parameters, and local data backups
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 text-xs font-semibold border-b border-stone-200 dark:border-stone-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-2.5 border-b-2 cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'profile'
              ? 'border-teal-600 dark:border-teal-400 text-teal-700 dark:text-teal-300'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          Firm Profile & Region
        </button>
        <button
          onClick={() => setActiveTab('ai_keys')}
          className={`pb-2.5 border-b-2 cursor-pointer whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'ai_keys'
              ? 'border-teal-600 dark:border-teal-400 text-teal-700 dark:text-teal-300'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI & Gemini Keys</span>
          {userApiKey ? <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> : null}
        </button>
        <button
          onClick={() => setActiveTab('custom_fields')}
          className={`pb-2.5 border-b-2 cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'custom_fields'
              ? 'border-teal-600 dark:border-teal-400 text-teal-700 dark:text-teal-300'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          Custom Fields Schema ({state.customFields.length})
        </button>
        <button
          onClick={() => setActiveTab('scoring')}
          className={`pb-2.5 border-b-2 cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'scoring'
              ? 'border-teal-600 dark:border-teal-400 text-teal-700 dark:text-teal-300'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          Lead Scoring Rules
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-2.5 border-b-2 cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'backup'
              ? 'border-teal-600 dark:border-teal-400 text-teal-700 dark:text-teal-300'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          Data & Local Backup
        </button>
      </div>

      {/* Tab: AI Engine & API Keys */}
      {activeTab === 'ai_keys' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Key className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Google Gemini API Key</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Add your personal Gemini API key directly to CAOS. The system will automatically select the best available model based on your credits and free-tier quotas.
                </p>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1 hover:bg-blue-100 transition-colors shrink-0"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <form onSubmit={handleSaveAIConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Your Gemini API Key (Stored Securely on Device)
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={userApiKey}
                    onChange={(e) => setUserApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 pr-10 rounded-md border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-900 dark:text-stone-100 text-xs font-mono focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Leave blank to use the default environment key if configured. Your key never leaves your system.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Model Selection & Intelligence Strategy
                  </label>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {getModelMeta(modelPref).badge}
                  </span>
                </div>
                <select
                  value={modelPref}
                  onChange={(e) => setModelPref(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-hidden cursor-pointer"
                >
                  {AVAILABLE_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} — [{model.badge}]
                    </option>
                  ))}
                </select>

                {/* Active Model Description and Guidelines */}
                <div className="mt-2.5 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 text-[11px] text-stone-600 dark:text-stone-400 space-y-1.5">
                  <div className="font-semibold text-stone-800 dark:text-stone-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>{getModelMeta(modelPref).name}</span>
                    </span>
                    {getModelMeta(modelPref).freeTierFriendly && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                        Free-Tier Optimized
                      </span>
                    )}
                  </div>
                  <p>{getModelMeta(modelPref).description}</p>
                  {getModelMeta(modelPref).recommendedFor && (
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-200/60 dark:border-stone-700/60">
                      <span className="font-semibold text-stone-700 dark:text-stone-300">Recommended for: </span>
                      {getModelMeta(modelPref).recommendedFor}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Message / Test Output */}
              {keyTestResult.tested && (
                <div
                  className={`p-3 rounded-md border text-xs flex items-start gap-2.5 ${
                    keyTestResult.success
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200'
                      : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                  }`}
                >
                  {keyTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-0.5">
                    <div className="font-semibold">
                      {keyTestResult.success ? 'Ready & Validated' : 'Connection Notice'}
                    </div>
                    <div>{keyTestResult.message}</div>
                    {keyTestResult.model && (
                      <div className="font-mono text-[11px] opacity-80">
                        Active Model Detected: {keyTestResult.model}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-md bg-teal-600 hover:bg-teal-700 text-white shadow-xs cursor-pointer transition-colors"
                >
                  Save AI Preferences
                </button>

                <button
                  type="button"
                  onClick={handleTestApiKey}
                  disabled={isTestingKey}
                  className="px-4 py-2 text-xs font-semibold rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/60 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Cpu className={`w-3.5 h-3.5 ${isTestingKey ? 'animate-spin' : ''}`} />
                  <span>{isTestingKey ? 'Testing Connection...' : 'Test & Detect Models'}</span>
                </button>

                {userApiKey && (
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    className="text-xs text-stone-500 hover:text-red-600 dark:hover:text-red-400 underline ml-auto cursor-pointer"
                  >
                    Clear Custom Key
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Google Maps Platform Configuration Card */}
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Google Maps Platform Integration</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Enables live territory scanning, interactive maps, and Google Places (New) prospect discovery.
                </p>
              </div>
              <a
                href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1 hover:bg-teal-100 transition-colors shrink-0"
              >
                <span>Free Demo Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <form onSubmit={handleSaveGmapsKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Google Maps API Key (or Demo Key)
                </label>
                <div className="relative">
                  <input
                    type={showGmapsKey ? 'text' : 'password'}
                    value={gmapsApiKey}
                    onChange={(e) => setGmapsApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 pr-10 rounded-md border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-900 dark:text-stone-100 text-xs font-mono focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGmapsKey(!showGmapsKey)}
                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                  >
                    {showGmapsKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1">
                  <span>For prototyping without billing, use the Google Maps Demo Key.</span>
                  <a
                    href="https://console.cloud.google.com/google/maps-apis/credentials?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>Google Cloud Console</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {gmapsSavedNotice && (
                <div className="p-3 rounded-md border text-xs flex items-center gap-2 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
                  <span>{gmapsSavedNotice}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-md bg-teal-600 hover:bg-teal-700 text-white shadow-xs cursor-pointer transition-colors"
                >
                  Save Maps Configuration
                </button>

                {gmapsApiKey && (
                  <button
                    type="button"
                    onClick={handleClearGmapsKey}
                    className="text-xs text-stone-500 hover:text-red-600 dark:hover:text-red-400 underline ml-auto cursor-pointer"
                  >
                    Clear Maps Key
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Consultancy & Target Market Identity
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Consultant / Practice Name</label>
              <input
                type="text"
                value={state.profile.businessName}
                onChange={(e) => onUpdateProfile({ businessName: e.target.value })}
                className="w-full mt-1 px-3 py-1.5 text-sm rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Consultant Name</label>
              <input
                type="text"
                value={state.profile.name}
                onChange={(e) => onUpdateProfile({ name: e.target.value })}
                className="w-full mt-1 px-3 py-1.5 text-sm rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Specialized Niche</label>
              <input
                type="text"
                value={state.profile.niche}
                onChange={(e) => onUpdateProfile({ niche: e.target.value })}
                className="w-full mt-1 px-3 py-1.5 text-sm rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Primary Geography Focus</label>
              <input
                type="text"
                value={state.profile.geographicMarkets}
                onChange={(e) => onUpdateProfile({ geographicMarkets: e.target.value })}
                className="w-full mt-1 px-3 py-1.5 text-sm rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Custom Fields Builder */}
      {activeTab === 'custom_fields' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Create Field Form */}
          <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-600" />
              <span>Define New Field</span>
            </h3>

            <form onSubmit={handleCreateCustomField} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Field Label *</label>
                <input
                  required
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="e.g. Student Enrollment Count"
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Target Entity</label>
                  <select
                    value={newFieldTarget}
                    onChange={(e) => setNewFieldTarget(e.target.value as any)}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 cursor-pointer"
                  >
                    <option value="organization">Organization</option>
                    <option value="opportunity">Opportunity</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Type</label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as any)}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 cursor-pointer"
                  >
                    <option value="text">Text (Single-line)</option>
                    <option value="long_text">Long Text</option>
                    <option value="number">Number (Monospace)</option>
                    <option value="boolean">Boolean Toggle</option>
                    <option value="date">Date</option>
                    <option value="select">Dropdown Select</option>
                    <option value="url">URL Link</option>
                  </select>
                </div>
              </div>

              {(newFieldType === 'select' || newFieldType === 'multiselect') && (
                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Options (Comma-separated)</label>
                  <input
                    type="text"
                    value={newFieldOptions}
                    onChange={(e) => setNewFieldOptions(e.target.value)}
                    placeholder="e.g. Low, Medium, High, Enterprise"
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newFieldRequired}
                  onChange={(e) => setNewFieldRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600"
                />
                <span className="text-xs font-medium text-stone-700 dark:text-stone-300">Required Field</span>
              </label>

              <button
                type="submit"
                className="w-full py-2 px-4 rounded bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs cursor-pointer"
              >
                Add Custom Field to Schema
              </button>
            </form>
          </div>

          {/* Existing Fields List */}
          <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Configured Custom Fields ({state.customFields.length})
            </h3>

            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {state.customFields.map((cf) => (
                <div key={cf.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{cf.name}</span>
                      <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        {cf.fieldType}
                      </span>
                      <span className="text-[11px] uppercase font-mono text-stone-400">
                        {cf.entityType}
                      </span>
                    </div>
                    {cf.options && (
                      <p className="text-xs text-stone-400 mt-0.5">Options: {cf.options.join(', ')}</p>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteCustomField(cf.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Scoring Rules */}
      {activeTab === 'scoring' && (
        <div className="max-w-2xl bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Deterministic Lead Scoring Weights
          </h3>
          <p className="text-xs text-stone-500">
            Rule-based, transparent scoring calculated automatically for every prospect (0–100 scale).
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-md bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
              <span className="font-medium text-stone-800 dark:text-stone-200">High Priority Flag</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400">+15 pts</span>
            </div>

            <div className="p-3 rounded-md bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
              <span className="font-medium text-stone-800 dark:text-stone-200">Engaged / Contacted Stage</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400">+25 pts</span>
            </div>

            <div className="p-3 rounded-md bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
              <span className="font-medium text-stone-800 dark:text-stone-200">Decision Maker Contact Identified</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400">+10 pts</span>
            </div>

            <div className="p-3 rounded-md bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
              <span className="font-medium text-stone-800 dark:text-stone-200">Structured Deep Research Completed</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400">+10 pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Backup & Reset */}
      {activeTab === 'backup' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Export & Import Application Data
            </h3>
            <p className="text-xs text-stone-500">
              Export your entire CRM database (prospects, deals, activities, templates) as a portable JSON file.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleExportBackup}
                className="px-4 py-2 text-xs font-semibold rounded bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Full Backup (JSON)</span>
              </button>

              <label className="px-4 py-2 text-xs font-semibold rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Backup File</span>
                <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
              </label>
            </div>
          </div>

          <div className="bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/60 p-6 space-y-3">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="text-sm font-semibold">Reset to Default</h4>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Clears all prospects, deals, activities, and tasks, providing a clean slate. Your profile and settings will be preserved.
            </p>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-1.5 text-xs font-semibold rounded bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer"
            >
              Reset Database
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Entire CAOS Database?"
        description="This will permanently delete all organizations, deals, contacts, and activities."
        confirmLabel="Reset Data"
        variant="destructive"
        requireTypedName="RESET"
        onConfirm={() => {
          setShowResetConfirm(false);
          onResetToSeed();
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
