from rest_framework import serializers
from base.models import *
from base.models import Product, Category, SkinConcern, SkinType,User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(many=False, read_only=True)
    class Meta:
        model = Profile
        fields = ('user', 'first_name', 'last_name', 'email')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
    
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user        
    

class SkinConcernSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkinConcern
        fields = ['id', 'name', 'description'] 

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'slug', 'is_active']


class ProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        request = self.context.get('request')  # Get the request context
        if request and obj.image:
            return request.build_absolute_uri(obj.image.url)  # Build the absolute URL
        return None  # Return None if no image is found or request is not available

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'discount_price', 'image', 'image_url',
            'rating', 'stock', 'is_available', 'category', 'skin_type', 'skin_concerns',
            'ingredients', 'usage_instructions', 'brand', 'created_at', 'updated_at'
        ]