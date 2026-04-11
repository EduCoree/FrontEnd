import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  currentLang = signal<'en' | 'ar'>('en');

  constructor(private translate: TranslateService) {
    const saved = localStorage.getItem('lang') as 'en' | 'ar' || 'en';
    this.setLanguage(saved);
  }

  setLanguage(lang: 'en' | 'ar') {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem('lang', lang);


    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  toggle() {
    const next = this.currentLang() === 'en' ? 'ar' : 'en';
    this.setLanguage(next);
  }
}