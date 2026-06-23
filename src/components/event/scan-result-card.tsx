"use client";

import { CheckInButton } from "./check-in-button";

interface Props {
    attendee: any;
}

export function ScanResultCard({
    attendee,
}: Props) {
    const profile =
        Array.isArray(
            attendee.profiles
        )
            ? attendee.profiles[0]
            : attendee.profiles;

    const event =
        Array.isArray(
            attendee.events
        )
            ? attendee.events[0]
            : attendee.events;

    return (
        <div className="rounded-2xl border p-6 bg-background">

            <h2 className="text-2xl font-bold mb-4">
                Ticket Verified
            </h2>

            <div className="space-y-3">

                <p>
                    <strong>Name:</strong>{" "}
                    {profile?.full_name ??
                        "Unknown"}
                </p>

                <p>
                    <strong>Email:</strong>{" "}
                    {profile?.email}
                </p>

                <p>
                    <strong>Event:</strong>{" "}
                    {event?.title}
                </p>

                <p>
                    <strong>Registered:</strong>{" "}
                    {new Date(
                        attendee.created_at
                    ).toLocaleString()}
                </p>

            </div>

            <div className="mt-6">

                {attendee.checked_in ? (
                    <div className="rounded-xl bg-green-100 p-4 text-green-700">

                        <p className="font-semibold">
                            Already Checked In
                        </p>

                        <p className="text-sm mt-1">
                            {attendee.checked_in_at
                                ? new Date(
                                      attendee.checked_in_at
                                  ).toLocaleString()
                                : ""}
                        </p>

                    </div>
                ) : (
                    <CheckInButton
                        registrationId={
                            attendee.id
                        }
                    />
                )}

            </div>

        </div>
    );
}