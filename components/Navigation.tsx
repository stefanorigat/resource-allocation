'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Settings, ChevronDown, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Resources', path: '/resources' },
  { name: 'Pods', path: '/pods' },
  { name: 'Projects', path: '/projects' },
  { name: 'Overview by Month', path: '/overview' },
  { name: 'Budget Tracking', path: '/budget' },
];

const settingsItems = [
  { name: 'Skills', path: '/settings/skills' },
  { name: 'Roles', path: '/settings/roles' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSettingsDropdown(false);
      }
    };

    if (showSettingsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSettingsDropdown]);

  const isSettingsActive = pathname?.startsWith('/settings');

  return (
    <nav className="bg-gradient-to-r from-yellow-50 via-orange-400 to-yellow-400 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-3">
                <Image 
                  src="/wiz-team-logo.png" 
                  alt="Wiz-Team Logo" 
                  width={120} 
                  height={50}
                  className="h-10 w-auto"
                  priority
                />
              </Link>
              <div className="h-8 w-px bg-white opacity-30 hidden md:block" />
              <h1 className="text-lg font-semibold text-white hidden md:block">
                Resource Allocation
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-white text-white'
                        : 'border-transparent text-orange-100 hover:border-orange-200 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Settings Dropdown */}
          <div className="flex items-center">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isSettingsActive
                    ? 'bg-white/20 text-white'
                    : 'text-white hover:bg-white'
                }`}
              >
                <Settings className={`w-5 h-5 ${!isSettingsActive && 'group-hover:text-orange-600'}`} />
                <span className={!isSettingsActive ? 'group-hover:text-orange-600' : ''}>Settings</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSettingsDropdown ? 'rotate-180' : ''} ${!isSettingsActive && 'group-hover:text-orange-600'}`} />
              </button>

              {/* Dropdown Menu */}
              {showSettingsDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  {settingsItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setShowSettingsDropdown(false)}
                        className={`block px-4 py-2 text-sm ${
                          isActive
                            ? 'bg-orange-50 text-orange-600 font-medium'
                            : 'text-gray-700 hover:bg-orange-50'
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="ml-4 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white hover:text-orange-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
