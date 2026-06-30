"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { X } from "lucide-react";
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
  customQuestions?: any;
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
  customQuestions,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [isOrdering, setIsOrdering] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

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

  const [isWaitlistPending, startWaitlistTransition] = useTransition();

  const handleJoinWaitlist = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/events/${slug}`)}`);
      return;
    }
    startWaitlistTransition(async () => {
      const { joinEventWaitlist } = await import("@/services/waitlist");
      const res = await joinEventWaitlist(eventId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Joined waitlist successfully! Position: #${res.position}`);
      router.refresh();
    });
  };

  if (isFull) {
    return (
      <button
        onClick={handleJoinWaitlist}
        disabled={isWaitlistPending}
        className="w-full rounded-xl bg-orange-600 text-white px-6 py-3 font-semibold hover:bg-orange-500 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isWaitlistPending ? "Joining Waitlist..." : "Join Waitlist"}
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

  async function handleRegister(customAnswers?: Record<string, string>) {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/events/${slug}`)}`);
      return;
    }

    // If there are custom questions and the modal hasn't been shown yet, open it
    const hasQuestions = Array.isArray(customQuestions) && customQuestions.length > 0;
    if (hasQuestions && !customAnswers) {
      setShowModal(true);
      return;
    }

    if (!isPaid) {
      startTransition(async () => {
        const result = await registerForEvent(eventId, customAnswers);

        if (result?.error) {
          toast.error(result.error);
          return;
        }

        toast.success("Successfully registered for event.");
        router.push("/dashboard/events");
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

            toast.success("Successfully registered for event.");
            router.push("/dashboard/events");
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
    <>
      <button
        onClick={() => handleRegister()}
        disabled={isProcessing}
        className="w-full rounded-xl bg-black text-white px-6 py-3 font-semibold hover:bg-black/90 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isProcessing
          ? "Processing..."
          : isPaid
            ? `Pay ₹${ticketPrice}`
            : "Register Now"}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-foreground">Complete Registration</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Please provide the details below.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/50 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowModal(false);
                handleRegister(answers);
              }}
              className="space-y-4"
            >
              {customQuestions.map((q: any) => (
                <div key={q.id} className="space-y-2">
                  <label htmlFor={q.id} className="text-sm font-semibold flex items-center gap-1 text-foreground">
                    {q.label}
                    {q.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {q.type === "select" ? (
                    <div className="relative">
                      <select
                        id={q.id}
                        required={q.required}
                        value={answers[q.id] || ""}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        className="w-full bg-transparent border rounded-xl text-sm font-semibold pr-8 pl-3 py-2 cursor-pointer text-foreground appearance-none h-10 border-input focus:ring-0 focus:outline-none"
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right 10px center', backgroundSize: '16px', backgroundRepeat: 'no-repeat' }}
                      >
                        <option value="" className="bg-card">Select option...</option>
                        {q.options?.map((opt: string) => (
                          <option key={opt} value={opt} className="bg-card">{opt}</option>
                        ))}
                      </select>
                    </div>
                  ) : q.type === "checkbox" ? (
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="checkbox"
                        id={q.id}
                        required={q.required}
                        checked={answers[q.id] === "Yes"}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.checked ? "Yes" : "No" }))}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor={q.id} className="text-xs font-semibold cursor-pointer text-foreground">
                        Confirm/Accept
                      </label>
                    </div>
                  ) : q.type === "number" ? (
                    <input
                      type="number"
                      id={q.id}
                      required={q.required}
                      value={answers[q.id] || ""}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Enter a number..."
                      className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  ) : (
                    <input
                      type="text"
                      id={q.id}
                      required={q.required}
                      value={answers[q.id] || ""}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Write your answer..."
                      className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  )}
                </div>
              ))}

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-bold border rounded-xl hover:bg-muted/50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold bg-black text-white hover:bg-black/90 rounded-xl cursor-pointer"
                >
                  Complete Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}