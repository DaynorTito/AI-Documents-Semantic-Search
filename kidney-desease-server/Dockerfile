FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .


RUN pip install --upgrade pip && \
    pip install numpy scikit-learn pandas torch --only-binary :all: && \
    pip install --no-cache-dir -r requirements.txt

RUN pip install --upgrade torch torchvision torchaudio

COPY . .

RUN mkdir -p /app/data/chroma_db \
             /app/data/documents \
             /app/data/documents_db \
             /app/data/models

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
