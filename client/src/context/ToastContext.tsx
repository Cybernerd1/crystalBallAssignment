import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import Icon from '../components/ui/Icon';

const ToastContext = createContext<(message: string) => void>(() => {});

/**
 * App-wide feedback toasts. Pages call `showToast("…")` and the message
 * renders for a few seconds — convenient after cross-page navigation.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((next: string) => setMessage(next), []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 3500);
    return () => window.clearTimeout(timer);
  }, [message]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {message ? (
        <div className="toast" role="status">
          <Icon name="check-circle" size={16} />
          {message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
