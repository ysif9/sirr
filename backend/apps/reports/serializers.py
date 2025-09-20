import secrets

from rest_framework import serializers

from .models import AIAnalysis, Attachment, Report, ReportCategory, ReportRedaction, ReportTemplate


# -------------------
# Category serializers
# -------------------
class ReportCategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = ReportCategory
        fields = ["id", "key", "title", "subtitle", "sort_order", "parent_category", "subcategories", "created_at",
                  "updated_at"]
        read_only_fields = ["id", "key", "sort_order", "created_at", "updated_at"]

    def get_subcategories(self, obj):
        return ReportCategorySerializer(obj.subcategories.all(), many=True).data


# -------------------
# Template serializers
# -------------------
class ReportTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportTemplate
        fields = ["id", "category", "key", "title", "definition", "created_at", "updated_at"]
        read_only_fields = ["id", "key", "created_at", "updated_at"]


# -------------------
# Report serializers
# -------------------
class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["id", "template", "access_key", "data", "status", "score", "priority", "last_access_by_reporter",
                  "expires_at"]
        read_only_fields = ["id", "access_key", "score", "last_access_by_reporter", "expires_at", "created_at",
                            "updated_at"]

    def create(self, validated_data):
        # Generate a secure, random access key for the user
        access_key = secrets.token_hex(16)
        validated_data["access_key"] = access_key
        return super().create(validated_data)


class ReportListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["id", "status", "priority", "last_access_by_reporter",
                  "expires_at"]


# -------------------
# Attachment serializers
# -------------------
class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ["id", "report", "file", "description", "checksum", "mime_type", "file_extension"]
        read_only_fields = ["id", "mime_type", "file_extension"]


# -------------------
# AI Analysis serializers
# -------------------
class AIAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAnalysis
        fields = ["report", "is_spam", "confidence", "analyzed_at", "model_version", "analysis_data"]


# -------------------
# Redaction serializers
# -------------------
class ReportRedactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportRedaction
        fields = ["report", "redactor_user", "reference_id", "redaction_reason"]
        read_only_fields = ["reference_id", "created_at", "updated_at", "redactor_user"]
