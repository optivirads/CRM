'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, AlertCircle, Info, Loader2 } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: React.ReactNode;
  subDescription?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'primary';
  isLoading?: boolean;
  badge?: string;
  details?: { label: string; value: React.ReactNode }[];
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  subDescription,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  badge,
  details = [],
}) => {
  const [internalLoading, setInternalLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  };

  const loading = isLoading || internalLoading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
          icon: <Trash2 className="w-5 h-5" />,
          btn: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-rose-600/20 shadow-md',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
          icon: <AlertTriangle className="w-5 h-5" />,
          btn: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-amber-600/20 shadow-md',
        };
      case 'info':
        return {
          iconBg: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
          icon: <Info className="w-5 h-5" />,
          btn: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-600/20 shadow-md',
        };
      case 'primary':
      default:
        return {
          iconBg: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
          icon: <AlertCircle className="w-5 h-5" />,
          btn: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-600/20 shadow-md',
        };
    }
  };

  const { iconBg, icon, btn } = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 transition-all transform animate-in zoom-in-95 duration-150 relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                  {title}
                </h3>
                {badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {badge}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
          <div>{description}</div>

          {details.length > 0 && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-1.5">
              {details.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium">{item.label}:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {subDescription && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <span className="shrink-0 font-bold">⚠️</span>
              <span className="leading-snug">{subDescription}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-40"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${btn}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
