# models.py

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json
from django.urls import reverse


class Job(models.Model):
    STATUS_CHOICES = [
        ('posted', 'Posted'),
        ('accepted', 'Accepted'),
        ('completed', 'Completed'),
        ('delivered', 'Delivered'),
    ]
    
    in_game_name = models.CharField(max_length=20, default='Unknown')
    server = models.CharField(max_length=20, default='Server')
    node = models.CharField(max_length=20, default='Node')
    items_requested = models.TextField(default='No items specified')
    ITEM_CATEGORY_CHOICES = [
        ('Alchemy', 'Alchemy'),
        ('Animal Husbandry', 'Animal Husbandry'),
        ('Arcane Engineering', 'Arcane Engineering'),
        ('Armor Smithing', 'Armor Smithing'),
        ('Carpentry', 'Carpentry'),
        ('Cooking', 'Cooking'),
        ('Farming', 'Farming'),
        ('Fishing', 'Fishing'),
        ('Herbalism', 'Herbalism'),
        ('Hunting', 'Hunting'),
        ('Jewel Cutting', 'Jewel Cutting'),
        ('Leatherworking', 'Leatherworking'),
        ('Lumberjacking', 'Lumberjacking'),
        ('Lumber Milling', 'Lumber Milling'),
        ('Metalworking', 'Metalworking'),
        ('Mining', 'Mining'),
        ('Other', 'Other'),
        ('Scribing', 'Scribing'),
        ('Stonemasonry', 'Stonemasonry'),
        ('Tailoring', 'Tailoring'),
        ('Tanning', 'Tanning'),
        ('Weapon Smithing', 'Weapon Smithing'),
        ('Weaving', 'Weaving'),
    ]
    item_category = models.CharField(
        max_length=50,
        choices=ITEM_CATEGORY_CHOICES,
        default='Alchemy',
    )
    gold = models.IntegerField(default=0)
    silver = models.IntegerField(default=0)
    copper = models.IntegerField(default=0)
    total_copper = models.IntegerField(default=0)
    deadline = models.DateField(default=timezone.now)
    special_notes = models.TextField(blank=True)
    date_posted = models.DateTimeField(default=timezone.now)
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE)
    accepted_bid = models.ForeignKey('Bid', null=True, blank=True, on_delete=models.SET_NULL, related_name='accepted_jobs')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='posted')
    completed_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-date_posted']

    def save(self, *args, **kwargs):
        # Calculate total_copper if not already set
        if self.total_copper == 0:
            self.total_copper = (self.gold * 10000) + (self.silver * 100) + self.copper
        super().save(*args, **kwargs)

    def get_price_in_gold_silver_copper(self):
        """Convert total copper to gold, silver, and copper."""
        gold = self.total_copper // 10000
        silver = (self.total_copper % 10000) // 100
        copper = self.total_copper % 100
        return gold, silver, copper

    def __str__(self):
        return f"{self.items_requested} by {self.posted_by.username}"

    def mark_as_completed(self):
        """Mark job as completed."""
        self.status = 'completed'
        self.completed_date = now()
        self.save()


class Profile(models.Model):
    """User profile model to store additional user information."""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    game_location = models.CharField(max_length=30, blank=True)
    in_game_name = models.CharField(max_length=30, blank=True)
    completed_jobs = models.IntegerField(default=0)
    recent_completed_jobs = models.TextField(default='[]')  # Store recent job history as a JSON string
    can_create_store = models.BooleanField(default=False)

    def add_to_history(self, items_requested, delivered_date):
        """Add a job completion record to the recent history."""
        try:
            job_history = json.loads(self.recent_completed_jobs)
        except json.JSONDecodeError:
            job_history = []

        job_record = {
            'items_requested': items_requested,
            'delivered_date': delivered_date.strftime('%Y-%m-%d'),
        }

        job_history.append(job_record)
        job_history = job_history[-10:]

        self.recent_completed_jobs = json.dumps(job_history)
        self.save()

    def get_recent_completed_jobs(self):
        """Retrieve recent completed jobs history as a list of dictionaries."""
        try:
            return json.loads(self.recent_completed_jobs)
        except json.JSONDecodeError:
            return []

    def __str__(self):
        return self.user.username


class Certification(models.Model):
    user = models.ForeignKey(User, related_name="certifications", on_delete=models.CASCADE)
    profession = models.CharField(max_length=50)
    certification_level = models.CharField(max_length=20)
    screenshot = models.ImageField(upload_to='certifications/', null=True, blank=True)

    def __str__(self):
        return f"{self.profession} - {self.certification_level} ({self.user.username})"


class Bid(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='bids')
    bidder = models.ForeignKey(User, on_delete=models.CASCADE)
    estimated_completion_time = models.CharField(max_length=100)
    gold = models.IntegerField(default=0)
    silver = models.IntegerField(default=0)
    copper = models.IntegerField(default=0)
    proposed_price_copper = models.IntegerField(default=0)
    in_game_name = models.CharField(max_length=100)
    CERTIFICATION_LEVEL_CHOICES = [
        ('Novice', 'Novice'),
        ('Apprentice', 'Apprentice'),
        ('Journeyman', 'Journeyman'),
        ('Master', 'Master'),
        ('Grandmaster', 'Grandmaster'),
    ]
    certification_level = models.CharField(max_length=20, choices=CERTIFICATION_LEVEL_CHOICES)
    note = models.TextField(blank=True)
    date_bid = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)

    class Meta:
        unique_together = ('job', 'bidder')

    def save(self, *args, **kwargs):
        # Calculate proposed_price_copper if not already set
        if self.proposed_price_copper == 0:
            self.proposed_price_copper = (self.gold * 10000) + (self.silver * 100) + self.copper
        super().save(*args, **kwargs)

    def get_proposed_price_in_gold_silver_copper(self):
        """Convert proposed price copper to gold, silver, and copper."""
        gold = self.proposed_price_copper // 10000
        silver = (self.proposed_price_copper % 10000) // 100
        copper = self.proposed_price_copper % 100
        return gold, silver, copper

    def __str__(self):
        return f"Bid by {self.bidder.username} on {self.job}"


class CertificationRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    certification_level = models.CharField(max_length=20)
    profession = models.CharField(max_length=50)
    screenshot = models.ImageField(upload_to='certifications/')
    approved = models.BooleanField(default=False)


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('job_status', 'Job Status Update'),
        ('new_bid', 'New Bid'),
        ('bid_update', 'Bid Update'),
        ('job_update', 'Job Update'),
        ('service_request', 'Service Request'),
        ('cert_feedback', 'Certification Feedback'),
    ]
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    content = models.TextField()
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    link = models.URLField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.type} for {self.recipient.username} at {self.timestamp}"


class Store(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stores')
    in_game_name = models.CharField(max_length=30)
    description = models.TextField()
    location = models.CharField(max_length=30)
    services = models.CharField(max_length=400)
    
    def __str__(self):
        return f"{self.in_game_name} - {self.location}"


class ServiceRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('denied', 'Denied'),
        ('feedback', 'Feedback Requested'),
        ('completed', 'Completed'),
    ]

    customer = models.ForeignKey(User, related_name="service_requests", on_delete=models.CASCADE)
    store_owner = models.ForeignKey(User, related_name="service_offers", on_delete=models.CASCADE)
    description = models.TextField()
    gold = models.IntegerField(default=0)
    silver = models.IntegerField(default=0)
    copper = models.IntegerField(default=0)
    total_copper = models.IntegerField(default=0)
    timeline = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    feedback_message = models.TextField(blank=True, null=True)
    job = models.OneToOneField(Job, null=True, blank=True, on_delete=models.SET_NULL)

    def save(self, *args, **kwargs):
        # Calculate total copper only if not already set
        if self.total_copper == 0:
            self.total_copper = (self.gold * 10000) + (self.silver * 100) + self.copper
        super().save(*args, **kwargs)

    def get_price_in_gold_silver_copper(self):
        """Convert total copper to gold, silver, and copper."""
        gold = self.total_copper // 10000
        silver = (self.total_copper % 10000) // 100
        copper = self.total_copper % 100
        return gold, silver, copper    

    def accept(self):
        """Mark the request as accepted, create a job, and send notifications."""
        job = Job.objects.create(
            posted_by=self.customer,
            in_game_name=self.customer.profile.in_game_name,
            items_requested=self.description,
            gold=self.gold,
            silver=self.silver,
            copper=self.copper,
            total_copper=self.total_copper,
            status='accepted'
        )
        accepted_bid = Bid.objects.create(
            job=job,
            bidder=self.store_owner,
            gold=self.gold,
            silver=self.silver,
            copper=self.copper,
            proposed_price_copper=self.total_copper,
            in_game_name=self.store_owner.profile.in_game_name,
            accepted=True
        )
        job.accepted_bid = accepted_bid
        job.save(update_fields=['accepted_bid'])
        self.job = job
        self.status = 'accepted'
        self.save(update_fields=['job', 'status'])
        Notification.objects.create(
            recipient=self.customer,
            content="Your service request has been accepted.",
            type='service_request'
        )
        Notification.objects.create(
            recipient=self.store_owner,
            content="You have accepted a service request.",
            type='service_request'
        )

    def deny(self):
        """Mark the request as denied and notify the customer."""
        self.status = 'denied'
        self.save()
        Notification.objects.create(
            recipient=self.customer,
            content="Your service request has been denied.",
            type='service_request'
        )

    def request_feedback(self, message):
        """Request feedback and notify the customer."""
        self.status = 'feedback'
        self.feedback_message = message
        self.save()
        Notification.objects.create(
            recipient=self.customer, 
            content="Feedback requested on your service request: " + message,
            type='service_request',
            link=reverse('respond-feedback', args=[self.id])
        )

    def mark_completed(self):
        """Mark the service as completed and notify the customer."""
        self.status = 'completed'
        self.save()
        Notification.objects.create(
            recipient=self.customer,
            content="Service request marked as completed.",
            type='service_request'
        )
