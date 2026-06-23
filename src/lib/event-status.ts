export type EventStatus =
    | "Draft"
    | "Upcoming"
    | "Live"
    | "Completed"
    | "Cancelled";

export function getEventStatus(
    startsAt: string,
    endsAt: string | null,
    dbStatus: string
): EventStatus {
    // Explicit database states

    if (dbStatus === "draft") {
        return "Draft";
    }

    if (dbStatus === "cancelled") {
        return "Cancelled";
    }

    const now = new Date();

    const start =
        new Date(startsAt);

    const end = endsAt
        ? new Date(endsAt)
        : start;

    // Event currently running

    if (
        now >= start &&
        now <= end
    ) {
        return "Live";
    }

    // Event finished

    if (now > end) {
        return "Completed";
    }

    // Future event

    return "Upcoming";
}

export function getEventStatusClasses(
    status: EventStatus
) {
    switch (status) {
        case "Draft":
            return "bg-yellow-100 text-yellow-700 border-yellow-200";

        case "Live":
            return "bg-red-100 text-red-700 border-red-200";

        case "Completed":
            return "bg-gray-100 text-gray-700 border-gray-200";

        case "Cancelled":
            return "bg-red-100 text-red-700 border-red-200";

        case "Upcoming":
        default:
            return "bg-green-100 text-green-700 border-green-200";
    }
}