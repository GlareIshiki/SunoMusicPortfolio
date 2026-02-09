/* Design Philosophy: Grand Harmonic Archive - collection showcase view */

import { useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Music2, Clock, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SongCard } from '@/components/SongCard';
import { usePlayer } from '@/contexts/PlayerContext';
import { getPlaylistById, getSongsByPlaylistId } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';

export default function PlaylistDetail() {
  const [, params] = useRoute('/playlist/:id');
  const playlist = params?.id ? getPlaylistById(params.id) : null;
  const songs = playlist ? getSongsByPlaylistId(playlist.id) : [];
  const { playSong } = usePlayer();
  
  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center ornate-card elegant-shadow">
          <div className="ornate-card-inner p-8">
            <h1 className="font-display text-2xl mb-4">Collection Not Found</h1>
            <Link href="/playlists">
              <Button variant="outline" className="rounded-lg">
                Return to Collections
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const totalDuration = songs.reduce((acc, song) => acc + song.duration, 0);
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);
  
  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };
  
  return (
    <div className="min-h-screen pt-28 pb-32">
      {/* Hero Section */}
      <section className="relative mb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-cover bg-center blur-3xl"
            style={{ backgroundImage: `url(${playlist.coverUrl})` }}
          />
        </div>
        <div className="absolute inset-0 mystical-particles opacity-30" />
        
        <div className="relative container">
          <Link href="/playlists">
            <Button variant="ghost" className="mb-6 rounded-lg font-elegant">
              <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={2} />
              Back to Collections
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
                <motion.div
                  className="relative flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-56 h-56 md:w-72 md:h-72 rounded-xl overflow-hidden ornate-border elegant-shadow">
                    <img
                      src={playlist.coverUrl}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary animate-pulse" />
                </motion.div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-accent to-primary p-0.5 gold-glow">
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                        <FolderOpen className="w-6 h-6 text-primary" strokeWidth={2} />
                      </div>
                    </div>
                    <span className="font-elegant text-sm text-muted-foreground tracking-wider">
                      Curated Collection
                    </span>
                  </div>
                  
                  <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                    {playlist.name}
                  </h1>
                  <p className="font-elegant text-lg text-muted-foreground mb-6 max-w-2xl">
                    {playlist.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Music2 className="w-4 h-4" />
                      <span className="font-mono">{songs.length} tracks</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="font-mono">
                        {hours > 0 && `${hours}h `}
                        {minutes}m
                      </span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      Created: {formatDate(playlist.createdAt)}
                    </span>
                  </div>
                  
                  <Button
                    size="lg"
                    onClick={handlePlayAll}
                    className="btn-luxurious rounded-lg"
                  >
                    <Play className="w-5 h-5 mr-2 ml-0.5" strokeWidth={2.5} />
                    Play All
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Songs List */}
      <section className="container">
        <div className="ornate-card elegant-shadow mb-8">
          <div className="ornate-card-inner">
            <h2 className="font-display text-2xl">
              <span className="gradient-text">Track Manifest</span> ({songs.length})
            </h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {songs.map((song, index) => (
            <SongCard key={song.id} song={song} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
