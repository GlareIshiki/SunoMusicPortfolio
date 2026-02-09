/* Design Philosophy: Grand Harmonic Archive - ornate luxurious header */

import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Music2, Home, ListMusic, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function Header() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  const navItems = [
    { href: '/', label: 'Archive', icon: Home },
    { href: '/playlists', label: 'Collections', icon: ListMusic },
  ];
  
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-b border-primary/30 elegant-shadow"
    >
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
      
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <motion.div
              className="flex items-center gap-4 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-accent to-primary p-0.5 gold-glow">
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                    <Music2 className="w-6 h-6 text-primary" strokeWidth={2} />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-pulse" />
              </div>
              <div>
                <div className="font-display text-sm text-muted-foreground tracking-widest">
                  MYSTIC
                </div>
                <div className="font-display text-xl leading-none tracking-wider gradient-text">
                  HARMONIC ARCHIVE
                </div>
              </div>
            </motion.div>
          </Link>
          
          {/* Navigation */}
          <nav aria-label="メインナビゲーション" className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'gap-2 font-elegant text-sm tracking-wide transition-all duration-300',
                      isActive && 'bg-primary/10 text-primary border border-primary/30 gold-glow'
                    )}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'ライトモードに切替' : 'ダークモードに切替'}
              className="ml-2 rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-primary" strokeWidth={2} />
              ) : (
                <Moon className="w-5 h-5 text-primary" strokeWidth={2} />
              )}
            </Button>
          </nav>
        </div>
      </div>
      
      {/* Decorative bottom border */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </motion.header>
  );
}
