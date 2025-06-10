CREATE POLICY buckets_policy ON storage.buckets FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name) VALUES ('REQUEST_ATTACHMENTS', 'REQUEST_ATTACHMENTS');
INSERT INTO storage.buckets (id, name) VALUES ('USER_PROFILE', 'USER_PROFILE');
INSERT INTO storage.buckets (id, name) VALUES ('PACKAGE_IMAGES', 'PACKAGE_IMAGES');
UPDATE storage.buckets SET public = true;

CREATE EXTENSION IF NOT EXISTS plv8;


DROP VIEW IF EXISTS packages_schema.package_purchase_summary;

CREATE OR REPLACE VIEW packages_schema.package_purchase_summary AS
SELECT
    cmt.company_member_id AS member_id,
    COUNT(*) FILTER (
        WHERE pt.package_name = 'TIER 1'
        AND pmc.package_member_status = 'ACTIVE'
        AND pmc.package_member_connection_created >= CURRENT_DATE
        AND pmc.package_member_connection_created < CURRENT_DATE + INTERVAL '1 day'
    ) AS standard_count,
    COUNT(*) FILTER (
        WHERE pt.package_name = 'TRIAL'
        AND pmc.package_member_status = 'ACTIVE'
        AND pmc.package_member_connection_created >= CURRENT_DATE
        AND pmc.package_member_connection_created < CURRENT_DATE + INTERVAL '1 day'
    ) AS express_count,
FROM company_schema.company_member_table cmt
LEFT JOIN packages_schema.package_member_connection_table pmc 
    ON pmc.package_member_member_id = cmt.company_member_id
LEFT JOIN packages_schema.package_table pt 
    ON pmc.package_member_package_id = pt.package_id
GROUP BY cmt.company_member_id;


DROP view company_schema.dashboard_earnings_summary;
CREATE OR REPLACE VIEW company_schema.dashboard_earnings_summary AS
WITH 
    earnings AS (
        SELECT 
            package_member_member_id AS member_id,
            COALESCE(SUM(package_member_amount::DECIMAL), 0) AS total_amount,
            COALESCE(SUM(package_member_amount_earnings::DECIMAL), 0) AS total_earnings
        FROM packages_schema.package_earnings_log
        WHERE package_member_status = 'ENDED'
        GROUP BY package_member_member_id
    ),
    withdrawals AS (
        SELECT 
            company_withdrawal_request_member_id AS member_id,
            COALESCE(SUM(company_withdrawal_request_amount::DECIMAL), 0) AS total_withdrawals,
            COALESCE(SUM(company_withdrawal_request_fee::DECIMAL), 0) AS total_fee
        FROM company_schema.company_withdrawal_request_table
        WHERE company_withdrawal_request_status = 'APPROVED'
        GROUP BY company_withdrawal_request_member_id
    ),
    direct_referrals AS (
        SELECT 
            package_ally_bounty_member_id AS member_id,
            COUNT(DISTINCT(package_ally_bounty_from)) AS direct_referral_count,
            COALESCE(SUM(package_ally_bounty_earnings::DECIMAL), 0) AS direct_referral_amount
        FROM packages_schema.package_ally_bounty_log
        WHERE package_ally_bounty_type = 'DIRECT'
        GROUP BY package_ally_bounty_member_id
    ),
    indirect_referrals AS (
        SELECT 
            package_ally_bounty_member_id AS member_id,
            COUNT(DISTINCT(package_ally_bounty_from)) AS indirect_referral_count,
            COALESCE(SUM(package_ally_bounty_earnings::DECIMAL), 0) AS indirect_referral_amount
        FROM packages_schema.package_ally_bounty_log
        WHERE package_ally_bounty_type = 'INDIRECT'
        GROUP BY package_ally_bounty_member_id
    )
SELECT 
    m.company_member_id AS member_id,
    COALESCE(
    COALESCE(e.total_earnings, 0) + 
    COALESCE(e.total_amount, 0) + 
    COALESCE(d.direct_referral_amount, 0) + 
    COALESCE(i.indirect_referral_amount, 0), 
0) AS total_earnings,
    COALESCE(w.total_withdrawals - w.total_fee, 0) AS total_withdrawals,
    COALESCE(d.direct_referral_amount, 0) AS direct_referral_amount,
    COALESCE(i.indirect_referral_amount, 0) AS indirect_referral_amount,
    COALESCE(e.total_amount + e.total_earnings, 0) AS package_income,
    COALESCE(d.direct_referral_count, 0) AS direct_referral_count,
    COALESCE(i.indirect_referral_count, 0) AS indirect_referral_count
FROM company_schema.company_member_table m
LEFT JOIN earnings e ON m.company_member_id = e.member_id
LEFT JOIN withdrawals w ON m.company_member_id = w.member_id
LEFT JOIN direct_referrals d ON m.company_member_id = d.member_id
LEFT JOIN indirect_referrals i ON m.company_member_id = i.member_id;


grant usage on schema auth to prisma;
grant usage on schema user_schema to prisma;
grant usage on schema company_schema to prisma;
grant usage on schema packages_schema to prisma;
grant usage on schema merchant_schema to prisma;

grant all on all tables in schema auth to prisma;

grant all on all tables in schema user_schema to prisma;
grant all on all tables in schema company_schema to prisma;
grant all on all tables in schema user_schema to prisma;
grant all on all tables in schema merchant_schema to prisma;
grant all on all tables in schema packages_schema to prisma;