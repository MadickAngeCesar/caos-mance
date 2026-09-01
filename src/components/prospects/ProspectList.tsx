import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Upload, 
  Download, 
  MoreVertical, 
  Sparkles, 
  Send, 
  Eye, 
  Trash2, 
  CheckSquare, 
  Building2,
  ChevronRight,
  ExternalLink,
  Layers,
  Compass,
  MapPin
} from 'lucide-react';
import { Organization, CustomFieldDefinition } from '../../types';
import { StageBadge, PriorityBadge } from '../ui/Badge';
import { CustomFieldRenderer } from '../ui/CustomFieldRenderer';
import { ProspectDiscoveryModal } from './ProspectDiscoveryModal';

interface ProspectListProps {
  organizations: Organization[];
  customFields: CustomFieldDefinition[];
  onSelectOrg: (id: string) => void;
  onAddOrg: (org: Partial<Organization>) => void;
  onUpdateOrgStage: (id: string, stage: Organization['stage']) => void;
  onDeleteOrg: (id: string) => void;
  onOpenOutreach: (orgId: string) => void;
  onTriggerResearch: (orgId: string) => void;
  initialCreateOpen?: boolean;
}

export const ProspectList: React.FC<ProspectListProps> = ({
  organizations,
  customFields,
  onSelectOrg,
  onAddOrg,
  onUpdateOrgStage,
  onDeleteOrg,
  onOpenOutreach,
  onTriggerResearch,
  initialCreateOpen = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isDense, setIsDense] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'leadScore' | 'stage' | 'createdAt'>('leadScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(initialCreateOpen);
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);

  // New Organization Form State
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgType, setNewOrgType] = useState('Private University');
  const [newOrgCity, setNewOrgCity] = useState('');
  const [newOrgCountry, setNewOrgCountry] = useState('Cameroon');
  const [newOrgWebsite, setNewOrgWebsite] = useState('');
  const [newOrgPriority, setNewOrgPriority] = useState<Organization['priority']>('medium');
  const [newOrgNotes, setNewOrgNotes] = useState('');
  const [newOrgCustomFields, setNewOrgCustomFields] = useState<Record<string, any>>({});

  // Filter & Sort
  const filtered = organizations
    .filter((o) => !o.deletedAt)
    .filter((o) => {
      const matchSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.organizationType?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStage = stageFilter === 'all' || o.stage === stageFilter;
      const matchPriority = priorityFilter === 'all' || o.priority === priorityFilter;
      return matchSearch && matchStage && matchPriority;
    })
    .sort((a, b) => {
      let valA: any = a[sortField] ?? '';
      let valB: any = b[sortField] ?? '';
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    onAddOrg({
      name: newOrgName.trim(),
      organizationType: newOrgType,
      city: newOrgCity.trim() || undefined,
      country: newOrgCountry.trim() || undefined,
      website: newOrgWebsite.trim() || undefined,
      priority: newOrgPriority,
      notes: newOrgNotes.trim() || undefined,
      stage: 'lead',
      customFields: newOrgCustomFields,
    });

    // Reset
    setNewOrgName('');
    setNewOrgCity('');
    setNewOrgWebsite('');
    setNewOrgNotes('');
    setNewOrgCustomFields({});
    setShowAddModal(false);
  };

  const handleExportCsv = () => {
    const rows = [
      ['Name', 'Stage', 'Priority', 'Lead Score', 'City', 'Country', 'Website'],
      ...filtered.map((o) => [
        o.name,
        o.stage,
        o.priority,
        o.leadScore,
        o.city || '',
        o.country || '',
        o.website || '',
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CAOS_Prospects_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Prospect Organizations
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Mode A client acquisition records ({filtered.length} visible of {organizations.length} total)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowDiscoveryModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Find Prospects (Maps & AI)</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-stone-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-stone-950 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Organization</span>
          </button>
        </div>
      </div>

      {/* 2. Persistent Filter Bar */}
      <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name, location, or type..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600/30"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Stage dropdown */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer"
            >
              <option value="all">All Stages</option>
              <option value="lead">Lead</option>
              <option value="researching">Researching</option>
              <option value="qualified">Qualified</option>
              <option value="contacted">Contacted</option>
              <option value="engaged">Engaged</option>
              <option value="nurture">Nurture</option>
              <option value="disqualified">Disqualified</option>
            </select>

            {/* Priority dropdown */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto text-xs text-stone-500">
          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isDense}
              onChange={(e) => setIsDense(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Dense view</span>
          </label>
        </div>
      </div>

      {/* 3. Bulk Selection Action Bar (when ≥ 1 selected) */}
      {selectedIds.length > 0 && (
        <div className="px-4 py-2 rounded-lg bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-150">
          <span className="font-semibold text-teal-900 dark:text-teal-200">
            {selectedIds.length} organization(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                selectedIds.forEach((id) => onUpdateOrgStage(id, 'qualified'));
                setSelectedIds([]);
              }}
              className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-2xs cursor-pointer"
            >
              Mark as Qualified
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1 rounded border border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* 4. Main Data Table */}
      <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-3.5 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={handleSelectAll}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                </th>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-stone-800 dark:hover:text-stone-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Organization</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('stage')}
                  className="py-3 px-4 cursor-pointer hover:text-stone-800 dark:hover:text-stone-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Stage</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Priority</th>
                <th
                  onClick={() => toggleSort('leadScore')}
                  className="py-3 px-4 cursor-pointer hover:text-stone-800 dark:hover:text-stone-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Lead Score</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Digital Maturity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-stone-400">
                    No prospect organizations match your current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((org) => (
                  <tr
                    key={org.id}
                    className={`hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors group ${
                      selectedIds.includes(org.id) ? 'bg-teal-50/30 dark:bg-teal-950/20' : ''
                    } ${isDense ? 'py-1.5' : 'py-3'}`}
                  >
                    <td className="py-3 px-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(org.id)}
                        onChange={() => handleToggleSelectOne(org.id)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                    </td>

                    {/* Org Name + City */}
                    <td className="py-3 px-4 min-w-[200px]">
                      <div
                        onClick={() => onSelectOrg(org.id)}
                        className="font-medium text-stone-900 dark:text-stone-100 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{org.name}</span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {org.organizationType || 'Education'} • {org.city || 'Cameroon'}
                      </p>
                    </td>

                    {/* Stage Dropdown */}
                    <td className="py-3 px-4">
                      <select
                        value={org.stage}
                        onChange={(e) => onUpdateOrgStage(org.id, e.target.value as any)}
                        className="text-xs font-medium rounded px-2 py-0.5 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 cursor-pointer"
                      >
                        <option value="lead">Lead</option>
                        <option value="researching">Researching</option>
                        <option value="qualified">Qualified</option>
                        <option value="contacted">Contacted</option>
                        <option value="engaged">Engaged</option>
                        <option value="nurture">Nurture</option>
                        <option value="disqualified">Disqualified</option>
                      </select>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      <PriorityBadge priority={org.priority} />
                    </td>

                    {/* Lead Score with Visual Progress */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-900 dark:text-stone-100 w-7">
                          {org.leadScore}
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              org.leadScore >= 70
                                ? 'bg-teal-600 dark:bg-teal-400'
                                : org.leadScore >= 40
                                ? 'bg-amber-500'
                                : 'bg-stone-400'
                            }`}
                            style={{ width: `${org.leadScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Digital Maturity */}
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-stone-600 dark:text-stone-300">
                        {org.digitalizationProfile?.overallScore || '5.0'}/10
                      </span>
                    </td>

                    {/* Quick Row Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onTriggerResearch(org.id)}
                          title="Run Research with Gemini"
                          className="p-1.5 rounded text-stone-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenOutreach(org.id)}
                          title="Draft Outreach"
                          className="p-1.5 rounded text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectOrg(org.id)}
                          title="Open Detail Hub"
                          className="p-1.5 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add Prospect Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Add Prospect Organization</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Organization Name *</label>
                <input
                  required
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Institut Universitaire de la Côte (IUC)"
                  className="w-full mt-1 px-3 py-1.5 text-sm rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Type</label>
                  <select
                    value={newOrgType}
                    onChange={(e) => setNewOrgType(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Public University">Public University</option>
                    <option value="Private University">Private University</option>
                    <option value="Vocational Institute">Vocational Institute</option>
                    <option value="Research Center">Research Center</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Priority</label>
                  <select
                    value={newOrgPriority}
                    onChange={(e) => setNewOrgPriority(e.target.value as any)}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">City</label>
                  <input
                    type="text"
                    value={newOrgCity}
                    onChange={(e) => setNewOrgCity(e.target.value)}
                    placeholder="Douala, Yaoundé, Bamenda..."
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Website</label>
                  <input
                    type="url"
                    value={newOrgWebsite}
                    onChange={(e) => setNewOrgWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Custom Fields */}
              {customFields.length > 0 && (
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Custom Fields</p>
                  {customFields.map((cf) => (
                    <CustomFieldRenderer
                      key={cf.id}
                      definition={cf}
                      value={newOrgCustomFields[cf.id]}
                      onChange={(val) => setNewOrgCustomFields({ ...newOrgCustomFields, [cf.id]: val })}
                    />
                  ))}
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium rounded border border-stone-200 dark:border-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium rounded bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                >
                  Create Prospect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discovery Modal (Google Maps & Gemini) */}
      <ProspectDiscoveryModal
        isOpen={showDiscoveryModal}
        onClose={() => setShowDiscoveryModal(false)}
        existingOrganizations={organizations}
        onImportProspects={(prospectsToImport, autoResearch) => {
          prospectsToImport.forEach((p) => {
            onAddOrg(p);
          });
        }}
      />
    </div>
  );
};
