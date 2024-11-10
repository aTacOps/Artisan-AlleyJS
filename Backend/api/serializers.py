# serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Job, Bid, CertificationRequest, Notification, Store, ServiceRequest


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user registration and basic user details."""
    class Meta:
        model = User
        fields = ('id', 'username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user


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


class JobSerializer(serializers.ModelSerializer):
    """Serializer for job listings, including currency fields and status."""
    posted_by = UserSerializer(read_only=True)
    gold = serializers.IntegerField(required=False, min_value=0)
    silver = serializers.IntegerField(required=False, min_value=0, max_value=99)
    copper = serializers.IntegerField(required=False, min_value=0, max_value=99)

    class Meta:
        model = Job
        fields = (
            'id', 'posted_by', 'in_game_name', 'server', 'node', 'items_requested', 
            'item_category', 'gold', 'silver', 'copper', 'total_copper', 
            'deadline', 'special_notes', 'date_posted', 'status', 'accepted_bid'
        )

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


class BidSerializer(serializers.ModelSerializer):
    """Serializer for bids, including currency fields and status."""
    bidder = UserSerializer(read_only=True)
    gold = serializers.IntegerField(required=False, min_value=0)
    silver = serializers.IntegerField(required=False, min_value=0, max_value=99)
    copper = serializers.IntegerField(required=False, min_value=0, max_value=99)

    class Meta:
        model = Bid
        fields = (
            'id', 'job', 'bidder', 'estimated_completion_time', 'in_game_name', 
            'gold', 'silver', 'copper', 'proposed_price_copper', 'certification_level', 
            'note', 'date_bid', 'accepted'
        )

    def validate(self, data):
        """Calculate proposed_price_copper based on gold, silver, and copper."""
        gold = data.get('gold', 0)
        silver = data.get('silver', 0)
        copper = data.get('copper', 0)
        data['proposed_price_copper'] = (gold * 10000) + (silver * 100) + copper
        return data

    def create(self, validated_data):
        validated_data['bidder'] = self.context['request'].user
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
