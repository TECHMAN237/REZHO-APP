# REZHO — Frontend (customer app + provider dashboards)

Plateforme de réservation pour le Cameroun : hébergements, restaurants et location de véhicules.
Ce dépôt contient **le frontend uniquement** (aucun backend, aucune API, données mock locales).

## Architecture

```
REZHO/
├── apps/
│   ├── mobile/   # Application client (mobile-first web, React + Vite + TS + Tailwind) — port 5173
│   └── admin/    # Espace partenaire : dashboards hôtel / restaurant / véhicules (desktop-first) — port 5174
├── packages/
│   └── shared/   # Design tokens, types, helpers (FCFA, dates), catalogue d’images, données mock Cameroun
├── qa/           # Tests Playwright (smoke tests) + captures d’écran
└── package.json  # npm workspaces
```

- **Stack** : React 18, TypeScript (strict), Vite 6, React Router 6, Tailwind CSS 3, Zustand (état + persistance localStorage), Lucide icons.
- **Design tokens** : `packages/shared/src/tokens.ts` (vert REZHO, lime, encre, rayons, ombres) consommés par les deux configs Tailwind.
- **Données mock** : `packages/shared/src/data/` (Yaoundé, Douala, Buea, Limbe, Kribi, Bamenda ; prix en FCFA).
- **Persistance démo** : les réservations, favoris, chambres/plats/véhicules publiés, statuts, paramètres sont sauvegardés dans `localStorage` (clés `rezho-mobile-v1`, `rezho-admin-v2`). Un bouton « Réinitialiser la démo » existe dans chaque app (Profil → Paramètres ; Aide & Support).

## Démarrage

```bash
npm install
npm run dev            # lance les deux apps (mobile 5173 + admin 5174)
# ou séparément
npm run dev:mobile     # http://localhost:5173
npm run dev:admin      # http://localhost:5174
```

Autres commandes :

```bash
npm run typecheck      # tsc --noEmit sur les deux apps
npm run build          # builds de production (apps/*/dist)
node qa/mobile.mjs     # smoke test Playwright de l’app client (serveur 5173 requis)
node qa/admin.mjs      # smoke test Playwright des dashboards (serveur 5174 requis)
node qa/responsive.mjs # vérification des largeurs 375/390/414/430 et 1024/1280/1440/1600
node qa/home.mjs       # accueil : cadre iPhone 11, rotation du carrousel (10 s), bannière dorée
```

Les tests Playwright utilisent le Chrome installé localement (`channel: 'chrome'`).

## URLs

### Application client (mobile)

| Écran | URL |
|---|---|
| Splash → onboarding → connexion | http://localhost:5173/ |
| Connexion / Inscription / Mot de passe oublié | `/login`, `/register`, `/forgot-password` |
| Accueil | `/home` |
| Hébergements / détail / réservation | `/accommodations`, `/accommodations/:id`, `/booking/accommodation/:id` |
| Restaurants / détail / réservation de table | `/restaurants`, `/restaurants/:id`, `/booking/restaurant/:id` |
| Véhicules / détail / location | `/vehicles`, `/vehicles/:id`, `/booking/vehicle/:id` |
| Paiement / confirmation | `/checkout`, `/booking-success/:id` |
| Réservations / détail | `/bookings`, `/bookings/:id` |
| Favoris, Profil, Assistant | `/favorites`, `/profile`, `/assistant` |

Sur desktop, l’app est présentée dans un cadre de téléphone au format iPhone 11 (414 × 896 px). Sur mobile, elle occupe tout l’écran.
Connexion démo : n’importe quel email / mot de passe (≥ 6 caractères).

### Espace partenaire (desktop)

Chaque type d’établissement possède **son propre espace, sa propre adresse de connexion et sa propre session**.
Un hôtel connecté ne peut pas ouvrir l’espace restaurant ni l’espace véhicules (et inversement) : toute tentative
renvoie vers la page de connexion de l’espace visé. Il n’y a aucun sélecteur d’établissement dans la barre latérale.

| Espace | Connexion | Pages |
|---|---|---|
| Portail (choix de l’espace, avant connexion) | http://localhost:5174/partner/login | — |
| Hôtel / Hébergement | http://localhost:5174/partner/hotels/login | `/partner/hotels/dashboard`, `/rooms`, `/rooms/new`, `/rooms/:id/edit`, `/reservations`, `/payments`, `/availability`, `/settings`, `/support` |
| Restaurant | http://localhost:5174/partner/restaurants/login | `/partner/restaurants/dashboard`, `/menu`, `/menu/new`, `/menu/:id/edit`, `/reservations`, `/payments`, `/availability`, `/settings`, `/support` |
| Location de véhicules | http://localhost:5174/partner/vehicles/login | `/partner/vehicles/dashboard`, `/fleet`, `/fleet/new`, `/fleet/:id/edit`, `/reservations`, `/payments`, `/availability`, `/settings`, `/support` |

Toutes les routes fonctionnent en accès direct ; une route protégée sans session renvoie vers la connexion de son espace.
Connexion démo : n’importe quel email / mot de passe (≥ 6 caractères).

## Statut backend

Aucun backend n’est connecté : pas de Supabase, PostgreSQL, Firebase, API ou paiement réel.
Authentification, réservations, paiements et publications sont simulés côté client.

## Déploiement sur Vercel

Un seul projet Vercel suffit : le `vercel.json` racine construit les deux applications et les sert depuis le même domaine.

| Adresse | Application |
|---|---|
| `https://<votre-domaine>/` | Application client |
| `https://<votre-domaine>/admin` | Espaces partenaires (redirige vers `/admin/partner/login`) |
| `https://<votre-domaine>/admin/partner/hotels/login` | Connexion hôtel |
| `https://<votre-domaine>/admin/partner/restaurants/login` | Connexion restaurant |
| `https://<votre-domaine>/admin/partner/vehicles/login` | Connexion location de véhicules |

Réglages Vercel : Root Directory **vide** (racine du dépôt), Node.js 20+, aucune variable d’environnement. La commande
`npm run build:vercel` construit l’application client dans `apps/mobile/dist` puis l’admin (avec `--base=/admin/`) dans
`apps/mobile/dist/admin`. Les règles de réécriture renvoient `/admin/*` vers l’admin et tout le reste vers l’application client.

Alternative : un projet Vercel par application, avec Root Directory `apps/mobile` ou `apps/admin` (chaque dossier a son
propre `vercel.json`). Dans ce cas l’admin est servi à la racine de son domaine (`/partner/hotels/login`).

En cas d’échec de build, ouvrez *Deployments → Build Logs* et vérifiez Root Directory, la version de Node.js et que la
commande d’installation est restée par défaut.
