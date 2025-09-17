from rest_framework import serializers
from .models import ReportCategory, ReportTemplate, Report, Attachment, AIAnalysis, ReportAssignment, ReportRedaction

# -------------------
# Category serializers
# -------------------
class ReportCategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = ReportCategory
        fields = ["id", "key", "title", "subtitle", "sort_order", "parent_category", "subcategories"]

    def get_subcategories(self, obj):
        return ReportCategorySerializer(obj.subcategories.all(), many=True).data


# -------------------
# Template serializers
# -------------------
class ReportTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportTemplate
        fields = ["id", "category", "key", "title", "definition"]


# -------------------
# Report serializers
# -------------------
class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["id", "template", "access_key", "data", "status", "score", "priority", "last_access_by_reporter", "expires_at"]


# -------------------
# Attachment serializers
# -------------------
class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ["id", "report", "file", "description", "checksum", "mime_type", "file_extension"]


# -------------------
# AI Analysis serializers
# -------------------
class AIAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAnalysis
        fields = ["report", "is_spam", "confidence", "analyzed_at", "model_version", "analysis_data"]


# -------------------
# Assignment serializers
# -------------------
class ReportAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportAssignment
        fields = ["report", "assignee", "assigned_at", "last_access"]


# -------------------
# Redaction serializers
# -------------------
class ReportRedactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportRedaction
        fields = ["report", "redactor_user", "reference_id", "redaction_reason"]
