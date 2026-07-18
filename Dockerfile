# Use a base image with Python and CUDA support
FROM nvidia/cuda:12.1.1-devel-ubuntu22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Install system dependencies and uv
RUN apt-get update && apt-get install -y \
    python3 \
    python3-dev \
    git \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/* \
    && curl -LsSf https://astral.sh/uv/install.sh | sh

# Add uv to PATH
ENV PATH="/root/.local/bin:${PATH}"

# Set working directory
WORKDIR /app

# Install basic ML/inference libraries using uv
RUN uv pip install --system --no-cache torch transformers accelerate huggingface_hub fastapi uvicorn

# Copy project files
COPY ./src /app/src

# Set default command (to be overridden by k8s or docker run)
CMD ["python3", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
