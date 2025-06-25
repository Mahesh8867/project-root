from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny,IsAdminUser
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.viewsets import ModelViewSet
from .models import Product, CartItem, Order, UserProfile, OrderItem
from .seriliazers import (
    ProductSerializers, CartSerializers, AddToCartSerializer,
    OrderSerializer, CustomTokenObtainPairSerializer, PlaceOrderSerializers
)
from rest_framework import generics
import stripe
from django.conf import settings



class ProductViewSet(ModelViewSet):
    serializer_class = ProductSerializers
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Product.objects.all()  # Full access
        return Product.objects.filter(creator=user)  # Limited access

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
stripe.api_key = settings.STIPE_API_KEY

User = get_user_model()


class CreateCheckoutSessionView(APIView):
    def post(self, request):
        order_id = request.data.get("order_id")
        if not order_id:
            return Response({"error": "Missing order_id"}, status=400)

        try:
            order = Order.objects.get(id=order_id)
            order_items = order.items.all()

            total_amount = sum(
                item.quantity * float(item.price_at_purchase)
                for item in order_items
            )
            amount_in_paise = int(total_amount * 100)

            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                mode='payment',
                line_items=[{
                    'price_data': {
                        'currency': 'inr',
                        'unit_amount': amount_in_paise,
                        'product_data': {'name': f'Order #{order.id}'},
                    },
                    'quantity': 1,
                }],
                success_url=f'http://localhost:5173/payment-success?order_id={order_id}',
                cancel_url='http://localhost:5173/cart',
            )

            return Response({'id': session.id}, status=200)

        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class MarkOrderPaidView(APIView):
    def post(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
            order.status = "Paid"
            order.save()
            return Response({"message": "Order marked as paid"}, status=200)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CustomLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, email=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name
                }
            })
        return Response({'detail': 'Invalid credentials'}, status=401)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        password = request.data.get('password')

        if not all([name, email, password]):
            return Response({'error': 'Name, email, and password are required'}, status=400)

        if UserProfile.objects.filter(email=email).exists():
            return Response({'error': 'User already exists'}, status=400)

        UserProfile.objects.create_user(name=name, email=email, password=password)
        return Response({'message': 'User created successfully'}, status=201)


class ProductList(APIView):
    permission_classes = [IsAuthenticated,]

    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializers(products, many=True, context={'request': request})
        return Response(serializer.data, status=200)

    def post(self, request):
        serializer = ProductSerializers(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(creator=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class ProductDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductSerializers(product, context={'request': request})
        return Response(serializer.data)

class ProductList(generics.ListAPIView):
    serializer_class = ProductSerializers

    def get_queryset(self):
        queryset = Product.objects.all()
        query = self.request.query_params.get('search')
        if query:
            queryset = queryset.filter(name__icontains=query)
        return queryset
class MyProductsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Superuser can see all products
        if request.user.is_superuser:
            products = Product.objects.all()
        else:
            products = Product.objects.filter(creator=request.user)
        serializer = ProductSerializers(products, many=True, context={'request': request})
        return Response(serializer.data)

    def get_object(self, pk):
        product = get_object_or_404(Product, pk=pk)

        # Superuser can access any product
        if self.request.user.is_superuser:
            return product

        # Regular users can only access their own product
        if product.creator != self.request.user:
            raise PermissionDenied("You do not have permission to access this product.")
        return product

    def put(self, request, pk):
        product = self.get_object(pk)
        serializer = ProductSerializers(product, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        product = self.get_object(pk)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class CartAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart = CartItem.objects.filter(user=request.user)
        serializer = CartSerializers(cart, many=True)
        return Response(serializer.data, status=200)


class AddToCartAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user_profile = UserProfile.objects.get(email=request.user)
                serializer.save(user=user_profile)
                return Response(serializer.data, status=201)
            except UserProfile.DoesNotExist:
                return Response({"error": "UserProfile not found"}, status=404)
        return Response(serializer.errors, status=400)


class CartItemDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        deleted, _ = CartItem.objects.filter(user=request.user, product_id=product_id).delete()
        if deleted:
            return Response(status=204)
        return Response({'error': 'Item not found'}, status=404)


class PlaceOrder(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = OrderItem.objects.filter(customer=request.user)
        serializer = PlaceOrderSerializers(orders, many=True)
        return Response(serializer.data, status=200)

    def post(self, request):
        user_profile = request.user
        cart_items = CartItem.objects.filter(user=user_profile)

        if not cart_items.exists():
            return Response({"detail": "Cart is empty."}, status=400)

        order = Order.objects.create(customer=user_profile)

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                customer=user_profile,
                product=item.product,
                quantity=item.quantity,
                price_at_purchase=item.product.price
            )

        # Optional: Clear cart after order
        # cart_items.delete()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=201)
