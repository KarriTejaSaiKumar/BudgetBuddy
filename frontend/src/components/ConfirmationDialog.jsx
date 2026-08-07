import React from 'react';
import Modal from './Modal';
import SecondaryButton from './SecondaryButton';
import { AlertTriangle } from 'lucide-react';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title = "Are you sure?", message = "This action cannot be undone.", confirmText = "Confirm", cancelText = "Cancel", isDanger = true }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div
            className={`grid size-9 shrink-0 place-items-center rounded-lg ${
              isDanger ? 'bg-destructive/10 text-destructive' : 'bg-warning/12 text-warning'
            }`}
          >
            <AlertTriangle className="size-4" />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2">
          <SecondaryButton onClick={onClose}>{cancelText}</SecondaryButton>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`inline-flex h-9 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-medium shadow-xs transition-[background-color,box-shadow,transform] duration-200 hover:shadow-sm active:translate-y-px ${
              isDanger
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
