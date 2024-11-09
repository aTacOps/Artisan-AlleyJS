# signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.urls import reverse
from .models import Bid, Job, Notification, CertificationRequest, ServiceRequest, Profile
from django.contrib.auth.models import User

# Automatically create or update the user profile when the User model changes
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, **kwargs):
    Profile.objects.get_or_create(user=instance)

@receiver(post_save, sender=Bid)
def notify_bid_update(sender, instance, created, **kwargs):
    """Notify job poster when a new bid is placed or an existing bid is updated."""
    content = f"New bid placed on your job '{instance.job.items_requested}'." if created else f"A bid on your job '{instance.job.items_requested}' has been updated."
    notification_type = 'new_bid' if created else 'bid_update'
    
    job_detail_url = reverse('job-detail', args=[instance.job.id])  # API or frontend route for job detail

    # Create a notification for the job poster
    Notification.objects.create(
        recipient=instance.job.posted_by,
        content=content,
        type=notification_type,
        link=job_detail_url
    )

@receiver(post_save, sender=Job)
def notify_job_status_update(sender, instance, **kwargs):
    """Notify job poster of job status updates (e.g., accepted, completed, delivered)."""
    content = f"The status of your job '{instance.items_requested}' has been updated to {instance.status}."
    job_detail_url = reverse('job-detail', args=[instance.id])

    Notification.objects.create(
        recipient=instance.posted_by,
        content=content,
        type='job_status',
        link=job_detail_url
    )

@receiver(post_save, sender=Job)
def notify_job_update(sender, instance, created, **kwargs):
    """Notify all bidders when a job's details are updated."""
    if not created:
        content = f"The details for the job '{instance.items_requested}' have been updated."
        job_detail_url = reverse('job-detail', args=[instance.id])

        # Notify all bidders on the job
        for bid in instance.bids.all():
            Notification.objects.create(
                recipient=bid.bidder,
                content=content,
                type='job_update',
                link=job_detail_url
            )

@receiver(post_save, sender=ServiceRequest)
def notify_service_request(sender, instance, created, **kwargs):
    """Notify store owner of a new service request."""
    if created:
        content = f"You have received a new service request for '{instance.description}'."
        service_request_url = reverse('service-request-detail', args=[instance.id])

        Notification.objects.create(
            recipient=instance.store_owner,
            content=content,
            type='service_request',
            link=service_request_url
        )

@receiver(post_save, sender=CertificationRequest)
def notify_certification_feedback(sender, instance, **kwargs):
    """Notify user about certification approval or denial."""
    content = f"Your certification for {instance.profession} as {instance.certification_level} has been {'approved' if instance.approved else 'not approved'}."
    
    Notification.objects.create(
        recipient=instance.user,
        content=content,
        type='cert_feedback'
    )

@receiver(post_save, sender=Job)
def job_status_delivered_notification(sender, instance, **kwargs):
    """Notify the accepted bidder when the job status is marked as delivered."""
    if instance.status == 'delivered' and instance.accepted_bid:
        Notification.objects.create(
            recipient=instance.accepted_bid.bidder,
            type='job_status',
            content=f"The job '{instance.items_requested}' has been marked as delivered by the job poster.",
            link=reverse('job-detail', args=[instance.id])
        )
