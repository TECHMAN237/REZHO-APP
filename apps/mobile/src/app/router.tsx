import { Navigate, Outlet, createBrowserRouter, useLocation } from 'react-router-dom';
import { PhoneFrame } from '@/components/layout/PhoneFrame';
import { useAppStore } from '@/store/useAppStore';
import { SplashScreen } from '@/features/splash/SplashScreen';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { RegisterScreen } from '@/features/auth/RegisterScreen';
import { ForgotPasswordScreen } from '@/features/auth/ForgotPasswordScreen';
import { HomeScreen } from '@/features/home/HomeScreen';
import { SearchScreen } from '@/features/search/SearchScreen';
import { AccommodationListScreen } from '@/features/accommodations/AccommodationListScreen';
import { AccommodationDetailScreen } from '@/features/accommodations/AccommodationDetailScreen';
import { AccommodationBookingScreen } from '@/features/accommodations/AccommodationBookingScreen';
import { RestaurantListScreen } from '@/features/restaurants/RestaurantListScreen';
import { RestaurantDetailScreen } from '@/features/restaurants/RestaurantDetailScreen';
import { RestaurantReservationScreen } from '@/features/restaurants/RestaurantReservationScreen';
import { VehicleListScreen } from '@/features/vehicles/VehicleListScreen';
import { VehicleDetailScreen } from '@/features/vehicles/VehicleDetailScreen';
import { VehicleBookingScreen } from '@/features/vehicles/VehicleBookingScreen';
import { CheckoutScreen } from '@/features/checkout/CheckoutScreen';
import { BookingSuccessScreen } from '@/features/checkout/BookingSuccessScreen';
import { BookingsScreen } from '@/features/bookings/BookingsScreen';
import { BookingDetailScreen } from '@/features/bookings/BookingDetailScreen';
import { FavoritesScreen } from '@/features/favorites/FavoritesScreen';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { EditProfileScreen } from '@/features/profile/EditProfileScreen';
import { SettingsScreen } from '@/features/profile/SettingsScreen';
import { NotificationsScreen } from '@/features/profile/NotificationsScreen';
import { HelpScreen } from '@/features/profile/HelpScreen';
import { PaymentMethodsScreen } from '@/features/profile/PaymentMethodsScreen';
import { AssistantScreen } from '@/features/assistant/AssistantScreen';

const DARK_STATUS_ROUTES = [/^\/$/, /^\/onboarding/, /^\/(accommodations|restaurants|vehicles)\/[^/]+$/];

function Shell() {
  const { pathname } = useLocation();
  const dark = DARK_STATUS_ROUTES.some((r) => r.test(pathname));
  return (
    <PhoneFrame dark={dark}>
      <Outlet />
    </PhoneFrame>
  );
}

/** Routes that require a (simulated) session. */
function Protected() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

function NotFound() {
  return <Navigate to="/home" replace />;
}

export const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { path: '/', element: <SplashScreen /> },
      { path: '/onboarding', element: <OnboardingScreen /> },
      { path: '/login', element: <LoginScreen /> },
      { path: '/register', element: <RegisterScreen /> },
      { path: '/forgot-password', element: <ForgotPasswordScreen /> },
      {
        element: <Protected />,
        children: [
          { path: '/home', element: <HomeScreen /> },
          { path: '/search', element: <SearchScreen /> },
          { path: '/accommodations', element: <AccommodationListScreen /> },
          { path: '/accommodations/:id', element: <AccommodationDetailScreen /> },
          { path: '/booking/accommodation/:id', element: <AccommodationBookingScreen /> },
          { path: '/restaurants', element: <RestaurantListScreen /> },
          { path: '/restaurants/:id', element: <RestaurantDetailScreen /> },
          { path: '/booking/restaurant/:id', element: <RestaurantReservationScreen /> },
          { path: '/vehicles', element: <VehicleListScreen /> },
          { path: '/vehicles/:id', element: <VehicleDetailScreen /> },
          { path: '/booking/vehicle/:id', element: <VehicleBookingScreen /> },
          { path: '/checkout', element: <CheckoutScreen /> },
          { path: '/booking-success/:id', element: <BookingSuccessScreen /> },
          { path: '/bookings', element: <BookingsScreen /> },
          { path: '/bookings/:id', element: <BookingDetailScreen /> },
          { path: '/favorites', element: <FavoritesScreen /> },
          { path: '/profile', element: <ProfileScreen /> },
          { path: '/profile/edit', element: <EditProfileScreen /> },
          { path: '/profile/settings', element: <SettingsScreen /> },
          { path: '/profile/payment-methods', element: <PaymentMethodsScreen /> },
          { path: '/profile/help', element: <HelpScreen /> },
          { path: '/notifications', element: <NotificationsScreen /> },
          { path: '/assistant', element: <AssistantScreen /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
