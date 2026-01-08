import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

type Phase = 'inhale' | 'hold' | 'exhale' | 'rest';

const PHASE_DURATIONS = {
  inhale: 4,
  hold: 7,
  exhale: 8,
  rest: 0,
};

const TOTAL_ROUNDS = 4;

export function GroundingPage() {
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Phase>('rest');
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const startExercise = () => {
    setIsActive(true);
    setCurrentPhase('inhale');
    setTimeLeft(PHASE_DURATIONS.inhale);
    setCurrentRound(1);
    setIsCompleted(false);
  };

  const pauseExercise = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resumeExercise = () => {
    setIsActive(true);
  };

  const resetExercise = () => {
    setIsActive(false);
    setCurrentPhase('rest');
    setTimeLeft(0);
    setCurrentRound(1);
    setIsCompleted(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          if (currentPhase === 'inhale') {
            setCurrentPhase('hold');
            return PHASE_DURATIONS.hold;
          } else if (currentPhase === 'hold') {
            setCurrentPhase('exhale');
            return PHASE_DURATIONS.exhale;
          } else if (currentPhase === 'exhale') {
            // Round completed
            if (currentRound >= TOTAL_ROUNDS) {
              // Exercise completed
              setIsCompleted(true);
              setIsActive(false);
              setCurrentPhase('rest');
              return 0;
            } else {
              // Next round
              setCurrentRound((r) => r + 1);
              setCurrentPhase('inhale');
              return PHASE_DURATIONS.inhale;
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, currentPhase, currentRound]);

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale':
        return t('grounding.breatheIn');
      case 'hold':
        return t('grounding.hold');
      case 'exhale':
        return t('grounding.breatheOut');
      case 'rest':
        return isCompleted ? t('grounding.completed') : '';
      default:
        return '';
    }
  };

  const getCircleScale = () => {
    if (currentPhase === 'rest') return 1;
    if (currentPhase === 'inhale') {
      const progress = (PHASE_DURATIONS.inhale - timeLeft) / PHASE_DURATIONS.inhale;
      return 1 + progress * 0.5;
    }
    if (currentPhase === 'exhale') {
      const progress = (PHASE_DURATIONS.exhale - timeLeft) / PHASE_DURATIONS.exhale;
      return 1.5 - progress * 0.5;
    }
    return 1.5;
  };

  const getCircleColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'bg-blue-500';
      case 'hold':
        return 'bg-purple-500';
      case 'exhale':
        return 'bg-green-500';
      default:
        return 'bg-gray-300 dark:bg-gray-700';
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t('grounding.title')}</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">{t('grounding.subtitle')}</p>
      </div>

      {/* Breathing Exercise Card - Mobile Optimized */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl">{t('grounding.breathing')}</CardTitle>
          <CardDescription className="text-sm">{t('grounding.breathingDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Breathing Circle - Larger on Mobile */}
          <div className="flex flex-col items-center justify-center py-4 md:py-8">
            <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
              <div
                className={`absolute rounded-full ${getCircleColor()} transition-all duration-1000 ease-in-out`}
                style={{
                  width: `${getCircleScale() * 160}px`,
                  height: `${getCircleScale() * 160}px`,
                  opacity: currentPhase === 'rest' ? 0.3 : 0.8,
                }}
              />
              <div className="relative z-10 text-center px-4">
                <p className="text-4xl md:text-5xl font-bold text-foreground">
                  {currentPhase !== 'rest' ? timeLeft : ''}
                </p>
                <p className="text-xl md:text-2xl mt-3 text-foreground font-medium">
                  {getPhaseText()}
                </p>
              </div>
            </div>
          </div>

          {/* Round Counter - Larger on Mobile */}
          {currentPhase !== 'rest' && (
            <div className="text-center">
              <p className="text-base md:text-sm font-medium text-muted-foreground">
                {t('grounding.round')} {currentRound} / {TOTAL_ROUNDS}
              </p>
            </div>
          )}

          {/* Controls - Full Width Buttons on Mobile */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {currentPhase === 'rest' ? (
              <Button onClick={startExercise} size="lg" className="w-full sm:w-auto h-14 text-lg">
                <Play className="h-6 w-6 mr-2" />
                {isCompleted ? t('grounding.reset') : t('grounding.start')}
              </Button>
            ) : (
              <>
                {isActive ? (
                  <Button onClick={pauseExercise} variant="outline" size="lg" className="w-full sm:w-auto h-14 text-lg">
                    <Pause className="h-6 w-6 mr-2" />
                    {t('grounding.pause')}
                  </Button>
                ) : (
                  <Button onClick={resumeExercise} size="lg" className="w-full sm:w-auto h-14 text-lg">
                    <Play className="h-6 w-6 mr-2" />
                    {t('grounding.resume')}
                  </Button>
                )}
                <Button onClick={resetExercise} variant="outline" size="lg" className="w-full sm:w-auto h-14 text-lg">
                  <RotateCcw className="h-6 w-6 mr-2" />
                  {t('grounding.reset')}
                </Button>
              </>
            )}
          </div>

          {/* Completion Message - Mobile Optimized */}
          {isCompleted && (
            <div className="text-center p-5 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-lg md:text-base text-green-700 dark:text-green-300 font-medium">
                {t('grounding.completed')}
              </p>
              <p className="text-base md:text-sm text-green-600 dark:text-green-400 mt-2">
                {t('dashboard.subtitle')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card - Mobile Optimized */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl">{t('grounding.instructions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 list-decimal list-inside text-sm md:text-base text-muted-foreground">
            <li className="pl-2">{t('grounding.step1')}</li>
            <li className="pl-2">{t('grounding.step2')}</li>
            <li className="pl-2">{t('grounding.step3')}</li>
            <li className="pl-2">{t('grounding.step4')}</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
