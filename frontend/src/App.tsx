import { BrowserRouter, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

// Layouts
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Customer Pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { SearchPage } from '@/pages/SearchPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { WishlistPage } from '@/pages/WishlistPage';
import { ComparePage } from '@/pages/ComparePage';
import { CustomizePage } from '@/pages/CustomizePage';
import { WholesalePage } from '@/pages/WholesalePage';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminProducts } from '@/pages/admin/AdminProducts';
import { AdminOrders } from '@/pages/admin/AdminOrders';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminVouchers } from '@/pages/admin/AdminVouchers';
import { AdminInventory } from '@/pages/admin/AdminInventory';
import { AdminReports } from '@/pages/admin/AdminReports';

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <TooltipProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Auth pages (no layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Customer pages with layout */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrdersPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/customize" element={<CustomizePage />} />
              <Route path="/wholesale" element={<WholesalePage />} />
            </Route>

            {/* Admin pages with layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="vouchers" element={<AdminVouchers />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </>
  );
}

export default App;
