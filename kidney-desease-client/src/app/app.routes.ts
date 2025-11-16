import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'documents',
    loadChildren: () => import('./features/documents/documents.routes').then(m => m.DOCUMENTS_ROUTES)
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'clustering',
    loadComponent: () => import('./features/clustering/clustering.component').then(m => m.ClusteringComponent)
  },
  {
    path: 'anomaly',
    loadComponent: () => import('./features/anomaly/anomaly.component').then(m => m.AnomalyComponent)
  },
  {
    path: 'quality',
    loadComponent: () => import('./features/quality/quality.component').then(m => m.QualityComponent)
  },
  {
    path: 'visualization',
    loadComponent: () => import('./features/visualization/visualization.component').then(m => m.VisualizationComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
