from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated ,  AllowAny 
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status, generics,viewsets, status 
from base.serializer import (
    ProfileSerializer,
    RegisterSerializer,
    ProductSerializer,
    CategorySerializer,
    SkinConcernSerializer,
    OrderSerializer,
    OrderItemSerializer,
)
from base.models import Product, Category, SkinConcern, Profile, Order, OrderItem
from django.contrib.auth.models import User
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404


@api_view(['POST'])
@permission_classes([AllowAny])  # Allows public access
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        # Create the user
        user = serializer.save()

        # Check if profile already exists for this user
        profile, created = Profile.objects.get_or_create(user=user)

        # If the profile is newly created, set the email from the user model
        if created:
            profile.email = user.email  # Set the email from the user model
            profile.save()

        # Return user and profile data
        return Response({
            "message": "User registered successfully",
            "user": {
                "username": user.username,
                "email": user.email
            },
            "profile": {
                "id": profile.id,
                "username": user.username,  # Fetch username from user
                "email": user.email  # Fetch email from user
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
    profile = get_object_or_404(Profile, user=request.user)
    serializer = ProfileSerializer(profile, many=False)
    return Response(serializer.data)


class ProductListView(APIView):
    def get(self, request, format=None):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = ProductSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailView(APIView):
    def get(self, request, id, format=None):
        product = get_object_or_404(Product, id=id)
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)

    def put(self, request, id, format=None):
        product = get_object_or_404(Product, id=id)
        serializer = ProductSerializer(product, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class SkinConcernListView(generics.ListCreateAPIView):
    queryset = SkinConcern.objects.all()
    serializer_class = SkinConcernSerializer



@permission_classes([AllowAny])
class OrderViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        # Get data from the request
        address = request.data.get('address')
        city = request.data.get('city')
        postal_code = request.data.get('postal_code')
        phone_number = request.data.get('phone_number')
        cart_items = request.data.get('cart_items', [])

        # Check if all required fields are provided
        if not all([address, city, postal_code, phone_number, cart_items]):
            return Response({"message": "Please provide all required details"}, status=status.HTTP_400_BAD_REQUEST)

        total = 0
        # Process each cart item
        for item in cart_items:
            try:
                product = Product.objects.get(id=item['product_id'])
            except Product.DoesNotExist:
                return Response({"message": f"Product with ID {item['product_id']} not found"}, status=status.HTTP_404_NOT_FOUND)

            # Check if there is sufficient stock for the product
            if item['quantity'] > product.stock:
                return Response({"message": f"Insufficient stock for {product.name}"}, status=status.HTTP_400_BAD_REQUEST)

            # Calculate the total price of the order
            total += item['quantity'] * product.price

            # Decrease the stock for the product
            product.stock -= item['quantity']
            product.save()

        # Create the order
        order = Order.objects.create(
            user=request.user,
            total=total,
            address=address,
            city=city,
            postal_code=postal_code,
            phone_number=phone_number
        )

        # Create OrderItems for each product in the cart
        for item in cart_items:
            product = Product.objects.get(id=item['product_id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                price=product.price
            )

        # Serialize the order data, including order items (cart items)
        order_serializer = OrderSerializer(order)
        return Response({"message": "Order confirmed", "order": order_serializer.data}, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        try:
            # Retrieve the order by primary key (ID), ensure user is authorized to view it
            order = Order.objects.get(id=pk, user=request.user)  # Only allow the user to view their own orders

            # Retrieve the related order items (cart items)
            order_items = order.order_items.all()  # 'order_items' is the related name in OrderItem

            # Serialize the order and its items
            order_serializer = OrderSerializer(order)
            order_data = order_serializer.data

            # Add cart items to the response manually
            order_data['cart_items'] = OrderItemSerializer(order_items, many=True).data

            return Response(order_data)
        except Order.DoesNotExist:
            return Response({"message": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

