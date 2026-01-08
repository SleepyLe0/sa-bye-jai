import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { mentalBoxService } from '@/services/mental-box.service';
import type { MentalBoxEntry } from '@/types/mental-box.types';
import { Trash2, Plus } from 'lucide-react';

export function MentalBoxPage() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<MentalBoxEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await mentalBoxService.getAll();
      setEntries(data);
    } catch (err: any) {
      setError(err.response?.data?.message || t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      setError(t('validation.required'));
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await mentalBoxService.create(newEntry);
      setNewEntry({ title: '', content: '' });
      setIsAddDialogOpen(false);
      await loadEntries();
    } catch (err: any) {
      setError(err.response?.data?.message || t('errors.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await mentalBoxService.delete(id);
      await loadEntries();
      setDeleteId(null);
    } catch (err: any) {
      setError(err.response?.data?.message || t('errors.deleteFailed'));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t('mentalBox.title')}</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">{t('mentalBox.subtitle')}</p>
      </div>

      {/* Add Button - Full Width on Mobile */}
      <Button
        onClick={() => setIsAddDialogOpen(true)}
        size="lg"
        className="w-full md:w-auto h-14 text-lg md:h-10 md:text-base"
      >
        <Plus className="h-5 w-5 md:h-4 md:w-4 mr-2" />
        {t('mentalBox.addEntry')}
      </Button>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Entries List - Mobile Optimized */}
      {entries.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <CardTitle className="text-lg mb-2">{t('mentalBox.empty')}</CardTitle>
            <CardDescription>{t('mentalBox.emptyDescription')}</CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg md:text-xl line-clamp-2">{entry.title}</CardTitle>
                    <CardDescription className="mt-1 text-xs md:text-sm">
                      {formatDate(entry.created_at)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(entry.id)}
                    className="flex-shrink-0 h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap line-clamp-6">{entry.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Entry Dialog - Mobile Optimized */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">{t('mentalBox.addEntry')}</DialogTitle>
            <DialogDescription className="text-sm">{t('mentalBox.addEntryDescription')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEntry} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">{t('mentalBox.entryTitle')}</Label>
              <input
                id="title"
                type="text"
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('mentalBox.titlePlaceholder')}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">{t('mentalBox.entryContent')}</Label>
              <Textarea
                id="content"
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                placeholder={t('mentalBox.contentPlaceholder')}
                rows={6}
                disabled={submitting}
                className="text-base resize-none"
              />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={submitting}
                className="w-full h-12"
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={submitting} className="w-full h-12">
                {submitting ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog - Mobile Optimized */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg">{t('mentalBox.deleteConfirmTitle')}</DialogTitle>
            <DialogDescription className="text-sm">{t('mentalBox.deleteConfirmMessage')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="w-full h-12">
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDeleteEntry(deleteId)}
              className="w-full h-12"
            >
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
