import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/services/api';
import { 
  Vault, 
  LayoutDashboard, 
  Shield, 
  Heart, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

const navLinks = [
  { path: '/dashboard', label: 'Timeline', icon: LayoutDashboard },
  { path: '/privacy', label: 'Privacy', icon: Shield },
  { path: '/legacy', label: 'Legacy', icon: Heart },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const DashboardNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-black/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
              <Vault className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-black">LifeVault</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-black text-white'
                    : 'text-black/60 hover:bg-black/5 hover:text-black'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                {getInitials(user?.name || user?.email)}
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-black/60 hover:bg-black/5 hover:text-black transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-black/5 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-black text-white'
                    : 'text-black/60 hover:bg-black/5'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};