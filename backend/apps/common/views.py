"""Base API views for common endpoints."""

from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthView(APIView):
    """Simple health endpoint to verify the API is up."""

    def get(self, request: Request) -> Response:
        """Return a basic health payload."""
        return Response({"status": "ok"})
