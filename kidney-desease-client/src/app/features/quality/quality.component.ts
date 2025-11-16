import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, QualityAssessmentResponse } from '../../core/services/api.service';

@Component({
  selector: 'app-quality',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Quality Assessment</h2>
        <p class="text-slate-600">Evaluate and classify document chunk quality</p>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          (click)="showTraining.set(true); showPrediction.set(false)"
          [class.bg-blue-600]="showTraining()"
          [class.text-white]="showTraining()"
          [class.bg-white]="!showTraining()"
          [class.text-slate-700]="!showTraining()"
          class="px-6 py-4 border border-slate-200 rounded-xl font-medium hover:shadow-md transition-all"
        >
          <div class="text-center">
            <svg class="w-8 h-8 mx-auto mb-2" [class.text-white]="showTraining()" [class.text-blue-600]="!showTraining()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p class="font-semibold">Train Classifier</p>
            <p class="text-sm mt-1 opacity-75">Provide labeled training data</p>
          </div>
        </button>

        <button
          (click)="showPrediction.set(true); showTraining.set(false)"
          [class.bg-green-600]="showPrediction()"
          [class.text-white]="showPrediction()"
          [class.bg-white]="!showPrediction()"
          [class.text-slate-700]="!showPrediction()"
          class="px-6 py-4 border border-slate-200 rounded-xl font-medium hover:shadow-md transition-all"
        >
          <div class="text-center">
            <svg class="w-8 h-8 mx-auto mb-2" [class.text-white]="showPrediction()" [class.text-green-600]="!showPrediction()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="font-semibold">Predict Quality</p>
            <p class="text-sm mt-1 opacity-75">Assess document chunks</p>
          </div>
        </button>
      </div>

      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-4">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">Error</p>
              <p class="text-sm text-red-700 mt-1">{{ error() }}</p>
            </div>
          </div>
        </div>
      }

      <!-- Training Section -->
      @if (showTraining()) {
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Train Quality Classifier</h3>
          <p class="text-sm text-slate-600 mb-4">
            Provide training samples with labels (high, medium, low, anomalous) to train the classifier.
          </p>

          <div class="space-y-3">
            <textarea
              [(ngModel)]="trainingDataText"
              rows="10"
              placeholder='[{"chunk_id": "abc123", "label": "high"}, {"chunk_id": "def456", "label": "medium"}]'
              class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            ></textarea>

            <button
              (click)="trainClassifier()"
              [disabled]="trainingLoading()"
              class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              @if (trainingLoading()) {
                <span class="flex items-center justify-center">
                  <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Training...
                </span>
              } @else {
                <span>Train Classifier</span>
              }
            </button>
          </div>

          @if (trainingSuccess()) {
            <div class="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <div class="ml-3">
                  <p class="text-sm font-medium text-green-800">Training Successful</p>
                  @if (trainingMetrics()) {
                    <div class="mt-2 text-xs text-green-700">
                      <pre>{{ JSON.stringify(trainingMetrics(), null, 2) }}</pre>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Prediction Section -->
      @if (showPrediction()) {
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Predict Quality</h3>
          
          <div class="space-y-3 mb-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Chunk IDs (Optional - leave empty to assess all chunks)
              </label>
              <textarea
                [(ngModel)]="chunkIdsText"
                rows="3"
                placeholder='["chunk_id_1", "chunk_id_2", "chunk_id_3"]'
                class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
              ></textarea>
            </div>

            <button
              (click)="predictQuality()"
              [disabled]="predictionLoading()"
              class="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              @if (predictionLoading()) {
                <span class="flex items-center justify-center">
                  <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Predicting...
                </span>
              } @else {
                <span>Predict Quality</span>
              }
            </button>
          </div>

          @if (assessments().length > 0) {
            <div class="mt-6">
              <div class="flex items-center justify-between mb-4">
                <h4 class="font-semibold text-slate-900">
                  Assessment Results ({{ assessments().length }})
                </h4>
                <div class="flex items-center space-x-2">
                  <button
                    (click)="qualityFilter.set('all')"
                    [class.bg-slate-900]="qualityFilter() === 'all'"
                    [class.text-white]="qualityFilter() === 'all'"
                    [class.bg-slate-100]="qualityFilter() !== 'all'"
                    class="px-3 py-1 rounded text-xs font-medium"
                  >All</button>
                  <button
                    (click)="qualityFilter.set('high')"
                    [class.bg-green-600]="qualityFilter() === 'high'"
                    [class.text-white]="qualityFilter() === 'high'"
                    [class.bg-slate-100]="qualityFilter() !== 'high'"
                    class="px-3 py-1 rounded text-xs font-medium"
                  >High</button>
                  <button
                    (click)="qualityFilter.set('medium')"
                    [class.bg-blue-600]="qualityFilter() === 'medium'"
                    [class.text-white]="qualityFilter() === 'medium'"
                    [class.bg-slate-100]="qualityFilter() !== 'medium'"
                    class="px-3 py-1 rounded text-xs font-medium"
                  >Medium</button>
                  <button
                    (click)="qualityFilter.set('low')"
                    [class.bg-amber-600]="qualityFilter() === 'low'"
                    [class.text-white]="qualityFilter() === 'low'"
                    [class.bg-slate-100]="qualityFilter() !== 'low'"
                    class="px-3 py-1 rounded text-xs font-medium"
                  >Low</button>
                  <button
                    (click)="qualityFilter.set('anomalous')"
                    [class.bg-red-600]="qualityFilter() === 'anomalous'"
                    [class.text-white]="qualityFilter() === 'anomalous'"
                    [class.bg-slate-100]="qualityFilter() !== 'anomalous'"
                    class="px-3 py-1 rounded text-xs font-medium"
                  >Anomalous</button>
                </div>
              </div>

              <!-- Quality Distribution -->
              <div class="grid grid-cols-4 gap-3 mb-6">
                @for (stat of getQualityStats(); track stat.label) {
                  <div [ngClass]="stat.bgColor" class="rounded-lg p-3">
                    <p [ngClass]="stat.textColor" class="text-xs font-medium">{{ stat.label }}</p>
                    <p [ngClass]="stat.textDark" class="text-xl font-bold mt-1">{{ stat.count }}</p>
                  </div>
                }
              </div>

              <!-- Results List -->
              <div class="space-y-3 max-h-96 overflow-y-auto">
                @for (assessment of getFilteredAssessments(); track assessment.chunk_id) {
                  <div [ngClass]="getQualityBorder(assessment.quality_label)" class="border rounded-lg p-4">
                    <div class="flex items-start justify-between mb-2">
                      <div class="flex items-center space-x-2">
                        <span [ngClass]="getQualityBadge(assessment.quality_label)" class="px-2 py-1 text-xs font-semibold rounded uppercase">
                          {{ assessment.quality_label }}
                        </span>
                        <span class="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded">
                          {{ (assessment.confidence * 100).toFixed(1) }}% confident
                        </span>
                      </div>
                      <button
                        (click)="toggleAssessment(assessment.chunk_id)"
                        class="text-slate-400 hover:text-slate-600"
                      >
                        <svg 
                          [class.rotate-180]="isAssessmentExpanded(assessment.chunk_id)"
                          class="w-5 h-5 transition-transform" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    <div class="text-xs text-slate-500">
                      Chunk: {{ assessment.chunk_id }}...
                    </div>

                    @if (isAssessmentExpanded(assessment.chunk_id)) {
                      <div class="mt-3 pt-3 border-t border-slate-200">
                        <span class="text-xs font-medium text-slate-700">Features:</span>
                        <div class="bg-slate-50 rounded p-2 mt-1">
                          <pre class="text-xs text-slate-700 overflow-x-auto">{{ JSON.stringify(assessment.features, null, 2) }}</pre>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              @if (getFilteredAssessments().length === 0) {
                <div class="text-center py-8 text-slate-600">
                  No assessments match the current filter
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Info Card -->
      @if (!showTraining() && !showPrediction()) {
        <div class="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-slate-900 mb-3">Quality Assessment Workflow</h3>
          <ol class="space-y-3 text-sm text-slate-700">
            <li class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
              <div>
                <p class="font-medium">Train the Classifier</p>
                <p class="text-slate-600 mt-1">Provide labeled examples with quality ratings (high, medium, low, anomalous)</p>
              </div>
            </li>
            <li class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
              <div>
                <p class="font-medium">Run Quality Predictions</p>
                <p class="text-slate-600 mt-1">The trained model will assess all document chunks automatically</p>
              </div>
            </li>
            <li class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
              <div>
                <p class="font-medium">Review Results</p>
                <p class="text-slate-600 mt-1">Filter and analyze quality assessments to improve your dataset</p>
              </div>
            </li>
          </ol>
        </div>
      }
    </div>
  `
})
export class QualityComponent {
  private apiService = inject(ApiService);
  
  showTraining = signal(false);
  showPrediction = signal(false);
  trainingDataText = '';
  chunkIdsText = '';
  
  trainingLoading = signal(false);
  trainingSuccess = signal(false);
  trainingMetrics = signal<Record<string, number> | null>(null);
  
  predictionLoading = signal(false);
  assessments = signal<QualityAssessmentResponse[]>([]);
  
  error = signal<string | null>(null);
  expandedAssessments = signal<Set<string>>(new Set());
  qualityFilter = signal<'all' | 'high' | 'medium' | 'low' | 'anomalous'>('all');
  
  JSON = JSON;

  trainClassifier(): void {
    try {
      const trainingData = JSON.parse(this.trainingDataText);
      this.trainingLoading.set(true);
      this.error.set(null);
      this.trainingSuccess.set(false);

      this.apiService.trainQualityClassifier({ training_data: trainingData }).subscribe({
        next: (response) => {
          this.trainingSuccess.set(true);
          this.trainingMetrics.set(response.metrics);
          this.trainingLoading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.detail || 'Training failed. Please check your data and try again.');
          this.trainingLoading.set(false);
          console.error('Training error:', err);
        }
      });
    } catch (e) {
      this.error.set('Invalid JSON format. Please check your training data.');
    }
  }

  predictQuality(): void {
    let chunkIds: string[] | undefined;
    
    if (this.chunkIdsText.trim()) {
      try {
        chunkIds = JSON.parse(this.chunkIdsText);
      } catch (e) {
        this.error.set('Invalid JSON format for chunk IDs.');
        return;
      }
    }

    this.predictionLoading.set(true);
    this.error.set(null);

    this.apiService.predictQuality(chunkIds).subscribe({
      next: (response) => {
        this.assessments.set(response.assessments);
        this.predictionLoading.set(false);
      },
      error: (err) => {
        this.error.set('Quality prediction failed. Ensure the classifier is trained.');
        this.predictionLoading.set(false);
        console.error('Prediction error:', err);
      }
    });
  }

  getFilteredAssessments(): QualityAssessmentResponse[] {
    const filter = this.qualityFilter();
    if (filter === 'all') return this.assessments();
    return this.assessments().filter(a => a.quality_label === filter);
  }

  getQualityStats() {
    const all = this.assessments();
    return [
      { label: 'High', count: all.filter(a => a.quality_label === 'high').length, bgColor: 'bg-green-50', textColor: 'text-green-600', textDark: 'text-green-900' },
      { label: 'Medium', count: all.filter(a => a.quality_label === 'medium').length, bgColor: 'bg-blue-50', textColor: 'text-blue-600', textDark: 'text-blue-900' },
      { label: 'Low', count: all.filter(a => a.quality_label === 'low').length, bgColor: 'bg-amber-50', textColor: 'text-amber-600', textDark: 'text-amber-900' },
      { label: 'Anomalous', count: all.filter(a => a.quality_label === 'anomalous').length, bgColor: 'bg-red-50', textColor: 'text-red-600', textDark: 'text-red-900' }
    ];
  }

  getQualityBadge(label: string): string {
    const badges: Record<string, string> = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-blue-100 text-blue-800',
      low: 'bg-amber-100 text-amber-800',
      anomalous: 'bg-red-100 text-red-800'
    };
    return badges[label] || 'bg-slate-100 text-slate-800';
  }

  getQualityBorder(label: string): string {
    const borders: Record<string, string> = {
      high: 'border-green-300 bg-green-50',
      medium: 'border-blue-300 bg-blue-50',
      low: 'border-amber-300 bg-amber-50',
      anomalous: 'border-red-300 bg-red-50'
    };
    return borders[label] || 'border-slate-200';
  }

  toggleAssessment(chunkId: string): void {
    const expanded = new Set(this.expandedAssessments());
    if (expanded.has(chunkId)) {
      expanded.delete(chunkId);
    } else {
      expanded.add(chunkId);
    }
    this.expandedAssessments.set(expanded);
  }

  isAssessmentExpanded(chunkId: string): boolean {
    return this.expandedAssessments().has(chunkId);
  }
}
