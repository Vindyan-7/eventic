import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import QRCode from "qrcode";

export default async function TicketPage({
    params,
}: {
    params: Promise<{
        registrationId: string;
    }>;
}) {
    await requireUser();

    const { registrationId } =
        await params;

    const supabase =
        await createClient();

    const {
        data: registration,
        error,
    } = await supabase
        .from("event_registrations")
        .select(`
            *,
            events (*)
        `)
        .eq("id", registrationId)
        .single();

    if (error || !registration) {
        notFound();
    }

    const qrCode =
        await QRCode.toDataURL(
            registration.id
        );

    return (
        <div className="max-w-2xl mx-auto py-10">
            <div className="rounded-3xl border p-8 space-y-6">
                <div>
                    <h1 className="text-4xl font-bold">
                        Event Ticket
                    </h1>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold">
                        {
                            registration.events
                                .title
                        }
                    </h2>

                    <p className="text-muted-foreground">
                        {
                            registration.events
                                .description
                        }
                    </p>
                </div>

                <div className="space-y-2">
                    <p>
                        📍{" "}
                        {
                            registration.events
                                .venue
                        }
                    </p>

                    <p>
                        📅{" "}
                        {new Date(
                            registration.events.starts_at
                        ).toLocaleString()}
                    </p>
                </div>

                <div className="flex justify-center">
                    <img
                        src={qrCode}
                        alt="Ticket QR"
                        className="rounded-xl border"
                    />
                </div>

                <div className="rounded-xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">
                        Registration ID
                    </p>

                    <code className="break-all">
                        {registration.id}
                    </code>
                </div>

                <div>
                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                        Registered
                    </span>
                </div>
            </div>
        </div>
    );
}