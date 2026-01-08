import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Smile, Wind } from 'lucide-react';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    {
      icon: Heart,
      title: t('mentalBox.title'),
      description: t('mentalBox.description'),
    },
    {
      icon: Smile,
      title: t('moodTracker.title'),
      description: t('moodTracker.description'),
    },
    {
      icon: Wind,
      title: t('grounding.title'),
      description: t('grounding.description'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight gradient-text">
            {t('common.appName')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('dashboard.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/register')} className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
              {t('common.register')}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              {t('common.login')}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">
            Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="animate-in fade-in slide-in-from-bottom-4 duration-1000" style={{ animationDelay: `${index * 150}ms` }}>
                <CardHeader>
                  <div className="inline-flex p-3 rounded-2xl bg-primary/10 mb-4 w-fit">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
