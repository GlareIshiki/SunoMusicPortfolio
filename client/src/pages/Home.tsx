/* Design Philosophy: Grand Harmonic Archive - mystical grand library layout */

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid3x3, List, Sparkles, Clock, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pin } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { SongCardSkeleton } from '@/components/SongCardSkeleton';
import { SongTableRow } from '@/components/SongTableRow';
import { useSongs } from '@/hooks/useSongs';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchGenres } from '@/lib/api';

type ViewMode = 'grid' | 'list';
type SortBy = 'newest' | 'oldest' | 'title' | 'artist' | 'duration';

const SONGS_PER_PAGE = 40;

export default function Home() {
  const [activeTab, setActiveTab] = useState<'pinned' | 'all'>('pinned');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('title');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const [genres, setGenres] = useState<string[]>(['all']);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { songs, total, totalPages, isLoading, refetch } = useSongs({
    page,
    limit: SONGS_PER_PAGE,
    search: debouncedSearch,
    genre: selectedGenre,
    sort: sortBy,
    pinned: activeTab === 'pinned' ? true : undefined,
  });

  // Load genres on mount
  useEffect(() => {
    fetchGenres()
      .then(g => setGenres(['all', ...g]))
      .catch(() => {});
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedGenre, sortBy, activeTab]);

  const safePage = Math.min(page, Math.max(1, totalPages));

  // Build visible page numbers: always show first, last, current, and neighbors
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [];
    const current = safePage;
    const around = new Set([1, 2, current - 1, current, current + 1, totalPages - 1, totalPages]);
    const sorted = Array.from(around).filter(n => n >= 1 && n <= totalPages).sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) pages.push('...');
      pages.push(sorted[i]);
    }
    return pages;
  }, [safePage, totalPages]);

  const goToPage = (p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
    window.scrollTo({ top: document.querySelector('#songs-section')?.getBoundingClientRect().top! + window.scrollY - 100, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pt-24 pb-32">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden mb-16">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(/hero-bg.png)`,
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
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              >
                <img
                  src="/emblem.png"
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
              星の記憶が奏でる700余の旋律——Sunoの魔法によって永遠に刻まれた、音の遺産
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
                      aria-label="楽曲を検索"
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

      {/* Tab Switch */}
      <section className="container mb-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pinned' | 'all')}>
          <TabsList className="bg-card/80 border border-primary/20 backdrop-blur-sm">
            <TabsTrigger value="pinned" className="font-display text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2">
              <Pin className="w-4 h-4" />
              ピン
            </TabsTrigger>
            <TabsTrigger value="all" className="font-display text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2">
              <Sparkles className="w-4 h-4" />
              すべて
            </TabsTrigger>
          </TabsList>
        </Tabs>
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
                    {total} melodies
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    aria-label="グリッド表示"
                    className="rounded-lg"
                  >
                    <Grid3x3 className="w-4 h-4" strokeWidth={2} />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    aria-label="リスト表示"
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

      {/* Songs Grid / Table */}
      <section id="songs-section" className="container">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <SongCardSkeleton key={i} />
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {songs.map((song, index) => (
              <SongCard key={song.id} song={song} index={index} onVisibilityChange={refetch} />
            ))}
          </div>
        ) : (
          <div className="ornate-card elegant-shadow">
            <div className="ornate-card-inner p-2 md:p-4">
              {/* Table Header */}
              <div className="grid grid-cols-[2.5rem_1fr_3rem] md:grid-cols-[2.5rem_2fr_1fr_1fr_3.5rem] gap-3 items-center px-4 py-2 border-b border-border/50 mb-1" role="row">
                <span role="columnheader" className="font-mono text-xs text-muted-foreground text-center">#</span>
                <span role="columnheader" className="font-display text-xs text-muted-foreground tracking-wider">タイトル</span>
                <span role="columnheader" className="font-display text-xs text-muted-foreground tracking-wider hidden md:block">ジャンル</span>
                <span role="columnheader" className="font-display text-xs text-muted-foreground tracking-wider hidden md:block">追加日</span>
                <Clock className="w-4 h-4 text-muted-foreground ml-auto" aria-label="再生時間" />
              </div>
              {/* Rows */}
              {songs.map((song, index) => (
                <SongTableRow key={song.id} song={song} index={(safePage - 1) * SONGS_PER_PAGE + index} queue={songs} onVisibilityChange={refetch} />
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <nav aria-label="ページナビゲーション" className="flex items-center justify-center gap-1 mt-12">
            {/* First */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(1)}
              disabled={safePage === 1}
              aria-label="最初のページ"
              className="rounded-lg"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            {/* Prev */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              aria-label="前のページ"
              className="rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Page numbers */}
            {pageNumbers.map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="w-10 text-center font-mono text-sm text-muted-foreground select-none">
                  ...
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === safePage ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => goToPage(p)}
                  aria-label={`ページ ${p}`}
                  aria-current={p === safePage ? 'page' : undefined}
                  className={`rounded-lg font-mono text-sm ${p === safePage ? 'gold-glow' : ''}`}
                >
                  {p}
                </Button>
              )
            )}

            {/* Next */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              aria-label="次のページ"
              className="rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            {/* Last */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(totalPages)}
              disabled={safePage === totalPages}
              aria-label="最後のページ"
              className="rounded-lg"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </nav>
        )}

        {/* Page info */}
        {!isLoading && totalPages > 1 && (
          <div className="text-center mt-4">
            <span className="font-mono text-xs text-muted-foreground">
              {(safePage - 1) * SONGS_PER_PAGE + 1}–{Math.min(safePage * SONGS_PER_PAGE, total)} / {total}
            </span>
          </div>
        )}

        {!isLoading && songs.length === 0 && (
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
