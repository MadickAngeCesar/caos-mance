import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'primary';
  requireTypedName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  requireTypedName,
  onConfirm,
  onCancel,
}) => {
  const [typedValue, setTypedValue] = React.useState('');

  if (!isOpen) return null;

  const isConfirmedAllowed = !requireTypedName || typedValue.trim().toLowerCase() === requireTypedName.trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md p-6 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xl">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${variant === 'destructive' ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400' : 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400'}`}>
            {variant === 'destructive' ? <AlertTriangle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p>
          </div>
        </div>

        {requireTypedName && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
              Type <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">{requireTypedName}</span> to confirm:
            </label>
            <input
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              placeholder={requireTypedName}
              className="w-full px-3 py-1.5 text-sm rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-red-500/30 font-mono"
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-sm font-medium rounded-md border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={!isConfirmedAllowed}
            onClick={() => {
              onConfirm();
              setTypedValue('');
            }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md text-white shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500'
                : 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-stone-950'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
