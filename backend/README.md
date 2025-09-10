# Backend Development Guide

This Django REST API backend uses **uv** for dependency management and **poethepoet (poe)** for task automation with Docker-based development.

## Prerequisites

- Python 3.13+
- [uv](https://docs.astral.sh/uv/) for dependency management
- Docker & Docker Compose

### Installation

  **Install uv:**
- Follow the official [uv installation guide](https://docs.astral.sh/uv/getting-started/installation/)
- Quick install:
  ```bash
  # Unix/macOS
  curl -LsSf https://astral.sh/uv/install.sh | sh

  # Windows (PowerShell)
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```
**Install Docker:**
- Follow the official [Docker installation guide](https://docs.docker.com/get-docker/)
- Ensure Docker Compose is included (bundled with Docker Desktop)

## Quick Start

```bash
# Make sure you're in the project root
cd backend

# Install dependencies
uv sync

# Copy the example environment file to create your local .env file
cp ../.env.example ../.env

# Build containers
poe build

# Start development server
poe dev
```

## Environment Configuration

Before running the development server, you need to set up your environment variables:

```bash
# Copy the example environment file to create your local .env file
cp ../.env.example ../.env
```

The `.env.example` file (located in the project root) contains all necessary environment variables with default values for development. Key configurations include:

## Development Workflow

### Environment Setup
The project uses **_uv_** for dependency management instead of pip as it is alot faster and has dependency resolution.
```bash
# Create virtual environment and install dependencies
# (instead of pip install -r requirements.txt)
uv sync

# Install additional dependencies
# (instead of pip install <package-name>)
uv add <package-name>          # Production dependency
uv add --dev <package-name>    # Development dependency
```

### Available Poe Commands

| Command | Description |
|---------|-------------|
| `poe build` | Build/rebuild Docker containers |
| `poe dev` | Start development server |
| `poe down` | Stop containers and clean up |
| `poe clean` | Stop containers and remove volumes/database |
| `poe makemigrations` | Generate new migrations |
| `poe migrate` | Apply database migrations |
| `poe shell` | Open Django interactive shell |
| `poe startapp <app>` | Create new Django app under `apps/` |

### Daily Development Flow

1. **Start development**: `poe dev`
2. **Make model changes**: Edit models in `apps/`
3. **Create migrations**: `poe makemigrations`
4. **Apply migrations**: `poe migrate`
5. **Access shell**: `poe shell` (if needed)
6. **Stop development**: `poe down`
7. **Build/rebuild**: `poe build` (when dependencies change)

### Code Quality

The project includes automated code quality tools:
- **Ruff**: Linting and formatting (configured in `pyproject.toml`)
- **MyPy**: Type checking with Django stubs
- **Pre-configured**: All tools are set up with sensible defaults

## Project Structure

```
backend/
├── apps/           # Django applications
├── core/           # Django settings and configuration
├── manage.py       # Django management script
├── pyproject.toml  # Dependencies and tool configuration
└── uv.lock        # Locked dependencies
```

## Database

- **Development**: PostgreSQL (via Docker)
- **Cache**: Redis (via Docker)
- **Task Queue**: Celery with Redis broker

Access the database through Django shell or directly via Docker:
```bash
# Django shell
poe shell

# Direct database access
docker compose -f ../docker-compose.yml exec db psql -U <username> <database>
```
