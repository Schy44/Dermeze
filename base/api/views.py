from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from base.serializer import RegisterSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from base.models import Profile
from base.serializer import ProfileSerializer,RegisterSerializer,ProductSerializer, CategorySerializer,SkinConcernSerializer
from rest_framework import serializers
from django.contrib.auth.models import User
from base.models import Product, Category, SkinConcern, SkinType



class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username

        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    profile = user.profile
    serializer = ProfileSerializer(profile, many=False)
    return Response(serializer.data)


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

        # Create the user's profile
        Profile.objects.create(user=user)  # Automatically create a profile

        return user
    
@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)    


class ProductListView(APIView):
    def get(self, request, format=None):
        products = Product.objects.all()  # Fetch all products
        # Pass the request context to the serializer
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

class ProductDetailView(APIView):
    def get(self, request, id, format=None):
        try:
            product = Product.objects.get(id=id)
            # Pass the request context to the serializer
            serializer = ProductSerializer(product, context={'request': request})
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)



class CategoryListView(APIView):
    def get(self, request, format=None):
        categories = Category.objects.all()  # Fetch all categories
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

class SkinConcernListView(APIView):
    def get(self, request, format=None):
        concerns = SkinConcern.objects.all()  # Fetch all skin concerns
        serializer = SkinConcernSerializer(concerns, many=True)
        return Response(serializer.data)
