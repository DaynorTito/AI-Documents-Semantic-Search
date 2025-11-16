import { Routes } from '@angular/router';

export const DOCUMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./documents-list/documents-list.component').then(m => m.DocumentsListComponent)
  },
  {
    path: 'upload',
    loadComponent: () => import('./document-upload/document-upload.component').then(m => m.DocumentUploadComponent)
  }
];
