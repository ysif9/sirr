from django.urls import include, path

from .views import (
    OnboardingCompleteStep1View,
    OnboardingCompleteStep2View,
    OnboardingTokenVerifyView,
    UserPublicKeyBundleView,
    UserRegistrationView,
)

onboarding_patterns = [
    path("verify/<str:token>/", OnboardingTokenVerifyView.as_view(), name="onboarding-verify-token"),
    path("complete-step-1/", OnboardingCompleteStep1View.as_view(), name="onboarding-complete-step-1"),
    path("complete-step-2/", OnboardingCompleteStep2View.as_view(), name="onboarding-complete-step-2"),
]

urlpatterns = [
    path("me/public-key/", UserPublicKeyBundleView.as_view(), name="user-public-key"),
    path("register/", UserRegistrationView.as_view(), name="user-register"),
    # New path for onboarding endpoints under `/api/users/onboarding/`
    path("onboarding/", include((onboarding_patterns, "onboarding"))),
]