import React from 'react';

export const GlassCard = ({ children, className = '', hover = false, glow = false, ...props }) => {
  return (
    <div
      className={`glass-panel rounded-2xl p-6 ${hover ? 'glass-panel-hover' : ''} ${glow ? 'glass-card-glow' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
