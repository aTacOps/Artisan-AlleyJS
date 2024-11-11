# views.py

from rest_framework import generics, status, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import login
from django.contrib import messages
from .models import (
    Profile, CertificationRequest, Store, Job, Bid, Notification, ServiceRequest
)
from django.contrib.auth.models import User
from .serializers import (
    UserSerializer, ProfileSerializer, JobSerializer, BidSerializer,
    CertificationRequestSerializer, StoreSerializer, ServiceRequestSerializer, NotificationSerializer
)
from django.db.models.functions import Coalesce
from django.db.models import Q, Count, Avg
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
import logging

logger = logging.getLogger(__name__)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    logger.debug(f"Authorization Header: {request.headers.get('Authorization')}")
    if not request.user.is_authenticated:
        return Response({"detail": "Authentication credentials were not provided."}, status=401)

    user_data = {
        "id": request.user.id,
        "username": request.user.username,
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



# Job views
class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.annotate(
        bid_count=Coalesce(Count('bids'), 0),
        average_bid=Coalesce(Avg('bids__proposed_price_copper'), 0.0)  # Average in copper
    ).order_by('-date_posted')
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    ordering_fields = ['date_posted', 'deadline', 'status',]

    def get_queryset(self):
        queryset = super().get_queryset()
        logger.debug(f"Jobs Queryset: {queryset}")
        return queryset

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-jobs')
    def my_jobs(self, request):
        jobs = Job.objects.filter(posted_by=request.user).annotate(
            bid_count=Count('bids'),
            average_bid=Avg('bids__proposed_price_copper')
        )
        serializer = self.get_serializer(jobs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path="bids")
    def bids(self, request, pk=None):
        """
        Retrieve all bids for a specific job.
        """
        job = self.get_object()
        if job.posted_by != request.user:
            return Response({"detail": "Not authorized to view bids for this job."}, status=403)

        bids = job.bids.all()
        serializer = BidSerializer(bids, many=True)
        return Response(serializer.data)



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

    @action(detail=False, methods=['get'], url_path='my-bids')
    def my_bids(self, request):
        """Retrieve all bids placed by the current user."""
        bids = Bid.objects.filter(bidder=request.user)
        serializer = self.get_serializer(bids, many=True)
        return Response(serializer.data)


class ProfileViewSet(viewsets.GenericViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get', 'put'])
    def me(self, request):
        if request.method == 'GET':
            profile = self.request.user.profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        elif request.method == 'PUT':
            profile = self.request.user.profile
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

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
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-timestamp')
