import { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';

export function AdminLoginDialog() {
  const { showLoginDialog, setShowLoginDialog, login } = useAdmin();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    try {
      const ok = await login(password);
      if (ok) {
        toast.success('Master Access Granted');
        setPassword('');
      } else {
        toast.error('Invalid credentials');
      }
    } catch {
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
      <DialogContent className="ornate-card border-primary/30 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-accent to-primary p-0.5 gold-glow">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-primary" />
              </div>
            </div>
            <DialogTitle className="font-display text-xl tracking-wider gradient-text">
              Master Access
            </DialogTitle>
          </div>
          <DialogDescription className="font-elegant text-muted-foreground">
            Enter the archive master key to enable editing.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="font-elegant"
          />
          <Button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full btn-luxurious"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <KeyRound className="w-4 h-4 mr-2" />
            )}
            Authenticate
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
