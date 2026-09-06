import React from 'react';

export const GlassButton = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white hover:opacity-95 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-98',
    secondary: 'bg-purple-950/40 border border-purple-500/30 text-purple-200 hover:bg-purple-900/50 hover:border-purple-400/50 active:scale-98',
    outline: 'bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800/60 hover:text-white active:scale-98',
    danger: 'bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600/30 active:scale-98',
    success: 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 active:scale-98',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4 mr-1 text-current" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};
