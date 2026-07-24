import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = "No data available", description = "Get started by adding your first record.", icon: Icon = Inbox, action }) => {
  return (
    <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-400 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
