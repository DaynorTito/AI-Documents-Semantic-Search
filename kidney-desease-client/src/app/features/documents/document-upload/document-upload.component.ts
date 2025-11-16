import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center space-x-2 text-sm text-slate-600 mb-3">
          <a routerLink="/documents" class="hover:text-blue-600 transition-colors">Documents</a>
          <span>/</span>
          <span class="text-slate-900">Upload</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Upload Document</h2>
        <p class="text-slate-600">Upload kidney disease research documents for analysis</p>
      </div>

      <!-- Upload Form -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        @if (!uploading() && !uploadSuccess()) {
          <div
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
            [class.border-blue-500]="isDragging()"
            [class.bg-blue-50]="isDragging()"
            class="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center transition-all"
          >
            <svg class="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            @if (selectedFile()) {
              <div class="mb-4">
                <div class="inline-flex items-center space-x-3 bg-slate-50 rounded-lg px-4 py-3">
                  <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                  </svg>
                  <div class="text-left">
                    <p class="text-sm font-medium text-slate-900">{{ selectedFile()!.name }}</p>
                    <p class="text-xs text-slate-500">{{ formatFileSize(selectedFile()!.size) }}</p>
                  </div>
                  <button
                    (click)="clearFile()"
                    class="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            } @else {
              <p class="text-lg font-medium text-slate-900 mb-2">Drop your file here</p>
              <p class="text-sm text-slate-600 mb-6">or click to browse</p>
            }
            
            <input
              #fileInput
              type="file"
              accept=".pdf,.txt,.docx"
              (change)="onFileSelected($event)"
              class="hidden"
            />
            
            <button
              (click)="fileInput.click()"
              class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Choose File
            </button>
            
            <p class="text-xs text-slate-500 mt-4">Supported formats: PDF, TXT, DOCX (Max 50MB)</p>
          </div>

          @if (selectedFile()) {
            <div class="mt-6 flex items-center justify-end space-x-3">
              <button
                (click)="clearFile()"
                class="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                (click)="uploadFile()"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Upload Document
              </button>
            </div>
          }
        }

        @if (uploading()) {
          <div class="text-center py-12">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p class="text-lg font-medium text-slate-900 mb-2">Uploading document...</p>
            <p class="text-sm text-slate-600">Please wait while we process your file</p>
          </div>
        }

        @if (uploadSuccess()) {
          <div class="text-center py-12">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-900 mb-2">Upload Successful</h3>
            <p class="text-slate-600 mb-6">Your document has been uploaded and is being processed</p>
            <div class="flex items-center justify-center space-x-3">
              <button
                (click)="resetUpload()"
                class="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Upload Another
              </button>
              <a
                routerLink="/documents"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                View Documents
              </a>
            </div>
          </div>
        }

        @if (error()) {
          <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <p class="text-sm font-medium text-red-800">Upload Failed</p>
                <p class="text-sm text-red-700 mt-1">{{ error() }}</p>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Guidelines -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 class="text-lg font-semibold text-slate-900 mb-3">Upload Guidelines</h3>
        <ul class="space-y-2 text-sm text-slate-700">
          <li class="flex items-start">
            <svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Processing time varies based on document size and complexity</span>
          </li>
        </ul>
      </div>
    </div>
  `
})
export class DocumentUploadComponent {
  private apiService = inject(ApiService);
  private router = inject(Router);
  
  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  uploadSuccess = signal(false);
  error = signal<string | null>(null);
  isDragging = signal(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!validTypes.includes(file.type)) {
      this.error.set('Invalid file type. Please upload PDF, TXT, or DOCX files only.');
      return;
    }

    if (file.size > maxSize) {
      this.error.set('File size exceeds 50MB limit. Please upload a smaller file.');
      return;
    }

    this.selectedFile.set(file);
    this.error.set(null);
  }

  clearFile(): void {
    this.selectedFile.set(null);
    this.error.set(null);
  }

  uploadFile(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.uploading.set(true);
    this.error.set(null);

    this.apiService.uploadDocument(file).subscribe({
      next: (response) => {
        this.uploading.set(false);
        this.uploadSuccess.set(true);
        console.log('Upload successful:', response);
      },
      error: (err) => {
        this.uploading.set(false);
        this.error.set('Failed to upload document. Please try again.');
        console.error('Upload error:', err);
      }
    });
  }

  resetUpload(): void {
    this.selectedFile.set(null);
    this.uploadSuccess.set(false);
    this.error.set(null);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}