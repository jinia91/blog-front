"use client";

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  contents: React.ReactNode;
}

export const RelatedMemoModal: React.FC<ModalProps> = ({ isOpen, onClose, contents }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 z-10 flex items-center justify-center">
      <div className="bg-gray-800 text-white rounded-lg p-4 max-w-xs w-full">
        <div className="flex flex-col">
          {contents}
        </div>
        <div className="text-right mt-4">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 rounded px-4 py-2 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
