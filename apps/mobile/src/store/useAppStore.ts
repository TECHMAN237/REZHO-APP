import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CURRENT_USER,
  SEED_BOOKINGS,
  makeId,
  makeRef,
  type Booking,
  type BookingKind,
  type City,
  type PaymentMethod,
  type PriceLine,
} from '@rezho/shared';

export interface Profile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  city: City;
}

export interface BookingDraft {
  kind: BookingKind;
  itemId: string;
  itemName: string;
  itemImage: string;
  city: City;
  startDate: string;
  endDate?: string;
  time?: string;
  guests: number;
  lines: PriceLine[];
  total: number;
  details: Record<string, string>;
  subtitle?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  at: string;
}

export interface NotificationPrefs {
  push: boolean;
  email: boolean;
  promos: boolean;
  bookingUpdates: boolean;
}

export interface SavedCard {
  id: string;
  brand: 'Visa' | 'Mastercard';
  last4: string;
  holder: string;
}

interface AppState {
  onboarded: boolean;
  isAuthenticated: boolean;
  user: Profile;
  favorites: string[];
  bookings: Booking[];
  draft: BookingDraft | null;
  chat: ChatMessage[];
  notifications: NotificationPrefs;
  cards: SavedCard[];
  mobileMoneyNumber: string;

  completeOnboarding: () => void;
  login: (email: string) => void;
  register: (data: { name: string; email: string; phone: string }) => void;
  logout: () => void;
  toggleFavorite: (id: string) => void;
  setDraft: (draft: BookingDraft | null) => void;
  confirmBooking: (method: PaymentMethod) => Booking | null;
  cancelBooking: (id: string) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'at'>) => void;
  resetChat: () => void;
  setNotification: (key: keyof NotificationPrefs, value: boolean) => void;
  addCard: (card: Omit<SavedCard, 'id'>) => void;
  removeCard: (id: string) => void;
  setMobileMoneyNumber: (n: string) => void;
  resetDemo: () => void;
}

const defaultProfile: Profile = {
  name: CURRENT_USER.name,
  email: CURRENT_USER.email,
  phone: CURRENT_USER.phone,
  avatar: CURRENT_USER.avatar,
  city: 'Yaoundé',
};

const initialChat: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Bonjour ! Je suis l’assistant REZHO. Je peux vous aider à trouver un hébergement, un restaurant ou un véhicule au Cameroun. Que recherchez-vous ?',
    at: new Date().toISOString(),
  },
];

const initialState = {
  onboarded: false,
  isAuthenticated: false,
  user: defaultProfile,
  favorites: ['acc_vallee', 'rest_bantu'],
  bookings: SEED_BOOKINGS,
  draft: null,
  chat: initialChat,
  notifications: { push: true, email: true, promos: false, bookingUpdates: true },
  cards: [{ id: 'card_1', brand: 'Visa' as const, last4: '4821', holder: 'AYESHA KHAN' }],
  mobileMoneyNumber: '+237 6 90 12 34 56',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      completeOnboarding: () => set({ onboarded: true }),

      login: (email) =>
        set((s) => ({
          isAuthenticated: true,
          onboarded: true,
          user: { ...s.user, email: email || s.user.email },
        })),

      register: ({ name, email, phone }) =>
        set((s) => ({
          isAuthenticated: true,
          onboarded: true,
          user: { ...s.user, name, email, phone },
        })),

      logout: () => set({ isAuthenticated: false, draft: null }),

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
        })),

      setDraft: (draft) => set({ draft }),

      confirmBooking: (method) => {
        const draft = get().draft;
        if (!draft) return null;
        const booking: Booking = {
          id: makeId('bk'),
          ref: makeRef('REZ'),
          kind: draft.kind,
          status: 'confirmed',
          itemId: draft.itemId,
          itemName: draft.itemName,
          itemImage: draft.itemImage,
          city: draft.city,
          createdAt: new Date().toISOString(),
          startDate: draft.startDate,
          endDate: draft.endDate,
          time: draft.time,
          guests: draft.guests,
          lines: draft.lines,
          total: draft.total,
          paymentMethod: method,
          paymentStatus: method === 'on_site' ? 'pending' : 'paid',
          details: draft.details,
        };
        set((s) => ({ bookings: [booking, ...s.bookings], draft: null }));
        return booking;
      },

      cancelBooking: (id) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === id ? { ...b, status: 'cancelled', paymentStatus: b.paymentStatus === 'paid' ? 'refunded' : b.paymentStatus } : b,
          ),
        })),

      updateProfile: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),

      addChatMessage: (msg) =>
        set((s) => ({ chat: [...s.chat, { ...msg, id: makeId('msg'), at: new Date().toISOString() }] })),

      resetChat: () => set({ chat: initialChat }),

      setNotification: (key, value) => set((s) => ({ notifications: { ...s.notifications, [key]: value } })),

      addCard: (card) => set((s) => ({ cards: [...s.cards, { ...card, id: makeId('card') }] })),
      removeCard: (id) => set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),
      setMobileMoneyNumber: (n) => set({ mobileMoneyNumber: n }),

      resetDemo: () => set({ ...initialState }),
    }),
    {
      name: 'rezho-mobile-v1',
      partialize: (s) => ({
        onboarded: s.onboarded,
        isAuthenticated: s.isAuthenticated,
        user: s.user,
        favorites: s.favorites,
        bookings: s.bookings,
        draft: s.draft,
        chat: s.chat,
        notifications: s.notifications,
        cards: s.cards,
        mobileMoneyNumber: s.mobileMoneyNumber,
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
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2800);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
