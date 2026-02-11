import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { adminLogin as apiLogin, adminLogout as apiLogout, verifyAdmin, getAdminToken } from '@/lib/api';

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
    // Only verify if there's a stored token
    const token = getAdminToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    verifyAdmin()
      .then(setIsAdmin)
      .catch(() => setIsAdmin(false))
      .finally(() => setIsLoading(false));
  }, []);

  // Secret URL: /#admin opens login dialog
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin' && !isAdmin) {
        setShowLoginDialog(true);
        // Clear hash without triggering navigation
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [isAdmin]);

  const login = useCallback(async (password: string): Promise<boolean> => {
    const result = await apiLogin(password);
    if (result.ok) {
      setIsAdmin(true);
      setShowLoginDialog(false);
    }
    return result.ok;
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
