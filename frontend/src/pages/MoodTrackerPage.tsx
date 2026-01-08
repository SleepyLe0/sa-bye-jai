import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { moodTrackerService } from '@/services/mood-tracker.service';
import type { MoodEntry, MoodType } from '@/types/mood-tracker.types';
import { Smile, Frown, Meh, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const MOOD_CONFIG = {
  great: { emoji: '😄', label: 'Great', color: 'bg-green-500', textColor: 'text-green-700', icon: Smile },
  good: { emoji: '🙂', label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-700', icon: Smile },
  okay: { emoji: '😐', label: 'Okay', color: 'bg-yellow-500', textColor: 'text-yellow-700', icon: Meh },
  bad: { emoji: '😟', label: 'Bad', color: 'bg-orange-500', textColor: 'text-orange-700', icon: Frown },
  terrible: { emoji: '😢', label: 'Terrible', color: 'bg-red-500', textColor: 'text-red-700', icon: Frown },
};

export function MoodTrackerPage() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [stressLevel, setStressLevel] = useState(5);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await moodTrackerService.getRecent(14);
      setEntries(data);
    } catch (err: any) {
      setError(err.response?.data?.message || t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      setError(t('moodTracker.selectMood'));
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await moodTrackerService.create({
        mood: selectedMood,
        stress_level: stressLevel,
        note: note.trim() || undefined,
      });

      // Reset form
      setSelectedMood(null);
      setStressLevel(5);
      setNote('');
      setShowForm(false);

      await loadEntries();
    } catch (err: any) {
      setError(err.response?.data?.message || t('errors.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return t('moodTracker.justNow');
    } else if (diffInHours < 24) {
      return t('moodTracker.hoursAgo', { hours: Math.floor(diffInHours) });
    } else {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getStressColor = (level: number) => {
    if (level <= 3) return 'bg-green-500';
    if (level <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStressLabel = (level: number) => {
    if (level <= 3) return t('moodTracker.stressLow');
    if (level <= 6) return t('moodTracker.stressMedium');
    return t('moodTracker.stressHigh');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t('moodTracker.title')}</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">{t('moodTracker.subtitle')}</p>
      </div>

      {/* Quick Check-in Button - Mobile Optimized */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          size="lg"
          className="w-full h-14 text-lg"
        >
          <Smile className="h-6 w-6 mr-2" />
          {t('moodTracker.checkIn')}
        </Button>
      )}

      {/* Check-in Form - Mobile Optimized */}
      {showForm && (
        <Card className="border-2 border-primary">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{t('moodTracker.howAreYou')}</CardTitle>
            <CardDescription>{t('moodTracker.selectMoodBelow')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mood Selection - Large Touch Targets */}
            <div>
              <label className="text-sm font-medium mb-3 block">{t('moodTracker.yourMood')}</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(Object.keys(MOOD_CONFIG) as MoodType[]).map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                      selectedMood === mood
                        ? `${MOOD_CONFIG[mood].color} border-current text-white scale-105`
                        : 'border-border hover:border-primary hover:scale-105'
                    }`}
                  >
                    <span className="text-3xl mb-1">{MOOD_CONFIG[mood].emoji}</span>
                    <span className="text-xs font-medium">{t(`moodTracker.mood${mood.charAt(0).toUpperCase() + mood.slice(1)}`)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stress Level Slider - Mobile Optimized */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">{t('moodTracker.stressLevel')}</label>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${getStressColor(stressLevel)} text-white`}>
                  {stressLevel}/10 - {getStressLabel(stressLevel)}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-primary"
                style={{
                  background: `linear-gradient(to right, ${
                    stressLevel <= 3 ? '#22c55e' : stressLevel <= 6 ? '#eab308' : '#ef4444'
                  } 0%, ${
                    stressLevel <= 3 ? '#22c55e' : stressLevel <= 6 ? '#eab308' : '#ef4444'
                  } ${stressLevel * 10}%, #e5e7eb ${stressLevel * 10}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{t('moodTracker.calm')}</span>
                <span>{t('moodTracker.stressed')}</span>
              </div>
            </div>

            {/* Optional Note - Expandable */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t('moodTracker.noteOptional')}</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('moodTracker.notePlaceholder')}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Action Buttons - Full Width on Mobile */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setSelectedMood(null);
                  setStressLevel(5);
                  setNote('');
                  setError('');
                }}
                className="w-full h-12"
                disabled={submitting}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedMood || submitting}
                className="w-full h-12"
              >
                {submitting ? t('common.saving') : t('moodTracker.saveCheckIn')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Entries - Mobile Optimized Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          {t('moodTracker.recentEntries')}
        </h2>

        {entries.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">{t('moodTracker.noEntries')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('moodTracker.startTracking')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Mood Emoji */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full ${MOOD_CONFIG[entry.mood].color} flex items-center justify-center`}>
                        <span className="text-2xl">{MOOD_CONFIG[entry.mood].emoji}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{t(`moodTracker.mood${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}`)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStressColor(entry.stress_level)} text-white`}>
                            {t('moodTracker.stress')}: {entry.stress_level}/10
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(entry.created_at)}</p>
                        {entry.note && (
                          <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{entry.note}</p>
                        )}
                      </div>
                    </div>

                    {/* Trend Indicator */}
                    {entries.indexOf(entry) > 0 && (
                      <div className="flex-shrink-0 ml-2">
                        {entry.stress_level < entries[entries.indexOf(entry) - 1].stress_level ? (
                          <TrendingDown className="h-5 w-5 text-green-500" />
                        ) : entry.stress_level > entries[entries.indexOf(entry) - 1].stress_level ? (
                          <TrendingUp className="h-5 w-5 text-red-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
