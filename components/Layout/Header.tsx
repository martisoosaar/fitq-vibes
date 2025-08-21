'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import UserDropdown from './UserDropdown';

const mainMenu = [
  {
    name: 'Treeningud',
    submenu: [
      { name: 'Programmid', href: '/programs' },
      { name: 'Väljakutsed', href: '/challenges' },
      { name: 'Treenerid', href: '/trainers' },
      { name: 'Videod', href: '/videos' },
      { name: 'Vox Populi', href: '/voxpopuli' },
      { name: 'AI testid', href: '/ai-tests' },
    ],
  },
  {
    name: 'Tööriistad',
    submenu: [
      { name: 'Kalkulaatorid', href: '/calculators' },
      { name: 'Treeningpäevik', href: '/dashboard?tab=training-history' },
    ],
  },
  { name: 'Hinnakiri', href: '/pricing' },
  {
    name: 'Info',
    submenu: [
      { name: 'Treenerile', href: '/for-trainers' },
      { name: 'Kasutajale', href: '/for-users' },
      { name: 'Blogi', href: 'https://fitq.me/blog/', external: true },
      { name: 'Stebby', href: '/stebby' },
    ],
  },
  { name: 'E-pood', href: 'https://fitq.me/shop/', external: true },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [submenuTimeout, setSubmenuTimeout] = useState<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      const minScroll = 100;
      
      if (isMenuOpen) {
        setShowHeader(true);
        return;
      }
      
      if (currentScroll > lastScroll && currentScroll > minScroll) {
        setShowHeader(false);
      } else if (currentScroll < lastScroll) {
        setShowHeader(true);
      }
      
      setLastScroll(currentScroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll, isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMouseEnter = (itemName: string) => {
    if (submenuTimeout) {
      clearTimeout(submenuTimeout);
      setSubmenuTimeout(null);
    }
    setActiveSubmenu(itemName);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveSubmenu(null);
    }, 300); // 300ms delay before closing
    setSubmenuTimeout(timeout);
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 bg-[#2c313a] transition-transform duration-150 ${
        !showHeader ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Hamburger menu for mobile */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 relative z-50"
          >
            <span className={`block w-6 h-0.5 bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white my-1 transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/fitq-logo-new.svg"
              alt="FitQ logo"
              width={75}
              height={28}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {mainMenu.map((item) => (
              <div
                key={item.name}
                className="relative group"
                onMouseEnter={() => handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                {item.href ? (
                  item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#f6f7f8] hover:text-[#40b236] transition-colors font-medium"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className={`text-[#f6f7f8] hover:text-[#40b236] transition-colors font-medium ${
                        pathname === item.href ? 'text-[#40b236]' : ''
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                ) : (
                  <button className="text-[#f6f7f8] hover:text-[#40b236] transition-colors font-medium flex items-center gap-1">
                    {item.name}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
                
                {/* Submenu */}
                {item.submenu && activeSubmenu === item.name && (
                  <div 
                    className="absolute top-full left-0 pt-2"
                    onMouseEnter={() => handleMouseEnter(item.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="bg-[#3e4551] rounded-lg shadow-xl py-2 min-w-[200px]">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block px-4 py-2 text-[#f6f7f8] hover:bg-[#4d5665] hover:text-[#40b236] transition-colors"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* User Dropdown */}
            <UserDropdown />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden fixed top-20 left-0 w-full h-full bg-[#2c313a] transition-transform ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <nav className="p-6">
          {mainMenu.map((item) => (
            <div key={item.name} className="mb-4">
              {item.href ? (
                item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-2 text-[#f6f7f8] hover:text-[#40b236] font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="block py-2 text-[#f6f7f8] hover:text-[#40b236] font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              ) : (
                <div>
                  <div className="py-2 text-[#f6f7f8] font-medium">{item.name}</div>
                  {item.submenu && (
                    <div className="ml-4 mt-2">
                      {item.submenu.map((subItem) => (
                        subItem.external ? (
                          <a
                            key={subItem.name}
                            href={subItem.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block py-2 text-[#828ea0] hover:text-[#40b236]"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {subItem.name}
                          </a>
                        ) : (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block py-2 text-[#828ea0] hover:text-[#40b236]"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        )
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {/* Mobile user menu - will be handled by UserDropdown */}
          <div className="mt-8 pt-8 border-t border-[#3e4551] md:hidden">
            <Link
              href="/dashboard"
              className="block py-2 text-[#f6f7f8] hover:text-[#40b236] font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Minu töölaud
            </Link>
            <Link
              href="/settings"
              className="block py-2 text-[#f6f7f8] hover:text-[#40b236] font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Seaded
            </Link>
            <Link
              href="/messenger"
              className="block py-2 text-[#f6f7f8] hover:text-[#40b236] font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Sõnumid
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
