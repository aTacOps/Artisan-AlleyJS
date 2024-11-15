from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import current_user, MarkNotificationAsRead

# Set up the DefaultRouter
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
    path('current-user/', current_user, name='current-user'),
    
    # Notifications
    path('notifications/', views.NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:pk>/', MarkNotificationAsRead.as_view(), name='mark-notification-as-read'),

    # Nested route for job bids
    path(
        'jobs/<int:job_id>/bids/',
        views.BidViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='job-bids'
    ),

    # Custom endpoint for "My Bids"
    path(
        'bids/my-bids/',
        views.BidViewSet.as_view({'get': 'my_bids'}),
        name='my-bids'
    ),

    #Admin messaging
    



    # Include router URLs (only include this once)
    path('', include(router.urls)),
]
