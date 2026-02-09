/* Design Philosophy: Grand Harmonic Archive - curated collections view */

import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Music2, Clock, FolderOpen, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockPlaylists, getSongsByPlaylistId } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';

export default function Playlists() {
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
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-accent to-primary p-0.5 gold-glow flex-shrink-0">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                  <FolderOpen className="w-8 h-8 text-primary" strokeWidth={2} />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
                  <span className="gradient-text">Curated Collections</span>
                </h1>
                <p className="font-elegant text-lg text-muted-foreground">
                  Mystical playlists crafted through ancient harmonies
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Playlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockPlaylists.map((playlist, index) => {
            const songs = getSongsByPlaylistId(playlist.id);
            const totalDuration = songs.reduce((acc, song) => acc + song.duration, 0);
            const hours = Math.floor(totalDuration / 3600);
            const minutes = Math.floor((totalDuration % 3600) / 60);
            
            return (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.15,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Link href={`/playlist/${playlist.id}`}>
                  <div className="ornate-card elegant-shadow transition-all duration-500 hover:gold-glow group cursor-pointer">
                    <div className="ornate-card-inner p-0">
                      {/* Cover Image */}
                      <div className="relative aspect-[16/10] overflow-hidden rounded-t-lg">
                        <img
                          src={playlist.coverUrl}
                          alt={playlist.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute inset-0 mystical-particles opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Overlay info */}
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-primary/90 text-background font-elegant rounded-full backdrop-blur-sm">
                              Collection
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-white/90">
                              <Sparkles className="w-3 h-3" />
                              <span className="font-mono">{songs.length} tracks</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Decorative corners */}
                        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-primary/50 rounded-tl-lg" />
                        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-primary/50 rounded-br-lg" />
                      </div>
                      
                      {/* Info */}
                      <div className="p-6">
                        <h3 className="font-display text-xl mb-2 text-foreground">
                          {playlist.name}
                        </h3>
                        <p className="font-elegant text-sm text-muted-foreground mb-4 line-clamp-2">
                          {playlist.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs mb-4">
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Music2 className="w-4 h-4" />
                              <span className="font-mono">{songs.length}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span className="font-mono">
                                {hours > 0 && `${hours}h `}
                                {minutes}m
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-border/50">
                          <span className="font-mono text-xs text-muted-foreground">
                            Updated: {formatDate(playlist.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
