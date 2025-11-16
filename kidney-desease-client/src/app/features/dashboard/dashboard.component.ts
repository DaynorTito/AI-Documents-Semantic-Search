import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, SystemStatusResponse } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Dashboard Overview</h2>
        <p class="text-slate-600">Monitor your kidney disease research document analysis system</p>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }

      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-4">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">Error loading dashboard data</p>
              <p class="text-sm text-red-700 mt-1">{{ error() }}</p>
            </div>
          </div>
        </div>
      }

      @if (status() && !loading()) {
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-100 text-sm font-medium">Total Documents</p>
                <p class="text-3xl font-bold mt-2">{{ status()!.total_documents }}</p>
              </div>
              <div class="bg-white/20 rounded-lg p-3">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                  <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-emerald-100 text-sm font-medium">Total Chunks</p>
                <p class="text-3xl font-bold mt-2">{{ status()!.total_chunks }}</p>
              </div>
              <div class="bg-white/20 rounded-lg p-3">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-amber-100 text-sm font-medium">Avg Chunks/Doc</p>
                <p class="text-3xl font-bold mt-2">{{ status()!.average_chunks_per_document.toFixed(1) }}</p>
              </div>
              <div class="bg-white/20 rounded-lg p-3">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-100 text-sm font-medium">Completed</p>
                <p class="text-3xl font-bold mt-2">{{ status()!.status_breakdown['completed'] || 0 }}</p>
              </div>
              <div class="bg-white/20 rounded-lg p-3">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Breakdown -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Processing Status</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            @for (status of getStatusEntries(); track status.key) {
              <div class="bg-slate-50 rounded-lg p-4">
                <p class="text-sm text-slate-600 capitalize">{{ status.key }}</p>
                <p class="text-2xl font-bold text-slate-900 mt-1">{{ status.value }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              routerLink="/documents/upload"
              class="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <div class="bg-blue-600 rounded-lg p-2">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-slate-900">Upload Document</p>
                <p class="text-sm text-slate-600">Add new research papers</p>
              </div>
            </a>

            <a
              routerLink="/search"
              class="flex items-center space-x-3 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors group"
            >
              <div class="bg-emerald-600 rounded-lg p-2">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-slate-900">Semantic Search</p>
                <p class="text-sm text-slate-600">Find relevant content</p>
              </div>
            </a>

            <a
              routerLink="/clustering"
              class="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
            >
              <div class="bg-purple-600 rounded-lg p-2">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-slate-900">Run Clustering</p>
                <p class="text-sm text-slate-600">Analyze document groups</p>
              </div>
            </a>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  
  status = signal<SystemStatusResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadStatus();
  }

  loadStatus(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.apiService.getSystemStatus().subscribe({
      next: (data) => {
        this.status.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load system status. Please try again.');
        this.loading.set(false);
        console.error('Error loading status:', err);
      }
    });
  }

  getStatusEntries(): Array<{key: string, value: number}> {
    const breakdown = this.status()?.status_breakdown || {};
    return Object.entries(breakdown).map(([key, value]) => ({ key, value }));
  }
}
