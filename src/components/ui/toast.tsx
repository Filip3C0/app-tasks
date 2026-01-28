"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { X, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "default" | "info" | "success" | "warning" | "destructive";

type ToastProps = {
  id?: string;
  title: string;
  description?: string;
  variant?: Variant;
  duration?: number; // ms
};

type ToastContextValue = {
  push: (t: ToastProps) => void;
  remove: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let _push: ((t: ToastProps) => void) | null = null;

export function toast(t: ToastProps) {
  if (_push) {
    _push(t);
  } else {
    // fallback
    // eslint-disable-next-line no-console
    console.log("toast:", t.title, t.description || "");
  }
}

function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx)
    throw new Error("useToastContext must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  useEffect(() => {
    _push = (t: ToastProps) => {
      const id =
        t.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((s) => [{ ...t, id }, ...s]);
    };

    return () => {
      _push = null;
    };
  }, []);

  function push(t: ToastProps) {
    const id =
      t.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((s) => [{ ...t, id }, ...s]);
  }

  function remove(id: string) {
    setToasts((s) => s.filter((x) => x.id !== id));
  }

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}

      {/* Toast viewport */}
      <div className="fixed z-50 right-6 bottom-6 flex flex-col items-end gap-3">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => remove(t.id!)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function IconForVariant({ variant }: { variant?: Variant }) {
  switch (variant) {
    case "info":
      return <Info className="w-5 h-5" />;
    case "success":
      return <CheckCircle className="w-5 h-5" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5" />;
    case "destructive":
      return <AlertTriangle className="w-5 h-5" />;
    default:
      return <Info className="w-5 h-5" />;
  }
}

function variantClasses(v?: Variant) {
  switch (v) {
    case "info":
      return "bg-indigo-900/80 border border-indigo-500/30 text-indigo-100";
    case "success":
      return "bg-emerald-900/80 border border-emerald-600/30 text-emerald-200";
    case "warning":
      return "bg-amber-900/80 border border-amber-600/30 text-amber-200";
    case "destructive":
      return "bg-rose-900/80 border border-rose-600/30 text-rose-200";
    default:
      return "bg-slate-800/80 border border-indigo-500/30 text-indigo-100";
  }
}

function Toast({
  id,
  title,
  description,
  variant,
  duration = 4500,
  onClose,
}: ToastProps & { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto w-full max-w-sm rounded-lg p-3 shadow-lg flex items-start gap-3 border",
        variantClasses(variant),
      )}
    >
      <div className="pt-0.5 text-current">
        <IconForVariant variant={variant} />
      </div>
      <div className="flex-1">
        <div className="font-medium text-sm">{title}</div>
        {description && (
          <div className="text-sm opacity-80 mt-1">{description}</div>
        )}
      </div>
      <button
        onClick={onClose}
        className="ml-3 opacity-80 hover:opacity-100"
        aria-label="Fechar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default Toast;
