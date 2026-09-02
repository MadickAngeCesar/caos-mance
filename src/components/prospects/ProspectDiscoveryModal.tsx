import React, { useState, useEffect, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import {
  Search,
  MapPin,
  Sparkles,
  Layers,
  Building2,
  Phone,
  Globe,
  Star,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Compass,
  ArrowRight,
  Filter,
  Check,
  X,
  RefreshCw,
  Zap,
  Cpu,
  Key,
  ShieldCheck,
  Navigation,
} from 'lucide-react';
import { Organization, DiscoveredProspect } from '../../types';
import { 
  searchGooglePlaces, 
  findProspectsWithAI, 
  getGoogleMapsApiKey, 
  STORAGE_KEY_GMAPS_API,
  fetchMapsConfig 
} from '../../lib/api';

interface ProspectDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingOrganizations: Organization[];
  onImportProspects: (prospects: Partial<Organization>[], autoTriggerResearch?: boolean) => void;
  firmProfile?: any;
}

// Preset industry options
const INDUSTRY_PRESETS = [
  { id: 'Finance', label: 'Finance (Banques, microfinance & credit)', defaultQuery: 'Banque microfinance credit institute', color: '#2563eb' },
  { id: 'Assurance', label: 'Assurance', defaultQuery: 'Assurance insurance company', color: '#0ea5e9' },
  { id: 'Telecom', label: 'Telecommunication & Numerique', defaultQuery: 'Telecommunication tech numerique IT company', color: '#8b5cf6' },
  { id: 'Energy', label: 'Energie', defaultQuery: 'Energie solar power company', color: '#f59e0b' },
  { id: 'Agro', label: 'Agro-Industrie', defaultQuery: 'Agro-industrie agriculture farm', color: '#10b981' },
  { id: 'Nutrition', label: 'Nutrition', defaultQuery: 'Nutrition food production supplement', color: '#84cc16' },
  { id: 'Transport', label: 'Transport', defaultQuery: 'Transport logistics transit', color: '#d97706' },
  { id: 'Hospitality', label: 'Hotelery + Restaurant + Tourisme', defaultQuery: 'Hotel restaurant tourisme resort', color: '#e11d48' },
  { id: 'Media', label: 'Media + Communication', defaultQuery: 'Media communication agency press', color: '#6366f1' },
  { id: 'Health', label: 'Health', defaultQuery: 'Hospital clinic health center pharmacy', color: '#059669' },
  { id: 'Firms', label: 'Firms (Consulting/Legal)', defaultQuery: 'Consulting firm law legal cabinet', color: '#7c3aed' },
  { id: 'Commerce', label: 'Commerce + Distribution', defaultQuery: 'Commerce distribution retail wholesale', color: '#f43f5e' },
  { id: 'Public', label: 'Public Enterprise', defaultQuery: 'Public enterprise state corporation', color: '#64748b' },
  { id: 'RealEstate', label: 'Real Estate', defaultQuery: 'Real estate property developer agency', color: '#14b8a6' },
  { id: 'Education', label: 'Education & Training', defaultQuery: 'University school training institute', color: '#0d9488' },
  { id: 'Custom', label: 'Other', defaultQuery: '', color: '#0d9488' },
];

export const ProspectDiscoveryModal: React.FC<ProspectDiscoveryModalProps> = ({
  isOpen,
  onClose,
  existingOrganizations,
  onImportProspects,
  firmProfile,
}) => {
  // Discovery Engine Mode: 'maps' | 'gemini' | 'hybrid'
  const [engineMode, setEngineMode] = useState<'maps' | 'gemini' | 'hybrid'>('hybrid');

  // Input states
  const [selectedIndustry, setSelectedIndustry] = useState<string>('Higher Education');
  const [customIndustry, setCustomIndustry] = useState<string>('');
  const [city, setCity] = useState<string>(firmProfile?.targetCity || 'Yaounde');
  const [country, setCountry] = useState<string>(firmProfile?.targetCountry || 'Cameroon');
  const [searchQuery, setSearchQuery] = useState<string>('Private university college institute');
  const [specificCriteria, setSpecificCriteria] = useState<string>('Established organization with 30+ staff, high student/client volume');
  const [targetPainPoints, setTargetPainPoints] = useState<string>('Manual paper-based registration, no online payment portal, outdated website');
  const [quantity, setQuantity] = useState<number>(6);

  // Map & API Key state
  const [gmapsApiKey, setGmapsApiKey] = useState<string>(getGoogleMapsApiKey());
  const [tempApiKeyInput, setTempApiKeyInput] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [mapConfig, setMapConfig] = useState<{ hasKey: boolean; demoKeyUrl: string; consoleKeyUrl: string } | null>(null);

  // Search execution state
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<DiscoveredProspect[]>([]);
  const [selectedProspectIds, setSelectedProspectIds] = useState<string[]>([]);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'cards'>('split');

  // Map viewport center
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 3.848, lng: 11.502 });
  const [mapZoom, setMapZoom] = useState<number>(13);

  // Load config on mount
  useEffect(() => {
    fetchMapsConfig().then(setMapConfig).catch(() => {});
    const key = getGoogleMapsApiKey();
    setGmapsApiKey(key);
  }, [isOpen]);

  // Adjust center based on city
  useEffect(() => {
    const lowerCity = city.toLowerCase();
    if (lowerCity.includes('yaound')) {
      setMapCenter({ lat: 3.848, lng: 11.502 });
      setMapZoom(13);
    } else if (lowerCity.includes('douala')) {
      setMapCenter({ lat: 4.051, lng: 9.767 });
      setMapZoom(13);
    } else if (lowerCity.includes('nairobi')) {
      setMapCenter({ lat: -1.2921, lng: 36.8219 });
      setMapZoom(12);
    } else if (lowerCity.includes('lagos')) {
      setMapCenter({ lat: 6.5244, lng: 3.3792 });
      setMapZoom(12);
    } else if (lowerCity.includes('accra')) {
      setMapCenter({ lat: 5.6037, lng: -0.1870 });
      setMapZoom(12);
    } else if (lowerCity.includes('paris')) {
      setMapCenter({ lat: 48.8566, lng: 2.3522 });
      setMapZoom(12);
    } else if (lowerCity.includes('london')) {
      setMapCenter({ lat: 51.5074, lng: -0.1278 });
      setMapZoom(12);
    }
  }, [city]);

  // Sync default query when preset changes
  const handleIndustryChange = (indId: string) => {
    setSelectedIndustry(indId);
    const preset = INDUSTRY_PRESETS.find((p) => p.id === indId);
    if (preset && preset.defaultQuery) {
      setSearchQuery(preset.defaultQuery);
    }
  };

  // Perform search
  const handleExecuteSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setSelectedProspectIds([]);
    setActiveMarkerId(null);
    setHasSearched(true);

    const effectiveIndustry = selectedIndustry === 'Custom' ? customIndustry || 'General' : selectedIndustry;
    const fullQuery = `${searchQuery} in ${city}, ${country}`.trim();

    try {
      if (engineMode === 'maps') {
        // Pure Google Places Search
        const response = await searchGooglePlaces({
          query: fullQuery,
          locationBias: {
            latitude: mapCenter.lat,
            longitude: mapCenter.lng,
            radius: 20000,
          },
          pageSize: quantity,
        });

        const mapped: DiscoveredProspect[] = response.places.map((p: any, idx: number) => {
          const isExisting = existingOrganizations.some(
            (o) => o.name.toLowerCase().trim() === p.name.toLowerCase().trim()
          );
          return {
            id: `gmap_${p.id || idx}`,
            name: p.name,
            organizationType: p.primaryType || effectiveIndustry,
            industry: effectiveIndustry,
            city,
            country,
            address: p.address,
            website: p.website,
            phone: p.phone,
            rating: p.rating,
            userRatingsTotal: p.userRatingsTotal,
            googlePlaceId: p.googlePlaceId,
            latitude: p.latitude || mapCenter.lat + (Math.random() - 0.5) * 0.04,
            longitude: p.longitude || mapCenter.lng + (Math.random() - 0.5) * 0.04,
            source: 'google_maps',
            estimatedLeadScore: Math.floor(70 + Math.random() * 25),
            currentDigitalState: 'Google Maps verified business entity.',
            keyPainPoints: ['Digital transformation candidate', 'Online workflow modernization'],
            recommendedAngle: 'Conduct initial digital maturity assessment.',
            suggestedNextStep: 'Verify key decision maker and outreach channel.',
            isExisting,
          };
        });

        setSearchResults(mapped);
        if (mapped.length > 0 && mapped[0].latitude && mapped[0].longitude) {
          setMapCenter({ lat: mapped[0].latitude, lng: mapped[0].longitude });
        }
      } else if (engineMode === 'gemini') {
        // Pure Gemini Sourcing taking all user inputs
        const response = await findProspectsWithAI({
          industry: effectiveIndustry,
          city,
          country,
          searchQuery,
          organizationType: effectiveIndustry,
          specificCriteria,
          targetPainPoints,
          quantity,
          profile: firmProfile,
        });

        const mapped = response.prospects.map((p: any) => ({
          ...p,
          isExisting: existingOrganizations.some(
            (o) => o.name.toLowerCase().trim() === p.name.toLowerCase().trim()
          ),
        }));

        setSearchResults(mapped);
        setModelUsed(response.model || 'Gemini');
        if (mapped.length > 0 && mapped[0].latitude && mapped[0].longitude) {
          setMapCenter({ lat: mapped[0].latitude, lng: mapped[0].longitude });
        }
      } else {
        // Hybrid: First try Maps or AI, combine and enrich
        try {
          const aiResponse = await findProspectsWithAI({
            industry: effectiveIndustry,
            city,
            country,
            searchQuery,
            organizationType: effectiveIndustry,
            specificCriteria,
            targetPainPoints,
            quantity,
            profile: firmProfile,
          });

          let placesMap: any[] = [];
          if (gmapsApiKey || mapConfig?.hasKey) {
            try {
              const mapsResponse = await searchGooglePlaces({
                query: fullQuery,
                locationBias: { latitude: mapCenter.lat, longitude: mapCenter.lng, radius: 20000 },
                pageSize: Math.max(quantity, 5),
              });
              placesMap = mapsResponse.places || [];
            } catch {
              // Gracefully continue with AI results
            }
          }

          const combined = aiResponse.prospects.map((aiP: any, index: number) => {
            const matchingPlace = placesMap[index];
            const isExisting = existingOrganizations.some(
              (o) => o.name.toLowerCase().trim() === aiP.name.toLowerCase().trim()
            );

            return {
              ...aiP,
              source: (matchingPlace ? 'hybrid' : 'gemini') as 'hybrid' | 'gemini',
              address: matchingPlace?.address || aiP.address,
              phone: matchingPlace?.phone || aiP.phone,
              website: matchingPlace?.website || aiP.website,
              rating: matchingPlace?.rating || aiP.rating,
              userRatingsTotal: matchingPlace?.userRatingsTotal || aiP.userRatingsTotal,
              googlePlaceId: matchingPlace?.googlePlaceId,
              latitude: matchingPlace?.latitude || aiP.latitude || mapCenter.lat + (Math.random() - 0.5) * 0.03,
              longitude: matchingPlace?.longitude || aiP.longitude || mapCenter.lng + (Math.random() - 0.5) * 0.03,
              isExisting,
            };
          });

          setSearchResults(combined);
          setModelUsed(aiResponse.model || 'Gemini');
          if (combined.length > 0 && combined[0].latitude && combined[0].longitude) {
            setMapCenter({ lat: combined[0].latitude, lng: combined[0].longitude });
          }
        } catch (hybridErr: any) {
          throw hybridErr;
        }
      }
    } catch (err: any) {
      console.error('Prospect discovery error:', err);
      setSearchError(err.message || 'Failed to complete prospect search. Please check your query or API key.');
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle selection
  const toggleSelectProspect = (id: string) => {
    setSelectedProspectIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const nonExisting = searchResults.filter((r) => !r.isExisting).map((r) => r.id);
    if (selectedProspectIds.length === nonExisting.length) {
      setSelectedProspectIds([]);
    } else {
      setSelectedProspectIds(nonExisting);
    }
  };

  // Import Handler
  const handleImport = (autoResearch: boolean = false) => {
    const toImport = searchResults.filter((r) => selectedProspectIds.includes(r.id));
    if (toImport.length === 0) return;

    const orgsToCreate: Partial<Organization>[] = toImport.map((p) => ({
      name: p.name,
      organizationType: p.organizationType,
      city: p.city,
      country: p.country,
      address: p.address,
      website: p.website,
      phone: p.phone,
      rating: p.rating,
      userRatingsTotal: p.userRatingsTotal,
      googlePlaceId: p.googlePlaceId,
      latitude: p.latitude,
      longitude: p.longitude,
      priority: p.estimatedLeadScore && p.estimatedLeadScore >= 80 ? 'high' : 'medium',
      stage: 'lead',
      leadScore: p.estimatedLeadScore || 70,
      notes: `Discovered via ${p.source.toUpperCase()} Radar.\n\nRecommended Angle: ${p.recommendedAngle || 'Digitalization and portal modernization.'}\n\nPain Points: ${(p.keyPainPoints || []).join('; ')}`,
      tags: ['Radar Sourced', p.industry || 'Tech'].filter(Boolean),
      contacts: (p as any).contacts || [],
    }));

    onImportProspects(orgsToCreate, autoResearch);
    onClose();
  };

  // Save custom key
  const handleSaveCustomKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_GMAPS_API, tempApiKeyInput.trim());
      setGmapsApiKey(tempApiKeyInput.trim());
      setShowKeyModal(false);
    }
  };

  // Selected item object
  const activeMarkerItem = useMemo(
    () => searchResults.find((r) => r.id === activeMarkerId),
    [searchResults, activeMarkerId]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-900/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Prospect Discovery Radar
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Google Maps & Gemini
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Scan target territories with interactive Google Maps places data and Gemini institutional qualification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyModal(true)}
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Configure Google Maps API Key"
            >
              <Key className="w-3.5 h-3.5 text-stone-400" />
              <span>{gmapsApiKey ? 'Maps Key Active' : 'Configure Maps Key'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two-Column Form & Viewport */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-stone-200 dark:divide-stone-800">
          
          {/* Left Panel: Search Parameters & Criteria (5 Cols) */}
          <div className="lg:col-span-5 p-5 space-y-4 overflow-y-auto max-h-[calc(92vh-130px)]">
            {/* Engine Mode Tabs */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Discovery Engine
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-lg">
                <button
                  type="button"
                  onClick={() => setEngineMode('hybrid')}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    engineMode === 'hybrid'
                      ? 'bg-white dark:bg-stone-900 text-teal-700 dark:text-teal-300 shadow-2xs font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Dual (Maps+AI)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEngineMode('maps')}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    engineMode === 'maps'
                      ? 'bg-white dark:bg-stone-900 text-teal-700 dark:text-teal-300 shadow-2xs font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Google Maps</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEngineMode('gemini')}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    engineMode === 'gemini'
                      ? 'bg-white dark:bg-stone-900 text-teal-700 dark:text-teal-300 shadow-2xs font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Gemini AI</span>
                </button>
              </div>
            </div>

            {/* Target Industry / Sector */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Target Industry / Vertical
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => handleIndustryChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 cursor-pointer focus:ring-2 focus:ring-teal-600/30 focus:outline-hidden"
              >
                {INDUSTRY_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              {selectedIndustry === 'Custom' && (
                <input
                  type="text"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  placeholder="Specify custom sector (e.g. Agritech, Solar Energy, Law Firms)..."
                  className="mt-2 w-full px-3 py-1.5 text-xs rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              )}
            </div>

            {/* Geographic Focus: City & Country */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  City / Territory
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Yaounde, Douala..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600/30 focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Cameroon, Kenya..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600/30 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Search Query / Keywords */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Search Query / Specific Focus
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Private university, referral hospital, polytechnic..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600/30 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Custom Research Criteria & Pain Points (Takes User's Inputs) */}
            <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Custom Research Criteria</span>
                </span>
                <span className="text-[10px] text-stone-400">Personalized Inputs</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Target Size & Institutional Profile
                </label>
                <input
                  type="text"
                  value={specificCriteria}
                  onChange={(e) => setSpecificCriteria(e.target.value)}
                  placeholder="e.g. 50+ staff, high student volume, campus presence..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600/30 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Target Digitalization Pain Points
                </label>
                <textarea
                  value={targetPainPoints}
                  onChange={(e) => setTargetPainPoints(e.target.value)}
                  rows={2}
                  placeholder="e.g. Manual paper forms, outdated website, no fee payment gateway, disjointed Excel sheets..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-600/30 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400">
                  Target Batch Size:
                </label>
                <div className="flex items-center gap-1.5">
                  {[3, 6, 10, 15].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuantity(num)}
                      className={`px-2.5 py-0.5 text-xs rounded-md border cursor-pointer ${
                        quantity === num
                          ? 'bg-teal-600 text-white border-teal-600 font-semibold'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Execute Search CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleExecuteSearch()}
                disabled={isSearching}
                className="w-full py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Scanning Territory & Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4" />
                    <span>Scan & Find Prospects ({quantity})</span>
                  </>
                )}
              </button>
            </div>

            {searchError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{searchError}</span>
                  {!gmapsApiKey && (
                    <div className="mt-1.5">
                      <button
                        onClick={() => setShowKeyModal(true)}
                        className="font-semibold underline hover:text-red-950 dark:hover:text-red-200 cursor-pointer"
                      >
                        Click here to add your Google Maps API Key or Demo Key
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Interactive Google Map & Discovered Results (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col bg-stone-50/50 dark:bg-stone-950/50 h-full max-h-[calc(92vh-130px)]">
            
            {/* View Controls & Selection Status */}
            <div className="p-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  {searchResults.length > 0 ? (
                    <span>Discovered: {searchResults.length} prospects</span>
                  ) : (
                    <span>Interactive Territory View</span>
                  )}
                </span>
                {modelUsed && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                    Model: {modelUsed}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* View switcher */}
                <div className="flex items-center p-0.5 bg-stone-100 dark:bg-stone-800 rounded-md">
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      viewMode === 'split'
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Split
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      viewMode === 'map'
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Map
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      viewMode === 'cards'
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Cards
                  </button>
                </div>
              </div>
            </div>

            {/* View Content Area */}
            <div className="flex-1 overflow-y-auto flex flex-col">
              
              {/* Interactive Google Map / Territory Radar Section */}
              {(viewMode === 'split' || viewMode === 'map') && (
                <div 
                  className={`w-full relative border-b border-stone-200 dark:border-stone-800 bg-stone-900 overflow-hidden ${
                    viewMode === 'split' ? 'h-[260px] sm:h-[300px]' : 'h-full min-h-[400px]'
                  }`}
                >
                  {gmapsApiKey ? (
                    <APIProvider apiKey={gmapsApiKey}>
                      <Map
                        center={mapCenter}
                        zoom={mapZoom}
                        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                        className="w-full h-full"
                        style={{ height: '100%', width: '100%' }}
                        gestureHandling="greedy"
                        disableDefaultUI={false}
                      >
                        {/* Advanced Markers for each discovered prospect */}
                        {searchResults.map((prospect) => {
                          if (!prospect.latitude || !prospect.longitude) return null;
                          const isSelected = selectedProspectIds.includes(prospect.id);
                          const isHighPriority = (prospect.estimatedLeadScore || 0) >= 80;

                          return (
                            <AdvancedMarker
                              key={prospect.id}
                              position={{ lat: prospect.latitude, lng: prospect.longitude }}
                              onClick={() => setActiveMarkerId(prospect.id)}
                              title={prospect.name}
                            >
                              <Pin
                                background={isSelected ? '#0f766e' : isHighPriority ? '#0d9488' : '#3b82f6'}
                                borderColor="#ffffff"
                                glyphColor="#ffffff"
                                scale={isSelected ? 1.2 : 1.0}
                              />
                            </AdvancedMarker>
                          );
                        })}

                        {/* InfoWindow for active clicked marker */}
                        {activeMarkerItem && activeMarkerItem.latitude && activeMarkerItem.longitude && (
                          <InfoWindow
                            position={{ lat: activeMarkerItem.latitude, lng: activeMarkerItem.longitude }}
                            onCloseClick={() => setActiveMarkerId(null)}
                          >
                            <div className="p-1 max-w-[240px] text-stone-900">
                              <h4 className="font-bold text-xs leading-tight mb-1">
                                {activeMarkerItem.name}
                              </h4>
                              <p className="text-[11px] text-stone-600 mb-1">
                                {activeMarkerItem.address || `${activeMarkerItem.city}, ${activeMarkerItem.country}`}
                              </p>
                              {activeMarkerItem.rating && (
                                <div className="flex items-center gap-1 text-[11px] text-amber-600 mb-1.5">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span className="font-semibold">{activeMarkerItem.rating}</span>
                                  {activeMarkerItem.userRatingsTotal && (
                                    <span className="text-stone-400">({activeMarkerItem.userRatingsTotal})</span>
                                  )}
                                </div>
                              )}
                              <div className="pt-1.5 border-t border-stone-200 flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                                  Score: {activeMarkerItem.estimatedLeadScore || 75}%
                                </span>
                                <button
                                  onClick={() => toggleSelectProspect(activeMarkerItem.id)}
                                  className="px-2 py-0.5 text-[10px] font-semibold rounded bg-teal-600 text-white cursor-pointer hover:bg-teal-700"
                                >
                                  {selectedProspectIds.includes(activeMarkerItem.id) ? 'Deselect' : 'Select'}
                                </button>
                              </div>
                            </div>
                          </InfoWindow>
                        )}
                      </Map>
                    </APIProvider>
                  ) : (
                    /* Interactive Territory Grid / Radar View when no Google Maps API Key is provided */
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative select-none bg-stone-950 text-white">
                      {/* Radar circular background grids */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <div className="w-64 h-64 rounded-full border border-teal-500/40" />
                        <div className="w-48 h-48 rounded-full border border-teal-500/30 absolute" />
                        <div className="w-32 h-32 rounded-full border border-teal-500/20 absolute" />
                        <div className="w-16 h-16 rounded-full border border-teal-500/20 absolute" />
                        <div className="w-full h-px bg-teal-500/20 absolute" />
                        <div className="h-full w-px bg-teal-500/20 absolute" />
                      </div>

                      {/* Discovered pins plotted on territory radar */}
                      {searchResults.length > 0 ? (
                        <div className="relative z-10 w-full h-full flex flex-col justify-between p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 bg-stone-900/80 px-2.5 py-1 rounded-md border border-stone-700/60 text-xs">
                              <MapPin className="w-3.5 h-3.5 text-teal-400" />
                              <span className="font-mono text-[11px] text-teal-300">
                                {city}, {country} ({mapCenter.lat.toFixed(3)}°N, {mapCenter.lng.toFixed(3)}°E)
                              </span>
                            </div>
                            <button
                              onClick={() => setShowKeyModal(true)}
                              className="text-[11px] font-medium bg-teal-900/60 hover:bg-teal-900 text-teal-300 border border-teal-700/60 px-2.5 py-1 rounded cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <Key className="w-3 h-3" />
                              <span>Connect Google Maps Key</span>
                            </button>
                          </div>

                          {/* Plotted Interactive Points */}
                          <div className="relative flex-1 my-2 overflow-hidden">
                            {searchResults.map((prospect, idx) => {
                              const isSelected = selectedProspectIds.includes(prospect.id);
                              const isHighPriority = (prospect.estimatedLeadScore || 0) >= 80;
                              // Calculate pseudo coordinates relative to mapCenter for radar placement
                              const offsetX = 50 + ((prospect.longitude || mapCenter.lng) - mapCenter.lng) * 1200 + ((idx % 3) - 1) * 20;
                              const offsetY = 50 - ((prospect.latitude || mapCenter.lat) - mapCenter.lat) * 1200 + ((idx % 2) - 0.5) * 25;
                              const clampedX = Math.max(8, Math.min(92, offsetX));
                              const clampedY = Math.max(12, Math.min(88, offsetY));

                              return (
                                <button
                                  key={prospect.id}
                                  onClick={() => setActiveMarkerId(prospect.id)}
                                  style={{ left: `${clampedX}%`, top: `${clampedY}%` }}
                                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-1 rounded-full cursor-pointer transition-all transform hover:scale-125 z-10 ${
                                    isSelected
                                      ? 'bg-teal-500 text-white ring-2 ring-white shadow-lg'
                                      : isHighPriority
                                      ? 'bg-emerald-500 text-white ring-1 ring-emerald-300'
                                      : 'bg-blue-600 text-white'
                                  }`}
                                  title={`${prospect.name} (${prospect.estimatedLeadScore || 70}%)`}
                                >
                                  <Building2 className="w-3.5 h-3.5" />
                                </button>
                              );
                            })}
                          </div>

                          {/* Active marker preview bar */}
                          {activeMarkerItem && (
                            <div className="bg-stone-900/95 border border-stone-700/80 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs">
                              <div className="truncate">
                                <div className="font-bold text-white truncate">{activeMarkerItem.name}</div>
                                <div className="text-[11px] text-stone-400 truncate">
                                  {activeMarkerItem.address || `${activeMarkerItem.city}, ${activeMarkerItem.country}`}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] font-semibold text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                                  Score: {activeMarkerItem.estimatedLeadScore || 75}%
                                </span>
                                <button
                                  onClick={() => toggleSelectProspect(activeMarkerItem.id)}
                                  className="px-2.5 py-1 text-[11px] font-semibold rounded bg-teal-600 text-white hover:bg-teal-500 cursor-pointer"
                                >
                                  {selectedProspectIds.includes(activeMarkerItem.id) ? 'Deselect' : 'Select'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="z-10 flex flex-col items-center justify-center text-center p-6 space-y-2">
                          <Compass className="w-8 h-8 text-teal-400 animate-pulse" />
                          <h3 className="text-xs font-bold text-stone-200">Interactive Territory Radar Ready</h3>
                          <p className="text-[11px] text-stone-400 max-w-xs">
                            Scans &amp; geo-plots local organizations across {city}, {country}. Click &quot;Scan &amp; Find Prospects&quot; to begin.
                          </p>
                          <button
                            onClick={() => setShowKeyModal(true)}
                            className="mt-1 text-[11px] text-teal-400 hover:text-teal-300 underline cursor-pointer"
                          >
                            Add Google Maps Key for Satellite &amp; Vector View
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empty / Not Searched State Overlay on Map */}
                  {!hasSearched && searchResults.length === 0 && gmapsApiKey && (
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-2xs flex flex-col items-center justify-center p-6 text-center text-white pointer-events-none">
                      <Compass className="w-10 h-10 text-teal-400 mb-2 animate-pulse" />
                      <h3 className="text-sm font-bold">Ready to Scan Territory</h3>
                      <p className="text-xs text-stone-200 max-w-sm mt-1">
                        Select your target industry, territory, and digital pain points on the left, then click &quot;Scan &amp; Find Prospects&quot;.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Discovered Cards List */}
              {(viewMode === 'split' || viewMode === 'cards') && (
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {searchResults.length > 0 && (
                    <div className="flex items-center justify-between pb-1 text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="select-all-prospects"
                          checked={
                            selectedProspectIds.length > 0 &&
                            selectedProspectIds.length === searchResults.filter((r) => !r.isExisting).length
                          }
                          onChange={handleSelectAll}
                          className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                        <label htmlFor="select-all-prospects" className="font-medium text-stone-700 dark:text-stone-300 cursor-pointer">
                          Select all valid candidates ({selectedProspectIds.length} chosen)
                        </label>
                      </div>
                    </div>
                  )}

                  {searchResults.map((prospect) => {
                    const isSelected = selectedProspectIds.includes(prospect.id);
                    const isHighFit = (prospect.estimatedLeadScore || 0) >= 80;

                    return (
                      <div
                        key={prospect.id}
                        onClick={() => !prospect.isExisting && toggleSelectProspect(prospect.id)}
                        className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                          prospect.isExisting
                            ? 'bg-stone-100/70 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-60'
                            : isSelected
                            ? 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-500 shadow-2xs'
                            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={prospect.isExisting}
                              onChange={() => toggleSelectProspect(prospect.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                                  {prospect.name}
                                </h4>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                                  {prospect.organizationType}
                                </span>
                                {prospect.isExisting && (
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                                    Already in CRM
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-1">
                                <MapPin className="w-3 h-3 shrink-0 text-stone-400" />
                                <span>{prospect.address || `${prospect.city}, ${prospect.country}`}</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="flex items-center justify-end gap-1">
                              <span className={`text-xs font-bold ${isHighFit ? 'text-teal-600 dark:text-teal-400' : 'text-stone-700 dark:text-stone-300'}`}>
                                {prospect.estimatedLeadScore}%
                              </span>
                              <span className="text-[10px] text-stone-400">Fit</span>
                            </div>
                            {prospect.rating && (
                              <div className="flex items-center justify-end gap-1 text-[10px] text-amber-500 mt-0.5">
                                <Star className="w-3 h-3 fill-amber-400" />
                                <span>{prospect.rating}</span>
                                {prospect.userRatingsTotal ? (
                                  <span className="text-stone-400">({prospect.userRatingsTotal})</span>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Pain points & pitch angle */}
                        {prospect.keyPainPoints && prospect.keyPainPoints.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800/80">
                            <div className="text-[11px] text-stone-600 dark:text-stone-400 space-y-1">
                              <div className="flex items-start gap-1.5">
                                <span className="font-semibold text-stone-700 dark:text-stone-300 shrink-0">
                                  Pain Points:
                                </span>
                                <span className="line-clamp-1">{prospect.keyPainPoints.join(', ')}</span>
                              </div>
                              {prospect.recommendedAngle && (
                                <div className="flex items-start gap-1.5 text-teal-700 dark:text-teal-300">
                                  <span className="font-semibold shrink-0">Pitch Angle:</span>
                                  <span className="line-clamp-1">{prospect.recommendedAngle}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Contact details */}
                        <div className="mt-2 flex items-center gap-3 text-[11px] text-stone-500">
                          {prospect.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-stone-400" />
                              <span>{prospect.phone}</span>
                            </span>
                          )}
                          {prospect.website && (
                            <a
                              href={prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline"
                            >
                              <Globe className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">{prospect.website.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {hasSearched && searchResults.length === 0 && !isSearching && (
                    <div className="py-12 text-center text-stone-500">
                      <Building2 className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold">No prospects matched your specific search criteria</p>
                      <p className="text-[11px] text-stone-400 mt-1">
                        Try broadening your keywords, changing the target city, or switching discovery engines.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Ingestion Action Bar */}
            <div className="p-3.5 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between gap-3">
              <div className="text-xs text-stone-600 dark:text-stone-400">
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  {selectedProspectIds.length}
                </span>{' '}
                prospect(s) selected for CRM ingestion
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleImport(false)}
                  disabled={selectedProspectIds.length === 0}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Import Selected ({selectedProspectIds.length})
                </button>

                <button
                  type="button"
                  onClick={() => handleImport(true)}
                  disabled={selectedProspectIds.length === 0}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-xs disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Import & Auto-Research ({selectedProspectIds.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Configure Google Maps Key */}
        {showKeyModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Google Maps Platform API Key
                  </h3>
                </div>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-stone-500">
                To search verified Google Places and display interactive maps, provide your Google Maps API key or use the free public Maps Demo Key for prototyping.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Google Maps API Key
                </label>
                <input
                  type="password"
                  value={tempApiKeyInput}
                  onChange={(e) => setTempApiKeyInput(e.target.value)}
                  placeholder={gmapsApiKey ? '••••••••••••••••••••' : 'AIzaSy...'}
                  className="w-full px-3 py-2 text-xs rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <a
                  href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Get Free Maps Demo Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://console.cloud.google.com/google/maps-apis/credentials?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-500 hover:underline flex items-center gap-1"
                >
                  <span>Cloud Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomKey}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                >
                  Save API Key
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
