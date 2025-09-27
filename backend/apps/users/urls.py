from django.urls import include, path

from .views import (
    CurrentUserView,
    OnboardingCompleteStep1View,
    OnboardingCompleteStep2View,
    OnboardingTokenVerifyView,
    SetPasswordView,
    UserPublicKeyBundleView,
    UserRegistrationView,
)

onboarding_patterns = [
    path("verify/<str:token>/", OnboardingTokenVerifyView.as_view(), name="onboarding-verify-token"),
    path("complete-step-1/", OnboardingCompleteStep1View.as_view(), name="onboarding-complete-step-1"),
    path("complete-step-2/", OnboardingCompleteStep2View.as_view(), name="onboarding-complete-step-2"),
]

urlpatterns = [
    path("me/", CurrentUserView.as_view(), name="user-me"),
    path("me/set-password/", SetPasswordView.as_view(), name="user-set-password"),
    path("me/public-key/", UserPublicKeyBundleView.as_view(), name="user-public-key"),
    path("register/", UserRegistrationView.as_view(), name="user-register"),
    path("onboarding/", include((onboarding_patterns, "onboarding"))),
]