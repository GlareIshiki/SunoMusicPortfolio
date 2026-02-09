/* Design Philosophy: Grand Harmonic Archive - mystical grand library layout */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid3x3, List, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SongCard } from '@/components/SongCard';
import { mockSongs } from '@/lib/mockData';

type ViewMode = 'grid' | 'list';
type SortBy = 'newest' | 'oldest' | 'title' | 'artist' | 'duration';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  const genres = useMemo(() => {
    const allGenres = mockSongs.map((song) => song.genre);
    return ['all', ...Array.from(new Set(allGenres))];
  }, []);
  
  const filteredSongs = useMemo(() => {
    let filtered = [...mockSongs];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (song) =>
          song.title.toLowerCase().includes(query) ||
          song.artist.toLowerCase().includes(query) ||
          song.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    
    if (selectedGenre !== 'all') {
      filtered = filtered.filter((song) => song.genre === selectedGenre);
    }
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'artist':
          return a.artist.localeCompare(b.artist);
        case 'duration':
          return b.duration - a.duration;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [searchQuery, selectedGenre, sortBy]);
  
  return (
    <div className="min-h-screen pt-24 pb-32">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden mb-16">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://private-us-east-1.manuscdn.com/sessionFile/s1rF6OwbRH7CMoYsrPbBKV/sandbox/sRwgALMr55TD0qa4vI4D5e-img-1_1770654682000_na1fn_ZmdvLWhlcm8tYmFja2dyb3VuZA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvczFyRjZPd2JSSDdDTW9Zc3JQYkJLVi9zYW5kYm94L3NSd2dBTE1yNTVURDBxYTR2STRENWUtaW1nLTFfMTc3MDY1NDY4MjAwMF9uYTFmbl9abWR2TFdobGNtOHRZbUZqYTJkeWIzVnVaQS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=dyk2t5JMsAyJkiwLJn3ObXILkZyadCwzNZkvh9MuDhBiUE6fjXGGWDpYLs7axzx8n~PLHyo5VT1LGmC6WRcIu8kqYOqEZDleJFRXTVKMEfA0gH4Tiu3ThLP6eT6btcXOPLWL3VUEc1HP-oWrd18JQOGMDH4Q94Cv-3twkALYE0fAEFffp2lpwlHFicnHAATOwA2bmVFlBVBwWEKFoRks2lqPHx46ErahTsK~XQQ-XWEY4h5nsTv96nOFg9xUw4MkqTFVMm5UG9k7oXdB7PJwQd~7qHFCo5ygsuq-p7Uh2pctt8I3UcfbjM1QJX~GDS1-cAdzZoTrqpfv-i41I8Gqng__)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="absolute inset-0 mystical-particles" />
        
        {/* Content */}
        <div className="relative z-10 container text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Emblem */}
            <div className="flex justify-center mb-8">
              <motion.div
                className="relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              >
                <img
                  src="https://private-us-east-1.manuscdn.com/sessionFile/s1rF6OwbRH7CMoYsrPbBKV/sandbox/sRwgALMr55TD0qa4vI4D5e_1770654684992_na1fn_ZmdvLW11c2ljLWVtYmxlbQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvczFyRjZPd2JSSDdDTW9Zc3JQYkJLVi9zYW5kYm94L3NSd2dBTE1yNTVURDBxYTR2STRENWVfMTc3MDY1NDY4NDk5Ml9uYTFmbl9abWR2TFcxMWMybGpMV1Z0WW14bGJRLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=AGG-0kjuXdWdACszwnqyUImeGgZaokZKOAR78vWQKCQDSrQ5O4pzCBChIULgEYIduVNvXjBu1EjOOc~DO~AO5dx-jD03G2v2u97Uv7qX98eqYqF2xxKEZHenKLrUzGUZMKf38eAxacllmp1dE4sJtTlzPVhk3S-V5VLNyg-6I-xWSPvUOhlap3goOV7ldCfOlwgf8Acmg3fv9LcTdriRxX2FG8ZGnleNXsjCTnpVxqYg6993zJzShz98ShXRC~VpiClgw8dKGoWHVeebqlPZSiGT9xPvP4pQ1eLnm8bfileIkqzWUoaxH62ONC2xVvYUkbReiJA7TezdFhuUfuusjw__"
                  alt="Emblem"
                  className="w-32 h-32 drop-shadow-2xl"
                />
                <div className="absolute inset-0 gold-glow rounded-full" />
              </motion.div>
            </div>
            
            {/* Title */}
            <div className="mb-3">
              <span className="font-elegant text-lg text-muted-foreground tracking-widest">
                Welcome to the
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 tracking-wider">
              <span className="gradient-text">GRAND HARMONIC</span>
              <br />
              <span className="text-foreground">ARCHIVE</span>
            </h1>
            <p className="font-elegant text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Sunoが紡いだ700曲以上の旋律を収めた、永遠のアーカイブ
            </p>
            
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="ornate-card elegant-shadow">
                <div className="ornate-card-inner p-2">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <Search className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <Input
                      type="text"
                      placeholder="曲名、アーティスト、タグで検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 bg-background border-0 font-elegant"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Filters and Controls */}
      <section className="container mb-10">
        <div className="ornate-card elegant-shadow">
          <div className="ornate-card-inner">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                {/* Genre Filter */}
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm text-muted-foreground whitespace-nowrap">
                    Genre:
                  </span>
                  <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                    <SelectTrigger className="w-[180px] rounded-lg font-elegant">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="ornate-card">
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre} className="font-elegant">
                          {genre === 'all' ? 'すべて' : genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Sort */}
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm text-muted-foreground whitespace-nowrap">
                    Sort:
                  </span>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                    <SelectTrigger className="w-[180px] rounded-lg font-elegant">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="ornate-card">
                      <SelectItem value="newest" className="font-elegant">新しい順</SelectItem>
                      <SelectItem value="oldest" className="font-elegant">古い順</SelectItem>
                      <SelectItem value="title" className="font-elegant">タイトル順</SelectItem>
                      <SelectItem value="artist" className="font-elegant">アーティスト順</SelectItem>
                      <SelectItem value="duration" className="font-elegant">再生時間順</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* View Mode and Count */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-mono text-sm text-primary">
                    {filteredSongs.length} melodies
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className="rounded-lg"
                  >
                    <Grid3x3 className="w-4 h-4" strokeWidth={2} />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className="rounded-lg"
                  >
                    <List className="w-4 h-4" strokeWidth={2} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Songs Grid */}
      <section className="container">
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
          : 'flex flex-col gap-6'
        }>
          {filteredSongs.map((song, index) => (
            <SongCard key={song.id} song={song} index={index} />
          ))}
        </div>
        
        {filteredSongs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="font-display text-2xl text-muted-foreground">
              No melodies found
            </p>
          </motion.div>
        )}
      </section>
    </div>
  );
}
