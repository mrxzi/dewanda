"use client";

import { useTheme } from "./ThemeProvider";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div
        className={`relative w-full max-w-xs rounded-xl border p-5 text-center ${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        }`}
      >
        <h3 className={`text-base font-semibold mb-1.5 ${isDark ? "text-white" : "text-slate-900"}`}>
          {title}
        </h3>
        <p className={`text-sm mb-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {message}
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
            Batal
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600">
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
