"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { registerForEvent } from "@/services/registrations";
import { createPaymentOrder } from "@/services/payments";
import { verifyPayment } from "@/services/payment-verification";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Props {
  eventId: string;
  isPaid: boolean;
  ticketPrice: number;
  isRegistered: boolean;
  registrationId: string | null;
  isFull: boolean;
  isEventClosed?: boolean;
  eventStatus?: "Draft" | "Upcoming" | "Live" | "Completed" | "Cancelled";
  slug: string;
  isAuthenticated: boolean;
}

export function RegisterButton({
  eventId,
  isPaid,
  ticketPrice,
  isRegistered,
  registrationId,
  isFull,
  isEventClosed,
  eventStatus,
  slug,
  isAuthenticated,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [isOrdering, setIsOrdering] = useState(false);

  const isProcessing = pending || isOrdering;

  if (isEventClosed) {
    return (
      <button
        disabled
        className="w-full rounded-xl bg-muted text-muted-foreground px-6 py-3 cursor-not-allowed font-medium"
      >
        {eventStatus === "Cancelled" ? "Event Cancelled" : "Event Completed"}
      </button>
    );
  }

  if (isFull) {
    return (
      <button
        disabled
        className="w-full rounded-xl bg-red-100 text-red-600 px-6 py-3 cursor-not-allowed font-medium"
      >
        Event Full
      </button>
    );
  }

  if (isRegistered) {
    return (
      <div className="space-y-3">
        <button
          disabled
          className="w-full rounded-xl bg-green-100 text-green-700 px-6 py-3 cursor-not-allowed font-medium"
        >
          ✓ Already Registered
        </button>
        {registrationId && (
          <Link
            href={`/dashboard/events/${registrationId}`}
            className="w-full block text-center rounded-xl bg-black text-white px-6 py-3 font-semibold hover:bg-black/90 transition-colors"
          >
            View Ticket
          </Link>
        )}
      </div>
    );
  }

  async function handleRegister() {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/events/${slug}`)}`);
      return;
    }

    if (!isPaid) {
      startTransition(async () => {
        const result = await registerForEvent(eventId);

        if (result?.error) {
          toast.error(result.error);
          return;
        }

        toast.success("Successfully registered!");
        if (result.registrationId) {
          router.push(`/dashboard/events/${result.registrationId}`);
        } else {
          router.push("/dashboard/events");
        }
      });

      return;
    }

    try {
      setIsOrdering(true);
      const order = await createPaymentOrder(eventId);

      if (!order || "error" in order) {
        toast.error(order?.error ?? "Failed to create payment order");
        setIsOrdering(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: "INR",
        name: "Eventic",
        description: order.eventTitle,
        order_id: order.orderId,
        handler: async (response: any) => {
          startTransition(async () => {
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (result?.error) {
              toast.error(result.error);
              setIsOrdering(false);
              return;
            }

            toast.success("Payment successful & registration completed!");
            if (result.registrationId) {
              router.push(`/dashboard/events/${result.registrationId}`);
            } else {
              router.push("/dashboard/events");
            }
          });
        },
        modal: {
          ondismiss: () => {
            setIsOrdering(false);
          },
        },
      });

      razorpay.open();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      setIsOrdering(false);
    }
  }

  return (
    <button
      onClick={handleRegister}
      disabled={isProcessing}
      className="w-full rounded-xl bg-black text-white px-6 py-3 font-semibold hover:bg-black/90 transition-colors disabled:opacity-50"
    >
      {isProcessing
        ? "Processing..."
        : isPaid
          ? `Pay ₹${ticketPrice}`
          : "Register Now"}
    </button>
  );
}