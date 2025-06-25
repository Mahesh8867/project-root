from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='products')
urlpatterns = [
    path('create-checkout-session/', views.CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('mark-order-paid/<int:order_id>/',views.MarkOrderPaidView.as_view(), name='mark-order-paid'),
    path('products/', views.ProductList.as_view(), name='product-list'),
    path('api/login/', views. CustomTokenObtainPairView.as_view(), name='custom_login'),
    path('api/register/', views.RegisterView.as_view(), name='register'),
    path('products/<int:pk>/', views.MyProductsView.as_view(), name='product-detail'),
    path('products/info/<int:pk>/', views.ProductDetail.as_view(), name='product-info'),
    path('products/cart/', views.CartAPI.as_view(), name='cart'),
    path('cart/add/', views.AddToCartAPI.as_view(), name='add-to-cart'),
    path('place/order/', views.PlaceOrder.as_view(), name='place-order'),
    path('products/cart/<int:product_id>/', views.CartItemDeleteView.as_view(), name='delete-cart-item'),
    path('my_products/', views.MyProductsView.as_view(), name='My-products'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)+ router.urls