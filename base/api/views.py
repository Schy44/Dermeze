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
from django.db.models import Q
from django.conf import settings
from django.http import JsonResponse
stripe.api_key = settings.STRIPE_SECRET_KEY
import logging
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
logger = logging.getLogger(__name__)
from django.views.decorators.http import require_http_methods
from rest_framework.exceptions import NotFound
GEMINI_API_KEY = settings.GEMINI_API_KEY
from django.shortcuts import render
from django.conf import settings
import requests
import google.generativeai as genai
import logging
logger = logging.getLogger(__name__)
api_key = settings.GEMINI_API_KEY
from base.utils import extract_keywords
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import google.generativeai as genai
from PIL import Image
import io
from rest_framework.decorators import api_view
from rest_framework.parsers import MultiPartParser, FormParser
from base.services import (
    configure_genai,
    extract_skincare_details,
    search_products,
    get_dynamic_keywords,
    generate_gemini_response
    
)

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def cart_view(request):
    if 'cart' not in request.session:
        request.session['cart'] = {}

    if request.method == 'GET':
        # Retrieve the cart
        return JsonResponse(request.session['cart'], safe=False)

    elif request.method == 'POST':
        # Add an item to the cart
        data = json.loads(request.body)
        product_id = str(data.get('product_id'))
        quantity = data.get('quantity', 1)

        if product_id in request.session['cart']:
            request.session['cart'][product_id] += quantity
        else:
            request.session['cart'][product_id] = quantity

        request.session.modified = True
        return JsonResponse({'message': 'Item added to cart'})

    elif request.method == 'PUT':
        # Update item quantity
        data = json.loads(request.body)
        product_id = str(data.get('product_id'))
        quantity = data.get('quantity', 1)

        if product_id in request.session['cart']:
            request.session['cart'][product_id] = quantity
            request.session.modified = True
            return JsonResponse({'message': 'Cart updated'})
        else:
            return JsonResponse({'error': 'Product not in cart'}, status=404)

    elif request.method == 'DELETE':
        # Remove an item from the cart
        data = json.loads(request.body)
        product_id = str(data.get('product_id'))

        if product_id in request.session['cart']:
            del request.session['cart'][product_id]
            request.session.modified = True
            return JsonResponse({'message': 'Item removed from cart'})
        else:
            return JsonResponse({'error': 'Product not in cart'}, status=404)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


def custom_404(request, exception):
    return render(request, '404.html', status=404)


from django.http import HttpResponseRedirect

def redirect_to_frontend(request):
    return HttpResponseRedirect("https://dermeze.netlify.app")





@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_orders(request):
    user = request.user
    orders = Order.objects.filter(user=user)  
    serialized_orders = OrderSerializer(orders, many=True)
    return Response(serialized_orders.data)



@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "message": "User registered successfully",
            "user": {
                "username": user.username,
                "email": user.email
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


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    try:
        profile = request.user.profile

        if request.method == 'GET':
            serializer = ProfileSerializer(profile)
            return Response(serializer.data)

        if request.method == 'PUT':
            serializer = ProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)

    except Profile.DoesNotExist:
        raise NotFound(detail="Profile not found.")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    try:
        profile = request.user.profile  # Access the profile of the logged-in user
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)
    except Profile.DoesNotExist:
        raise NotFound(detail="Profile not found.")


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

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get(self, request, *args, **kwargs):
        slug = self.kwargs.get("slug")
        if slug:
            category = get_object_or_404(Category, slug=slug)
            products = Product.objects.filter(category=category)
            product_serializer = ProductSerializer(products, many=True)
            return Response({"products": product_serializer.data})
        return super().get(request, *args, **kwargs)

class SkinConcernListView(generics.ListCreateAPIView):
    queryset = SkinConcern.objects.all()
    serializer_class = SkinConcernSerializer



    
@require_http_methods(["GET", "POST"])
def get_payment_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        if request.method == "GET":
            payment_status = order.payment_status
            return JsonResponse({'status': payment_status})
        elif request.method == "POST":
            # Handle POST logic here (if needed)
            return JsonResponse({'status': 'Payment status updated'}, status=200)
    except Order.DoesNotExist:
        return JsonResponse({'error': 'Order not found'}, status=404)


@api_view(["POST"])
def chat_with_recommendations(request):
    """Handle chat and provide skincare recommendations or general conversation."""
    user_text = request.data.get("text", "").strip()

    if not user_text:
        return Response({"error": "Please provide more details about your skin concerns."}, status=400)

    try:
        # Fetch dynamic keywords
        dynamic_keywords = get_dynamic_keywords()

        # Extract details from user input
        skincare_details = extract_skincare_details(user_text, dynamic_keywords)

        if "error" in skincare_details:
            # Handle general conversation with Gemini API
            general_response = generate_gemini_response(user_text)

            if isinstance(general_response, str) and general_response.startswith("Error"):
                return Response({"error": general_response}, status=400)

            return Response({
                "type": "general_conversation",
                "message": general_response
            }, status=200)

        # Process skincare-related input
        skin_type = skincare_details["skin_type"]
        concerns = ", ".join(skincare_details["concerns"])
        product_type = skincare_details["product_type"]

        gemini_prompt = f"Suggest ingredients for {skin_type} skin with concerns: {concerns} for {product_type}"
        ingredients = generate_gemini_response(gemini_prompt)

        if isinstance(ingredients, str) and ingredients.startswith("Error"):
            return Response({"error": ingredients}, status=400)

        # Search for products
        products = search_products(ingredients)
        if not products:
            return Response({"message": "No matching products found."}, status=200)

        return Response({
            "type": "product_recommendations",
            "count": len(products),
            "products": products
        }, status=200)

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return Response({"error": f"Something went wrong: {str(e)}"}, status=500)


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
        client_secret = request.data.get('clientSecret') 
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
  
    @action(detail=False, methods=['post'])
    @method_decorator(csrf_exempt)
    @permission_classes([AllowAny])
    def webhook(self, request):
        payload = request.body
        sig_header = request.META['HTTP_STRIPE_SIGNATURE']
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET 

        try:
         
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError as e:
            logger.error(f"Invalid payload: {str(e)}")
            return JsonResponse({'message': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid signature: {str(e)}")
            return JsonResponse({'message': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

        # Handle the event
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            order_id = payment_intent['metadata']['order_id']

            try:
                order = Order.objects.get(id=order_id)
                if order.status != Order.OrderStatus.PAID:
                    order.status = Order.OrderStatus.PAID
                    order.save()
                    logger.info(f"Payment succeeded for order {order_id}. Status updated to PAID.")
                    return JsonResponse({'message': 'Payment successful'}, status=status.HTTP_200_OK)
                else:
                   logger.info(f"Order {order_id} already marked as PAID.")
                   return JsonResponse({'message': 'Payment already processed'}, status=status.HTTP_200_OK)


            except Order.DoesNotExist:
                logger.error(f"Order not found for payment intent {payment_intent['id']}")
                return JsonResponse({'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            order_id = payment_intent['metadata']['order_id']

            try:
                # Fetch the order and mark as payment failed
                order = Order.objects.get(id=order_id)
                order.status = Order.OrderStatus.FAILED
                order.save()
                logger.info(f"Payment failed for order {order_id}. Status updated to FAILED.")
                return JsonResponse({'message': 'Payment failed'}, status=status.HTTP_200_OK)

            except Order.DoesNotExist:
                return JsonResponse({'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    
        elif event['type'] == 'payment_intent.canceled':
          payment_intent = event['data']['object']
          order_id = payment_intent['metadata']['order_id']
          try:
            order = Order.objects.get(id=order_id)
            order.status = Order.OrderStatus.CANCELED
            order.save()
            return JsonResponse({'message': 'Payment canceled'}, status=status.HTTP_200_OK)
          except Order.DoesNotExist:
            logger.error(f"Order not found for canceled payment intent {payment_intent['id']}")
            return JsonResponse({'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        return JsonResponse({'message': 'Event processed'}, status=status.HTTP_200_OK) 
    