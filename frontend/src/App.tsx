import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CartDrawer } from './components/CartDrawer';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Shop from './pages/Shop';
import ProductPage from './pages/ProductPage';
import Profile from './pages/Profile';
import About from './pages/about';
import ProductDetail from './pages/ProductDetail';
import Home from './pages/Home';
import {AdminRoute} from './routes/AdminRoute';
import {CustomerRoute} from './routes/CustomerRoute';
import AdminHome from './pages/admin/adminHome';
import AdminDashboard from './pages/admin/adminDashboard';
import AdminProducts from './pages/admin/adminProducts';
import AdminCategory from './pages/admin/adminCategories';
import AdminOrders from './pages/admin/adminOrder';
import AdminCustomers from './pages/admin/adminCustomers';
import Checkout from './pages/CheckOut';
import Orders from './pages/MyOrders';
import {Toaster} from 'react-hot-toast';
import ClientCustomOrders from './pages/CustomOrder';
import AdminCustomOrders from './pages/admin/adminCustomOrders';


export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster position="bottom-center" toastOptions={{ duration : 3000}}/>
        <Router>
          <CartDrawer />
          <Routes>
          <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/productDetail" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route element={<CustomerRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/custom-orders" element={<ClientCustomOrders />} />
            </Route>
            
            <Route element={<AdminRoute />}>
              <Route element={<AdminHome />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} /> 
                <Route path="/admin/categories" element={<AdminCategory />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/customers" element={<AdminCustomers />} />
                <Route path="/admin/custom-orders" element={<AdminCustomOrders />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;