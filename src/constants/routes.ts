export const ROUTES = {
    PUBLIC: {
        HOME: "/",
        EVENTS: "/events",
        EVENT_DETAIL: (slug: string) => `/events/${slug}`,
    },
    AUTH: {
        LOGIN: "/login",
        REGISTER: "/register",
        FORGOT_PASSWORD: "/forgot-password",
    },
    DASHBOARD: {
        HOME: "/dashboard",
        EVENTS: "/dashboard/events",
        PROFILE: "/dashboard/profile",
    },
    ORG: {
        HOME: "/org",
        EVENTS: "/org/events",
        CREATE_EVENT: "/org/events/create",
        ANALYTICS: "/org/analytics",
        PAYOUTS: "/org/payouts",
        SETTINGS: "/org/settings",
    },
    ADMIN: "/admin",
} as const;
