import React, { useState, useEffect } from 'react';

/**
 * Custom Toast Manager dispatching custom window events.
 * Can be imported anywhere: import { toast } from '../components/Toast';
 * Usage: toast.success('Logged in successfully!');
 *        toast.error('Invalid credentials');
 *        toast.info('Phone number copied');
 *        toast.warning('Cooldown period active');
 */
export const toast = {
  show: (message, type = 'info', title = '', duration = 4000) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lifestream-toast', {
          detail: { id: Date.now() + Math.random(), message, type, title, duration },
        })
      );
    }
  },
  success: (message, title = 'Success', duration = 4000) => toast.show(message, 'success', title, duration),
  error: (message, title = 'Error', duration = 5000) => toast.show(message, 'error', title, duration),
  info: (message, title = 'Notification', duration = 4000) => toast.show(message, 'info', title, duration),
  warning: (message, title = 'Warning', duration = 4500) => toast.show(message, 'warning', title, duration),
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToastEvent = (e) => {
      const newToast = e.detail;
      setToasts((prev) => [...prev, newToast]);
    };

    window.addEventListener('lifestream-toast', handleToastEvent);
    return () => window.removeEventListener('lifestream-toast', handleToastEvent);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast: { id, message, type, title, duration }, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      startExit();
    }, duration || 4000);

    return () => clearTimeout(timer);
  }, [duration]);

  const startExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getThemeStyles = () => {
    switch (type) {
      case 'success':
        return {
          border: 'border-emerald-200/90',
          bg: 'bg-white/95 text-emerald-950 shadow-emerald-500/10',
          badgeBg: 'bg-emerald-500/10 text-emerald-600',
          progressBg: 'bg-emerald-500',
          icon: (
            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ),
        };
      case 'error':
        return {
          border: 'border-red-200/90',
          bg: 'bg-white/95 text-red-950 shadow-red-500/10',
          badgeBg: 'bg-red-500/10 text-red-600',
          progressBg: 'bg-[#e63946]',
          icon: (
            <svg className="w-5 h-5 text-[#e63946] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
        };
      case 'warning':
        return {
          border: 'border-amber-200/90',
          bg: 'bg-white/95 text-amber-950 shadow-amber-500/10',
          badgeBg: 'bg-amber-500/10 text-amber-600',
          progressBg: 'bg-amber-500',
          icon: (
            <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        };
      case 'info':
      default:
        return {
          border: 'border-blue-200/90',
          bg: 'bg-white/95 text-slate-900 shadow-blue-500/10',
          badgeBg: 'bg-blue-500/10 text-blue-600',
          progressBg: 'bg-blue-600',
          icon: (
            <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${theme.border} ${theme.bg} backdrop-blur-md p-4 shadow-xl transition-all duration-300 transform ${
        isExiting ? 'opacity-0 translate-x-12 scale-95' : 'opacity-100 translate-x-0 scale-100'
      } flex items-start gap-3.5`}
    >
      <div className={`p-2 rounded-xl ${theme.badgeBg} flex items-center justify-center shrink-0`}>
        {theme.icon}
      </div>

      <div className="flex-1 pr-2 pt-0.5">
        {title && <h4 className="text-xs font-extrabold text-slate-900 tracking-tight leading-none mb-1">{title}</h4>}
        <p className="text-xs font-semibold text-slate-600 leading-snug">{message}</p>
      </div>

      <button
        onClick={startExit}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Countdown Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
        <div
          className={`h-full ${theme.progressBg} transition-all ease-linear`}
          style={{
            animation: `toast-progress ${duration || 4000}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
