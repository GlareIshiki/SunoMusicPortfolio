/* Design Philosophy: Grand Harmonic Archive - character story chapter index */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { BookOpen, Music2, Plus, Sparkles, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/contexts/AdminContext';
import { useCharacters } from '@/hooks/useCharacters';
import { createCharacter, updateCharacter, deleteCharacter } from '@/lib/api';
import { toast } from 'sonner';
import type { Character, CharacterSection } from '@/../../shared/types';

function countSongs(sections: CharacterSection[]): number {
  return sections
    .filter((s): s is { type: 'songs'; songIds: string[] } => s.type === 'songs')
    .reduce((sum, s) => sum + s.songIds.length, 0);
}

export default function Characters() {
  const { characters, isLoading, refetch } = useCharacters();
  const { isAdmin } = useAdmin();

  const handleCreate = async () => {
    try {
      await createCharacter({ name: 'New Chapter', subtitle: '', sections: [], sortOrder: characters.length });
      toast.success('Character created');
      refetch();
    } catch {
      toast.error('Failed to create');
    }
  };

  const handleToggleVisibility = async (char: Character) => {
    try {
      await updateCharacter(char.id, { visible: !char.visible });
      toast.success(char.visible ? 'Hidden' : 'Visible');
      refetch();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (char: Character) => {
    if (!confirm(`Delete "${char.name}"?`)) return;
    try {
      await deleteCharacter(char.id);
      toast.success('Deleted');
      refetch();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-32">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 ornate-card elegant-shadow"
        >
          <div className="ornate-card-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-accent to-primary p-0.5 gold-glow flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-primary" strokeWidth={2} />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
                    <span className="gradient-text">Character Stories</span>
                  </h1>
                  <p className="font-elegant text-lg text-muted-foreground">
                    The tales woven into each melody
                  </p>
                </div>
              </div>
              {isAdmin && (
                <Button onClick={handleCreate} className="btn-luxurious rounded-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  New Chapter
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-20">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="font-elegant text-muted-foreground">Loading stories...</p>
          </div>
        )}

        {/* Chapter List — vertical, story-like */}
        {!isLoading && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {characters.map((char, index) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                <div className={`ornate-card elegant-shadow transition-all duration-500 hover:gold-glow group ${isAdmin && !char.visible ? 'opacity-50' : ''}`}>
                  <div className="ornate-card-inner p-0">
                    <Link href={`/character/${char.id}`}>
                      <div className="flex flex-col md:flex-row cursor-pointer">
                        {/* Cover */}
                        {char.coverUrl && (
                          <div className="relative md:w-64 flex-shrink-0 overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                            <img
                              src={char.coverUrl}
                              alt={char.name}
                              className="w-full h-48 md:h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 hidden md:block" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 p-6 md:p-8">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="font-mono text-xs text-primary/60 tracking-widest">
                              CHAPTER {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>

                          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2 group-hover:text-primary transition-colors">
                            {char.name}
                          </h2>

                          {char.subtitle && (
                            <p className="font-elegant text-lg text-muted-foreground mb-4">
                              {char.subtitle}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Music2 className="w-4 h-4" />
                              <span className="font-mono">{countSongs(char.sections)} melodies</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Admin controls */}
                    {isAdmin && (
                      <div className="flex items-center gap-2 px-6 pb-4 md:pb-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleVisibility(char)}
                          className="gap-1"
                        >
                          {char.visible ? (
                            <Eye className="w-4 h-4 text-primary" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          )}
                          {char.visible ? 'Visible' : 'Hidden'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(char)}
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && characters.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="font-display text-2xl text-muted-foreground">No stories yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
