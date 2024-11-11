# serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Job, Bid, CertificationRequest, Notification, Store, ServiceRequest

# UserSerializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

# ProfileSerializer
class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ('user', 'bio', 'game_location', 'in_game_name', 'completed_jobs', 'recent_completed_jobs', 'can_create_store')

    def create(self, validated_data):
        user = validated_data.pop('user', None)
        if not user:
            raise serializers.ValidationError({'user': 'User instance is required to create a profile.'})
        return Profile.objects.create(user=user, **validated_data)

# Other serializers follow here...


class BidSerializer(serializers.ModelSerializer):
    """Serializer for bids, including currency fields and status."""
    job = serializers.SerializerMethodField()
    bidder = UserSerializer(read_only=True)
    gold = serializers.IntegerField(required=False, min_value=0)
    silver = serializers.IntegerField(required=False, min_value=0, max_value=99)
    copper = serializers.IntegerField(required=False, min_value=0, max_value=99)
    proposed_price_display = serializers.SerializerMethodField()

    def get_job(self, obj):
        job = obj.job
        return {
            "id": job.id,
            "in_game_name": job.in_game_name,
            "items_requested": job.items_requested,
            "server": job.server,
            "node": job.node,
            "status": job.status,
        }

    def get_proposed_price_display(self, obj):
        """
        Convert proposed price in copper to gold, silver, and copper.
        """
        gold = obj.proposed_price_copper // 10000
        silver = (obj.proposed_price_copper % 10000) // 100
        copper = obj.proposed_price_copper % 100
        return f"{gold} Gold, {silver} Silver, {copper} Copper"
    
    class Meta:
        model = Bid
        fields = (
            'id', 'job', 'bidder', 'estimated_completion_time', 'in_game_name', 
            'gold', 'silver', 'copper', 'proposed_price_copper', 'certification_level', 
            'note', 'date_bid', 'accepted', 'proposed_price_display'
        )

    def validate(self, data):
        """Validate and calculate proposed_price_copper from gold, silver, and copper."""
        gold = data.get('gold', 0)
        silver = data.get('silver', 0)
        copper = data.get('copper', 0)
        data['proposed_price_copper'] = (gold * 10000) + (silver * 100) + copper
        return data

    def create(self, validated_data):
        validated_data['bidder'] = self.context['request'].user
        return super().create(validated_data)

class JobSerializer(serializers.ModelSerializer):
    """Serializer for job listings, including bid statistics."""
    bids = BidSerializer(many=True, read_only=True)
    posted_by = UserSerializer(read_only=True)
    gold = serializers.IntegerField(required=False, min_value=0)
    silver = serializers.IntegerField(required=False, min_value=0, max_value=99)
    copper = serializers.IntegerField(required=False, min_value=0, max_value=99)
    bid_count = serializers.IntegerField(read_only=True)
    average_bid = serializers.FloatField(read_only=True)
    average_bid_display = serializers.SerializerMethodField()

    def get_average_bid_display(self, obj):
        if not hasattr(obj, 'average_bid') or obj.average_bid is None:
            return "No bids yet"
        gold = int(obj.average_bid // 10000)
        silver = int((obj.average_bid % 10000) // 100)
        copper = int(obj.average_bid % 100)
        return f"{gold} Gold, {silver} Silver, {copper} Copper"

    class Meta:
        model = Job
        fields = (
            'id', 'posted_by', 'in_game_name', 'server', 'node', 'items_requested',
            'item_category', 'gold', 'silver', 'copper', 'total_copper',
            'deadline', 'special_notes', 'date_posted', 'status', 'accepted_bid',
            'bid_count', 'average_bid', 'average_bid_display', 'bids'  # Ensure 'bids' is included here
        )
        read_only_fields = ['bid_count', 'average_bid', 'average_bid_display', 'bids']

    def validate(self, data):
        """Validate and calculate total_copper from gold, silver, and copper."""
        gold = data.get('gold', 0)
        silver = data.get('silver', 0)
        copper = data.get('copper', 0)
        data['total_copper'] = (gold * 10000) + (silver * 100) + copper
        return data

    def create(self, validated_data):
        validated_data['posted_by'] = self.context['request'].user
        return super().create(validated_data)



class CertificationRequestSerializer(serializers.ModelSerializer):
    """Serializer for certification requests."""
    user = UserSerializer(read_only=True)

    class Meta:
        model = CertificationRequest
        fields = ('id', 'user', 'certification_level', 'profession', 'screenshot', 'approved')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications."""
    recipient = UserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ('id', 'recipient', 'content', 'type', 'link', 'is_read', 'timestamp')


class StoreSerializer(serializers.ModelSerializer):
    """Serializer for store details."""
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Store
        fields = ('id', 'owner', 'in_game_name', 'description', 'location', 'services')

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class ServiceRequestSerializer(serializers.ModelSerializer):
    """Serializer for service requests, including currency fields."""
    customer = UserSerializer(read_only=True)
    store_owner = UserSerializer(read_only=True)
    gold = serializers.IntegerField(required=False, min_value=0)
    silver = serializers.IntegerField(required=False, min_value=0, max_value=99)
    copper = serializers.IntegerField(required=False, min_value=0, max_value=99)

    class Meta:
        model = ServiceRequest
        fields = (
            'id', 'customer', 'store_owner', 'description', 'gold', 'silver', 'copper', 
            'total_copper', 'timeline', 'status', 'feedback_message', 'job', 'created_at', 'updated_at'
        )

    def validate(self, data):
        """Calculate total_copper based on gold, silver, and copper."""
        gold = data.get('gold', 0)
        silver = data.get('silver', 0)
        copper = data.get('copper', 0)
        data['total_copper'] = (gold * 10000) + (silver * 100) + copper
        return data

    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)
