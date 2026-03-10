import { createContext, useContext, useState, useCallback } from 'react';
import { Check, X, Zap } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const icons = { success: <Check size={16} strokeWidth={3} />, error: <X size={16} strokeWidth={3} />, info: <Zap size={16} fill="currentColor" strokeWidth={0} /> };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast toast-${t.type}`}>
                        <span>{icons[t.type]}</span>
                        <span>{t.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() { return useContext(ToastContext); }
