import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocumentResponse {
  id: string;
  filename: string;
  doc_type: 'pdf' | 'txt' | 'docx';
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: Record<string, any>;
}

export interface DocumentUploadResponse {
  document_id: string;
  filename: string;
  status: string;
  message: string;
}

export interface SearchRequest {
  query: string;
  top_k?: number;
  filter_document_id?: string;
}

export interface SearchResultResponse {
  chunk_id: string;
  document_id: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
}

export interface SearchResponse {
  query: string;
  results: SearchResultResponse[];
  total_results: number;
}

export interface ClusterRequest {
  n_clusters?: number;
}

export interface ClusterInfoResponse {
  cluster_id: number;
  size: number;
  top_terms: string[];
  representative_chunks: string[];
}

export interface ClusterResponse {
  clusters: ClusterInfoResponse[];
  total_chunks: number;
}

export interface AnomalyRequest {
  contamination?: number;
}

export interface AnomalyResultResponse {
  chunk_id: string;
  is_anomaly: boolean;
  anomaly_score: number;
  metadata: Record<string, any>;
}

export interface AnomalyResponse {
  results: AnomalyResultResponse[];
  total_anomalies: number;
  total_chunks: number;
}

export interface QualityTrainingRequest {
  training_data: Array<{ chunk_id: string; label: string }>;
}

export interface QualityAssessmentResponse {
  chunk_id: string;
  quality_label: 'high' | 'medium' | 'low' | 'anomalous';
  confidence: number;
  features: Record<string, number>;
}

export interface QualityPredictionResponse {
  assessments: QualityAssessmentResponse[];
  total_assessed: number;
}

export interface VisualizationResponse {
  embeddings_2d: number[][];
  labels: number[];
  texts: string[];
  chunk_ids: string[];
  document_ids: string[];
}

export interface SystemStatusResponse {
  total_documents: number;
  total_chunks: number;
  status_breakdown: Record<string, number>;
  average_chunks_per_document: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // Documents
  uploadDocument(file: File): Observable<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<DocumentUploadResponse>(`${this.baseUrl}/documents/upload`, formData);
  }

  getDocument(documentId: string): Observable<DocumentResponse> {
    return this.http.get<DocumentResponse>(`${this.baseUrl}/documents/${documentId}`);
  }

  deleteDocument(documentId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/documents/${documentId}`);
  }

  listDocuments(skip = 0, limit = 100): Observable<DocumentResponse[]> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    return this.http.get<DocumentResponse[]>(`${this.baseUrl}/documents/`, { params });
  }

  // Search
  searchDocuments(request: SearchRequest): Observable<SearchResponse> {
    return this.http.post<SearchResponse>(`${this.baseUrl}/search/`, request);
  }

  // Clustering
  performClustering(request: ClusterRequest): Observable<ClusterResponse> {
    return this.http.post<ClusterResponse>(`${this.baseUrl}/clustering/cluster`, request);
  }

  // Anomaly Detection
  detectAnomalies(request: AnomalyRequest): Observable<AnomalyResponse> {
    return this.http.post<AnomalyResponse>(`${this.baseUrl}/anomaly/detect`, request);
  }

  // Quality Assessment
  trainQualityClassifier(request: QualityTrainingRequest): Observable<{ message: string; metrics: Record<string, number> }> {
    return this.http.post<{ message: string; metrics: Record<string, number> }>(`${this.baseUrl}/quality/train`, request);
  }

  predictQuality(chunkIds?: string[]): Observable<QualityPredictionResponse> {
    return this.http.post<QualityPredictionResponse>(`${this.baseUrl}/quality/predict`, chunkIds);
  }

  // Visualization
  getVisualizationData(): Observable<VisualizationResponse> {
    return this.http.get<VisualizationResponse>(`${this.baseUrl}/visualization/data`);
  }

  // System Status
  getSystemStatus(): Observable<SystemStatusResponse> {
    return this.http.get<SystemStatusResponse>(`${this.baseUrl}/status/`);
  }

  // Health Check
  healthCheck(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }
}
