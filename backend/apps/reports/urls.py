from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AIAnalysisViewSet,
    AttachmentViewSet,
    FollowUpViewSet,
    InvestigatorNoteViewSet,
    ReportCategoryViewSet,
    ReportRedactionViewSet,
    ReportTemplateViewSet,
    ReportViewSet,
)

router = DefaultRouter()
router.register(r"rep-categories", ReportCategoryViewSet)
router.register(r"templates", ReportTemplateViewSet)
router.register(r"reports", ReportViewSet)
router.register(r"attachments", AttachmentViewSet)
router.register(r"ai-analyses", AIAnalysisViewSet)
router.register(r"redactions", ReportRedactionViewSet)
router.register(r"investigator-notes", InvestigatorNoteViewSet)

router.register(r"follow-up", FollowUpViewSet, basename="report-followup-status")

urlpatterns = [
    path("", include(router.urls)),
]
