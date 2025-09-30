"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from apps.common.views import HealthView
from apps.users.views import (
    CaseworkerPublicKeysView,
    CookieTokenRefreshView,
    CustomTokenObtainPairView,
    LogoutView,
    SystemInboxPublicKeyView,
    VerifyTOTPView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", HealthView.as_view(), name="health"),
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify-totp/", VerifyTOTPView.as_view(), name="token_verify_totp"),
    path("api/token/logout/", LogoutView.as_view(), name="token_logout"),
    path("api/system/public-key/", SystemInboxPublicKeyView.as_view(), name="system-public-key"),
    path("api/recipients/public-keys/", CaseworkerPublicKeysView.as_view(), name="caseworker-public-keys"),
    path("api/users/", include("apps.users.urls")),
    path("api/", include("apps.reports.urls")),
]

# This is for development purposes only and should not be used in production.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)