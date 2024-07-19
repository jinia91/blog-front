import React from 'react'

// ModalProps 인터페이스 정의
interface ModalProps {
  onClose: () => void
  children: React.ReactNode
  width?: string
}

export default function CommonModal ({ onClose, children, width = '400px' }: ModalProps): React.ReactElement {
  return (
    <div
      className="fixed inset-0 flex justify-center items-center backdrop-hue-rotate-60"
      style={{ zIndex: 10000 }}
    >
      <div className={'relative bg-gray-800 p-6 rounded shadow-lg border-4 border-gray-900'}
           style={{ width }}>
        <button
          className="retro-font text-3xl absolute top-2 right-2 text-gray-300 hover:text-white"
          onClick={onClose}
        >&times;</button>
        {children}
      </div>
    </div>
  )
}
