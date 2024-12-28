# Project Documentation: Dermeze

**Dermeze** is your personalized skincare advisor and e-commerce platform, designed to help users feel confident in their skin. It offers AI-powered recommendations for purchasing skincare products tailored to individual needs.

### [**Live Demo**](https://dermeze.netlify.app/)
(Note: The backend may take a few minutes to initialize. Once products are displayed, the application is fully operational.)

---
## Features

### E-commerce Platform
- **Product Catalog**: Search and filter options to find desired products easily.
- **Shopping Cart Functionality**: Seamless handling of product transactions.
- **Order Management**: Manage orders efficiently.
- **Payment Integration**: Secure payment handling using Stripe.
- **Product Management**: Comprehensive tools for adding and managing products via Django Admin.

### Core Pages
- **Home Page**: Overview of products and features.
- **Login/Signup**: User authentication pages.
- **Profile Management**: Personalized user details and preferences.
- **Routine Maker**: Tools for creating skincare routines.
- **Chatbot**: AI-powered skincare assistance.
- **Wishlist**: Save products for later.
- **Cart**: Manage selected items for purchase.
- **Checkout Page**: Finalize purchases.
- **Order Confirmation Page**: Summary of completed orders.
- **404/Error Page**: User-friendly handling of invalid routes.

### Bonus Features
- **Real-Time Features**: WebSocket integration for live notifications.
- **Email - verification**: For forget password Email Recovery(Frontend isnt ready yet)
- **Auto-Deployment**: GitHub-based deployment pipeline.
- **Milestone-Based Completion**: Trackable progress and goals.

---
## Project Details

### Features and Core Functionalities

#### 1. **E-commerce Platform**
- Advanced search and filtering for finding products easily.
- Secure and reliable payment integration using Stripe.
- Seamless order and product management through Django’s Admin interface.

#### 2. **AI Chatbot**
- Powered by Gemini API for engaging general conversations.
- Provides tailored skincare product recommendations based on user input.

#### 3. **Real-Time Notifications**
- WebSocket integration for instant success messages post-payment.

#### 4. **Authentication & Security**
- User registration and login functionality.
- Token-based authentication for secure API access.

#### 5. **AI Skin Problem Detection** (In Progress)
- Upload images for skin issue analysis.
- AI-driven recommendations for suitable skincare products.

### Tech Stack
- **Frontend**: React.js
- **Backend**: Django
- **Database**: SQLite3
- **AI Model**: Pre-trained model for skin problem detection (in development).
- **Payment Gateway**: Stripe
- **WebSocket**: Django Channels
- **Chatbot API**: Gemini

---
## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Schy44/Dermeze.git
cd Dermeze
```

### 2. Install Dependencies
**Backend:**
```bash
pip install -r requirements.txt
```
**Frontend:**
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory and configure the following:
```env
STRIPE_API_KEY=<your-stripe-api-key>
GEMINI_API_KEY=<your-gemini-api-key>
SECRET_KEY=<your-django-secret-key>
DATABASE_URL=<your-database-url>
```

### 4. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Start Development Servers
**Backend:**
```bash
python manage.py runserver
```
**Frontend:**
```bash
npm start
```

---
## API Endpoints

### Authentication
- `api/register/` - User registration.
- `api/token/` - Obtain access tokens.
- `api/token/refresh/` - Refresh tokens.

### User Profile
- `api/profile/` - User profile management.

### Products & Categories
- `api/products/` - List of all products.
- `api/products/<int:id>/` - Product details.
- `api/categories/` - List of categories.
- `api/categories/<slug:slug>/` - Products by category.

### Skin Concerns
- `api/skin-concerns/` - List of skin concerns.

### Orders
- `api/orders/checkout/` - Order checkout.
- `api/orders/make_payment/` - Process payments.
- `api/orders/webhook/` - Stripe webhook integration.

### Miscellaneous
- `api/chat/` - Chatbot API endpoint.
- `api/media/<path>` - Media file access.

---
## Future Enhancements

- Implement forget password email recovery.( Backend is already completed and tested by Postman)
- Add review section and a community for discussion.
- Improve Login/Signup by adding Google Authorization.
- Notify users via email if a product remains in the wishlist or cart for more than 24 hours, encouraging purchase.( more then half of the work is completed )
- Implement advanced caching for improved performance.
- Add localization support for a global audience.
- Enhance chatbot response quality.

---
## Test Card Details for Stripe Payments
- **Card Number**: 4242 4242 4242 4242
- **Expiry Date**: 12/24
- **CVC**: 123
- **ZIP Code**: 12345

---
## Contact
For inquiries, reach out at **schy4362@gmail.com**.

