import json
from django.core.management.base import BaseCommand
from base.models import Category, Product, SkinConcern

class Command(BaseCommand):
    help = 'Import product, category, and skin concern data from JSON files into the database'

    def handle(self, *args, **kwargs):
        # Load data from JSON files
        with open(r'F:\data\products.json') as f:
            products_data = json.load(f)

        with open(r'F:\data\categories.json') as f:
            categories_data = json.load(f)

        with open(r'F:\data\skin-concerns.json') as f:
            skin_concerns_data = json.load(f)

        # Create categories (ensure no duplicates)
        for category_data in categories_data:
            category_name = category_data['name'].strip()
            category, created = Category.objects.get_or_create(name=category_name)

        # Create skin concerns (ensure no duplicates)
        for skin_concern_data in skin_concerns_data:
            skin_concern_name = skin_concern_data['name'].strip()
            skin_concern, created = SkinConcern.objects.get_or_create(name=skin_concern_name)

        # Import products and assign categories and skin concerns
        for product_data in products_data:
            category_id = product_data['category']  # Assuming category is an ID in your products JSON
            category = Category.objects.filter(id=category_id).first()
            
            if not category:
                self.stdout.write(self.style.ERROR(f"Category with ID '{category_id}' not found"))
                continue  # Skip this product if the category doesn't exist
            
            # Create product
            product = Product.objects.create(
                name=product_data['name'],
                description=product_data['description'],
                price=product_data['price'],
                discount_price=product_data.get('discount_price'),
                image=product_data.get('image'),  # If image URL is in the data
                rating=product_data.get('rating', 0.0),
                stock=product_data.get('stock', 0),
                is_available=product_data.get('is_available', True),
                category=category,
                skin_type=product_data.get('skin_type', ''),
                ingredients=product_data.get('ingredients', ''),
                usage_instructions=product_data.get('usage_instructions', ''),
                brand=product_data.get('brand', ''),
            )

            # Assign skin concerns (if any)
            skin_concerns = SkinConcern.objects.filter(name__in=product_data.get('skin_concerns', []))
            product.skin_concerns.set(skin_concerns)

            # Optionally, save the product if you made any updates
            product.save()

        self.stdout.write(self.style.SUCCESS('Successfully imported data from JSON files'))
