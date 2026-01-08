import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Smile, Wind, ArrowRight } from 'lucide-react';

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: Heart,
      title: t('mentalBox.title'),
      description: t('mentalBox.subtitle'),
      action: () => navigate('/mental-box'),
      color: 'text-red-500',
    },
    {
      icon: Smile,
      title: t('moodTracker.title'),
      description: t('moodTracker.subtitle'),
      action: () => navigate('/mood-tracker'),
      color: 'text-blue-500',
    },
    {
      icon: Wind,
      title: t('grounding.title'),
      description: t('grounding.subtitle'),
      action: () => navigate('/grounding'),
      color: 'text-green-500',
    },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Animated Background */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse -z-10"></div>

      {/* Welcome Section */}
      <div className="glass-card animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text">
          {t('dashboard.welcome', { name: user?.username || 'User' })}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">{t('dashboard.quickActions')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={action.action}
            >
              <CardHeader>
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4 w-fit group-hover:scale-110 transition-transform">
                  <action.icon className={`h-8 w-8 ${action.color}`} />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between group-hover:bg-primary/10">
                  {t('common.next')}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <CardHeader>
              <CardDescription>{t('dashboard.stats.totalEntries')}</CardDescription>
              <CardTitle className="text-4xl font-bold gradient-text">0</CardTitle>
            </CardHeader>
          </Card>
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <CardHeader>
              <CardDescription>{t('dashboard.stats.moodEntries')}</CardDescription>
              <CardTitle className="text-4xl font-bold gradient-text">0</CardTitle>
            </CardHeader>
          </Card>
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
            <CardHeader>
              <CardDescription>{t('dashboard.stats.completedSessions')}</CardDescription>
              <CardTitle className="text-4xl font-bold gradient-text">0</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
