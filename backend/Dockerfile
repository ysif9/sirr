# ---- Builder Stage ----
FROM python:3.13.3-slim-bookworm AS builder

WORKDIR /virtualenvs

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PATH="/virtualenvs/.venv/bin:$PATH"

# Copy dependency files
COPY pyproject.toml uv.lock /virtualenvs/

# Install dependencies (excluding project itself)
RUN --mount=type=cache,target=/root/.cache/uv \
    cd /virtualenvs && \
    uv sync --frozen --no-install-project

# ---- Development Stage ----
FROM python:3.13.3-slim-bookworm AS development

WORKDIR /usr/src/app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    VIRTUAL_ENV=/virtualenvs/.venv \
    PATH="/virtualenvs/.venv/bin:$PATH"

# Install system dependencies
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Install uv in the runtime stage
COPY --from=ghcr.io/astral-sh/uv:0.5.11 /uv /uvx /bin/

# Copy virtual environment from builder stage
COPY --from=builder ${VIRTUAL_ENV} ${VIRTUAL_ENV}

# Copy application code
COPY . /usr/src/app/

EXPOSE 8000
