# utils.py

import re

def extract_keywords(text):
    """
    Extracts keywords related to skincare concerns or ingredients from the user's input.
    """
    # List of common skin concerns and ingredients
    common_terms = [
        "acne", "dry skin", "oily skin", "sensitive skin", "redness",
        "blemishes", "hydration", "niacinamide", "salicylic acid", "zinc", "allantoin"
    ]

    # Normalize and tokenize the input text
    normalized_text = text.lower()
    words = re.findall(r'\w+', normalized_text)

    # Find matching keywords
    keywords = [word for word in words if word in common_terms]
    return keywords
