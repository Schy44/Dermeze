from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from base.api.views import (
    MyTokenObtainPairView, get_profile, register_user,
    ProductListView, ProductDetailView, CategoryListView,
    SkinConcernListView, OrderViewSet
)


router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('profile/', get_profile, name='profile'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', register_user, name='register'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:id>/', ProductDetailView.as_view(), name='product-detail'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('skin-concerns/', SkinConcernListView.as_view(), name='skin-concern-list'),
    path('orders/webhook/', OrderViewSet.as_view({'post': 'webhook'}), name='stripe-webhook'),
    
   
    path('', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
