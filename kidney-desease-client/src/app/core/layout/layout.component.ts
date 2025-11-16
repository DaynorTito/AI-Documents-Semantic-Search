import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 class="text-xl font-bold text-slate-900">Kidney Disease Research</h1>
                <p class="text-xs text-slate-500">Document Analysis & Embeddings System</p>
              </div>
            </div>
            
            <button
              (click)="toggleMobileMenu()"
              class="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col md:flex-row gap-6">
          <!-- Sidebar Navigation -->
          <aside [class.hidden]="!mobileMenuOpen()" class="md:block w-full md:w-64 flex-shrink-0">
            <nav class="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <ul class="space-y-1">
                @for (item of navItems; track item.route) {
                  <li>
                    <a
                      [routerLink]="item.route"
                      routerLinkActive="bg-blue-50 text-blue-700 font-medium"
                      [routerLinkActiveOptions]="{exact: item.route === '/'}"
                      class="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 transition-all duration-200 group"
                    >
                      <span [innerHTML]="item.icon" class="w-5 h-5"></span>
                      <span>{{ item.label }}</span>
                    </a>
                  </li>
                }
              </ul>
            </nav>
          </aside>

          <!-- Main Content -->
          <main class="flex-1 min-w-0">
            <ng-content></ng-content>
          </main>
        </div>
      </div>
    </div>
  `
})
export class LayoutComponent {
  mobileMenuOpen = signal(false);

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>'
    },
    {
      label: 'Documents',
      route: '/documents',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>'
    },
    {
      label: 'Semantic Search',
      route: '/search',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>'
    },
    {
      label: 'Clustering',
      route: '/clustering',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>'
    },
    {
      label: 'Anomaly Detection',
      route: '/anomaly',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>'
    },
    {
      label: 'Quality Assessment',
      route: '/quality',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
    },
    {
      label: 'Visualization',
      route: '/visualization',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>'
    }
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }
}
