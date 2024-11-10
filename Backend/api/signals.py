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

@receiver(post_save, sender=Job)
def notify_job_updates(sender, instance, created, **kwargs):
    if created:
        # Notify job poster on new job creation
        content = f"New job '{instance.items_requested}' posted."
        notification_type = 'new_job'
    else:
        # Notify on job details update
        content = f"The details for the job '{instance.items_requested}' have been updated."
        notification_type = 'job_update'

    job_detail_url = reverse('job-detail', args=[instance.id])
    
    # Notify job poster
    Notification.objects.create(
        recipient=instance.posted_by,
        content=content,
        type=notification_type,
        link=job_detail_url
    )

    # Notify all bidders on the job for updates
    if not created:
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

