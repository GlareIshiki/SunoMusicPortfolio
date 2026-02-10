import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { adminLogin as apiLogin, adminLogout as apiLogout, verifyAdmin } from '@/lib/api';

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  showLoginDialog: boolean;
  setShowLoginDialog: (show: boolean) => void;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    verifyAdmin()
      .then(setIsAdmin)
      .catch(() => setIsAdmin(false))
      .finally(() => setIsLoading(false));
  }, []);

  // Keyboard shortcut: Ctrl+Shift+A
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        if (isAdmin) {
          logout();
        } else {
          setShowLoginDialog(true);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAdmin]);

  const login = useCallback(async (password: string): Promise<boolean> => {
    const ok = await apiLogin(password);
    if (ok) {
      setIsAdmin(true);
      setShowLoginDialog(false);
    }
    return ok;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setIsAdmin(false);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, isLoading, showLoginDialog, setShowLoginDialog, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextType {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
