import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, SearchResultResponse } from '../../core/services/api.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Semantic Search</h2>
        <p class="text-slate-600">Search through kidney disease research documents using natural language</p>
      </div>

      <!-- Search Form -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Search Query</label>
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="query"
                (keyup.enter)="search()"
                placeholder="e.g., What are the early symptoms of chronic kidney disease?"
                class="w-full px-4 py-3 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg class="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-slate-700 mb-2">Number of Results</label>
              <select
                [(ngModel)]="topK"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option [value]="5">5 results</option>
                <option [value]="10">10 results</option>
                <option [value]="20">20 results</option>
                <option [value]="50">50 results</option>
              </select>
            </div>

            <div class="flex-1">
              <label class="block text-sm font-medium text-slate-700 mb-2">Filter by Document</label>
              <input
                type="text"
                [(ngModel)]="filterDocumentId"
                placeholder="Document ID (optional)"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            (click)="search()"
            [disabled]="searching() || !query.trim()"
            class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            @if (searching()) {
              <span class="flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
            } @else {
              <span>Search Documents</span>
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
              <p class="text-sm font-medium text-red-800">Search Error</p>
              <p class="text-sm text-red-700 mt-1">{{ error() }}</p>
            </div>
          </div>
        </div>
      }

      <!-- Search Results -->
      @if (searchPerformed() && !searching()) {
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-900">
              Search Results
              @if (results().length > 0) {
                <span class="text-slate-500 font-normal ml-2">({{ results().length }} found)</span>
              }
            </h3>
            @if (lastQuery()) {
              <span class="text-sm text-slate-600">Query: "{{ lastQuery() }}"</span>
            }
          </div>

          @if (results().length === 0) {
            <div class="text-center py-12">
              <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 class="text-lg font-semibold text-slate-900 mb-2">No results found</h4>
              <p class="text-slate-600">Try adjusting your search query or upload more documents</p>
            </div>
          }

          @if (results().length > 0) {
            <div class="space-y-4">
              @for (result of results(); track result.chunk_id) {
                <div class="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                        Score: {{ (result.score * 100).toFixed(1) }}%
                      </span>
                      <span class="text-xs text-slate-500">
                        Chunk: {{ result.chunk_id }}...
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

                  <div class="mb-2">
                    <p class="text-sm text-slate-700 line-clamp-3" [class.line-clamp-none]="isExpanded(result.chunk_id)">
                      {{ result.content }}
                    </p>
                  </div>

                  @if (isExpanded(result.chunk_id)) {
                    <div class="mt-3 pt-3 border-t border-slate-200">
                      <div class="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span class="text-slate-500">Document ID:</span>
                          <p class="text-slate-900 font-mono">{{ result.document_id }}...</p>
                        </div>
                        <div>
                          <span class="text-slate-500">Chunk ID:</span>
                          <p class="text-slate-900 font-mono">{{ result.chunk_id }}...</p>
                        </div>
                      </div>
                      @if (Object.keys(result.metadata).length > 0) {
                        <div class="mt-2">
                          <span class="text-slate-500 text-xs">Metadata:</span>
                          <div class="bg-slate-50 rounded p-2 mt-1">
                            <pre class="text-xs text-slate-700 overflow-x-auto">{{ JSON.stringify(result.metadata, null, 2) }}</pre>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Search Tips -->
      @if (!searchPerformed()) {
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-3">Search Tips</h3>
          <ul class="space-y-2 text-sm text-slate-700">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>Use natural language queries like "What causes kidney failure?" or "Treatment options for CKD"</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>Be specific about the medical concepts or topics you're researching</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>Results are ranked by semantic similarity, not just keyword matching</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>Filter by document ID to search within specific research papers</span>
            </li>
          </ul>
        </div>
      }
    </div>
  `
})
export class SearchComponent {
  private apiService = inject(ApiService);
  
  query = '';
  topK = 10;
  filterDocumentId = '';
  
  searching = signal(false);
  searchPerformed = signal(false);
  results = signal<SearchResultResponse[]>([]);
  error = signal<string | null>(null);
  lastQuery = signal<string>('');
  expandedChunks = signal<Set<string>>(new Set());
  
  JSON = JSON;
  Object = Object;
  
  search(): void {
    if (!this.query.trim()) return;

    this.searching.set(true);
    this.error.set(null);
    this.lastQuery.set(this.query);

    const request = {
      query: this.query,
      top_k: this.topK,
      filter_document_id: this.filterDocumentId || undefined
    };

    this.apiService.searchDocuments(request).subscribe({
      next: (response) => {
        this.results.set(response.results);
        this.searchPerformed.set(true);
        this.searching.set(false);
      },
      error: (err) => {
        this.error.set('Search failed. Please try again.');
        this.searching.set(false);
        console.error('Search error:', err);
      }
    });
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
}
