import { Navigate, createBrowserRouter, useParams } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
import { PortalPage } from '@/features/auth/PortalPage';
import { ReservationsPage } from '@/features/shared/ReservationsPage';
import { PaymentsPage } from '@/features/shared/PaymentsPage';
import { SettingsPage } from '@/features/shared/SettingsPage';
import { SupportPage } from '@/features/shared/SupportPage';
import { PublishSuccessPage } from '@/features/shared/PublishSuccessPage';
import { HotelDashboardPage } from '@/features/hotels/HotelDashboardPage';
import { RoomsPage } from '@/features/hotels/RoomsPage';
import { RoomWizardPage } from '@/features/hotels/RoomWizardPage';
import { HotelAvailabilityPage } from '@/features/hotels/HotelAvailabilityPage';
import { RestaurantDashboardPage } from '@/features/restaurants/RestaurantDashboardPage';
import { MenuPage } from '@/features/restaurants/MenuPage';
import { DishWizardPage } from '@/features/restaurants/DishWizardPage';
import { RestaurantAvailabilityPage } from '@/features/restaurants/RestaurantAvailabilityPage';
import { VehicleDashboardPage } from '@/features/vehicles/VehicleDashboardPage';
import { FleetPage } from '@/features/vehicles/FleetPage';
import { VehicleWizardPage } from '@/features/vehicles/VehicleWizardPage';
import { FleetAvailabilityPage } from '@/features/vehicles/FleetAvailabilityPage';

/** Each provider space has its own dashboard / inventory / availability pages. */
function KindDashboard() {
  const { kind } = useParams();
  if (kind === 'hotels') return <HotelDashboardPage />;
  if (kind === 'restaurants') return <RestaurantDashboardPage />;
  return <VehicleDashboardPage />;
}

function KindAvailability() {
  const { kind } = useParams();
  if (kind === 'hotels') return <HotelAvailabilityPage />;
  if (kind === 'restaurants') return <RestaurantAvailabilityPage />;
  return <FleetAvailabilityPage />;
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/partner/login" replace /> },
  { path: '/partner', element: <Navigate to="/partner/login" replace /> },
  // Neutral entry point to pick a partner space. Each space has its own login address + session.
  { path: '/partner/login', element: <PortalPage /> },
  { path: '/partner/:kind/login', element: <LoginPage /> },
  {
    path: '/partner/:kind',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <KindDashboard /> },
      { path: 'reservations', element: <ReservationsPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'availability', element: <KindAvailability /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'support', element: <SupportPage /> },
      // Hotels
      { path: 'rooms', element: <RoomsPage /> },
      { path: 'rooms/new', element: <RoomWizardPage /> },
      { path: 'rooms/:id/edit', element: <RoomWizardPage /> },
      { path: 'rooms/success/:id', element: <PublishSuccessPage /> },
      // Restaurants
      { path: 'menu', element: <MenuPage /> },
      { path: 'menu/new', element: <DishWizardPage /> },
      { path: 'menu/:id/edit', element: <DishWizardPage /> },
      { path: 'menu/success/:id', element: <PublishSuccessPage /> },
      // Vehicles
      { path: 'fleet', element: <FleetPage /> },
      { path: 'fleet/new', element: <VehicleWizardPage /> },
      { path: 'fleet/:id/edit', element: <VehicleWizardPage /> },
      { path: 'fleet/success/:id', element: <PublishSuccessPage /> },
      { path: '*', element: <Navigate to="dashboard" replace /> },
    ],
  },
  { path: '*', element: <Navigate to="/partner/login" replace /> },
]);
