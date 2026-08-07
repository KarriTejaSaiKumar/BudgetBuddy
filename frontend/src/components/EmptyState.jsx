import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = "Nothing here yet", description = "Get started by adding your first record.", icon: Icon = Inbox, action }) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <h4 className="mb-1.5 text-sm font-medium text-foreground">{title}</h4>
      <p className="mb-5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
