# urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'jobs', views.JobViewSet, basename='job')
router.register(r'bids', views.BidViewSet, basename='bid')
router.register(r'profiles', views.ProfileViewSet, basename='profile')
router.register(r'stores', views.StoreViewSet, basename='store')
router.register(r'service-requests', views.ServiceRequestViewSet, basename='service_request')
router.register(r'certification-requests', views.CertificationRequestViewSet, basename='certification_request')

urlpatterns = [
    # Authentication
    path('signup/', views.SignupView.as_view(), name='signup'),
    
    # Notifications
    path('notifications/', views.NotificationListView.as_view(), name='notifications'),
    
    # Include router URLs
    path('', include(router.urls)),
]
