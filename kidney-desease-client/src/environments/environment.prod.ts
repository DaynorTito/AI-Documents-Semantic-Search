export const environment = {
  production: true,
  apiUrl: 'http://localhost:8000',
  
  apiTimeout: 30000, 
  maxUploadSize: 10485760, 
  supportedFileTypes: ['.pdf', '.txt'],
  
  features: {
    clustering: true,
    anomalyDetection: true,
    qualityClassification: true,
    visualization: true
  }
};
