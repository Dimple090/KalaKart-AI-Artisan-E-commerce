import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Dashboard from './pages/Dashboard';
import AccessDenied from './pages/AccessDenied';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import LiveStream from './pages/LiveStream';
import CraftTutorial from './pages/CraftTutorial';
import GiftFinder from './pages/GiftFinder';
import SavedIdeas from './pages/SavedIdeas';
import Profile from './pages/Profile';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import AIChatbot from './components/AIChatbot';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
              <Navbar />
              <main className="flex-grow pt-16">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/access-denied" element={<AccessDenied />} />
                  <Route path="/live/:id" element={<LiveStream />} />
                  <Route path="/craft-tutorial" element={<CraftTutorial />} />
                  <Route path="/gifts" element={<GiftFinder />} />
                  <Route path="/profile/:id" element={<Profile />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['buyer', 'artisan', 'admin']} />}>
                    <Route path="/saved-ideas" element={<SavedIdeas />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedRoles={['artisan', 'admin']} />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                  </Route>
                </Routes>
              </main>
              <AIChatbot />
              <Footer />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
