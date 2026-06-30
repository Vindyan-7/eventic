# Eventic — Project Architecture & Codebase Guide

Welcome to Eventic, a trusted ticket discovery and entry gate scanning infrastructure platform. This README serves as a comprehensive system architecture map and audit guide to help developers and AI agents navigate the codebase.

---

## 📂 Project Directory Structure

```
eventic/
├── supabase/
│   └── migrations/               # Database SQL migrations list
├── src/
│   ├── app/                      # Next.js App Router root
│   │   ├── (auth)/               # Login/registration viewports
│   │   ├── (dashboard)/          # Attendee tickets and profile views
│   │   ├── (org)/                # Organizer portal (fests & payouts)
│   │   ├── admin/                # Eventic Administrative Console
│   │   │   ├── admins/           # Admin users list management
│   │   │   ├── analytics/        # User, host, and scanner flow charts
│   │   │   ├── moderation/       # Suspensions and hide triggers
│   │   │   ├── settings/         # SMTP, Branding, Features, and Health
│   │   │   ├── actions.ts        # Consolidated Admin Server Actions
│   │   │   └── page.tsx          # Main KPI stats cards dashboard
│   │   └── page.tsx              # Landing homepage
│   ├── components/               # React components library
│   │   ├── admin/                # Card widgets, tables, sidebar, drawers
│   │   ├── analytics/            # Responsive interactive SVG charts
│   │   └── ui/                   # Basic buttons and inputs elements
│   ├── lib/                      # Helper libraries
│   │   ├── admin/                # requireRole authentication, CSV exports
│   │   └── supabase/             # Supabase server and client factories
│   └── services/                 # Shared data service models
```

---

## 🗄️ Database Schema & Entities

The platform runs on **Supabase PostgreSQL** with Row Level Security (RLS) policies. Refer to the SQL files in the root folder (`001.sql` to `012_platform_settings_integrations.sql`) for complete DDL specifications.

### Core Entities
* **Profiles (`profiles`)**: Users accounts, email links, and suspension reasons logs.
* **Organizations (`organizations`)**: Host profiles with verification badges status.
* **Events (`events`)**: Fest listings with tickets limits, category tags, and feature ranks.
* **Registrations (`event_registrations`)**: Tickets booked, QR scanner codes, and scan records.
* **Audit Logs (`admin_audit_logs`)**: Immutable logging of all console activities.
* **Configurations**: SMTP outboxes, feature flags, webhooks, and partner API credentials tables.

---

## 🔐 Authentication & Role Permissions

Administrative permissions are checked via server-side helpers in [auth.ts](file:///home/vindyan/dataQ/eventic/src/lib/admin/auth.ts):

* **requireAdmin()**: Validates active admin session.
* **requireRole(roles)**: Restricts access to allowed roles:
  * `super_admin`: Full bypass of permissions checks.
  * `platform_admin`: Oversees fests, hosts, and admins.
  * `finance_admin`: Manages analytics dashboards.
  * `support_admin`: Manages scanner keys and ticket disputes.
  * `moderator`: Controls event visibility and suspensions.
  * `viewer`: Read-only stats console.

---

## 📊 Analytics & UI Components

* **Charts Engine**: Interactive SVG visualizers located in [analytics-charts.tsx](file:///home/vindyan/dataQ/eventic/src/components/analytics/analytics-charts.tsx) (Line area velocity, category donuts, check-in bar charts).
* **Console Widgets**: Unified UI cards, tables, badges, headers, and slide-out detail drawers are located in [src/components/admin/ui.tsx](file:///home/vindyan/dataQ/eventic/src/components/admin/ui.tsx) and [src/components/admin/drawers.tsx](file:///home/vindyan/dataQ/eventic/src/components/admin/drawers.tsx).

---

## 🛠️ Server Actions Index

All console administrative operations are located in [actions.ts](file:///home/vindyan/dataQ/eventic/src/app/admin/actions.ts):
* **Users & Hosts**: `suspendUser`, `reactivateUser`, `approveOrganization`, `rejectOrganization`.
* **Events & Tickets**: `featureEvent`, `cancelEvent`, `archiveEvent`, `hideEvent`, `pinEvent`, `cancelTicket`.
* **Configurations**: `updatePlatformGeneralSettings`, `updatePlatformBrandingSettings`, `updatePlatformSMTPSettings`, `updatePlatformEmailTemplate`, `updateFeatureFlag`, `createPlatformWebhook`, `createPlatformAPIKey`.

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Local Environment**:
   Ensure `.env.local` contains valid Supabase URL, Anon Key, and Service Role Keys.
3. **Database Migration**:
   Run SQL scripts sequentially (from `001.sql` to `012_platform_settings_integrations.sql`) in your Supabase SQL Editor.
4. **Start Dev Server**:
   ```bash
   npm run dev
   ```
