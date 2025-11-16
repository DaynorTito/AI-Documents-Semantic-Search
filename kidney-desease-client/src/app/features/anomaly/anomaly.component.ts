import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, AnomalyResultResponse } from '../../core/services/api.service';

@Component({
  selector: 'app-anomaly',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Anomaly Detection</h2>
        <p class="text-slate-600">Identify unusual or outlier document chunks for quality control</p>
      </div>

      <!-- Detection Controls -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              Contamination Rate
              <span class="text-slate-500 font-normal ml-2">(Expected anomaly rate: 1%-50%)</span>
            </label>
            <input
              type="range"
              [(ngModel)]="contamination"
              min="0.01"
              max="0.5"
              step="0.01"
              class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div class="flex justify-between text-sm text-slate-600 mt-1">
              <span>1%</span>
              <span class="font-semibold text-amber-600">{{ (contamination * 100).toFixed(0) }}%</span>
              <span>50%</span>
            </div>
            <p class="text-xs text-slate-500 mt-2">
              Lower values detect only extreme outliers. Higher values identify more potential anomalies.
            </p>
          </div>

          <button
            (click)="detectAnomalies()"
            [disabled]="loading()"
            class="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            @if (loading()) {
              <span class="flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Detecting Anomalies...
              </span>
            } @else {
              <span>Run Anomaly Detection</span>
            }
          </button>
        </div>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-4">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">Detection Error</p>
              <p class="text-sm text-red-700 mt-1">{{ error() }}</p>
            </div>
          </div>
        </div>
      }

      <!-- Results -->
      @if (results().length > 0 && !loading()) {
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-slate-900">Detection Results</h3>
            <div class="flex items-center space-x-2">
              <button
                (click)="filterView.set('all')"
                [class.bg-slate-900]="filterView() === 'all'"
                [class.text-white]="filterView() === 'all'"
                [class.bg-slate-100]="filterView() !== 'all'"
                [class.text-slate-700]="filterView() !== 'all'"
                class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                All ({{ totalChunks() }})
              </button>
              <button
                (click)="filterView.set('anomalies')"
                [class.bg-amber-600]="filterView() === 'anomalies'"
                [class.text-white]="filterView() === 'anomalies'"
                [class.bg-slate-100]="filterView() !== 'anomalies'"
                [class.text-slate-700]="filterView() !== 'anomalies'"
                class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                Anomalies ({{ totalAnomalies() }})
              </button>
              <button
                (click)="filterView.set('normal')"
                [class.bg-green-600]="filterView() === 'normal'"
                [class.text-white]="filterView() === 'normal'"
                [class.bg-slate-100]="filterView() !== 'normal'"
                [class.text-slate-700]="filterView() !== 'normal'"
                class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                Normal ({{ totalChunks() - totalAnomalies() }})
              </button>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-slate-50 rounded-lg p-4">
              <p class="text-sm text-slate-600 font-medium">Total Analyzed</p>
              <p class="text-2xl font-bold text-slate-900 mt-1">{{ totalChunks() }}</p>
            </div>
            <div class="bg-amber-50 rounded-lg p-4">
              <p class="text-sm text-amber-600 font-medium">Anomalies Detected</p>
              <p class="text-2xl font-bold text-amber-900 mt-1">{{ totalAnomalies() }}</p>
            </div>
            <div class="bg-green-50 rounded-lg p-4">
              <p class="text-sm text-green-600 font-medium">Anomaly Rate</p>
              <p class="text-2xl font-bold text-green-900 mt-1">{{ getAnomalyRate() }}%</p>
            </div>
          </div>

          <!-- Results List -->
          <div class="space-y-3">
            @for (result of getFilteredResults(); track result.chunk_id) {
              <div 
                [class.border-amber-300]="result.is_anomaly"
                [class.bg-amber-50]="result.is_anomaly"
                [class.border-slate-200]="!result.is_anomaly"
                class="border rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    @if (result.is_anomaly) {
                      <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                      <span class="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded">ANOMALY</span>
                    } @else {
                      <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">NORMAL</span>
                    }
                    <span class="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded">
                      Score: {{ result.anomaly_score.toFixed(3) }}
                    </span>
                  </div>
                  <button
                    (click)="toggleExpand(result.chunk_id)"
                    class="text-slate-400 hover:text-slate-600"
                  >
                    <svg 
                      [class.rotate-180]="isExpanded(result.chunk_id)"
                      class="w-5 h-5 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <div class="text-xs text-slate-500 mb-2">
                  Chunk ID: {{ result.chunk_id }}...
                </div>

                @if (isExpanded(result.chunk_id)) {
                  <div class="mt-3 pt-3 border-t border-slate-200">
                    @if (Object.keys(result.metadata).length > 0) {
                      <div>
                        <span class="text-slate-500 text-xs font-medium">Metadata:</span>
                        <div class="bg-white rounded p-2 mt-1">
                          <pre class="text-xs text-slate-700 overflow-x-auto">{{ JSON.stringify(result.metadata, null, 2) }}</pre>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>

          @if (getFilteredResults().length === 0) {
            <div class="text-center py-8">
              <p class="text-slate-600">No results match the current filter</p>
            </div>
          }
        </div>
      }

      <!-- Info Card -->
      @if (results().length === 0 && !loading()) {
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-3">About Anomaly Detection</h3>
          <ul class="space-y-2 text-sm text-slate-700">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>Detects document chunks that are significantly different from the majority</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>Useful for identifying data quality issues, formatting errors, or unique content</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>The contamination rate determines sensitivity - adjust based on your needs</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>Anomaly scores indicate how unusual a chunk is compared to the dataset</span>
            </li>
          </ul>
        </div>
      }
    </div>
  `
})
export class AnomalyComponent {
  private apiService = inject(ApiService);
  
  contamination = 0.1;
  
  loading = signal(false);
  error = signal<string | null>(null);
  results = signal<AnomalyResultResponse[]>([]);
  totalAnomalies = signal(0);
  totalChunks = signal(0);
  expandedChunks = signal<Set<string>>(new Set());
  filterView = signal<'all' | 'anomalies' | 'normal'>('all');
  
  JSON = JSON;
  Object = Object;

  detectAnomalies(): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.detectAnomalies({ contamination: this.contamination }).subscribe({
      next: (response) => {
        this.results.set(response.results);
        this.totalAnomalies.set(response.total_anomalies);
        this.totalChunks.set(response.total_chunks);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Anomaly detection failed. Please ensure you have uploaded documents.');
        this.loading.set(false);
        console.error('Anomaly detection error:', err);
      }
    });
  }

  getFilteredResults(): AnomalyResultResponse[] {
    const filter = this.filterView();
    if (filter === 'anomalies') {
      return this.results().filter(r => r.is_anomaly);
    } else if (filter === 'normal') {
      return this.results().filter(r => !r.is_anomaly);
    }
    return this.results();
  }

  toggleExpand(chunkId: string): void {
    const expanded = new Set(this.expandedChunks());
    if (expanded.has(chunkId)) {
      expanded.delete(chunkId);
    } else {
      expanded.add(chunkId);
    }
    this.expandedChunks.set(expanded);
  }

  isExpanded(chunkId: string): boolean {
    return this.expandedChunks().has(chunkId);
  }

  getAnomalyRate(): string {
    const total = this.totalChunks();
    if (total === 0) return '0';
    return ((this.totalAnomalies() / total) * 100).toFixed(1);
  }
}
