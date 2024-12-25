from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from base.api.views import (
    MyTokenObtainPairView, cart_view, get_profile, register_user,
    ProductListView, ProductDetailView, CategoryListView,
    SkinConcernListView, OrderViewSet, chat_with_recommendations,
)
from django.conf.urls import handler404

# Custom 404 handler
handler404 = 'base.views.custom_404'

# Initialize router for orders
router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    # User profile and authentication
    path('profile/', get_profile, name='profile'),
    path('register/', register_user, name='register'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Chat and recommendation system
    path('chat/', chat_with_recommendations, name='chat'),
    
    # Product and category APIs
    path('cart/', cart_view, name='cart'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:id>/', ProductDetailView.as_view(), name='product-detail'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/<slug:slug>/', CategoryListView.as_view(), name='products-by-category'),
    
    # Skin concerns and orders
    path('skin-concerns/', SkinConcernListView.as_view(), name='skin-concern-list'),
    path('orders/webhook/', OrderViewSet.as_view({'post': 'webhook'}), name='stripe-webhook'),

    # Include router URLs
    path('', include(router.urls)),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
