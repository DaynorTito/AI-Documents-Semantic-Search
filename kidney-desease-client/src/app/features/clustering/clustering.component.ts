import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ClusterInfoResponse } from '../../core/services/api.service';

@Component({
  selector: 'app-clustering',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Document Clustering</h2>
        <p class="text-slate-600">Group similar document chunks to discover patterns and themes</p>
      </div>

      <!-- Clustering Controls -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              Number of Clusters
              <span class="text-slate-500 font-normal ml-2">(2-20)</span>
            </label>
            <input
              type="range"
              [(ngModel)]="nClusters"
              min="2"
              max="20"
              class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div class="flex justify-between text-sm text-slate-600 mt-1">
              <span>2</span>
              <span class="font-semibold text-blue-600">{{ nClusters }}</span>
              <span>20</span>
            </div>
          </div>

          <button
            (click)="performClustering()"
            [disabled]="loading()"
            class="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            @if (loading()) {
              <span class="flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running Analysis...
              </span>
            } @else {
              <span>Run Clustering Analysis</span>
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
              <p class="text-sm font-medium text-red-800">Clustering Error</p>
              <p class="text-sm text-red-700 mt-1">{{ error() }}</p>
            </div>
          </div>
        </div>
      }

      <!-- Results -->
      @if (clusters().length > 0 && !loading()) {
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-slate-900">
              Cluster Results
              <span class="text-slate-500 font-normal ml-2">({{ totalChunks() }} chunks analyzed)</span>
            </h3>
          </div>

          <!-- Cluster Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-purple-50 rounded-lg p-4">
              <p class="text-sm text-purple-600 font-medium">Total Clusters</p>
              <p class="text-2xl font-bold text-purple-900 mt-1">{{ clusters().length }}</p>
            </div>
            <div class="bg-blue-50 rounded-lg p-4">
              <p class="text-sm text-blue-600 font-medium">Total Chunks</p>
              <p class="text-2xl font-bold text-blue-900 mt-1">{{ totalChunks() }}</p>
            </div>
            <div class="bg-green-50 rounded-lg p-4">
              <p class="text-sm text-green-600 font-medium">Avg Cluster Size</p>
              <p class="text-2xl font-bold text-green-900 mt-1">{{ getAvgClusterSize() }}</p>
            </div>
            <div class="bg-amber-50 rounded-lg p-4">
              <p class="text-sm text-amber-600 font-medium">Largest Cluster</p>
              <p class="text-2xl font-bold text-amber-900 mt-1">{{ getLargestCluster() }}</p>
            </div>
          </div>

          <!-- Cluster Cards -->
          <div class="space-y-4">
            @for (cluster of clusters(); track cluster.cluster_id) {
              <div class="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div 
                  (click)="toggleCluster(cluster.cluster_id)"
                  class="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 cursor-pointer hover:from-purple-100 hover:to-indigo-100 transition-colors"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div [style.background-color]="getClusterColor(cluster.cluster_id)" 
                           class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold">
                        {{ cluster.cluster_id }}
                      </div>
                      <div>
                        <h4 class="text-lg font-semibold text-slate-900">Cluster {{ cluster.cluster_id }}</h4>
                        <p class="text-sm text-slate-600">{{ cluster.size }} chunks</p>
                      </div>
                    </div>
                    <svg 
                      [class.rotate-180]="isClusterExpanded(cluster.cluster_id)"
                      class="w-6 h-6 text-slate-400 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                @if (isClusterExpanded(cluster.cluster_id)) {
                  <div class="p-4 space-y-4">
                    <!-- Top Terms -->
                    <div>
                      <h5 class="text-sm font-semibold text-slate-900 mb-2">Key Terms</h5>
                      <div class="flex flex-wrap gap-2">
                        @for (term of cluster.top_terms; track term) {
                          <span class="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                            {{ term }}
                          </span>
                        }
                      </div>
                    </div>

                    <!-- Representative Chunks -->
                    <div>
                      <h5 class="text-sm font-semibold text-slate-900 mb-2">Representative Samples</h5>
                      <div class="space-y-2">
                        @for (chunk of cluster.representative_chunks; track $index) {
                          <div class="bg-slate-50 rounded-lg p-3">
                            <p class="text-sm text-slate-700 line-clamp-3">{{ chunk }}</p>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- Info Card -->
      @if (clusters().length === 0 && !loading()) {
        <div class="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-3">About Clustering</h3>
          <ul class="space-y-2 text-sm text-slate-700">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>Clustering automatically groups similar document chunks based on semantic similarity</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>Discover recurring themes and topics across your kidney disease research documents</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>Adjust the number of clusters to find the right level of granularity for your analysis</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>Each cluster shows key terms and representative text samples</span>
            </li>
          </ul>
        </div>
      }
    </div>
  `
})
export class ClusteringComponent {
  private apiService = inject(ApiService);
  
  nClusters = 5;
  
  loading = signal(false);
  error = signal<string | null>(null);
  clusters = signal<ClusterInfoResponse[]>([]);
  totalChunks = signal(0);
  expandedClusters = signal<Set<number>>(new Set());

  performClustering(): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.performClustering({ n_clusters: this.nClusters }).subscribe({
      next: (response) => {
        this.clusters.set(response.clusters);
        this.totalChunks.set(response.total_chunks);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Clustering failed. Please ensure you have uploaded documents.');
        this.loading.set(false);
        console.error('Clustering error:', err);
      }
    });
  }

  toggleCluster(clusterId: number): void {
    const expanded = new Set(this.expandedClusters());
    if (expanded.has(clusterId)) {
      expanded.delete(clusterId);
    } else {
      expanded.add(clusterId);
    }
    this.expandedClusters.set(expanded);
  }

  isClusterExpanded(clusterId: number): boolean {
    return this.expandedClusters().has(clusterId);
  }

  getAvgClusterSize(): number {
    const total = this.totalChunks();
    const count = this.clusters().length;
    return count > 0 ? Math.round(total / count) : 0;
  }

  getLargestCluster(): number {
    return Math.max(...this.clusters().map(c => c.size), 0);
  }

  getClusterColor(clusterId: number): string {
    const colors = [
      '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B',
      '#EF4444', '#14B8A6', '#6366F1', '#F97316', '#84CC16',
      '#06B6D4', '#A855F7', '#D946EF', '#2563EB', '#059669',
      '#DC2626', '#7C3AED', '#DB2777', '#0891B2', '#65A30D'
    ];
    return colors[clusterId % colors.length];
  }
}
