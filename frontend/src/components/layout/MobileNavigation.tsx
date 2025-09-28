import React, { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface MobileNavigationProps {
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  onLogout: () => void;
  primaryColor?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  title,
  subtitle,
  navItems,
  onLogout,
  primaryColor = 'green'
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const colorClasses = {
    green: {
      nav: 'bg-green-600',
      hover: 'hover:bg-green-700',
      focus: 'focus:ring-green-500'
    },
    blue: {
      nav: 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      focus: 'focus:ring-blue-500'
    },
    purple: {
      nav: 'bg-purple-600',
      hover: 'hover:bg-purple-700',
      focus: 'focus:ring-purple-500'
    },
    red: {
      nav: 'bg-red-600',
      hover: 'hover:bg-red-700',
      focus: 'focus:ring-red-500'
    }
  };

  const colors = colorClasses[primaryColor as keyof typeof colorClasses] || colorClasses.green;

  return (
    <header className="bg-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 sm:py-6 lg:py-8">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset ${colors.focus} mr-3`}
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-sm sm:text-base lg:text-lg text-gray-600 hidden sm:block">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 sm:px-4 sm:py-2 lg:px-6 lg:py-3 rounded-lg text-sm sm:text-base lg:text-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className={`${colors.nav} shadow-lg hidden lg:block`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 py-3">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={`text-white px-4 py-2 text-sm font-medium ${colors.hover} rounded-lg transition-all duration-200 flex items-center`}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className={`lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className={`px-2 pt-2 pb-3 space-y-1 ${colors.nav} shadow-lg`}>
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`text-white block px-3 py-2 rounded-md text-base font-medium ${colors.hover} transition-all duration-200 flex items-center`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
};

export default MobileNavigation;