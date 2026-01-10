import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect, useCallback } from 'react';

// Define nav items outside component to prevent re-creation on every render
const NAV_PATHS = ['/dashboard', '/mental-box', '/mood-tracker', '/grounding'];

export function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Refs for navigation items to calculate indicator position
  const navRef = useRef<HTMLElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const navItems = [
    { path: '/dashboard', label: 'navigation.dashboard' },
    { path: '/mental-box', label: 'navigation.mentalBox' },
    { path: '/mood-tracker', label: 'navigation.moodTracker' },
    { path: '/grounding', label: 'navigation.grounding' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
  };

  const isActive = (path: string) => location.pathname === path;
  
  // Update indicator position - memoized callback
  const updateIndicatorPosition = useCallback(() => {
    if (!navRef.current) return;
    
    const activeIndex = NAV_PATHS.findIndex(path => path === location.pathname);
    if (activeIndex === -1) {
      setIndicatorStyle({ left: 0, width: 0 });
      return;
    }
    
    const navElement = navRef.current;
    const links = navElement.querySelectorAll('a');
    const activeLink = links[activeIndex] as HTMLElement;
    
    if (activeLink) {
      const navRect = navElement.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      setIndicatorStyle({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
      });
    }
  }, [location.pathname]);

  // Update indicator position when route or language changes
  useEffect(() => {
    // Small delay to allow text to render with new language
    const timer = setTimeout(() => {
      updateIndicatorPosition();
    }, 50);
    
    window.addEventListener('resize', updateIndicatorPosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicatorPosition);
    };
  }, [updateIndicatorPosition, i18n.language]);

  return (
    <header className="sticky top-0 z-50 w-full md:flex md:justify-center liquid-glass border-b border-white/20">
      <div className="container flex h-16 justify-between items-center px-4">
        {/* Logo - Fixed Width */}
        <div className="w-40">
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2">
            <img src="/logo.svg" alt="SaByeJai" className="h-10 w-10" />
            <span className="text-xl font-bold gradient-text">{t('common.appName')}</span>
          </Link>
        </div>

        {/* Desktop Navigation - Centered */}
        {isAuthenticated && (
          <nav ref={navRef} className="hidden md:flex items-center space-x-2 flex-1 justify-center relative">
            {/* Sliding Liquid Glass Indicator */}
            <div
              className="absolute h-9 bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/20 rounded-lg shadow-lg transition-all duration-500 ease-out pointer-events-none"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                opacity: indicatorStyle.width > 0 ? 1 : 0,
              }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
            
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors relative z-10 ${
                  isActive(item.path)
                    ? 'text-primary cursor-default pointer-events-none'
                    : 'hover:text-primary/80'
                }`}
              >
                {t(item.label)}
              </Link>
            ))}
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
              className={`py-2 text-sm font-medium ${isActive('/dashboard') ? 'text-primary pointer-events-none' : 'hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navigation.dashboard')}
            </Link>
            <Link
              to="/mental-box"
              className={`py-2 text-sm font-medium ${isActive('/mental-box') ? 'text-primary pointer-events-none' : 'hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navigation.mentalBox')}
            </Link>
            <Link
              to="/mood-tracker"
              className={`py-2 text-sm font-medium ${isActive('/mood-tracker') ? 'text-primary pointer-events-none' : 'hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('navigation.moodTracker')}
            </Link>
            <Link
              to="/grounding"
              className={`py-2 text-sm font-medium ${isActive('/grounding') ? 'text-primary pointer-events-none' : 'hover:text-primary'}`}
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
