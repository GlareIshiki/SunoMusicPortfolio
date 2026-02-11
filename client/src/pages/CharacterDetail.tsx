/* Design Philosophy: Grand Harmonic Archive - character story chapter view */

import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, BookOpen, Pencil, Sparkles, Music2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SongCard } from '@/components/SongCard';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useCharacter } from '@/hooks/useCharacters';
import { fetchSongsByIds } from '@/lib/api';
import { CharacterEditSheet } from '@/components/CharacterEditSheet';
import type { Song, CharacterSection, TextAlign } from '@/../../shared/types';

export default function CharacterDetail() {
  const [, params] = useRoute('/character/:id');
  const { character, isLoading, refetch } = useCharacter(params?.id);
  const { isAdmin } = useAdmin();
  const { playSong } = usePlayer();
  const [editOpen, setEditOpen] = useState(false);
  const [songsMap, setSongsMap] = useState<Map<string, Song>>(new Map());
  const [songsLoading, setSongsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.id]);

  // Fetch all songs referenced in sections
  useEffect(() => {
    if (!character) return;

    const allSongIds = character.sections
      .filter((s): s is { type: 'songs'; songIds: string[] } => s.type === 'songs')
      .flatMap(s => s.songIds);

    const uniqueIds = Array.from(new Set(allSongIds));
    if (uniqueIds.length === 0) {
      setSongsMap(new Map());
      return;
    }

    setSongsLoading(true);
    fetchSongsByIds(uniqueIds)
      .then(songs => {
        const map = new Map(songs.map(s => [s.id, s]));
        setSongsMap(map);
      })
      .catch(() => setSongsMap(new Map()))
      .finally(() => setSongsLoading(false));
  }, [character]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="font-elegant text-muted-foreground">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center ornate-card elegant-shadow">
          <div className="ornate-card-inner p-8">
            <h1 className="font-display text-2xl mb-4">Story Not Found</h1>
            <Link href="/characters">
              <Button variant="outline" className="rounded-lg">
                Return to Stories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Collect all songs for "Play All"
  const allSongs = character.sections
    .filter((s): s is { type: 'songs'; songIds: string[] } => s.type === 'songs')
    .flatMap(s => s.songIds.map(id => songsMap.get(id)))
    .filter((s): s is Song => s != null);

  const handlePlayAll = () => {
    if (allSongs.length > 0) {
      playSong(allSongs[0], allSongs);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-32">
      {/* Hero Section */}
      <section className="relative mb-16 overflow-hidden">
        {character.coverUrl && (
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0 bg-cover bg-center blur-3xl"
              style={{ backgroundImage: `url(${character.coverUrl})` }}
            />
          </div>
        )}
        <div className="absolute inset-0 mystical-particles opacity-30" />

        <div className="relative container">
          <Link href="/characters">
            <Button variant="ghost" className="mb-6 rounded-lg font-elegant">
              <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={2} />
              Back to Stories
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="ornate-card elegant-shadow"
          >
            <div className="ornate-card-inner">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                {/* Cover */}
                {character.coverUrl && (
                  <motion.div
                    className="relative flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="w-56 h-56 md:w-72 md:h-72 rounded-xl overflow-hidden ornate-border elegant-shadow">
                      <img
                        src={character.coverUrl}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary animate-pulse" />
                  </motion.div>
                )}

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-accent to-primary p-0.5 gold-glow">
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" strokeWidth={2} />
                      </div>
                    </div>
                    <span className="font-elegant text-sm text-muted-foreground tracking-wider">
                      Character Story
                    </span>
                  </div>

                  <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">
                    {character.name}
                  </h1>
                  {character.subtitle && (
                    <p className="font-elegant text-xl md:text-2xl text-muted-foreground mb-6">
                      {character.subtitle}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4">
                    {allSongs.length > 0 && (
                      <Button
                        size="lg"
                        onClick={handlePlayAll}
                        className="btn-luxurious rounded-lg"
                      >
                        <Play className="w-5 h-5 mr-2 ml-0.5" strokeWidth={2.5} />
                        Play All ({allSongs.length})
                      </Button>
                    )}

                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setEditOpen(true)}
                        className="rounded-lg border-primary/30 text-primary hover:bg-primary/10"
                      >
                        <Pencil className="w-5 h-5 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sections: alternating text and songs */}
      <section className="container">
        <div className="max-w-5xl mx-auto space-y-16">
          {character.sections.map((section, index) => {
            const align = (section.type === 'text' || section.type === 'image') ? (section.align || 'center') : 'center';

            // Animation direction based on alignment
            const motionProps = {
              initial: {
                opacity: 0,
                x: align === 'left' ? -40 : align === 'right' ? 40 : 0,
                y: align === 'center' || align === 'full' ? 30 : 0,
              },
              animate: { opacity: 1, x: 0, y: 0 },
              transition: { duration: 0.8, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] as const },
            };

            // Alignment classes for text and image sections
            const alignClasses: Record<TextAlign, string> = {
              left: 'md:w-[65%] md:mr-auto',
              right: 'md:w-[65%] md:ml-auto',
              center: 'md:w-[80%] mx-auto',
              full: 'w-full',
            };

            return (
              <div key={index}>
                {/* Decorative separator between sections */}
                {index > 0 && (
                  <div className="flex items-center justify-center gap-4 mb-16">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <div className="w-2 h-2 rotate-45 border border-primary/40" />
                    <div className="w-1.5 h-1.5 rotate-45 bg-primary/30" />
                    <div className="w-2 h-2 rotate-45 border border-primary/40" />
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  </div>
                )}

                <motion.div {...motionProps}>
                  {section.type === 'text' ? (
                    <div className={alignClasses[align]}>
                      {/* Decorative quote accent for left/right aligned */}
                      {(align === 'left' || align === 'right') && (
                        <div className={`mb-3 ${align === 'right' ? 'text-right' : ''}`}>
                          <span className="font-display text-4xl text-primary/20 leading-none select-none">
                            {align === 'left' ? '\u201C' : '\u201D'}
                          </span>
                        </div>
                      )}
                      {section.frame === false ? (
                        /* Frameless text */
                        <p className={`font-elegant text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : ''}`}>
                          {section.content}
                        </p>
                      ) : (
                        /* Framed text (default) */
                        <div className={`ornate-card elegant-shadow ${align === 'right' ? 'border-r-2 border-r-primary/30' : align === 'left' ? 'border-l-2 border-l-primary/30' : ''}`}>
                          <div className="ornate-card-inner">
                            <p className={`font-elegant text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : ''}`}>
                              {section.content}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : section.type === 'image' ? (
                    <div className={alignClasses[align]}>
                      <div className="rounded-xl overflow-hidden elegant-shadow">
                        <img
                          src={section.url}
                          alt={section.alt || ''}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                        <Music2 className="w-5 h-5 text-primary" />
                        <h3 className="font-display text-lg gradient-text tracking-wider">Associated Melodies</h3>
                        <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
                      </div>
                      {songsLoading ? (
                        <div className="text-center py-8">
                          <Sparkles className="w-8 h-8 text-primary mx-auto animate-pulse" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {section.songIds.map((songId, si) => {
                            const song = songsMap.get(songId);
                            if (!song) return null;
                            return <SongCard key={songId} song={song} index={si} />;
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })}

          {character.sections.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-elegant text-muted-foreground">This story is still being written...</p>
            </div>
          )}
        </div>
      </section>

      {/* Edit Sheet */}
      {isAdmin && (
        <CharacterEditSheet
          character={character}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
