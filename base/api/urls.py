
from django.urls import path
from . import views
from django.conf import settings
from .views import MyTokenObtainPairView ,register_user,ProductListView, CategoryListView, SkinConcernListView 
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('profile/', views.get_profile),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', register_user, name='register'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:id>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('skin-concerns/', SkinConcernListView.as_view(), name='skin-concern-list'),
    
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)