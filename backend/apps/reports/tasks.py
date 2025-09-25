import logging

from celery import shared_task
from django.db import transaction

from apps.reports.models import AIAnalysis, Report
from apps.reports.services.analysis_service import ReportAnalyzerService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
    handlers=[
        logging.StreamHandler()
    ],
)

logger = logging.getLogger(__name__)

@shared_task
def generate_analysis_task(report_data: dict | list | str, report_id: str):
    """Generates AI analysis for the given report data."""
    logger.info(f"Task received report_id: {report_id!r} (type: {type(report_id)})")

    analysis_service = ReportAnalyzerService()
    prediction = analysis_service.analyze_report(report_data)

    with transaction.atomic():
        # Try to create the analysis
        AIAnalysis.objects.create(
            report_id=report_id,
            is_spam=(prediction.is_spam == "spam"),
            confidence=int(prediction.confidence * 100),
            spam_reasoning=prediction.spam_reasoning,
            urgency=prediction.urgency,
            urgency_reasoning=prediction.urgency_reasoning,
        )
