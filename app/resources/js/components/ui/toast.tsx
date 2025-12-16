import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation
        setTimeout(() => setIsVisible(true), 10);

        // Auto-close after 5 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for animation
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`fixed top-4 right-4 z-50 min-w-[320px] max-w-md transform transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
        >
            <div
                className={`rounded-lg border shadow-lg p-4 ${type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200'
                        : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
                    }`}
            >
                <div className="flex items-start gap-3">
                    {type === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    ) : (
                        <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                        <p className="font-medium text-sm">{message}</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className="text-current hover:opacity-70 transition-opacity"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
