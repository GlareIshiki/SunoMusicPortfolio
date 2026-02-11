import { useState, useEffect, useRef } from 'react';
import { Save, Upload, Link2, X, Plus, Loader2, Eye, EyeOff, ChevronUp, ChevronDown, Type, Music2, Search, Trash2, AlignLeft, AlignCenter, AlignRight, AlignJustify, ImageIcon, Frame } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { updateCharacter, uploadCover, fetchSongs } from '@/lib/api';
import { toast } from 'sonner';
import type { Character, CharacterSection, Song, TextAlign } from '@/../../shared/types';

interface CharacterEditSheetProps {
  character: Character;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function CharacterEditSheet({ character, open, onOpenChange, onSaved }: CharacterEditSheetProps) {
  const [form, setForm] = useState({
    name: '',
    subtitle: '',
    coverUrl: '',
    sortOrder: 0,
    visible: true,
    sections: [] as CharacterSection[],
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Song search state
  const [songSearch, setSongSearch] = useState('');
  const [songResults, setSongResults] = useState<Song[]>([]);
  const [searchingFor, setSearchingFor] = useState<number | null>(null);

  useEffect(() => {
    if (open && character) {
      setForm({
        name: character.name,
        subtitle: character.subtitle,
        coverUrl: character.coverUrl,
        sortOrder: character.sortOrder,
        visible: character.visible,
        sections: character.sections.map(s => ({ ...s })),
      });
      setCoverPreview(character.coverUrl);
      setSongSearch('');
      setSongResults([]);
      setSearchingFor(null);
    }
  }, [open, character]);

  // Song search
  useEffect(() => {
    if (!songSearch.trim()) {
      setSongResults([]);
      return;
    }
    const timer = setTimeout(() => {
      fetchSongs({ search: songSearch, limit: 10 })
        .then(r => setSongResults(r.songs))
        .catch(() => setSongResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [songSearch]);

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
      await updateCharacter(character.id, {
        name: form.name,
        subtitle: form.subtitle,
        coverUrl: form.coverUrl,
        sortOrder: form.sortOrder,
        visible: form.visible,
        sections: form.sections,
      });
      toast.success('Character updated');
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Section manipulation
  const addSection = (type: 'text' | 'songs' | 'image') => {
    const newSection: CharacterSection =
      type === 'text' ? { type: 'text', content: '', align: 'center' as TextAlign, frame: true }
      : type === 'image' ? { type: 'image', url: '', align: 'center' as TextAlign }
      : { type: 'songs', songIds: [] };
    setForm(f => ({
      ...f,
      sections: [...f.sections, newSection],
    }));
  };

  const removeSection = (index: number) => {
    setForm(f => ({ ...f, sections: f.sections.filter((_, i) => i !== index) }));
    if (searchingFor === index) setSearchingFor(null);
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= form.sections.length) return;
    setForm(f => {
      const arr = [...f.sections];
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return { ...f, sections: arr };
    });
    if (searchingFor === index) setSearchingFor(target);
    else if (searchingFor === target) setSearchingFor(index);
  };

  const updateTextContent = (index: number, content: string) => {
    setForm(f => {
      const arr = [...f.sections];
      const existing = arr[index];
      if (existing.type !== 'text') return f;
      arr[index] = { ...existing, content };
      return { ...f, sections: arr };
    });
  };

  const updateTextAlign = (index: number, align: TextAlign) => {
    setForm(f => {
      const arr = [...f.sections];
      const existing = arr[index];
      if (existing.type === 'text' || existing.type === 'image') {
        arr[index] = { ...existing, align };
      }
      return { ...f, sections: arr };
    });
  };

  const updateTextFrame = (index: number, frame: boolean) => {
    setForm(f => {
      const arr = [...f.sections];
      const existing = arr[index];
      if (existing.type !== 'text') return f;
      arr[index] = { ...existing, frame };
      return { ...f, sections: arr };
    });
  };

  const updateImageUrl = (index: number, url: string) => {
    setForm(f => {
      const arr = [...f.sections];
      const existing = arr[index];
      if (existing.type !== 'image') return f;
      arr[index] = { ...existing, url };
      return { ...f, sections: arr };
    });
  };

  const updateImageAlt = (index: number, alt: string) => {
    setForm(f => {
      const arr = [...f.sections];
      const existing = arr[index];
      if (existing.type !== 'image') return f;
      arr[index] = { ...existing, alt };
      return { ...f, sections: arr };
    });
  };

  const addSongToSection = (sectionIndex: number, songId: string) => {
    setForm(f => {
      const arr = [...f.sections];
      const section = arr[sectionIndex];
      if (section.type !== 'songs') return f;
      if (section.songIds.includes(songId)) return f;
      arr[sectionIndex] = { ...section, songIds: [...section.songIds, songId] };
      return { ...f, sections: arr };
    });
  };

  const removeSongFromSection = (sectionIndex: number, songId: string) => {
    setForm(f => {
      const arr = [...f.sections];
      const section = arr[sectionIndex];
      if (section.type !== 'songs') return f;
      arr[sectionIndex] = { ...section, songIds: section.songIds.filter(id => id !== songId) };
      return { ...f, sections: arr };
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto border-primary/20">
        <SheetHeader>
          <SheetTitle className="font-display tracking-wider gradient-text">
            Edit Character
          </SheetTitle>
          <SheetDescription className="font-elegant">
            Modify character story, sections, and visibility.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 flex-1">
          {/* Name */}
          <div className="space-y-2">
            <Label className="font-display text-xs text-muted-foreground tracking-wider">NAME</Label>
            <Input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="font-elegant"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label className="font-display text-xs text-muted-foreground tracking-wider">SUBTITLE</Label>
            <Input
              value={form.subtitle}
              onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
              className="font-elegant"
              placeholder="A short tagline..."
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

          {/* Sort Order */}
          <div className="space-y-2">
            <Label className="font-display text-xs text-muted-foreground tracking-wider">SORT ORDER</Label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
              className="font-mono w-24"
            />
          </div>

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

          {/* Sections Editor */}
          <div className="space-y-3">
            <Label className="font-display text-xs text-muted-foreground tracking-wider">SECTIONS</Label>

            {form.sections.map((section, idx) => (
              <div key={idx} className="rounded-lg border border-border/50 p-3 space-y-2">
                {/* Section header */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs">
                    {section.type === 'text' ? (
                      <><Type className="w-3 h-3 mr-1" /> Text</>
                    ) : section.type === 'image' ? (
                      <><ImageIcon className="w-3 h-3 mr-1" /> Image</>
                    ) : (
                      <><Music2 className="w-3 h-3 mr-1" /> Songs ({section.songIds.length})</>
                    )}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSection(idx, -1)} disabled={idx === 0}>
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSection(idx, 1)} disabled={idx === form.sections.length - 1}>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeSection(idx)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Section content */}
                {section.type === 'text' ? (
                  <div className="space-y-2">
                    {/* Alignment + frame controls */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs text-muted-foreground font-elegant mr-1">Align:</span>
                      {([
                        { value: 'left' as TextAlign, icon: AlignLeft, label: 'Left' },
                        { value: 'center' as TextAlign, icon: AlignCenter, label: 'Center' },
                        { value: 'right' as TextAlign, icon: AlignRight, label: 'Right' },
                        { value: 'full' as TextAlign, icon: AlignJustify, label: 'Full' },
                      ] as const).map(({ value, icon: Icon, label }) => (
                        <Button
                          key={value}
                          variant={(section.align || 'center') === value ? 'default' : 'ghost'}
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateTextAlign(idx, value)}
                          title={label}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </Button>
                      ))}
                      <div className="w-px h-5 bg-border/50 mx-1" />
                      <Button
                        variant={section.frame !== false ? 'default' : 'ghost'}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateTextFrame(idx, section.frame === false)}
                        title={section.frame !== false ? 'Framed' : 'Frameless'}
                      >
                        <Frame className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Textarea
                      value={section.content}
                      onChange={e => updateTextContent(idx, e.target.value)}
                      rows={4}
                      className="font-elegant text-sm"
                      placeholder="Story text..."
                    />
                  </div>
                ) : section.type === 'image' ? (
                  <div className="space-y-2">
                    {/* Alignment selector */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground font-elegant mr-1">Align:</span>
                      {([
                        { value: 'left' as TextAlign, icon: AlignLeft, label: 'Left' },
                        { value: 'center' as TextAlign, icon: AlignCenter, label: 'Center' },
                        { value: 'right' as TextAlign, icon: AlignRight, label: 'Right' },
                        { value: 'full' as TextAlign, icon: AlignJustify, label: 'Full' },
                      ] as const).map(({ value, icon: Icon, label }) => (
                        <Button
                          key={value}
                          variant={(section.align || 'center') === value ? 'default' : 'ghost'}
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateTextAlign(idx, value)}
                          title={label}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </Button>
                      ))}
                    </div>
                    {/* Image URL */}
                    <Input
                      value={section.url}
                      onChange={e => updateImageUrl(idx, e.target.value)}
                      placeholder="https://... image URL"
                      className="font-elegant text-sm"
                    />
                    {/* Alt text */}
                    <Input
                      value={section.alt || ''}
                      onChange={e => updateImageAlt(idx, e.target.value)}
                      placeholder="Alt text (optional)"
                      className="font-elegant text-xs"
                    />
                    {/* Image upload */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs w-full"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = async (ev) => {
                          const file = (ev.target as HTMLInputElement).files?.[0];
                          if (!file) return;
                          try {
                            const url = await uploadCover(file);
                            updateImageUrl(idx, url);
                            toast.success('Image uploaded');
                          } catch {
                            toast.error('Upload failed');
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload className="w-3 h-3 mr-1" /> Upload Image
                    </Button>
                    {/* Preview */}
                    {section.url && (
                      <div className="rounded-lg overflow-hidden border border-border/30">
                        <img src={section.url} alt={section.alt || ''} className="w-full h-auto max-h-40 object-cover" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Song list */}
                    {section.songIds.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {section.songIds.map(songId => (
                          <Badge key={songId} variant="outline" className="font-mono text-xs gap-1 pr-1">
                            {songId.slice(0, 8)}...
                            <button onClick={() => removeSongFromSection(idx, songId)} className="hover:text-destructive">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Song search */}
                    {searchingFor === idx ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                          <Input
                            value={songSearch}
                            onChange={e => setSongSearch(e.target.value)}
                            placeholder="Search songs..."
                            className="pl-7 h-8 text-xs font-elegant"
                            autoFocus
                          />
                        </div>
                        {songResults.length > 0 && (
                          <div className="max-h-40 overflow-y-auto rounded border border-border/50 divide-y divide-border/30">
                            {songResults.map(song => (
                              <button
                                key={song.id}
                                onClick={() => addSongToSection(idx, song.id)}
                                className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors flex items-center gap-2"
                              >
                                <img src={song.coverUrl} alt="" className="w-6 h-6 rounded object-cover" />
                                <div className="min-w-0 flex-1">
                                  <p className="font-elegant text-xs truncate">{song.title}</p>
                                  <p className="font-elegant text-xs text-muted-foreground truncate">{song.artist}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setSearchingFor(null); setSongSearch(''); }}>
                          Close search
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs w-full"
                        onClick={() => { setSearchingFor(idx); setSongSearch(''); }}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Song
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Add section buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => addSection('text')}>
                <Type className="w-3 h-3 mr-1" /> Text
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => addSection('image')}>
                <ImageIcon className="w-3 h-3 mr-1" /> Image
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => addSection('songs')}>
                <Music2 className="w-3 h-3 mr-1" /> Songs
              </Button>
            </div>
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
