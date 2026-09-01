import React from 'react';
import { CustomFieldDefinition } from '../../types';
import { ExternalLink } from 'lucide-react';

interface CustomFieldRendererProps {
  definition: CustomFieldDefinition;
  value: any;
  onChange: (val: any) => void;
  disabled?: boolean;
}

export const CustomFieldRenderer: React.FC<CustomFieldRendererProps> = ({
  definition,
  value,
  onChange,
  disabled = false,
}) => {
  const { name, fieldType, options, isRequired } = definition;

  return (
    <div className="flex flex-col gap-1.5 py-1">
      <label className="text-xs font-medium text-stone-600 dark:text-stone-300 flex items-center gap-1">
        {name}
        {isRequired && <span className="text-red-500">*</span>}
      </label>

      {/* 1. Single-line Text */}
      {fieldType === 'text' && (
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={`Enter ${name.toLowerCase()}...`}
          className="w-full px-3 py-1.5 text-sm rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 dark:focus:border-teal-400 disabled:opacity-50 transition-colors"
        />
      )}

      {/* 2. Number (monospace) */}
      {fieldType === 'number' && (
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          disabled={disabled}
          placeholder="0"
          className="w-full px-3 py-1.5 text-sm font-mono rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 dark:focus:border-teal-400 disabled:opacity-50 transition-colors"
        />
      )}

      {/* 3. Long text */}
      {fieldType === 'long_text' && (
        <textarea
          rows={3}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={`Add details for ${name.toLowerCase()}...`}
          className="w-full px-3 py-2 text-sm rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 dark:focus:border-teal-400 disabled:opacity-50 transition-colors resize-y"
        />
      )}

      {/* 4. Single Select */}
      {fieldType === 'select' && (
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-1.5 text-sm rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 dark:focus:border-teal-400 disabled:opacity-50 transition-colors cursor-pointer"
        >
          <option value="">Select option...</option>
          {options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {/* 5. Boolean Toggle */}
      {fieldType === 'boolean' && (
        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-stone-300 dark:border-stone-700"
          />
          <span className="text-xs text-stone-700 dark:text-stone-300">
            {value ? 'Active / Yes' : 'No / None'}
          </span>
        </label>
      )}

      {/* 6. Date */}
      {fieldType === 'date' && (
        <input
          type="date"
          value={value ? String(value).slice(0, 10) : ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-1.5 text-sm font-mono rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 dark:focus:border-teal-400 disabled:opacity-50 transition-colors"
        />
      )}

      {/* 7. URL */}
      {fieldType === 'url' && (
        <div className="relative flex items-center">
          <input
            type="url"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="https://..."
            className="w-full pl-3 pr-8 py-1.5 text-sm font-mono rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 dark:focus:border-teal-400 disabled:opacity-50 transition-colors"
          />
          {value && (
            <a
              href={value.startsWith('http') ? value : `https://${value}`}
              target="_blank"
              rel="noreferrer"
              className="absolute right-2.5 text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};
