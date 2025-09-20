from django.contrib import admin

from apps.reports.models import Report, ReportAssignment


# Register your models here.
@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    pass


@admin.register(ReportAssignment)
class ReportAssignmentAdmin(admin.ModelAdmin):
    pass
