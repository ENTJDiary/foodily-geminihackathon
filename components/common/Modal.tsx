import React, { useEffect, useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: string;
    showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    maxWidth = 'max-w-lg',
    showCloseButton = true
}) => {
    const [animateIn, setAnimateIn] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            // Small delay to allow render before animating in
            const timer = setTimeout(() => setAnimateIn(true), 10);
            return () => clearTimeout(timer);
        } else {
            setAnimateIn(false);
            // Wait for animation to finish before unmounting
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative w-full ${maxWidth} bg-white rounded-3xl shadow-2xl transform transition-all duration-300 ${animateIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-2">
                    <h3 className="text-xl font-bold text-brand-black tracking-tight">{title}</h3>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="p-2 text-brand-slate/40 hover:text-brand-orange hover:bg-brand-orange/5 rounded-full transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="p-6 pt-2">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-6 pt-0 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
