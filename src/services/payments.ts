"use server";

import { razorpay } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";

export async function createPaymentOrder(
    eventId: string
) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: "Unauthorized",
        };
    }

    const { data: event, error: eventError } =
        await supabase
            .from("events")
            .select("*")
            .eq("id", eventId)
            .single();

    if (eventError || !event) {
        return {
            error: "Event not found",
        };
    }

    const { data: existingRegistration } =
        await supabase
            .from("event_registrations")
            .select("id")
            .eq("event_id", eventId)
            .eq("user_id", user.id)
            .maybeSingle();

    if (existingRegistration) {
        return {
            error: "Already registered",
        };
    }


    const order =
        await razorpay.orders.create({
            amount:
                Number(event.ticket_price) *
                100,
            currency: "INR",
            receipt: crypto.randomUUID(),
        });

    const {
        data: payment,
        error: paymentError,
    } = await supabase.rpc(
        "create_payment",
        {
            p_event_id: event.id,
            p_user_id: user.id,
            p_amount: event.ticket_price,
            p_order_id: order.id,
        }
    );

    console.log(
        "PAYMENT RPC RESULT",
        payment
    );

    console.log(
        "PAYMENT RPC ERROR",
        paymentError
    );

    if (paymentError) {
        return {
            error: paymentError.message,
        };
    }

    return {
        orderId: order.id,
        amount: order.amount,
        eventTitle: event.title,
    };
}