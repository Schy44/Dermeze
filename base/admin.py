from django.contrib import admin
from .models import Category, SkinConcern, Product, Order, OrderItem


class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total', 'status', 'created_at')  # Ensure 'status' is a field in your model

    def customer(self, obj):
        return obj.user.username  

    def total_price(self, obj):
        return sum(item.quantity * item.price for item in obj.order_items.all())  # Use the correct field 'price' instead of 'unit_price'

    customer.admin_order_field = 'user'  # Allow sorting by the 'user' field in the admin

    # Use 'created_at' as the field name instead of 'order_date'
    def order_date(self, obj):
        return obj.created_at  # Correctly reference 'created_at' in the model

    order_date.admin_order_field = 'created_at'  # Allow sorting by 'created_at'

admin.site.register(Category)
admin.site.register(SkinConcern)
admin.site.register(Product)
admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem)
