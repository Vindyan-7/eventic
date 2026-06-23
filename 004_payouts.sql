-- Platform Settings

create table platform_settings (
    id uuid primary key default gen_random_uuid(),

    percentage_fee numeric(5,2) not null default 10,
    fixed_fee_per_ticket numeric(10,2) not null default 5,

    created_at timestamptz default now()
);

insert into platform_settings (
    percentage_fee,
    fixed_fee_per_ticket
)
values (
    10,
    5
);

-- Payout Accounts

create table payout_accounts (
    id uuid primary key default gen_random_uuid(),

    organization_id uuid not null
        references organizations(id)
        on delete cascade,

    payout_type text not null
        check (
            payout_type in (
                'upi',
                'bank'
            )
        ),

    upi_id text,

    account_holder_name text,
    bank_name text,
    account_number text,
    ifsc_code text,

    created_at timestamptz default now(),
    updated_at timestamptz default now(),

    unique (organization_id)
);

-- Payout Requests

create table payout_requests (
    id uuid primary key default gen_random_uuid(),

    organization_id uuid not null
        references organizations(id)
        on delete cascade,

    amount numeric(10,2) not null,

    status text not null
        default 'pending'
        check (
            status in (
                'pending',
                'approved',
                'rejected',
                'paid'
            )
        ),

    requested_at timestamptz default now(),
    processed_at timestamptz
);