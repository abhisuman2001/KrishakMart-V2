import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Toaster } from './components/ui/sonner';
import { AlertTriangle } from 'lucide-react';

// Layout Components (keep these as regular imports)
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardLayout } from './components/DashboardLayout';
import { FarmerLayout } from './components/FarmerLayout';

// Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 bg-white rounded-2xl shadow-md border border-red-100 max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-gray-500 text-sm mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const ProductListingPage = lazy(() => import('./pages/ProductListingPage').then(m => ({ default: m.ProductListingPage })));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage').then(m => ({ default: m.ProductDetailsPage })));
const ShopPage = lazy(() => import('./pages/ShopPage').then(m => ({ default: m.ShopPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const BecomeSellerPage = lazy(() => import('./pages/BecomeSellerPage').then(m => ({ default: m.BecomeSellerPage })));

// Farmer Pages
const FarmerDashboard = lazy(() => import('./pages/farmer/FarmerDashboard').then(m => ({ default: m.FarmerDashboard })));
const FarmerStorePage = lazy(() => import('./pages/farmer/FarmerStorePage').then(m => ({ default: m.FarmerStorePage })));
const FarmerOrders = lazy(() => import('./pages/farmer/FarmerOrders').then(m => ({ default: m.FarmerOrders })));
const FarmerWishlist = lazy(() => import('./pages/farmer/FarmerWishlist').then(m => ({ default: m.FarmerWishlist })));
const FarmerProfile = lazy(() => import('./pages/farmer/FarmerProfile').then(m => ({ default: m.FarmerProfile })));

// Shop Owner Pages
const ShopOwnerDashboard = lazy(() => import('./pages/shop-owner/ShopOwnerDashboard').then(m => ({ default: m.ShopOwnerDashboard })));
const ShopOwnerProducts = lazy(() => import('./pages/shop-owner/ShopOwnerProducts').then(m => ({ default: m.ShopOwnerProducts })));
const ShopOwnerAddProduct = lazy(() => import('./pages/shop-owner/ShopOwnerAddProduct').then(m => ({ default: m.ShopOwnerAddProduct })));
const ShopOwnerEditProduct = lazy(() => import('./pages/shop-owner/ShopOwnerEditProduct').then(m => ({ default: m.ShopOwnerEditProduct })));
const ShopOwnerOrders = lazy(() => import('./pages/shop-owner/ShopOwnerOrders').then(m => ({ default: m.ShopOwnerOrders })));
const ShopOwnerEarnings = lazy(() => import('./pages/shop-owner/ShopOwnerEarnings').then(m => ({ default: m.ShopOwnerEarnings })));
const ShopOwnerProfile = lazy(() => import('./pages/shop-owner/ShopOwnerProfile').then(m => ({ default: m.ShopOwnerProfile })));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminFarmers = lazy(() => import('./pages/admin/AdminFarmers').then(m => ({ default: m.AdminFarmers })));
const AdminShopOwners = lazy(() => import('./pages/admin/AdminShopOwners').then(m => ({ default: m.AdminShopOwners })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminReports = lazy(() => import('./pages/admin/AdminReports').then(m => ({ default: m.AdminReports })));
const AdminOwnProducts = lazy(() => import('./pages/admin/AdminOwnProducts').then(m => ({ default: m.AdminOwnProducts })));
const AdminAddProduct = lazy(() => import('./pages/admin/AdminAddProduct').then(m => ({ default: m.AdminAddProduct })));
const AdminEditProduct = lazy(() => import('./pages/admin/AdminEditProduct').then(m => ({ default: m.AdminEditProduct })));
const AdminOwnEarnings = lazy(() => import('./pages/admin/AdminOwnEarnings').then(m => ({ default: m.AdminOwnEarnings })));


// Redirect logged-in users away from login/signup
const GuestOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authReady } = useApp();
  if (!authReady) return <LoadingFallback />;
  if (user) {
    switch (user.role) {
      case 'farmer': return <Navigate to="/farmer/store" replace />;
      case 'shopOwner': return <Navigate to="/shop-owner/dashboard" replace />;
      case 'admin': return <Navigate to="/admin/dashboard" replace />;
      default: return <Navigate to="/" replace />;
    }
  }
  return <>{children}</>;
};

// Protected Route Component with Shop Owner restrictions
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[]; blockShopOwner?: boolean }> = ({
  children,
  allowedRoles,
  blockShopOwner = false,
}) => {
  const { user, authReady } = useApp();

  // Wait for auth to be restored from localStorage before redirecting
  if (!authReady) return <LoadingFallback />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (blockShopOwner && user.role === 'shopOwner') {
    return <Navigate to="/shop-owner/dashboard" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Profile Redirect Component
const ProfileRedirect: React.FC = () => {
  const { user, authReady } = useApp();
  if (!authReady) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'farmer': return <Navigate to="/farmer/store" replace />;
    case 'shopOwner': return <Navigate to="/shop-owner/profile" replace />;
    case 'admin': return <Navigate to="/admin/dashboard" replace />;
    default: return <Navigate to="/" replace />;
  }
};

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Layout wrapper for public pages
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

// Home route: redirect farmers to /farmer/store, others see HomePage
const HomeRoute: React.FC = () => {
  const { user, authReady } = useApp();
  if (!authReady) return <LoadingFallback />;
  if (user?.role === 'farmer') return <Navigate to="/farmer/store" replace />;
  return (
    <PublicLayout>
      <Suspense fallback={<LoadingFallback />}>
        <HomePage />
      </Suspense>
    </PublicLayout>
  );
};

// Scroll to top on every route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

function AppContent() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomeRoute />} />
        <Route
          path="/shop"
          element={
            <PublicLayout>
              <ProductListingPage />
            </PublicLayout>
          }
        />
        <Route
          path="/product/:id"
          element={
            <PublicLayout>
              <ProductDetailsPage />
            </PublicLayout>
          }
        />
        <Route
          path="/shop/:sellerId"
          element={
            <PublicLayout>
              <ShopPage />
            </PublicLayout>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={['farmer', 'admin']} blockShopOwner={true}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <CartPage />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={['farmer', 'admin']} blockShopOwner={true}>
              <Suspense fallback={<LoadingFallback />}>
                <CheckoutPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <PublicLayout>
              <AboutPage />
            </PublicLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicLayout>
              <ContactPage />
            </PublicLayout>
          }
        />
        <Route
          path="/become-seller"
          element={
            <PublicLayout>
              <BecomeSellerPage />
            </PublicLayout>
          }
        />
        <Route path="/login" element={
          <Suspense fallback={<LoadingFallback />}>
            <GuestOnlyRoute><LoginPage /></GuestOnlyRoute>
          </Suspense>
        } />
        <Route path="/signup/:userType" element={
          <Suspense fallback={<LoadingFallback />}>
            <GuestOnlyRoute><SignupPage /></GuestOnlyRoute>
          </Suspense>
        } />

        {/* Profile Route - accessible to all logged-in users */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['farmer', 'shopOwner', 'admin']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  {/* We'll use role-specific profile components */}
                  <ProfileRedirect />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Farmer Routes */}
        <Route
          path="/farmer/store"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerLayout>
                <FarmerStorePage />
              </FarmerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <FarmerDashboard />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/orders"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <FarmerOrders />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/wishlist"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <FarmerWishlist />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer/profile"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <FarmerProfile />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Shop Owner Routes */}
        <Route
          path="/shop-owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['shopOwner']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <ShopOwnerDashboard />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop-owner/products"
          element={
            <ProtectedRoute allowedRoles={['shopOwner']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <ShopOwnerProducts />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop-owner/add-product"
          element={
            <ProtectedRoute allowedRoles={['shopOwner']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <ShopOwnerAddProduct />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop-owner/edit-product/:id"
          element={
            <ProtectedRoute allowedRoles={['shopOwner']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <ShopOwnerEditProduct />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop-owner/orders"
          element={
            <ProtectedRoute allowedRoles={['shopOwner']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <ShopOwnerOrders />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop-owner/earnings"
          element={
            <ProtectedRoute allowedRoles={['shopOwner']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <ShopOwnerEarnings />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop-owner/profile"
          element={
            <ProtectedRoute allowedRoles={['shopOwner']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <ShopOwnerProfile />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/farmers"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminFarmers />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shop-owners"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminShopOwners />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminProducts />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminOrders />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminReports />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/my-products"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminOwnProducts />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-product"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminAddProduct />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/edit-product/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminEditProduct />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/earnings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminOwnEarnings />
                </Suspense>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </AppProvider>
  );
}