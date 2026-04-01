# KalaKart - AI + Artisan E-commerce Platform 🎨🛍️

> **"Connecting India's finest artisans directly with the world."**

KalaKart is a modern, full-stack e-commerce application designed to empower local artisans by providing them with a platform to sell their handcrafted goods. Built with the MERN stack (MongoDB, Express, React, Node.js), it features a premium "Glassmorphism" UI, advanced animations, and AI-powered tools.

![KalaKart Hero Section](https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80) 
*(Note: Replace with actual screenshot)*

## 🚀 Key Features

### 🌟 Premium UI/UX
- **Glassmorphism Design**: Frosted glass effects on navbar and cards for a modern look.
- **Advanced Animations**: Smooth page transitions, staggered entry sequences, and hover effects using `framer-motion`.
- **Interactive Stats**: Real-time counting statistics using `react-countup`.
- **Responsive Layout**: Fully optimized for mobile, tablet, and desktop devices.

### 🛒 Shopping Experience
- **Product Discovery**: Search, filter by category, and sort products dynamically.
- **Wishlist**: Save favorite items for later (persisted locally).
- **Cart Management**: Add/remove items, adjust quantities, and view totals.
- **Checkout Flow**: Simulated payment processing with a mock Razorpay integration.
- **Order Success**: Celebration page with confetti animation.

### 🛡️ Authentication & Security
- **User Accounts**: Secure registration and login functionality.
- **JWT Authentication**: Protected routes for user-specific actions.
- **Role-Based Access**: Separate dashboards for regular users and artisans (Seller Mode).

### 🤖 AI-Native Ecosystem (Powered by Gemini)
KalaKart moves beyond generic e-commerce by deeply integrating **purpose-built AI features** designed specifically for the artisan marketplace. While the platform supports a comprehensive suite of AI tools, here are our **3 Killer AI Features**:

1. **Personalized AI Home Feed (Style DNA)**
   - **For Buyers**: Moves away from static category browsing. The AI analyzes subtle interactions combining browsing history and style preferences to surface highly curated, hyper-relevant artisan products, mimicking a personal shopper who intimately understands the buyer's aesthetic.

2. **AI-Powered Artisan Co-Pilot**
   - **For Artisans**: Rural artisans often struggle with digital marketing. This suite includes an **AI Social Media Caption Generator** that instantly crafts Instagram-ready posts from simple product photos, and a **Market Trend Forecaster** that advises artisans on upcoming seasonal demands to optimize inventory.

3. **AI Avatar & Craft Identity Generator**
   - **For Community**: Enhances platform engagement by allowing users and artisans to instantly generate custom, culturally rich profile avatars. This visually represents their unique craft identity and persona without requiring professional photoshoots.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS v4, Framer Motion, Lucide React, Axios, React Router v6.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **State Management**: React Context API (`AuthContext`, `CartContext`, `WishlistContext`).

## 🏁 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or Atlas cluster)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/kalakart.git
    cd kalakart
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Create a .env file with:
    # PORT=5000
    # MONGO_URI=mongodb://localhost:27017/kalakart
    # JWT_SECRET=your_jwt_secret
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Visit the App**
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📸 Screenshots

Here is a glimpse of the KalaKart platform:

### 🏠 Home Page
![Home Page](./screenshots/home.png)
*(Home Feed featuring Glassmorphism UI and dynamic animations)*

### 🪄 AI Feature Demo
![AI Feature Demo](./screenshots/ai-feature.png)
*(Demonstrating Personalized Feeds, Trend Forecasters, or Avatar Generators)*

### 🛒 Shopping Cart
![Shopping Cart](./screenshots/cart.png)
*(Seamless cart management and checkout flow)*

### 📊 Artisan Dashboard
![Dashboard](./screenshots/dashboard.png)
*(Artisan Hub featuring product management and analytics)*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
