from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AIAnalysisViewSet,
    AttachmentViewSet,
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

urlpatterns = [
    path("", include(router.urls)),
]
