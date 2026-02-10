/* Design Philosophy: Grand Harmonic Archive - detailed melody analysis view */

import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, Clock, Calendar, Tag, Music2, ExternalLink, FileAudio, Sparkles, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useSong } from '@/hooks/useSongs';
import { SongEditSheet } from '@/components/SongEditSheet';
import { formatDuration, formatDate } from '@/lib/utils';

export default function SongDetail() {
  const [, params] = useRoute('/song/:id');
  const { song, isLoading, refetch } = useSong(params?.id);
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { isAdmin } = useAdmin();
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="font-elegant text-muted-foreground">Loading melody...</p>
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center ornate-card elegant-shadow">
          <div className="ornate-card-inner p-8">
            <h1 className="font-display text-2xl mb-4">Melody Not Found</h1>
            <Link href="/">
              <Button variant="outline" className="rounded-lg">
                Return to Archive
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentSong = currentSong?.id === song.id;

  const handlePlayClick = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-32">
      {/* Hero Section */}
      <section className="relative mb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-cover bg-center blur-3xl"
            style={{ backgroundImage: `url(${song.coverUrl})` }}
          />
        </div>
        <div className="absolute inset-0 mystical-particles opacity-30" />

        <div className="relative container">
          <Link href="/">
            <Button variant="ghost" className="mb-6 rounded-lg font-elegant">
              <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={2} />
              Back to Archive
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
                <motion.div
                  className="relative flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-56 h-56 md:w-72 md:h-72 rounded-xl overflow-hidden ornate-border elegant-shadow">
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary animate-pulse" />
                  {song.isCover && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-accent/90 text-background font-elegant rounded-full backdrop-blur-sm">
                        Cover
                      </Badge>
                    </div>
                  )}
                  {isAdmin && !song.visible && (
                    <div className="absolute bottom-4 left-4">
                      <Badge variant="secondary" className="font-elegant rounded-full backdrop-blur-sm">
                        Hidden
                      </Badge>
                    </div>
                  )}
                </motion.div>

                {/* Info */}
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-accent to-primary p-0.5 gold-glow">
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                        <FileAudio className="w-6 h-6 text-primary" strokeWidth={2} />
                      </div>
                    </div>
                    <span className="font-elegant text-sm text-muted-foreground tracking-wider">
                      Eternal Melody
                    </span>
                  </div>

                  <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">
                    {song.title}
                  </h1>
                  <p className="font-elegant text-xl md:text-2xl text-muted-foreground mb-6">{song.artist}</p>

                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <Button
                      size="lg"
                      onClick={handlePlayClick}
                      className="btn-luxurious rounded-lg"
                    >
                      {isCurrentSong && isPlaying ? (
                        <>
                          <Pause className="w-5 h-5 mr-2" strokeWidth={2.5} />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2 ml-0.5" strokeWidth={2.5} />
                          Play
                        </>
                      )}
                    </Button>

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

                    {isCurrentSong && (
                      <Badge className="bg-primary/20 text-primary border-primary font-elegant rounded-full animate-glow-pulse flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Now Playing
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Details Section */}
      <section className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Prompt */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="ornate-card elegant-shadow"
            >
              <div className="ornate-card-inner">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-3">
                    <Music2 className="w-5 h-5 text-primary" strokeWidth={2} />
                    Generation Protocol
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed font-elegant text-base whitespace-pre-wrap">
                    {song.prompt}
                  </p>
                </CardContent>
              </div>
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="ornate-card elegant-shadow"
            >
              <div className="ornate-card-inner">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-3">
                    <Tag className="w-5 h-5 text-primary" strokeWidth={2} />
                    Classification Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {song.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="font-elegant text-sm border-primary/30 text-primary px-4 py-2 rounded-full"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </div>
            </motion.div>

            {/* Original Song Link */}
            {song.isCover && song.originalUrl && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="ornate-card elegant-shadow"
              >
                <div className="ornate-card-inner">
                  <CardHeader>
                    <CardTitle className="font-display flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-primary" strokeWidth={2} />
                      Original Source
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={song.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline flex items-center gap-2 font-elegant text-base"
                    >
                      Access Original Recording
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </CardContent>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="ornate-card elegant-shadow"
            >
              <div className="ornate-card-inner">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-start gap-3">
                    <Music2 className="w-5 h-5 text-primary mt-0.5" strokeWidth={2} />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-display mb-1">GENRE</p>
                      <p className="font-elegant">{song.genre}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5" strokeWidth={2} />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-display mb-1">DURATION</p>
                      <p className="font-mono">{formatDuration(song.duration)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" strokeWidth={2} />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-display mb-1">CREATED</p>
                      <p className="font-mono text-sm">{formatDate(song.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Edit Sheet */}
      {isAdmin && (
        <SongEditSheet
          song={song}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
