import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  FLEET,
  FLEET_PAYMENTS,
  FLEET_RESERVATIONS,
  HOTEL_PAYMENTS,
  HOTEL_RESERVATIONS,
  HOTEL_ROOMS,
  PROVIDER_PROFILES,
  RESTAURANT_DISHES,
  RESTAURANT_PAYMENTS,
  RESTAURANT_RESERVATIONS,
  makeId,
  type BookingStatus,
  type FleetVehicle,
  type Payment,
  type ProviderDish,
  type ProviderKind,
  type ProviderProfile,
  type ProviderReservation,
  type ProviderRoom,
} from '@rezho/shared';

export interface Session {
  kind: ProviderKind;
  email: string;
  remember: boolean;
}

export interface NotificationPrefs {
  newReservation: boolean;
  payment: boolean;
  reminders: boolean;
  marketing: boolean;
  email: boolean;
  sms: boolean;
}

export interface RestaurantHours {
  openDays: number[]; // 1..7 Mon..Sun
  open: string;
  close: string;
  serviceSlots: string[];
  closedDates: string[];
  maxCovers: number;
}

export interface Account {
  name: string;
  email: string;
  phone: string;
}

interface AdminState {
  /** One independent session per partner space: a hotel login never opens the restaurant or vehicle space. */
  sessions: Record<ProviderKind, Session | null>;
  profiles: Record<ProviderKind, ProviderProfile>;
  account: Account;
  rooms: ProviderRoom[];
  dishes: ProviderDish[];
  fleet: FleetVehicle[];
  reservations: Record<ProviderKind, ProviderReservation[]>;
  payments: Record<ProviderKind, Payment[]>;
  restaurantHours: RestaurantHours;
  notifications: Record<ProviderKind, NotificationPrefs>;
  sidebarCollapsed: boolean;

  login: (kind: ProviderKind, email: string, remember: boolean) => void;
  logout: (kind: ProviderKind) => void;
  setSidebarCollapsed: (v: boolean) => void;

  addRoom: (room: Omit<ProviderRoom, 'id' | 'createdAt'>) => ProviderRoom;
  updateRoom: (id: string, patch: Partial<ProviderRoom>) => void;
  deleteRoom: (id: string) => void;
  toggleRoomDate: (id: string, iso: string) => void;

  addDish: (dish: Omit<ProviderDish, 'id' | 'createdAt'>) => ProviderDish;
  updateDish: (id: string, patch: Partial<ProviderDish>) => void;
  deleteDish: (id: string) => void;

  addVehicle: (v: Omit<FleetVehicle, 'id' | 'createdAt'>) => FleetVehicle;
  updateVehicle: (id: string, patch: Partial<FleetVehicle>) => void;
  deleteVehicle: (id: string) => void;
  toggleVehicleDate: (id: string, iso: string) => void;

  setReservationStatus: (kind: ProviderKind, id: string, status: BookingStatus) => void;
  setPaymentStatus: (kind: ProviderKind, id: string, status: Payment['status']) => void;

  updateProfile: (kind: ProviderKind, patch: Partial<ProviderProfile>) => void;
  updateAccount: (patch: Partial<Account>) => void;
  setNotification: (kind: ProviderKind, key: keyof NotificationPrefs, value: boolean) => void;
  setRestaurantHours: (patch: Partial<RestaurantHours>) => void;
  toggleRestaurantClosedDate: (iso: string) => void;

  resetDemo: () => void;
}

const defaultPrefs: NotificationPrefs = { newReservation: true, payment: true, reminders: true, marketing: false, email: true, sms: false };

const initialState = {
  sessions: { hotels: null, restaurants: null, vehicles: null } as Record<ProviderKind, Session | null>,
  profiles: PROVIDER_PROFILES,
  account: { name: 'Clarisse Ngo Bell', email: 'clarisse@rezho.cm', phone: '+237 6 78 45 12 30' },
  rooms: HOTEL_ROOMS,
  dishes: RESTAURANT_DISHES,
  fleet: FLEET,
  reservations: { hotels: HOTEL_RESERVATIONS, restaurants: RESTAURANT_RESERVATIONS, vehicles: FLEET_RESERVATIONS },
  payments: { hotels: HOTEL_PAYMENTS, restaurants: RESTAURANT_PAYMENTS, vehicles: FLEET_PAYMENTS },
  restaurantHours: {
    openDays: [1, 2, 3, 4, 5, 6, 7],
    open: '11:00',
    close: '23:00',
    serviceSlots: ['12:00', '12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30', '21:00'],
    closedDates: ['2026-12-25', '2027-01-01'],
    maxCovers: 60,
  } as RestaurantHours,
  notifications: { hotels: defaultPrefs, restaurants: defaultPrefs, vehicles: defaultPrefs },
  sidebarCollapsed: false,
};

const today = () => new Date().toISOString().slice(0, 10);
const toggleIn = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      ...initialState,

      login: (kind, email, remember) => set((s) => ({ sessions: { ...s.sessions, [kind]: { kind, email, remember } } })),
      logout: (kind) => set((s) => ({ sessions: { ...s.sessions, [kind]: null } })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      addRoom: (room) => {
        const created: ProviderRoom = { ...room, id: makeId('hr'), createdAt: today() };
        set((s) => ({ rooms: [created, ...s.rooms] }));
        return created;
      },
      updateRoom: (id, patch) => set((s) => ({ rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      deleteRoom: (id) => set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) })),
      toggleRoomDate: (id, iso) =>
        set((s) => ({ rooms: s.rooms.map((r) => (r.id === id ? { ...r, unavailableDates: toggleIn(r.unavailableDates, iso) } : r)) })),

      addDish: (dish) => {
        const created: ProviderDish = { ...dish, id: makeId('rd'), createdAt: today() };
        set((s) => ({ dishes: [created, ...s.dishes] }));
        return created;
      },
      updateDish: (id, patch) => set((s) => ({ dishes: s.dishes.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),
      deleteDish: (id) => set((s) => ({ dishes: s.dishes.filter((d) => d.id !== id) })),

      addVehicle: (v) => {
        const created: FleetVehicle = { ...v, id: makeId('fv'), createdAt: today() };
        set((s) => ({ fleet: [created, ...s.fleet] }));
        return created;
      },
      updateVehicle: (id, patch) => set((s) => ({ fleet: s.fleet.map((v) => (v.id === id ? { ...v, ...patch } : v)) })),
      deleteVehicle: (id) => set((s) => ({ fleet: s.fleet.filter((v) => v.id !== id) })),
      toggleVehicleDate: (id, iso) =>
        set((s) => ({ fleet: s.fleet.map((v) => (v.id === id ? { ...v, unavailableDates: toggleIn(v.unavailableDates, iso) } : v)) })),

      setReservationStatus: (kind, id, status) =>
        set((s) => ({
          reservations: { ...s.reservations, [kind]: s.reservations[kind].map((r) => (r.id === id ? { ...r, status } : r)) },
        })),
      setPaymentStatus: (kind, id, status) =>
        set((s) => ({ payments: { ...s.payments, [kind]: s.payments[kind].map((p) => (p.id === id ? { ...p, status } : p)) } })),

      updateProfile: (kind, patch) => set((s) => ({ profiles: { ...s.profiles, [kind]: { ...s.profiles[kind], ...patch } } })),
      updateAccount: (patch) => set((s) => ({ account: { ...s.account, ...patch } })),
      setNotification: (kind, key, value) =>
        set((s) => ({ notifications: { ...s.notifications, [kind]: { ...s.notifications[kind], [key]: value } } })),
      setRestaurantHours: (patch) => set((s) => ({ restaurantHours: { ...s.restaurantHours, ...patch } })),
      toggleRestaurantClosedDate: (iso) =>
        set((s) => ({ restaurantHours: { ...s.restaurantHours, closedDates: toggleIn(s.restaurantHours.closedDates, iso) } })),

      resetDemo: () => set((s) => ({ ...initialState, sessions: s.sessions, sidebarCollapsed: s.sidebarCollapsed })),
    }),
    {
      name: 'rezho-admin-v2',
      partialize: (s) => ({
        sessions: s.sessions,
        profiles: s.profiles,
        account: s.account,
        rooms: s.rooms,
        dishes: s.dishes,
        fleet: s.fleet,
        reservations: s.reservations,
        payments: s.payments,
        restaurantHours: s.restaurantHours,
        notifications: s.notifications,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
    },
  ),
);

/* ---------- Toasts (not persisted) ---------- */

export interface Toast {
  id: string;
  message: string;
  tone: 'success' | 'info' | 'error';
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, tone?: Toast['tone']) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message, tone = 'success') => {
    const id = makeId('toast');
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
