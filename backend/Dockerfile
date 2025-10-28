# Multi-stage Dockerfile for Vinly Backend
# Optimized for FastAPI + FFmpeg + Playwright/Chromium + yt-dlp

# ============================================
# Stage 1: Base Image with System Dependencies
# ============================================
FROM python:3.11-slim as base

# Prevent Python from writing pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies for FFmpeg, Playwright, and general utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    # FFmpeg for video processing
    ffmpeg \
    # Chromium dependencies for Playwright
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 \
    # Additional dependencies
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libu2f-udev \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# ============================================
# Stage 2: Dependencies Installation
# ============================================
FROM base as builder

WORKDIR /app

# Copy requirements first for layer caching
COPY requirements.txt .

# Install Python dependencies (not using --user in builder stage)
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Install Playwright browsers (Chromium only to save space)
RUN python -m playwright install chromium && \
    python -m playwright install-deps chromium

# ============================================
# Stage 3: Production Image
# ============================================
FROM base as production

# Create non-root user for security
RUN useradd -m -u 1000 vinly && \
    mkdir -p /app/static /app/temp/videos /app/temp/frames && \
    chown -R vinly:vinly /app

WORKDIR /app

# Copy Python packages from builder (installed in system site-packages)
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --from=builder /root/.cache/ms-playwright /home/vinly/.cache/ms-playwright

# Fix ownership of playwright cache
RUN chown -R vinly:vinly /home/vinly/.cache

# Copy application code
COPY --chown=vinly:vinly . .

# Switch to non-root user
USER vinly

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health', timeout=5)"

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

