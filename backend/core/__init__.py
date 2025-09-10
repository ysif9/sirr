"""Initialize the core package for the Django project."""

# Make Celery import lazy/optional so management commands work even if Celery
# is not installed in certain environments (e.g., CI or local tooling).
try:
    from .celery import app as celery_app
except (ImportError, ModuleNotFoundError):
    celery_app = None

__all__ = ("celery_app",)
