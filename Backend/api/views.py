# views.py

# General imports
import logging
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.utils.timezone import now

# Django REST Framework imports
from rest_framework import (
    generics,
    status,
    permissions,
    viewsets,
    filters
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.generics import ListAPIView
from rest_framework.filters import SearchFilter

# Django Filter
from django_filters.rest_framework import DjangoFilterBackend

# Models and serializers
from .models import (
    Profile,
    CertificationRequest,
    Store,
    Job,
    Bid,
    Notification,
    ServiceRequest,
)
from .serializers import (
    UserSerializer,
    ProfileSerializer,
    JobSerializer,
    BidSerializer,
    CertificationRequestSerializer,
    StoreSerializer,
    ServiceRequestSerializer,
    NotificationSerializer,
)

# Django authentication and messages
from django.contrib.auth.models import User
from django.contrib.auth import login
from django.contrib import messages

# Django database functions
from django.db.models import Q, Count, Avg
from django.db.models.functions import Coalesce


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

logger = logging.getLogger(__name__)



@api_view(['POST'])
def send_custom_message(request):
    """Send a custom message to a user."""
    user_id = request.data.get("user_id")
    content = request.data.get("content")
    
    if not user_id or not content:
        return Response({"error": "User ID and content are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(id=user_id)
        Notification.objects.create(
            recipient=user,
            content=content,
            type="custom_message",
        )
        return Response({"message": "Custom message sent successfully."}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    logger.debug(f"Authorization Header: {request.headers.get('Authorization')}")
    
    if not request.user.is_authenticated:
        return Response({"detail": "Authentication credentials were not provided."}, status=401)

    user_data = {
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
        "is_staff": request.user.is_staff,
        "is_superuser": request.user.is_superuser,
    }
    return Response(user_data)


class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_serializer = UserSerializer(data=request.data)
        profile_serializer = ProfileSerializer(data=request.data)
        
        if user_serializer.is_valid() and profile_serializer.is_valid():
            user = user_serializer.save()
            profile_serializer.save(user=user)
            return Response(user_serializer.data, status=status.HTTP_201_CREATED)

        # Log errors for debugging
        print("User Serializer Errors:", user_serializer.errors)
        print("Profile Serializer Errors:", profile_serializer.errors)
        
        return Response(
            {**user_serializer.errors, **profile_serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

class AdminUserList(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = ["username", "email"]

    def get(self, request):
        users = User.objects.all().values("id", "username", "email", "is_staff", "is_active")
        return Response(users)

class AdminUserDetail(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        """Edit user details."""
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete a user."""
        user = get_object_or_404(User, pk=pk)
        user.delete()
        return Response({"message": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class AdminJobList(ListAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsAdminUser]
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = ["username", "item_description"]

    def get(self, request):
        jobs = Job.objects.all().values()
        return Response(jobs)

class AdminJobDetail(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        serializer = JobSerializer(job, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        job.delete()
        return Response({"message": "Job deleted successfully."}, status=status.HTTP_204_NO_CONTENT)        

class AdminBidList(ListAPIView):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer
    permission_classes = [IsAdminUser]
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = ["username", "item_description"]

    def get(self, request):
        bids = Bid.objects.all().values()
        return Response(bids)

class AdminBidDetail(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        bid = get_object_or_404(Bid, pk=pk)
        serializer = BidSerializer(bid, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        bid = get_object_or_404(Bid, pk=pk)
        bid.delete()
        return Response({"message": "Bid deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class AdminNotificationList(ListAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAdminUser]
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = ["username", "type"]

    def get(self, request):
        notifications = Notification.objects.all().values()
        return Response(notifications)

class AdminNotificationDetail(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk)
        serializer = NotificationSerializer(notification, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk)
        cotification.delete()
        return Response({"message": "Notification deleted successfully."}, status=status.HTTP_204_NO_CONTENT)   

class DeleteOldEntries(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        threshold_date = now() - timedelta(days=100)
        jobs_deleted = Job.objects.filter(date_posted__lt=threshold_date).delete()
        bids_deleted = Bid.objects.filter(date_bid__lt=threshold_date).delete()
        notifications_deleted = Notification.objects.filter(timestamp__lt=threshold_date).delete()
        return Response({
            "jobs_deleted": jobs_deleted,
            "bids_deleted": bids_deleted,
            "notifications_deleted": notifications_deleted,
        })



# Job views
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now
from django.db.models import Count, Avg
from django.db.models.functions import Coalesce

from .models import Job, Notification
from .serializers import JobSerializer, BidSerializer


class JobViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Jobs.
    Provides filtering, ordering, search, and custom actions for jobs.
    """
    queryset = Job.objects.annotate(
        bid_count=Coalesce(Count('bids'), 0),
        average_bid=Coalesce(Avg('bids__proposed_price_copper'), 0.0)
    ).select_related('accepted_bid').order_by('-date_posted')
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = ['items_requested', 'server', 'node', 'item_category']
    filterset_fields = ['item_category']
    ordering_fields = ['average_bid', 'bid_count', 'deadline']

    def get_queryset(self):
        """Filter queryset to only 'posted' jobs by default."""
        queryset = super().get_queryset()
        return queryset.filter(status='posted')

    def perform_create(self, serializer):
        """Associate the posted job with the currently authenticated user."""
        serializer.save(posted_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-jobs')
    def my_jobs(self, request):
        """
        Retrieve jobs posted by the authenticated user.
        Includes bid count and average bid as annotations.
        """
        jobs = self.get_queryset().filter(posted_by=request.user).annotate(
            bid_count=Count('bids'),
            average_bid=Avg('bids__proposed_price_copper')
        )
        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path="bids")
    def bids(self, request, pk=None):
        """
        Retrieve all bids for a specific job.
        Ensure only the job poster can view the bids.
        """
        job = self.get_object()
        if job.posted_by != request.user:
            return Response({"detail": "Not authorized to view bids for this job."}, status=status.HTTP_403_FORBIDDEN)

        bids = job.bids.all()
        serializer = BidSerializer(bids, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='accept-bid')
    def accept_bid(self, request, pk=None):
        """
        Accept a bid for a specific job.
        Ensure only one bid can be accepted for the job.
        """
        job = self.get_object()
        bid_id = request.data.get('bid_id')
        if not bid_id:
            return Response({"error": "Bid ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        bid = job.bids.filter(id=bid_id).first()
        if not bid:
            return Response({"error": "Bid not found."}, status=status.HTTP_404_NOT_FOUND)

        if job.accepted_bid:
            return Response({"error": "A bid has already been accepted for this job."}, status=status.HTTP_400_BAD_REQUEST)

        # Accept the bid and update job status
        bid.accepted = True
        bid.save()
        job.accepted_bid = bid
        job.status = 'accepted'
        job.save()

        # Notify the bidder
        Notification.objects.create(
            recipient=bid.bidder,
            content=f"Your bid for the job '{job.items_requested}' has been accepted!",
            type='job_status',
            link="/my-bids/",
        )
        return Response({"message": "Bid accepted successfully."}, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        """
        Update a job and notify all bidders of the changes.
        """
        job = self.get_object()
        response = super().update(request, *args, **kwargs)

        # Notify bidders about the job update
        for bid in job.bids.all():
            Notification.objects.create(
                recipient=bid.bidder,
                content=f"The job '{job.items_requested}' has been updated.",
                type="job_update",
                link=f"/my-bids/"
            )
        return response

    @action(detail=True, methods=['post'], url_path='mark-delivered')
    def mark_as_delivered(self, request, pk=None):
        """
        Mark a job as delivered.
        Only applicable if the job is already completed.
        """
        job = self.get_object()
        if job.status != 'completed':
            return Response({"error": "Job must be completed before marking as delivered."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Mark as delivered
        job.status = 'delivered'
        job.delivered_date = now()
        job.save()

        # Update user stats
        profile = job.posted_by.profile
        profile.completed_jobs += 1
        profile.add_to_history(job.items_requested, job.delivered_date)

        if job.accepted_bid:
            bidder_profile = job.accepted_bid.bidder.profile
            bidder_profile.completed_jobs += 1
            bidder_profile.add_to_history(job.items_requested, job.delivered_date)

        # Notify bidder of delivery
        Notification.objects.create(
            recipient=job.accepted_bid.bidder,
            content=f"The job '{job.items_requested}' has been marked as delivered!",
            type='job_status',
            link="/my-bids/",
        )
        return Response({"message": "Job marked as delivered successfully."}, status=status.HTTP_200_OK)


# Bid views
class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, job_id=None):
        """
        List all bids for a specific job.
        """
        job = get_object_or_404(Job, id=job_id)

        # Ensure the user is authorized to view the bids
        if job.posted_by != request.user:
            return Response({"detail": "Not authorized to view bids for this job."}, status=403)

        bids = job.bids.all()
        serializer = self.get_serializer(bids, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        job = get_object_or_404(Job, id=self.kwargs['job_id'])

        # Check if the user has already placed a bid on this job
        if Bid.objects.filter(job=job, bidder=self.request.user).exists():
            raise serializers.ValidationError("You have already placed a bid on this job.")

        if job.accepted_bid:
            raise serializers.ValidationError("This job already has an accepted bid.")

        serializer.save(bidder=self.request.user, job=job)

        Notification.objects.create(
            recipient=job.posted_by,
            content=f"A new bid has been placed on your job '{job.items_requested}'.",
            type='new_bid',
            link="/my-jobs/",
        )


    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        bid = self.get_object()
        job = bid.job

        # Ensure only the job poster can accept the bid
        if request.user != job.posted_by:
            return Response(
                {"error": "Only the job poster can accept this bid."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Prevent accepting multiple bids for the same job
        if job.accepted_bid:
            return Response(
                {"error": "A bid has already been accepted for this job."},
                status=status.HTTP_400_BAD_REQUEST
            )

        bid.accepted = True
        bid.save()
        job.accepted_bid = bid
        job.status = 'accepted'
        job.save()

        return Response({"message": "Bid accepted successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='mark-completed')
    def mark_as_completed(self, request, pk=None):
        bid = self.get_object()
        job = bid.job  # Get the related job

        # Ensure the job is in the accepted state
        if job.status != 'accepted':
            return Response({"error": "Job is not in an accepted state."}, status=400)

        # Mark the job as completed and set the completion date
        job.status = 'completed'
        job.completed_date = timezone.now()
        job.save()

        Notification.objects.create(
            recipient=job.posted_by,
            content=f"The job '{job.items_requested}' has been marked as completed by the bidder.",
            type='bid_update',
            link="/my-jobs/",
        )


        return Response({"message": "Job marked as completed successfully."}, status=200)

    @action(detail=False, methods=['get'], url_path='my-bids')
    def my_bids(self, request):
        """Retrieve all bids placed by the current user."""
        bids = Bid.objects.filter(bidder=request.user)
        serializer = self.get_serializer(bids, many=True)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        bid = self.get_object()
        job = bid.job

        # Notify the job poster of the bid update
        Notification.objects.create(
            recipient=job.posted_by,
            content=f"A bid on your job '{job.items_requested}' has been updated.",
            type='bid_update',
            link="/my-jobs/",
        )

        return response


    def destroy(self, request, *args, **kwargs):
        bid = self.get_object()
        if bid.accepted:
            return Response({"error": "Cannot delete an accepted bid."}, status=400)
        return super().destroy(request, *args, **kwargs)

class ProfileViewSet(viewsets.GenericViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get', 'post', 'put'])
    def me(self, request):
        # Handle GET request: Retrieve or create the profile
        if request.method == 'GET':
            profile, created = Profile.objects.get_or_create(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)

        # Handle POST request: Create a profile
        elif request.method == 'POST':
            data = request.data.copy()
            data['user'] = request.user.id  # Associate the profile with the current user
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=201)

        # Handle PUT request: Update the profile
        elif request.method == 'PUT':
            profile = Profile.objects.get(user=request.user)
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='view')
    def view_profile(self, request, pk=None):
        """Retrieve another user's profile."""
        try:
            profile = self.get_object()
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found."}, status=404)


# Store views
class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.user.profile.can_create_store:
            return Response({"error": "You do not have permission to create a store."}, status=status.HTTP_403_FORBIDDEN)
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'])
    def my_store(self, request):
        store = Store.objects.filter(owner=request.user).first()
        if not store:
            return Response({"error": "Store not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(store)
        return Response(serializer.data)

# Service Request views
class ServiceRequestViewSet(viewsets.ModelViewSet):
    queryset = ServiceRequest.objects.all()
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        store = get_object_or_404(Store, id=self.kwargs['store_id'])
        serializer.save(customer=self.request.user, store_owner=store.owner)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        service_request = self.get_object()
        if request.user != service_request.store_owner:
            return Response({"error": "You are not authorized to accept this service request."}, status=status.HTTP_403_FORBIDDEN)
        service_request.accept()
        return Response({"message": "Service request accepted successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def deny(self, request, pk=None):
        service_request = self.get_object()
        if request.user != service_request.store_owner:
            return Response({"error": "You are not authorized to deny this service request."}, status=status.HTTP_403_FORBIDDEN)
        service_request.deny()
        return Response({"message": "Service request denied."}, status=status.HTTP_200_OK)

# Certification Request views
class CertificationRequestViewSet(viewsets.ModelViewSet):
    queryset = CertificationRequest.objects.all()
    serializer_class = CertificationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Notification views
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-timestamp')

class MarkNotificationAsRead(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, recipient=request.user)
            notification.is_read = True
            notification.save()
            return Response({"message": "Notification marked as read."}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)
