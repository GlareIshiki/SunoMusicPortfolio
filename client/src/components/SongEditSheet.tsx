import { useState, useEffect, useRef } from 'react';
import { Save, Upload, Link2, X, Plus, Loader2, Eye, EyeOff } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { updateSong, uploadCover } from '@/lib/api';
import { toast } from 'sonner';
import type { Song } from '@/../../shared/types';

const GENRES = ['Electronic', 'Ambient', 'Synthwave', 'Lo-fi', 'Orchestral', 'Rock', 'Jazz', 'Classical', 'Pop', 'Experimental'];

interface SongEditSheetProps {
  song: Song;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function SongEditSheet({ song, open, onOpenChange, onSaved }: SongEditSheetProps) {
  const [form, setForm] = useState({
    title: '',
    artist: '',
    genre: '',
    tags: [] as string[],
    prompt: '',
    coverUrl: '',
    isCover: false,
    originalUrl: '',
    visible: true,
  });
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && song) {
      setForm({
        title: song.title,
        artist: song.artist,
        genre: song.genre,
        tags: [...song.tags],
        prompt: song.prompt,
        coverUrl: song.coverUrl,
        isCover: song.isCover,
        originalUrl: song.originalUrl || '',
        visible: song.visible,
      });
      setCoverPreview(song.coverUrl);
    }
  }, [open, song]);

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm(f => ({ ...f, tags: [...f.tags, tag] }));
    }
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadCover(file);
      setForm(f => ({ ...f, coverUrl: url }));
      setCoverPreview(url);
      toast.success('Cover uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSong(song.id, {
        title: form.title,
        artist: form.artist,
        genre: form.genre,
        tags: form.tags,
        prompt: form.prompt,
        coverUrl: form.coverUrl,
        isCover: form.isCover,
        originalUrl: form.isCover ? form.originalUrl || undefined : undefined,
        visible: form.visible,
      });
      toast.success('Song updated');
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto border-primary/20">
        <SheetHeader>
          <SheetTitle className="font-display tracking-wider gradient-text">
            Edit Song
          </SheetTitle>
          <SheetDescription className="font-elegant">
            Modify song metadata, tags, and visibility.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 flex-1">
          {/* Title */}
          <div className="space-y-2">
            <Label className="font-display text-xs text-muted-foreground tracking-wider">TITLE</Label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="font-elegant"
            />
          </div>

          {/* Artist */}
          <div className="space-y-2">
            <Label className="font-display text-xs text-muted-foreground tracking-wider">ARTIST</Label>
            <Input
              value={form.artist}
              onChange={e => setForm(f => ({ ...f, artist: e.target.value }))}
              className="font-elegant"
            />
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <Label className="font-display text-xs text-muted-foreground tracking-wider">GENRE</Label>
            <Select value={form.genre} onValueChange={v => setForm(f => ({ ...f, genre: v }))}>
              <SelectTrigger className="font-elegant">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map(g => (
                  <SelectItem key={g} value={g} className="font-elegant">{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="font-display text-xs text-muted-foreground tracking-wider">TAGS</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="font-elegant text-sm border-primary/30 text-primary px-3 py-1 rounded-full gap-1"
                >
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                className="font-elegant flex-1"
              />
              <Button variant="outline" size="icon" onClick={handleAddTag} className="shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label className="font-display text-xs text-muted-foreground tracking-wider">GENERATION PROMPT</Label>
            <Textarea
              value={form.prompt}
              onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
              rows={3}
              className="font-elegant"
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label className="font-display text-xs text-muted-foreground tracking-wider">COVER IMAGE</Label>
            {coverPreview && (
              <div className="w-32 h-32 rounded-lg overflow-hidden ornate-border mb-2">
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
              </div>
            )}
            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url" className="font-elegant text-xs">
                  <Link2 className="w-3 h-3 mr-1" /> URL
                </TabsTrigger>
                <TabsTrigger value="upload" className="font-elegant text-xs">
                  <Upload className="w-3 h-3 mr-1" /> Upload
                </TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="mt-2">
                <Input
                  placeholder="https://..."
                  value={form.coverUrl}
                  onChange={e => {
                    setForm(f => ({ ...f, coverUrl: e.target.value }));
                    setCoverPreview(e.target.value);
                  }}
                  className="font-elegant"
                />
              </TabsContent>
              <TabsContent value="upload" className="mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full font-elegant"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Choose Image
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          {/* Is Cover */}
          <div className="flex items-center justify-between">
            <Label className="font-display text-xs text-muted-foreground tracking-wider">COVER SONG</Label>
            <Switch
              checked={form.isCover}
              onCheckedChange={v => setForm(f => ({ ...f, isCover: v }))}
            />
          </div>

          {/* Original URL (only if cover) */}
          {form.isCover && (
            <div className="space-y-2">
              <Label className="font-display text-xs text-muted-foreground tracking-wider">ORIGINAL URL</Label>
              <Input
                placeholder="https://..."
                value={form.originalUrl}
                onChange={e => setForm(f => ({ ...f, originalUrl: e.target.value }))}
                className="font-elegant"
              />
            </div>
          )}

          {/* Visibility */}
          <div className="flex items-center justify-between rounded-lg border border-primary/20 p-3">
            <div className="flex items-center gap-2">
              {form.visible ? (
                <Eye className="w-4 h-4 text-primary" />
              ) : (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              )}
              <Label className="font-display text-sm">
                {form.visible ? 'Visible to public' : 'Hidden from public'}
              </Label>
            </div>
            <Switch
              checked={form.visible}
              onCheckedChange={v => setForm(f => ({ ...f, visible: v }))}
            />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSave} disabled={saving} className="w-full btn-luxurious">
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
