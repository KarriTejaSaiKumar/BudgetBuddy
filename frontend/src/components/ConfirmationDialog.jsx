import React from 'react';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import { AlertTriangle } from 'lucide-react';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title = "Are you sure?", message = "This action cannot be undone.", confirmText = "Confirm", cancelText = "Cancel", isDanger = true }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-3 text-slate-300">
          <div className={`p-2.5 rounded-xl shrink-0 ${isDanger ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-xs leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <SecondaryButton onClick={onClose}>
            {cancelText}
          </SecondaryButton>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs text-white transition-all cursor-pointer ${
              isDanger
                ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20'
                : 'bg-orange-500 hover:bg-orange-400 shadow-lg shadow-orange-500/20'
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
