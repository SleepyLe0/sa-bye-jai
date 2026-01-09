import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="sticky top-0 z-50 w-full md:flex md:justify-center liquid-glass border-b border-white/20">
      <div className="container flex h-16 justify-between items-center px-4">
        {/* Logo - Fixed Width */}
        <div className="w-32">
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2">
            <span className="text-xl font-bold gradient-text">{t('common.appName')}</span>
          </Link>
        </div>

        {/* Desktop Navigation - Centered */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-2 flex-1 justify-center">
            <Link
              to="/dashboard"
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-white/10 hover:backdrop-blur-sm"
            >
              {t('navigation.dashboard')}
            </Link>
            <Link
              to="/mental-box"
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-white/10 hover:backdrop-blur-sm"
            >
              {t('navigation.mentalBox')}
            </Link>
            <Link
              to="/mood-tracker"
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-white/10 hover:backdrop-blur-sm"
            >
              {t('navigation.moodTracker')}
            </Link>
            <Link
              to="/grounding"
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-white/10 hover:backdrop-blur-sm"
            >
              {t('navigation.grounding')}
            </Link>
          </nav>
        )}

        {/* Spacer for non-authenticated users */}
        {!isAuthenticated && <div className="flex-1" />}

        {/* Right side actions */}
        <div className="flex items-center space-x-2 w-32 justify-end">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            title={t('language.changeLanguage')}
          >
            <Globe className="h-5 w-5" />
            <span className="sr-only">{t('language.changeLanguage')}</span>
          </Button>

          {/* User Actions */}
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {user?.username}
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout} title={t('common.logout')}>
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">{t('common.logout')}</span>
                </Button>
              </div>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                {t('common.login')}
              </Button>
              <Button onClick={() => navigate('/register')}>
                {t('common.register')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-t border-white/20">
        <nav className="container flex flex-col space-y-2 p-4 liquid-glass">
            <Link
              to="/dashboard"
              className="py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navigation.dashboard')}
            </Link>
            <Link
              to="/mental-box"
              className="py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navigation.mentalBox')}
            </Link>
            <Link
              to="/mood-tracker"
              className="py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navigation.moodTracker')}
            </Link>
            <Link
              to="/grounding"
              className="py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navigation.grounding')}
            </Link>
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-muted-foreground">{user?.username}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('common.logout')}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
