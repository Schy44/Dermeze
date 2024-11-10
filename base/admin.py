from django.contrib import admin

from .models import Category, SkinConcern, Product

admin.site.register(Category)
admin.site.register(SkinConcern)
admin.site.register(Product)