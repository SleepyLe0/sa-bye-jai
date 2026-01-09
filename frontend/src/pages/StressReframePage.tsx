import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { stressReframeService } from '@/services/stress-reframe.service';
import type { ReframeResponse } from '@/types/stress-reframe.types';
import { Brain, Sparkles, Target, Mountain, Smile } from 'lucide-react';

export function StressReframePage() {
  const { t } = useTranslation();
  const [thought, setThought] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reframes, setReframes] = useState<ReframeResponse | null>(null);

  const handleReframe = async () => {
    if (!thought.trim()) {
      setError(t('stressReframe.enterThought'));
      return;
    }

    if (thought.length > 1000) {
      setError(t('stressReframe.tooLong'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await stressReframeService.create({
        original_thought: thought,
      });
      setReframes(result);
    } catch (err: any) {
      setError(err.response?.data?.message || t('errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setThought('');
    setReframes(null);
    setError('');
  };

  return (
    <div className="space-y-6 pb-6 relative">
      {/* Animated Background */}
      <div className="absolute -top-40 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse -z-10"></div>

      {/* Header */}
      <div className="glass-card animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">{t('stressReframe.title')}</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">{t('stressReframe.subtitle')}</p>
          </div>
        </div>
      </div>

      {!reframes ? (
        // Input Form
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t('stressReframe.shareThought')}
            </CardTitle>
            <CardDescription>{t('stressReframe.thoughtDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-4 text-sm font-medium text-destructive bg-destructive/10 border-2 border-destructive rounded-xl animate-in fade-in slide-in-from-top-1 duration-300">
                ⚠️ {error}
              </div>
            )}

            <Textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder={t('stressReframe.placeholder')}
              className="min-h-[150px] md:min-h-[120px] text-base resize-none"
              disabled={loading}
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t('stressReframe.example')}</span>
              <span>{thought.length}/1000</span>
            </div>

            <Button
              onClick={handleReframe}
              disabled={loading || !thought.trim()}
              className="w-full h-12 text-base"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2" />
                  {t('stressReframe.generating')}
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5 mr-2" />
                  {t('stressReframe.reframeButton')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Reframe Results
        <div className="space-y-4">
          {/* Original Thought */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader>
              <CardTitle className="text-lg">{t('stressReframe.originalThought')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground italic">"{reframes.original_thought}"</p>
            </CardContent>
          </Card>

          {/* Stoic Reframe */}
          <Card className="liquid-glass-hover animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 border-2 border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <div className="p-2 rounded-xl bg-blue-500/10">
                  <Mountain className="h-5 w-5" />
                </div>
                {t('stressReframe.stoic')}
              </CardTitle>
              <CardDescription>{t('stressReframe.stoicDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">{reframes.stoic_reframe}</p>
            </CardContent>
          </Card>

          {/* Optimist Reframe */}
          <Card className="liquid-glass-hover animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 border-2 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <Smile className="h-5 w-5" />
                </div>
                {t('stressReframe.optimist')}
              </CardTitle>
              <CardDescription>{t('stressReframe.optimistDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">{reframes.optimist_reframe}</p>
            </CardContent>
          </Card>

          {/* Realist Reframe */}
          <Card className="liquid-glass-hover animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 border-2 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <div className="p-2 rounded-xl bg-purple-500/10">
                  <Target className="h-5 w-5" />
                </div>
                {t('stressReframe.realist')}
              </CardTitle>
              <CardDescription>{t('stressReframe.realistDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">{reframes.realist_reframe}</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 h-12"
              size="lg"
            >
              {t('stressReframe.reframeAnother')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
