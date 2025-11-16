import { Component, OnInit, inject, signal, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, VisualizationResponse } from '../../core/services/api.service';

@Component({
  selector: 'app-visualization',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Embeddings Visualization</h2>
        <p class="text-slate-600">2D visualization of document chunk embeddings using dimensionality reduction</p>
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
              <p class="text-sm font-medium text-red-800">Visualization Error</p>
              <p class="text-sm text-red-700 mt-1">{{ error() }}</p>
            </div>
          </div>
        </div>
      }

      @if (visualizationData() && !loading()) {
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-900">
              Embedding Space
              <span class="text-slate-500 font-normal ml-2">({{ visualizationData()!.texts.length }} points)</span>
            </h3>
            <button
              (click)="loadData()"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>

          <!-- Canvas for visualization -->
          <div class="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
            <canvas #canvas class="w-full cursor-crosshair" height="600"></canvas>
          </div>

          <!-- Info Panel -->
          @if (selectedPoint()) {
            <div class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-start justify-between mb-2">
                <h4 class="font-semibold text-slate-900">Selected Chunk</h4>
                <button
                  (click)="clearSelection()"
                  class="text-slate-400 hover:text-slate-600"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <div class="space-y-2 text-sm">
                <div>
                  <span class="text-slate-600">Cluster:</span>
                  <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                    {{ selectedPoint()!.label }}
                  </span>
                </div>
                <div>
                  <span class="text-slate-600">Chunk ID:</span>
                  <span class="ml-2 text-slate-900 font-mono text-xs">{{ selectedPoint()!.chunkId }}</span>
                </div>
                <div>
                  <span class="text-slate-600">Document ID:</span>
                  <span class="ml-2 text-slate-900 font-mono text-xs">{{ selectedPoint()!.documentId }}</span>
                </div>
                <div>
                  <span class="text-slate-600">Text Preview:</span>
                  <p class="mt-1 text-slate-900 bg-white rounded p-2 text-xs line-clamp-3">
                    {{ selectedPoint()!.text }}
                  </p>
                </div>
              </div>
            </div>
          }

          <!-- Legend -->
          <div class="mt-4 flex flex-wrap gap-2">
            @for (cluster of getUniqueClusters(); track cluster) {
              <div class="flex items-center space-x-2 px-3 py-1 bg-slate-50 rounded-full">
                <div 
                  [style.background-color]="getClusterColor(cluster)" 
                  class="w-3 h-3 rounded-full"
                ></div>
                <span class="text-xs text-slate-700">Cluster {{ cluster }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p class="text-sm text-slate-600">Total Points</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ visualizationData()!.texts.length }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p class="text-sm text-slate-600">Clusters</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ getUniqueClusters().length }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p class="text-sm text-slate-600">Unique Documents</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ getUniqueDocuments() }}</p>
          </div>
        </div>
      }

      <!-- Info Card -->
      @if (!visualizationData() && !loading() && !error()) {
        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-3">About Embeddings Visualization</h3>
          <ul class="space-y-2 text-sm text-slate-700">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>Visualizes high-dimensional embeddings in 2D space using dimensionality reduction</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>Colors represent different clusters discovered through automatic grouping</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>Click on points to view detailed information about specific chunks</span>
            </li>
          </ul>
        </div>
      }
    </div>
  `
})
export class VisualizationComponent implements OnInit {
  private apiService = inject(ApiService);
  
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  
  loading = signal(false);
  error = signal<string | null>(null);
  visualizationData = signal<VisualizationResponse | null>(null);
  selectedPoint = signal<{text: string, label: number, chunkId: string, documentId: string} | null>(null);
  
  private ctx: CanvasRenderingContext2D | null = null;
  private points: Array<{x: number, y: number, label: number, text: string, chunkId: string, documentId: string}> = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.getVisualizationData().subscribe({
      next: (data) => {
        this.visualizationData.set(data);
        this.loading.set(false);
        setTimeout(() => this.drawVisualization(), 100);
      },
      error: (err) => {
        this.error.set('Failed to load visualization data. Please ensure documents are uploaded and processed.');
        this.loading.set(false);
        console.error('Visualization error:', err);
      }
    });
  }

  drawVisualization(): void {
    const canvasEl = this.canvas().nativeElement;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    this.ctx = ctx;
    const data = this.visualizationData();
    if (!data) return;

    const width = canvasEl.width = canvasEl.offsetWidth;
    const height = canvasEl.height = 600;

    ctx.clearRect(0, 0, width, height);

    // Calculate bounds with padding
    const padding = 40;
    const embeddings = data.embeddings_2d;
    
    const xValues = embeddings.map(e => e[0]);
    const yValues = embeddings.map(e => e[1]);
    
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    
    const xRange = maxX - minX || 1;
    const yRange = maxY - minY || 1;

    // Store points for interaction
    this.points = embeddings.map((coord, i) => {
      const x = ((coord[0] - minX) / xRange) * (width - 2 * padding) + padding;
      const y = ((coord[1] - minY) / yRange) * (height - 2 * padding) + padding;
      
      return {
        x,
        y: height - y, // Flip Y axis
        label: data.labels[i],
        text: data.texts[i],
        chunkId: data.chunk_ids[i],
        documentId: data.document_ids[i]
      };
    });

    // Draw points
    this.points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = this.getClusterColor(point.label);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Add click listener
    canvasEl.onclick = (e) => {
      const rect = canvasEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (const point of this.points) {
        const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
        if (distance < 8) {
          this.selectedPoint.set(point);
          this.highlightPoint(point);
          return;
        }
      }
    };
  }

  highlightPoint(point: {x: number, y: number, label: number}): void {
    if (!this.ctx) return;
    
    this.drawVisualization();
    
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
    this.ctx.strokeStyle = '#1e40af';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }

  clearSelection(): void {
    this.selectedPoint.set(null);
    this.drawVisualization();
  }

  getClusterColor(label: number): string {
    const colors = [
      '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B',
      '#EF4444', '#14B8A6', '#6366F1', '#F97316', '#84CC16',
      '#06B6D4', '#A855F7', '#D946EF', '#2563EB', '#059669',
      '#DC2626', '#7C3AED', '#DB2777', '#0891B2', '#65A30D'
    ];
    return colors[label % colors.length];
  }

  getUniqueClusters(): number[] {
    const data = this.visualizationData();
    if (!data) return [];
    return Array.from(new Set(data.labels)).sort((a, b) => a - b);
  }

  getUniqueDocuments(): number {
    const data = this.visualizationData();
    if (!data) return 0;
    return new Set(data.document_ids).size;
  }
}
