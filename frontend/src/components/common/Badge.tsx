import React from 'react';

export type BadgeVariant = 
  | 'verified' 
  | 'pending' 
  | 'flagged' 
  | 'completed' 
  | 'duplicate' 
  | 'info' 
  | 'slate' 
  | 'stage-foundation' 
  | 'stage-plinth' 
  | 'stage-lintel' 
  | 'stage-completion';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function Badge({
  variant = 'slate',
  children,
  className = '',
  size = 'md',
  icon
}: BadgeProps) {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  };

  const variantClasses: Record<BadgeVariant, string> = {
    verified: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 font-medium',
    completed: 'bg-teal-50 text-teal-800 border-teal-200/80 font-medium',
    pending: 'bg-amber-50 text-amber-800 border-amber-200/80 font-medium',
    flagged: 'bg-red-50 text-red-800 border-red-200/80 font-medium',
    duplicate: 'bg-rose-50 text-rose-800 border-rose-200/80 font-medium',
    info: 'bg-sky-50 text-sky-800 border-sky-200/80 font-medium',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
    'stage-foundation': 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
    'stage-plinth': 'bg-cyan-50 text-cyan-800 border-cyan-200 font-semibold',
    'stage-lintel': 'bg-purple-50 text-purple-800 border-purple-200 font-semibold',
    'stage-completion': 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs transition-all ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
