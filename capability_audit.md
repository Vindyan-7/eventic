# Eventic Capability Audit Report

This report presents a comprehensive capability audit of the Eventic platform, analyzing database models, permissions, routes, components, and server services.

---

## 1. Existing Features

| Feature | Status | Details |
| :--- | :--- | :--- |
| **Scanner Login** | **Complete** | Active 6-digit key lookup with token state validation. |
| **Scanner Permissions** | **Partial** | Enforces checks at scan endpoints, but lacks granular gate constraints. |
| **Volunteer Accounts** | **Missing** | Access keys are transient; no persistent volunteer profiles exist. |
| **Organization Members** | **Missing** | Organizations are single-owner; no team management is present. |
| **Verification Queue** | **Complete** | Review queue for organizations with approved/rejected states. |
| **User & Event Moderation** | **Complete** | Suspensions with custom reason logs and event visibility toggles. |
| **Platform Announcements** | **Complete** | Scheduling notices with audience filters (organizers, staff). |
| **Health Self-Diagnostics** | **Complete** | Checks database connections, storage buckets, and SMTP statuses. |

---

## 2. Partial Features

### 🔍 Scanner Access Codes
* **Current**: Generates 6-digit login codes (`event_scan_codes`) linked to events, expiring in the future.
* **Missing**: 
  * Granular scanner permissions (e.g., check-in only vs. ticket viewing).
  * Offline-first storage / local verification cache when connection drops.
  * Volunteer credentials tracking.

### 🚩 Feature Flags
* **Current**: Toggles organizational registration, event creation, and scanner logins.
* **Missing**: 
  * Custom registration forms configurations.
  * Fine-grained routing guards (e.g. locking specific sections).

---

## 3. Database Audit

### 📁 Tables Schema

* `profiles`: User account details. Includes `role` (user/org_admin/super_admin) and `suspension_reason`.
* `organizations`: Host registry. Includes verification status.
* `events`: Event listings. Includes description, custom questions, and featured pins.
* `event_registrations`: Tickets bought. Includes checked-in status and custom answers.
* `payments`: Razorpay transaction logs.
* `payout_accounts` & `payout_requests`: Organizer bank details and platform withdrawal records.
* `event_scan_codes`: Temporary scanner access keys.
* `admin_users`: Platform administrative records. Exposes granular console roles.
* `admin_audit_logs`: Immutable tracking log of all administrative actions.
* `platform_cms`: Homepage customization content.
* `platform_reports`: Abuse logs for fests and users.
* `announcements`: Global broadcast notices.
* `platform_banners`: Emergency top banners.
* `platform_general_settings` / `platform_branding_settings` / `platform_smtp_settings` / `platform_email_templates` / `platform_security_settings` / `platform_feature_flags` / `platform_webhooks` / `platform_api_keys`: Platform settings tables.

### ⚠️ Observations & Redundancies
* **Duplicate Role State**: `profiles.role` enum overlaps with `admin_users.role`. A user can have `role = 'user'` in profiles but exist in `admin_users` as `platform_admin`.
* **Unused Columns**: `payout_requests` is defined but no payout actions exist in the admin actions service yet.

---

## 4. Permission Audit

### 🔐 Administrative Roles Hierarchy
1. **Super Admin**: Bypasses all permissions checks; full system access.
2. **Platform Admin**: Manages fests, users, and verifications queue.
3. **Finance Admin**: Manages payouts and analytics.
4. **Support Admin**: Accesses tickets and scanners logs.
5. **Moderator**: Cancels fests, views abuse logs, suspends accounts.
6. **Viewer**: Read-only dashboard access.

### 🚨 Architectural Risks
* **RLS Policies Deficit**: Supabase RLS policies check database admin presence but do not check specific roles. For example, a `viewer` or `moderator` can bypass database checks at SQL level if the REST client doesn't enforce role limitations.
* **Hardcoded Roles**: Permissions checks are hardcoded as string lists (e.g., `requireRole(["super_admin", "platform_admin"])`) directly in Next.js Server Actions, rather than mapping routes to permission scopes.

---

## 5. Navigation Audit

### 🗺️ Admin Console Routing Namespace (`/admin`)
* `/admin`: Dashboard overview KPIs.
* `/admin/admins`: Super admin access management.
* `/admin/analytics/*`: User growth, host stats, and gate velocities sub-charts.
* `/admin/announcements`: Global notices dashboard.
* `/admin/audit-logs`: Immutable system operations auditing.
* `/admin/cms`: Content blocks configurator.
* `/admin/moderation/*`: User suspensions & event hiding lists.
* `/admin/organizations/verification`: Verified badge approvals.
* `/admin/settings/*`: API keys, SMTP outboxes, backups, and feature flags.

### 🗺️ Organizer Portal (`/org`)
* `/org`: Organizer dashboard.
* `/org/analytics`: Host charts.
* `/org/events/*`: Event creation, editing, scanner setup, and attendee lists.
* `/org/payouts`: Withdrawal requests.

---

## 6. Component Audit

### 📦 Reusable Elements
* **Layout Layouts**: Sidebar navigation, navbar filters, search bars.
* **UI widgets**: `AdminCard`, `AdminTable`, `AdminBadge`, `AdminEmptyState`.
* **Visual Charts**: SVG-rendered `RegistrationTrendChart`, `CategoryDoughnutChart`, `CheckInFlowChart`, `RegistrationHeatmap`.
* **Drawers**: Drawer panels for checking User Profiles, Tickets Details, and Audit Logs metadata.

---

## 7. Service Audit (Server Actions)

* **Verification**: Server actions in `src/app/admin/actions.ts` validate sessions using `requireRole` helpers.
* **Redundancies**:
  * Action names like `suspendUser` and `suspendOrganization` share similar audit logger calls but query distinct tables.
  * Template email parsers can be centralized into a single notification service rather than multiple action helpers.

---

## 8. Feature Matrix

| Feature | Complete | Partial | Missing |
| :--- | :---: | :---: | :---: |
| **Gate QR Scanner** | ✅ | | |
| **Offline Scanner** | | | ✅ |
| **Capacity Management** | ✅ | | |
| **Withdrawals Payouts** | | ✅ | |
| **SMTP Mail Queue** | | ✅ | |
| **Collaborator Members** | | | ✅ |
| **Waitlist Registry** | | | ✅ |

---

## 9. Recommendations

1. **Role Consolidation**: Remove `profiles.role` enum or sync it automatically with `admin_users.role` triggers in database to avoid mismatch states.
2. **Permission Scope Mapping**: Replace inline `requireRole` array checking with permission strings mapped inside a config file.
3. **Database RLS Policies Hardening**: Refactor Supabase RLS policies to check the actual role string from the joining `admin_users` table to enforce serverless security.
