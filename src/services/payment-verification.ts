"use server";

import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function verifyPayment(
    payload: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }
) {
    const generated = crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET!
        )
        .update(
            `${payload.razorpay_order_id}|${payload.razorpay_payment_id}`
        )
        .digest("hex");

    if (
        generated !==
        payload.razorpay_signature
    ) {
        return {
            error: "Payment verification failed",
        };
    }

    const supabase =
        await createClient();

    const {
        data: payment,
        error: paymentError,
    } = await supabase
        .from("payments")
        .select("*")
        .eq(
            "razorpay_order_id",
            payload.razorpay_order_id
        )
        .single();

    console.log(
        "PAYMENT FOUND",
        payment
    );

    console.log(
        "PAYMENT FETCH ERROR",
        paymentError
    );

    if (paymentError || !payment) {
        return {
            error: "Payment record not found",
        };
    }

    const {
        error: updateError,
    } = await supabase
        .from("payments")
        .update({
            status: "paid",
            razorpay_payment_id:
                payload.razorpay_payment_id,
        })
        .eq("id", payment.id);

    console.log(
        "PAYMENT UPDATE ERROR",
        updateError
    );

    if (updateError) {
        return {
            error:
                updateError.message,
        };
    }


    const {
        data: existingRegistration,
        error: existingRegistrationError,
    } = await supabase
        .from(
            "event_registrations"
        )
        .select("id")
        .eq(
            "event_id",
            payment.event_id
        )
        .eq(
            "user_id",
            payment.user_id
        )
        .maybeSingle();

    console.log(
        "EXISTING REGISTRATION",
        existingRegistration
    );

    console.log(
        "EXISTING REGISTRATION ERROR",
        existingRegistrationError
    );

    if (
        !existingRegistration
    ) {
        const {
            data: registration,
            error:
            registrationInsertError,
        } = await supabase
            .from(
                "event_registrations"
            )
            .insert({
                event_id:
                    payment.event_id,
                user_id:
                    payment.user_id,
            })
            .select()
            .single();

        console.log(
            "NEW REGISTRATION",
            registration
        );

        console.log(
            "REGISTRATION INSERT ERROR",
            registrationInsertError
        );

        if (
            registrationInsertError
        ) {
            return {
                error:
                    registrationInsertError.message,
            };
        }

        const {
            error: linkError,
        } = await supabase
            .from("payments")
            .update({
                registration_id:
                    registration.id,
            })
            .eq(
                "id",
                payment.id
            );

        console.log(
            "PAYMENT LINK ERROR",
            linkError
        );


        if (
            linkError
        ) {
            return {
                error:
                    linkError.message,
            };
        }

    }

    return {
        success: true,
    };
}