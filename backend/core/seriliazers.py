from rest_framework.serializers import ModelSerializer,SerializerMethodField
from .models import *
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom user info to token
        token['email'] = user.email
        token['name'] = user.name  # from your UserProfile model

        return token


class ProductSerializers(serializers.ModelSerializer):
    creator_id = serializers.IntegerField(source='creator.id', read_only=True)
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'photo', 'creator_id', 'description','category']

class AddToCartSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    product_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product_id', 'product', 'quantity', 'photo', 'product_name', 'product_price']

    def get_photo(self, obj):
        return obj.product.photo.url if obj.product.photo else None

    def get_product_name(self, obj):
        return obj.product.name

    def get_product_price(self, obj):
        return obj.product.price

class CartSerializers(serializers.ModelSerializer):
    photo = serializers.ImageField(source='product.photo', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', read_only=True, max_digits=10, decimal_places=2)

    class Meta:
        model = CartItem
        fields = ['product_id', 'product', 'quantity', 'photo', 'product_name', 'product_price']
        extra_kwargs = {
            'product': {'read_only': True}
        }
class PlaceOrderSerializers(serializers.ModelSerializer):
    photo = serializers.ImageField(source='product.photo', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', read_only=True, max_digits=10, decimal_places=2)
    class Meta:
        model = OrderItem
        fields = ['photo','product_name','product_price','quantity','price_at_purchase']
# serializers.py

# serializers.py

from rest_framework import serializers
from .models import Order, OrderItem, CartItem, Product

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price_at_purchase', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'customer', 'created_at', 'status', 'items']


