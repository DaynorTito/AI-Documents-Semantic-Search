import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, DocumentResponse } from '../../../core/services/api.service';

@Component({
  selector: 'app-documents-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-slate-900 mb-2">Documents Library</h2>
            <p class="text-slate-600">Manage your kidney disease research documents</p>
          </div>
          <a
            routerLink="/documents/upload"
            class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Upload Document
          </a>
        </div>
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
              <p class="text-sm font-medium text-red-800">Error loading documents</p>
              <p class="text-sm text-red-700 mt-1">{{ error() }}</p>
            </div>
          </div>
        </div>
      }

      @if (documents().length === 0 && !loading() && !error()) {
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">No documents yet</h3>
          <p class="text-slate-600 mb-6">Get started by uploading your first research document</p>
          <a
            routerLink="/documents/upload"
            class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Upload Document
          </a>
        </div>
      }

      @if (documents().length > 0 && !loading()) {
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                @for (doc of documents(); track doc.id) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div [ngClass]="getTypeColor(doc.doc_type)" class="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center">
                          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                          </svg>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-slate-900">{{ doc.filename }}</div>
                          <div class="text-sm text-slate-500">ID: {{ doc.id }}...</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800 uppercase">
                        {{ doc.doc_type }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [ngClass]="getStatusClass(doc.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {{ doc.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {{ formatDate(doc.created_at) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        (click)="viewDocument(doc)"
                        class="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View Details"
                      >
                        View
                      </button>
                      <button
                        (click)="deleteDocument(doc)"
                        [disabled]="deletingId() === doc.id"
                        class="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                        title="Delete Document"
                      >
                        @if (deletingId() === doc.id) {
                          <span>Deleting...</span>
                        } @else {
                          <span>Delete</span>
                        }
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Document Details Modal -->
      @if (selectedDocument()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="closeModal()">
          <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="p-6">
              <div class="flex items-start justify-between mb-4">
                <h3 class="text-xl font-bold text-slate-900">Document Details</h3>
                <button
                  (click)="closeModal()"
                  class="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Filename</label>
                  <p class="text-slate-900">{{ selectedDocument()!.filename }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Document ID</label>
                  <p class="text-slate-900 font-mono text-sm">{{ selectedDocument()!.id }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800 uppercase">
                    {{ selectedDocument()!.doc_type }}
                  </span>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <span [ngClass]="getStatusClass(selectedDocument()!.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ selectedDocument()!.status }}
                  </span>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Created At</label>
                  <p class="text-slate-900">{{ formatDate(selectedDocument()!.created_at) }}</p>
                </div>
                
                @if (Object.keys(selectedDocument()!.metadata).length > 0) {
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Metadata</label>
                    <div class="bg-slate-50 rounded-lg p-3">
                      <pre class="text-sm text-slate-900 overflow-x-auto">{{ JSON.stringify(selectedDocument()!.metadata, null, 2) }}</pre>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DocumentsListComponent implements OnInit {
  private apiService = inject(ApiService);
  
  documents = signal<DocumentResponse[]>([]);
  selectedDocument = signal<DocumentResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  deletingId = signal<string | null>(null);
  
  JSON = JSON;
  Object = Object;
  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.apiService.listDocuments().subscribe({
      next: (data) => {
        this.documents.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load documents. Please try again.');
        this.loading.set(false);
        console.error('Error loading documents:', err);
      }
    });
  }

  viewDocument(doc: DocumentResponse): void {
    this.selectedDocument.set(doc);
  }

  closeModal(): void {
    this.selectedDocument.set(null);
  }

  deleteDocument(doc: DocumentResponse): void {
    if (!confirm(`Are you sure you want to delete "${doc.filename}"?`)) {
      return;
    }
    
    this.deletingId.set(doc.id);
    
    this.apiService.deleteDocument(doc.id).subscribe({
      next: () => {
        this.documents.update(docs => docs.filter(d => d.id !== doc.id));
        this.deletingId.set(null);
      },
      error: (err) => {
        alert('Failed to delete document. Please try again.');
        this.deletingId.set(null);
        console.error('Error deleting document:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-slate-100 text-slate-800';
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      pdf: 'bg-red-500',
      txt: 'bg-blue-500',
      docx: 'bg-indigo-500'
    };
    return colors[type] || 'bg-slate-500';
  }
}
