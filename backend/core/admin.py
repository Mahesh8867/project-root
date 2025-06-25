from django.contrib import admin
from .models import UserProfile,Product, CartItem, Cart, Order
# Register your models here.
admin.site.register(UserProfile)
admin.site.register(Product)
admin.site.register(CartItem)
admin.site.register(Cart)
admin.site.register(Order)
