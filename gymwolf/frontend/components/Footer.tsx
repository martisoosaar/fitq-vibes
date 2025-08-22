'use client';

import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { t } from '@/lib/translations';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-semibold mb-3">{t('footer.aboutGymwolf')}</h3>
            <p className="text-sm text-gray-400">
              {t('footer.description')}
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  {t('nav.dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/exercises" className="hover:text-white transition-colors">
                  {t('nav.exercises')}
                </Link>
              </li>
              <li>
                <Link href="/calculators" className="hover:text-white transition-colors">
                  {t('nav.calculators')}
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  {t('nav.profile')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-3">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {t('footer.termsOfService')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              {t('footer.copyright')}
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <div className="text-sm text-gray-400">
                © 2011-{currentYear} • <a href="mailto:info@fitq.me" className="hover:text-white transition-colors">info@fitq.me</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}