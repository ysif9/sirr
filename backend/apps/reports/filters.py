"""Filters for the reports app."""
import django_filters

from apps.reports.models import Report


class ReportFilter(django_filters.FilterSet):
    """Filter for reports."""

    class Meta:
        model = Report
        fields = {
            "status": ["exact"],
            "priority": ["exact"],
        }
