Dermeze
Dermeze is your personalized skincare advisor, designed to help users feel confident in their skin. It offers advanced AI-powered recommendations for purchasing skincare products tailored to individual needs.

Live Demo

Test Card Details for Stripe Payments:
Card Number: 4242 4242 4242 4242
Expiry Date: 12/24
CVC: 123
ZIP Code: 12345
Note: The backend may take a few minutes to initialize. Once products are displayed, the application is fully operational.

Core Functionalities
1. E-commerce Platform
Product Catalog: Includes search and filter options.
Shopping Cart & Order Management: Seamless handling of product purchases.
Payment Integration: Secure transactions via Stripe.
2. AI Chatbot
Powered by the Gemini API for general conversations.
Provides product recommendations based on user input regarding skincare concerns.
3. Real-Time Notifications
WebSocket integration to deliver real-time success messages after Stripe payments.
4. Authentication & Security
User registration and login functionality.
Token-based authentication for secure API access.
5. AI Skin Problem Detection (In Progress)
Allows users to upload images of skin issues.
Analyzes images using AI models and suggests suitable skincare products from the available database.


Tech Stack
Frontend: React.js
Backend: Django
Database: SQLite3
AI Model: Pre-trained model for skin problem detection (In Development)
Payment Gateway: Stripe
WebSocket: Django Channels
Chatbot API: Gemini


Installation & Setup
1. Clone the Repository
bash
Copy code
git clone https://github.com/Schy44/Dermeze.git  
cd Dermeze  
2. Install Dependencies
Backend:
bash
Copy code
pip install -r requirements.txt

Frontend:
bash
Copy code
npm install  
4. Set Up Environment Variables
Create a .env file in the root directory and configure the following:
env
Copy code
STRIPE_API_KEY=<your-stripe-api-key>  
GEMINI_API_KEY=<your-gemini-api-key>  
SECRET_KEY=<your-django-secret-key>  
DATABASE_URL=<your-database-url>  

4. Run Migrations
bash
Copy code
python manage.py makemigrations  
python manage.py migrate
 
6. Start Development Servers
Backend:
bash
Copy code
python manage.py runserver

Frontend:
bash
Copy code
npm start  


API Endpoints
-Authentication
api/register/ [name='register']
api/token/ [name='token_obtain_pair']
api/token/refresh/ [name='token_refresh']
-User Profile
api/profile/ [name='profile']
-Products & Categories
api/products/ [name='product-list']
api/products/<int:id>/ [name='product-detail']
api/categories/ [name='category-list']
api/categories/<slug:slug>/ [name='products-by-category']
-Skin Concerns
api/skin-concerns/ [name='skin-concern-list']
Orders
api/orders/checkout/ [name='order-checkout']
api/orders/make_payment/ [name='order-make-payment']
api/orders/webhook/ [name='stripe-webhook']
-Miscellaneous
api/chat/ [name='chat']
api/media/<path>
Future Enhancements
Implement advanced caching strategies for improved performance.
Add localization support to cater to a global user base.
Ensure accessibility compliance for inclusivity.
Enable multilingual chatbot responses.

Contact
For inquiries, feel free to reach out at schy4362@gmail.com.

