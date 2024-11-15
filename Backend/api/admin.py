from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from .models import Profile, Job, Bid, Notification

# Unregister the default User model
admin.site.unregister(User)

# Register the User model with customizations
@admin.register(User)
class UserAdmin(DefaultUserAdmin):
    list_display = ('username', 'email', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('username', 'email')
    list_filter = ('is_active', 'is_staff')
    ordering = ('date_joined',)

# Register the Profile model
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'in_game_name', 'completed_jobs', 'game_location')
    search_fields = ('user__username', 'in_game_name')
    list_filter = ('game_location',)

# Register the Job model
@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('items_requested', 'server', 'status', 'posted_by', 'date_posted')
    search_fields = ('items_requested', 'server', 'posted_by__username')
    list_filter = ('status', 'server', 'date_posted')
    ordering = ('-date_posted',)

# Register the Bid model
@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ('job', 'bidder', 'proposed_price_copper', 'accepted', 'date_bid')
    search_fields = ('job__items_requested', 'bidder__username')
    list_filter = ('accepted',)

# Register the Notification model
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'content', 'type', 'is_read', 'timestamp')
    search_fields = ('recipient__username', 'content', 'type')
    list_filter = ('is_read', 'type', 'timestamp')
    actions = ['send_custom_message']

    def send_custom_message(self, request, queryset):
        selected = request.POST.getlist(admin.ACTION_CHECKBOX_NAME)
        user_ids = [int(pk) for pk in selected]
        users = User.objects.filter(id__in=user_ids)

        # Redirect to a custom message input page
        return HttpResponseRedirect(f"/admin/custom-message/?users={','.join(map(str, user_ids))}")

    send_custom_message.short_description = "Send Custom Message to Selected Users"
