import {
    LayoutDashboard,
    Calendar,
    User,
    BarChart3,
    PlusCircle,
    Wallet,
    Settings
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

export const DASHBOARD_NAV_ITEMS = [
    {
        title: "Overview",
        href: ROUTES.DASHBOARD.HOME,
        icon: LayoutDashboard,
    },
    {
        title: "My Events",
        href: ROUTES.DASHBOARD.EVENTS,
        icon: Calendar,
    },
    {
        title: "Profile",
        href: ROUTES.DASHBOARD.PROFILE,
        icon: User,
    },
];

export const ORG_NAV_ITEMS = [
    {
        title: "Dashboard",
        href: ROUTES.ORG.HOME,
        icon: LayoutDashboard,
    },
    {
        title: "Events",
        href: ROUTES.ORG.EVENTS,
        icon: Calendar,
    },
    {
        title: "Create Event",
        href: ROUTES.ORG.CREATE_EVENT,
        icon: PlusCircle,
    },
    {
        title: "Analytics",
        href: ROUTES.ORG.ANALYTICS,
        icon: BarChart3,
    },
    {
        title: "Payouts",
        href: ROUTES.ORG.PAYOUTS,
        icon: Wallet,
    },
    {
        title: "Settings",
        href: ROUTES.ORG.SETTINGS,
        icon: Settings,
    },
];
