from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
from api.views import SignupView  # Update to import your SignupView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

def api_not_found(request, exception=None):
    return JsonResponse({"error": "Endpoint not found"}, status=404)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/register/', SignupView.as_view(), name='register'),  # Use SignupView
    path('api/token/', TokenObtainPairView.as_view(), name='get_token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('api-auth/', include('rest_framework.urls')),  # Optional for login/logout views
    path('api/', include('api.urls')),  # Include app-specific API URLs
]

handler404 = api_not_found