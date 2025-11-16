# Kidney Disease Document Management System

### Name: Daynor Tito Condori

## Project Overview

This project implements an intelligent document management system for kidney disease research papers as part of a data science course final project. The system transforms medical documents into vector representations, creates a searchable knowledge base, implements quality control mechanisms, and detects anomalous documents that do not belong in the corpus.

## Project Objectives

The system addresses the following key learning objectives:

- Understanding embeddings and how they are generated
- Visualizing high-dimensional data
- Implementing transfer learning with pre-trained models
- Detecting patterns and clusters in data
- Identifying anomalies in document collections
- Building complete machine learning pipelines
- Applying Natural Language Processing techniques

## System Architecture

The project follows a modular architecture with four main components:

1. **Document Ingestion Pipeline**: Extracts text from PDFs and generates embeddings
2. **Vector Database Storage**: Stores embeddings and metadata in ChromaDB
3. **Quality Assessment System**: Evaluates document quality based on multiple criteria
4. **Anomaly Detection System**: Identifies documents that don't fit the kidney disease domain

## Technology Stack

- **Language**: Python 3.8+
- **Embedding Model**: Sentence Transformers (all-MiniLM-L6-v1)
- **Vector Database**: ChromaDB
- **Machine Learning**: scikit-learn, numpy, pandas
- **Visualization**: matplotlib, seaborn
- **PDF Processing**: PyPDF2

## Project Timeline: Weeks 1-4

### Weeks 1-2: Setup and Initial Pipeline

**Objectives:**
- Environment configuration
- Document loading and preprocessing
- Embedding generation
- Vector database integration

**Deliverables:**
- Functional PDF text extraction
- Document embedding generation using Sentence Transformers
- ChromaDB collection with stored embeddings

### Weeks 3-4: Quality Control

**Objectives:**
- Document quality classification
- Anomaly detection implementation
- Semantic search capabilities
- Mid-course demonstration

**Deliverables:**
- Quality assessment metrics for all documents
- Multi-method anomaly detection system
- Semantic search engine
- Comprehensive visualizations

## Document Collection Process

### Step 1: Finding Open Access Kidney Disease Papers

To comply with the project requirement of using open access documents, you should collect PDFs from the following sources:

#### Recommended Sources:

1. **PubMed Central (PMC)**
   - URL: https://www.ncbi.nlm.nih.gov/pmc/
   - Search terms: "chronic kidney disease", "acute kidney injury", "dialysis", "kidney transplant"
   - Filter: Free full text articles
   - Download: Use the PDF link on individual article pages

2. **PLOS ONE**
   - URL: https://journals.plos.org/plosone/
   - Search: Kidney disease related terms
   - All articles are open access with CC-BY licenses

3. **BioMed Central**
   - URL: https://www.biomedcentral.com/
   - Search in nephrology journals
   - Download open access articles

4. **medRxiv (Preprints)**
   - URL: https://www.medrxiv.org/
   - Search: Nephrology and kidney disease
   - All preprints are freely available

5. **NIH/NIDDK Publications**
   - URL: https://www.niddk.nih.gov/
   - Government publications are public domain

### Step 2: Document Collection Guidelines

**Minimum Requirements:**
- At least 20-25 PDF documents
- All documents must be open access (no copyright restrictions)
- Documents should be in English
- Focus on kidney disease research: CKD, AKI, dialysis, transplantation, nephrology

**Recommended Mix:**
- Original research articles (60%)
- Review papers (25%)
- Clinical guidelines (10%)
- Case studies (5%)


## Understanding the Results

### Quality Assessment Output

The quality assessment evaluates each document on multiple dimensions:

**Quality Metrics:**
- **Medical Relevance** (0-1): Density of kidney disease terminology
- **Length Score** (0-1): Document length normalized to expected research paper length
- **Structure Score** (0-1): Presence of standard research paper sections

**Quality Categories:**
- **High** (score > 0.7): Well-structured, relevant medical research papers
- **Medium** (0.4-0.7): Acceptable documents with some limitations
- **Low** (< 0.4): Documents lacking medical relevance or structure

**Interpreting Results:**
- High quality documents are ideal for the knowledge base
- Medium quality documents may need manual review
- Low quality documents should be examined for relevance

### Anomaly Detection Output

The system uses four detection methods that vote on whether each document is anomalous:

**Detection Methods:**

1. **Isolation Forest**: Statistical outlier detection based on document features
   - Flags documents with unusual feature combinations
   
2. **Embedding Similarity**: Semantic distance analysis
   - Identifies documents semantically distant from the corpus
   
3. **DBSCAN Clustering**: Density-based outlier detection
   - Detects documents that don't form clusters with others
   
4. **PCA Distance**: Distance in reduced dimensional space
   - Identifies documents far from the corpus center

**Anomaly Confidence:**
- **High** (4 votes): All methods agree - definitely anomalous
- **Medium-High** (3 votes): Strong consensus
- **Medium** (2 votes): Moderate consensus - flagged as anomaly
- **Low** (1 vote): Weak signal - not flagged
- **None** (0 votes): Normal document

**Common Anomaly Reasons:**
- Low kidney disease terminology density
- Missing standard research paper structure
- Semantic dissimilarity to other documents
- Statistical outlier in document features
- Document from different medical domain

**Actions for Anomalous Documents:**
1. Review the document content manually
2. Verify it's actually about kidney disease
3. Check if it's from a different medical domain
4. Consider removing if not relevant
5. Keep if it's valid but unique (e.g., novel methodology)


## Semantic Search Usage

The semantic search engine allows querying the document collection using natural language:

### Example Queries:

```python
# Initialize search engine
search_engine = SemanticSearchEngine(doc_system)
search_engine.index_documents(documents)

# Query examples
queries = [
    "chronic kidney disease progression and risk factors",
    "dialysis complications and patient outcomes",
    "kidney transplant rejection mechanisms",
    "acute kidney injury biomarkers and diagnosis",
    "renal function assessment methods"
]

for query in queries:
    print(f"\nQuery: {query}")
    results = search_engine.search(query, top_k=5)
    
    for i, result in enumerate(results, 1):
        print(f"{i}. {result['filename']}")
        print(f"   Similarity: {result['similarity_score']:.3f}")
        print(f"   Preview: {result['text_preview'][:100]}...")
```

### Search Result Interpretation:

- **Similarity Score > 0.5**: Highly relevant document
- **Similarity Score 0.3-0.5**: Moderately relevant
- **Similarity Score < 0.3**: Low relevance

## Troubleshooting

### Common Issues and Solutions:

**1. PDF Extraction Errors**
```
Error: "PdfReadError: EOF marker not found"
```
Solution: Some PDFs may be corrupted or password-protected. Remove problematic files and try again.

**2. Out of Memory Errors**
```
Error: "MemoryError: Unable to allocate array"
```
Solution: Process documents in smaller batches or reduce the number of documents.

**3. ChromaDB Collection Already Exists**
```
Error: "Collection already exists"
```
Solution: Either use the existing collection or delete the `./chroma_db/` directory to start fresh.

**4. No Documents Processed**
```
Warning: "No documents were successfully processed"
```
Solution: Check that PDF files are in the correct directory and are readable.

**5. Embedding Model Download Slow**
```
Issue: First run downloads the model (90MB)
```
Solution: Be patient during first execution. Subsequent runs will be faster.
