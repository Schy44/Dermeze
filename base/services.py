import google.generativeai as genai
from PIL import Image
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db.models import Q
from django.conf import settings
from .models import Product


def configure_genai():
    """Configure the Gemini API key."""
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("API key not found in settings.")
    genai.configure(api_key=api_key)


def extract_skincare_details(user_input):
    """
    Extract skin type and concerns from user input.
    """
    skincare_concerns = [
        "dry skin", "oily skin", "acne", "sensitive skin", 
        "eczema", "redness", "sunburn", "wrinkles", "dark spots"
    ]
    skin_types = ["dry", "oily", "combination", "sensitive"]

    user_input = user_input.lower()
    
    # Extract skin type
    skin_type = None
    for type in skin_types:
        if type in user_input:
            skin_type = type
            break
    
    # Extract skin concerns
    concerns = [concern for concern in skincare_concerns if concern in user_input]

    if not skin_type and not concerns:
        return {"error": "Could not identify your skin type or concerns. Please try again with more specific information."}
    
    return {"skin_type": skin_type, "concerns": concerns}


def search_products_by_ingredients(ingredients):
    if not ingredients:
        return [{"message": "No matching ingredients provided."}]
    
    query = Q()
    for ingredient in ingredients:
        query |= Q(ingredients__icontains=ingredient)
    
    products = Product.objects.filter(query).distinct()[:10]  # Limit results for efficiency
    return [
        {
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "ingredients": product.ingredients,
            "image_url": product.image.url if product.image else None,
        }
        for product in products
    ] if products.exists() else [{"message": "No matching products found."}]


def generate_gemini_response(user_input):
    """
    Generate a response from the Gemini model (AI).
    """
    try:
        configure_genai()
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(user_input)
        return response.text
    except genai.APIError as e:
        return f"Gemini API error: {str(e)}"
    except Exception as e:
        return f"Unexpected error: {str(e)}"


def get_ingredients_for_skin_concerns(skin_type, concerns):
    """
    Based on the skin type and concerns, return a list of ingredients.
    """
    ingredient_map = {
        "dry skin": ["hyaluronic acid", "glycerin", "ceramides", "squalane", "avocado oil"],
        "oily skin": ["salicylic acid", "benzoyl peroxide", "niacinamide", "retinol"],
        "acne": ["salicylic acid", "benzoyl peroxide", "retinol", "tea tree oil"],
        "sensitive skin": ["calendula", "chamomile", "niacinamide", "ceramides"],
        "eczema": ["colloidal oatmeal", "ceramides", "shea butter", "sunflower seed oil"],
        "wrinkles": ["retinol", "peptides", "hyaluronic acid", "vitamin C"],
        "dark spots": ["vitamin C", "niacinamide", "alpha arbutin", "licorice extract"],
        "sunburn": ["aloe vera", "calendula", "vitamin E"]
    }
    
    ingredients_needed = set()
    
    if skin_type:
        ingredients_needed.update(ingredient_map.get(skin_type, []))
    
    for concern in concerns:
        ingredients_needed.update(ingredient_map.get(concern, []))
    
    return list(ingredients_needed) if ingredients_needed else ["No ingredients found for your concerns."]
