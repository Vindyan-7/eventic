"use client";

import { useTransition } from "react";
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
}

export function RegisterButton({
  eventId,
  isPaid,
  ticketPrice,
  isRegistered,
}: Props) {
  if (isRegistered) {
    return (
      <button
        disabled
        className="rounded-xl bg-green-600 text-white px-6 py-3 cursor-not-allowed"
      >
        ✓ Already Registered
      </button>
    );
  }

  const [pending, startTransition] =
    useTransition();


  async function handleRegister() {
    if (!isPaid) {
      startTransition(
        async () => {
          const result =
            await registerForEvent(
              eventId
            );

          if (
            result?.error
          ) {
            alert(
              result.error
            );
            return;
          }

          alert(
            "Successfully registered!"
          );
        }
      );

      return;
    }

    console.log(
      "RAZORPAY KEY",
      process.env
        .NEXT_PUBLIC_RAZORPAY_KEY_ID
    );
    const order =
      await createPaymentOrder(
        eventId
      );

    console.log("ORDER RESPONSE", order);
    alert(JSON.stringify(order));


    if (
      !order ||
      "error" in order
    ) {
      alert(
        order?.error ??
        "Failed to create payment"
      );
      return;
    }

    const razorpay =
      new window.Razorpay({
        key: process.env
          .NEXT_PUBLIC_RAZORPAY_KEY_ID!,

        amount:
          order.amount,

        currency: "INR",

        name: "Eventic",

        description:
          order.eventTitle,

        order_id:
          order.orderId,

        handler:
          async (
            response: any
          ) => {
            const result =
              await verifyPayment(
                {
                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,
                }
              );

            if (
              result?.error
            ) {
              alert(
                result.error
              );
              return;
            }

            alert(
              "Payment successful & registration completed!"
            );

            window.location.reload();
          },
      });

    razorpay.open();
  }

  return (
    <button
      onClick={
        handleRegister
      }
      disabled={pending}
      className="rounded-xl bg-black text-white px-6 py-3"
    >
      {pending
        ? "Processing..."
        : isPaid
          ? `Pay ₹${ticketPrice}`
          : "Register Now"}
    </button>
  );
}