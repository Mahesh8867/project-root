from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from core.models import Product, CartItem, UserProfile, Order
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()

class APITests(APITestCase):
    def setUp(self):
        # Create user
        self.user = User.objects.create_user(
            name='test',
            email='testuser@gmail.com',
            password='testpass'
        )

        self.client = APIClient()
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        # Create a product
        self.product = Product.objects.create(
            name='Test Product',
            description='dummy data',
            price=100,
            stock_quantity=10,
            creator=self.user
        )

    def test_product_list(self):
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_product_detail(self):
        url = reverse('product-info', args=[self.product.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_register(self):
        url = reverse('register')
        data = {'email': 'newuser@example.com', 'name': 'New User', 'password': 'newpass123'}
        response = self.client.post(url, data)
        self.assertIn(response.status_code, [200, 201])

    def test_login(self):
        url = reverse('custom_login')
        data = {'email': 'testuser@gmail.com', 'password': 'testpass'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 200)

    def test_add_to_cart(self):
        url = reverse('add-to-cart')
        data = {'product': self.product.id, 'quantity': 1}  # ✅ Use 'product' not 'product_id'
        response = self.client.post(url, data)
        # print("Cart Add Error:", response.data)
        self.assertIn(response.status_code, [200, 201])

    def test_view_cart(self):
        url = reverse('cart')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_delete_cart_item(self):
        item = CartItem.objects.create(product=self.product, quantity=1, user=self.user)
        url = reverse('delete-cart-item', args=[self.product.id])
        response = self.client.delete(url)
        self.assertIn(response.status_code, [204, 200])

    def test_place_order(self):
        CartItem.objects.create(product=self.product, quantity=1, user=self.user)
        url = reverse('place-order')
        response = self.client.post(url)
        self.assertIn(response.status_code, [200, 201])

    def test_create_checkout_session(self):
        order = Order.objects.create(customer=self.user)
        url = reverse('create-checkout-session')
        response = self.client.post(url, {'order_id': order.id}, format='json')
        self.assertEqual(response.status_code, 200)

    def test_mark_order_paid(self):
        order = Order.objects.create(customer=self.user)
        url = reverse('mark-order-paid', args=[order.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)

    def test_my_products_view(self):
        url = reverse('My-products')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
