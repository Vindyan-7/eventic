ALTER TABLE payments
ADD COLUMN IF NOT EXISTS event_id uuid;

ALTER TABLE payments
ADD COLUMN IF NOT EXISTS user_id uuid;

DROP POLICY IF EXISTS "Users can create payments"
ON public.payments;

CREATE POLICY "Users can create payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id
);

DROP POLICY IF EXISTS "Users can view own payments"
ON public.payments;

CREATE POLICY "Users can view own payments"
ON public.payments
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

CREATE POLICY "Users can update own payments"
ON public.payments
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
)
WITH CHECK (
    user_id = auth.uid()
);

DROP FUNCTION IF EXISTS create_payment(
    uuid,
    uuid,
    numeric,
    text
);

CREATE OR REPLACE FUNCTION create_payment(
    p_event_id uuid,
    p_user_id uuid,
    p_amount numeric,
    p_order_id text
)
RETURNS payments
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_payment payments;
BEGIN
    INSERT INTO payments (
        event_id,
        user_id,
        amount,
        razorpay_order_id,
        status
    )
    VALUES (
        p_event_id,
        p_user_id,
        p_amount,
        p_order_id,
        'pending'
    )
    RETURNING *
    INTO new_payment;

    RETURN new_payment;
END;
$$;

GRANT EXECUTE ON FUNCTION create_payment(
    uuid,
    uuid,
    numeric,
    text
)
TO authenticated;

INSERT INTO storage.buckets (
    id,
    name,
    public
)
VALUES (
    'organization-logos',
    'organization-logos',
    true
)
ON CONFLICT (id)
DO NOTHING;

CREATE POLICY "Allow authenticated uploads to organization-logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'organization-logos'
);

CREATE POLICY "Allow public read access to organization-logos"
ON storage.objects
FOR SELECT
TO public
USING (
    bucket_id = 'organization-logos'
);

User clicks Pay
        ↓
createPaymentOrder()
        ↓
Razorpay Order Created
        ↓
create_payment() RPC
        ↓
payments.status = pending
        ↓
Razorpay Checkout
        ↓
verifyPayment()
        ↓
Signature Verification
        ↓
payments.status = paid
        ↓
event_registration created
        ↓
payments.registration_id updated
        ↓
Already Registered button shown