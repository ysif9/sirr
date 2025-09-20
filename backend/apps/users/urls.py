from django.urls import path

from .views import UserPublicKeyBundleView

urlpatterns = [
    path("me/public-key/", UserPublicKeyBundleView.as_view(), name="user-public-key"),
]