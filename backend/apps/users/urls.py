from django.urls import path

from .views import UserPublicKeyBundleView, UserRegistrationView

urlpatterns = [
    path("me/public-key/", UserPublicKeyBundleView.as_view(), name="user-public-key"),
    path("register/", UserRegistrationView.as_view(), name="user-register"),

]
