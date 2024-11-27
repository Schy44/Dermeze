from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes,action
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
import stripe
from django.conf import settings
stripe.api_key = settings.STRIPE_SECRET_KEY


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

@permission_classes([AllowAny]) 
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

@permission_classes([AllowAny]) 
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

@permission_classes([AllowAny]) 
class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

@permission_classes([AllowAny]) 
class SkinConcernListView(generics.ListCreateAPIView):
    queryset = SkinConcern.objects.all()
    serializer_class = SkinConcernSerializer



class OrderViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        # Get the data from the request
        address = request.data.get('address')
        city = request.data.get('city')
        postal_code = request.data.get('postal_code')
        phone_number = request.data.get('phone_number')
        cart_items = request.data.get('cart_items', [])

        # Check if all required fields are provided
        if not all([address, city, postal_code, phone_number, cart_items]):
            return Response({"message": "Please provide all required details"}, status=status.HTTP_400_BAD_REQUEST)

        total = 0
        for item in cart_items:
            try:
                product = Product.objects.get(id=item['product_id'])
            except Product.DoesNotExist:
                return Response({"message": f"Product with ID {item['product_id']} not found"}, status=status.HTTP_404_NOT_FOUND)

            if item['quantity'] > product.stock:
                return Response({"message": f"Insufficient stock for {product.name}"}, status=status.HTTP_400_BAD_REQUEST)

            total += item['quantity'] * product.price
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

        # Create order items
        for item in cart_items:
            product = Product.objects.get(id=item['product_id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                price=product.price
            )

        # Serialize the order data, including the order items
        order_serializer = OrderSerializer(order)

        # Create a payment intent with Stripe
        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=int(order.total * 100),  # Amount in cents
                currency="usd",  # Ensure this matches your currency
                metadata={'order_id': order.id}
            )
            return Response({
                "message": "Order confirmed",
                "order": order_serializer.data,
                "clientSecret": payment_intent.client_secret  # Send client secret for frontend to confirm payment
            }, status=status.HTTP_201_CREATED)
        except stripe.error.StripeError as e:
            return Response({"message": f"Stripe error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def make_payment(self, request):
        order_id = request.data.get('order_id')
        payment_method_id = request.data.get('payment_method_id')

        try:
            # Fetch the order
            order = Order.objects.get(id=order_id, user=request.user)

            # If the order is already paid, return an error
            if order.status == Order.OrderStatus.PAID:
                return Response({"message": "Order is already paid"}, status=status.HTTP_400_BAD_REQUEST)

            # Confirm the payment with Stripe
            payment_intent = stripe.PaymentIntent.confirm(
                request.data.get('clientSecret'),
                payment_method=payment_method_id
            )

            # Check the payment status
            if payment_intent.status == 'succeeded':
                order.status = Order.OrderStatus.PAID
                order.save()
                return Response({
                    "message": "Payment successful",
                    "payment_intent_id": payment_intent.id
                }, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Payment failed"}, status=status.HTTP_400_BAD_REQUEST)

        except Order.DoesNotExist:
            return Response({"message": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
        except stripe.error.StripeError as e:
            return Response({"message": f"Stripe error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"message": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, pk=None):
        try:
            order = Order.objects.get(id=pk, user=request.user)
            order_items = order.order_items.all()
            order_serializer = OrderSerializer(order)
            order_data = order_serializer.data
            order_data['cart_items'] = OrderItemSerializer(order_items, many=True).data
            return Response(order_data)
        except Order.DoesNotExist:
            return Response({"message": "Order not found"}, status=status.HTTP_404_NOT_FOUND)