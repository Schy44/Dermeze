from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db.models import Q
from django.conf import settings
from .models import Product
import google.generativeai as genai
import logging

# Configure logger
logger = logging.getLogger(__name__)

# Configure Gemini API
def configure_genai():
    """Configure the Gemini API key."""
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("API key not found in settings.")
    genai.configure(api_key=api_key)

def extract_skincare_details(user_input, dynamic_keywords):
    """Extract skin type, concerns, and product type using simple keyword matching."""
    user_input = user_input.lower()

    skin_type = next((word for word in dynamic_keywords["skin_types"] if word in user_input), None)
    product_type = next((word for word in dynamic_keywords["product_types"] if word in user_input), None)
    concerns = [word for word in dynamic_keywords["concerns"] if word in user_input]

    if not (skin_type or product_type or concerns):
        return {"error": "Could not detect any skin type, concern, or product type. Please provide more details."}

    return {
        "skin_type": skin_type,
        "product_type": product_type,
        "concerns": concerns,
    }


def get_dynamic_keywords():
    """Fetch dynamic keywords from the database."""
    categories = Product.objects.values_list("category", flat=True).distinct()
    ingredients = Product.objects.values_list("ingredients", flat=True).distinct()
    concerns = ["acne", "redness", "wrinkles", "eczema", "dark spots", "sunburn"]

    return {
        "skin_types": [str(category).lower() for category in categories],
        "product_types": ["sunscreen", "cleanser", "serum", "moisturizer", "toner"],
        "concerns": [str(concern).lower() for concern in concerns],
        "ingredients": [str(ingredient).lower() for ingredient in ingredients],
    }


# Search products by ingredients
def search_products(ingredients):
    """Search for products matching ingredients."""
    if not ingredients:
        return []

    query = Q()
    for ingredient in ingredients:
        query |= Q(ingredients__icontains=ingredient.strip())

    products = Product.objects.filter(query).distinct()[:10]
    return [
        {
            "name": product.name,
            "image_url": product.image.url if product.image else None,
        }
        for product in products
    ]

# Generate Gemini response
def generate_gemini_response(user_text):
    """Generate a response using the Gemini API."""
    try:
        configure_genai()
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(user_text)
        return response.text.split(",")  # Assume response is a comma-separated list of ingredients
    except Exception as e:
        logger.error(f"Gemini API Error: {str(e)}")
        return f"Error: {str(e)}"

