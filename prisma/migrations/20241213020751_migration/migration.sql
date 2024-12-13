-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "alliance_schema";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "merchant_schema";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "packages_schema";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "user_schema";

-- CreateEnum
CREATE TYPE "alliance_schema"."Role" AS ENUM ('MEMBER', 'ADMIN', 'MERCHANT', 'ACCOUNTING');

-- CreateEnum
CREATE TYPE "alliance_schema"."ReferralType" AS ENUM ('DIRECT', 'INDIRECT');

-- CreateTable
CREATE TABLE "user_schema"."user_table" (
    "user_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_username" TEXT,
    "user_first_name" TEXT,
    "user_last_name" TEXT,
    "user_email" TEXT NOT NULL,
    "user_password" TEXT NOT NULL,
    "user_iv" TEXT,

    CONSTRAINT "user_table_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_schema"."user_history_log" (
    "user_history_log_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_history_log_date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_ip_address" TEXT NOT NULL,
    "user_history_user_id" UUID NOT NULL,

    CONSTRAINT "user_history_log_pkey" PRIMARY KEY ("user_history_log_id")
);

-- CreateTable
CREATE TABLE "alliance_schema"."alliance_table" (
    "alliance_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "alliance_name" TEXT NOT NULL,
    "alliance_date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alliance_table_pkey" PRIMARY KEY ("alliance_id")
);

-- CreateTable
CREATE TABLE "alliance_schema"."alliance_member_table" (
    "alliance_member_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "alliance_member_role" "alliance_schema"."Role" NOT NULL DEFAULT 'MEMBER',
    "alliance_member_date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alliance_member_alliance_id" UUID NOT NULL,
    "alliance_member_user_id" UUID NOT NULL,
    "alliance_member_restricted" BOOLEAN NOT NULL DEFAULT false,
    "alliance_member_date_updated" TIMESTAMP(3),
    "alliance_member_is_active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "alliance_member_table_pkey" PRIMARY KEY ("alliance_member_id")
);

-- CreateTable
CREATE TABLE "alliance_schema"."alliance_referral_link_table" (
    "alliance_referral_link_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "alliance_referral_link" TEXT NOT NULL,
    "alliance_referral_link_member_id" UUID NOT NULL,

    CONSTRAINT "alliance_referral_link_table_pkey" PRIMARY KEY ("alliance_referral_link_id")
);

-- CreateTable
CREATE TABLE "alliance_schema"."alliance_referral_table" (
    "alliance_referral_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "alliance_referral_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alliance_referral_hierarchy" TEXT,
    "alliance_referral_member_id" UUID NOT NULL,
    "alliance_referral_link_id" UUID NOT NULL,
    "alliance_referral_from_member_id" UUID,

    CONSTRAINT "alliance_referral_table_pkey" PRIMARY KEY ("alliance_referral_id")
);

-- CreateTable
CREATE TABLE "alliance_schema"."alliance_earnings_table" (
    "alliance_earnings_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "alliance_olympus_wallet" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "alliance_olympus_earnings" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "alliance_olympus_loot" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "alliance_ally_bounty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "alliance_legion_bounty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "alliance_earnings_member_id" UUID NOT NULL,

    CONSTRAINT "alliance_earnings_table_pkey" PRIMARY KEY ("alliance_earnings_id")
);

-- CreateTable
CREATE TABLE "alliance_schema"."alliance_top_up_request_table" (
    "alliance_top_up_request_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "alliance_top_up_request_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "alliance_top_up_request_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alliance_top_up_request_status" TEXT NOT NULL DEFAULT 'PENDING',
    "alliance_top_up_request_type" TEXT NOT NULL,
    "alliance_top_up_request_account" TEXT NOT NULL,
    "alliance_top_up_request_name" TEXT NOT NULL,
    "alliance_top_up_request_attachment" TEXT NOT NULL,
    "alliance_top_up_request_reject_note" TEXT,
    "alliance_top_up_request_member_id" UUID NOT NULL,
    "alliance_top_up_request_approved_by" UUID,

    CONSTRAINT "alliance_top_up_request_table_pkey" PRIMARY KEY ("alliance_top_up_request_id")
);

-- CreateTable
CREATE TABLE "alliance_schema"."alliance_withdrawal_request_table" (
    "alliance_withdrawal_request_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "alliance_withdrawal_request_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "alliance_withdrawal_request_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alliance_withdrawal_request_status" TEXT NOT NULL DEFAULT 'APPROVED',
    "alliance_withdrawal_request_account" TEXT NOT NULL DEFAULT 'APPROVED',
    "alliance_withdrawal_request_type" TEXT NOT NULL,
    "alliance_withdrawal_request_withdraw_type" TEXT,
    "alliance_withdrawal_request_member_id" UUID NOT NULL,
    "alliance_withdrawal_request_approved_by" UUID,
    "alliance_withdrawal_request_reject_note" TEXT,

    CONSTRAINT "alliance_withdrawal_request_table_pkey" PRIMARY KEY ("alliance_withdrawal_request_id")
);

-- CreateTable
CREATE TABLE "packages_schema"."package_table" (
    "package_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "package_name" TEXT NOT NULL,
    "package_description" TEXT NOT NULL,
    "package_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "packages_days" INTEGER NOT NULL,

    CONSTRAINT "package_table_pkey" PRIMARY KEY ("package_id")
);

-- CreateTable
CREATE TABLE "packages_schema"."package_member_connection_table" (
    "package_member_connection_id" UUID NOT NULL,
    "package_member_package_id" UUID NOT NULL,
    "package_member_member_id" UUID NOT NULL,
    "package_member_connection_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "package_member_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "package_amount_earnings" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "package_member_status" TEXT NOT NULL,

    CONSTRAINT "package_member_connection_table_pkey" PRIMARY KEY ("package_member_connection_id")
);

-- CreateTable
CREATE TABLE "packages_schema"."package_earnings_log" (
    "package_earnings_log_id" UUID NOT NULL,
    "package_member_connection_id" UUID NOT NULL,
    "package_member_package_id" UUID NOT NULL,
    "package_member_member_id" UUID NOT NULL,
    "package_member_connection_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "package_member_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "package_member_amount_earnings" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "package_member_status" TEXT NOT NULL,

    CONSTRAINT "package_earnings_log_pkey" PRIMARY KEY ("package_earnings_log_id")
);

-- CreateTable
CREATE TABLE "packages_schema"."package_ally_bounty_log" (
    "package_ally_bounty_log_id" UUID NOT NULL,
    "package_ally_bounty_log_date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "package_ally_bounty_member_id" UUID NOT NULL,
    "package_ally_bounty_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "package_ally_bounty_earnings" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "package_ally_bounty_type" TEXT NOT NULL,
    "package_ally_bounty_connection_id" UUID NOT NULL,

    CONSTRAINT "package_ally_bounty_log_pkey" PRIMARY KEY ("package_ally_bounty_log_id")
);

-- CreateTable
CREATE TABLE "merchant_schema"."merchant_table" (
    "merchant_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "merchant_date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "merchant_account_name" TEXT NOT NULL,
    "merchant_account_number" TEXT NOT NULL,
    "merchant_account_type" TEXT NOT NULL,

    CONSTRAINT "merchant_table_pkey" PRIMARY KEY ("merchant_id")
);

-- CreateTable
CREATE TABLE "merchant_schema"."merchant_member_table" (
    "merchant_member_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "merchant_member_date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "merchant_member_merchant_id" UUID NOT NULL,
    "merchant_member_balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "merchant_member_table_pkey" PRIMARY KEY ("merchant_member_id")
);

-- CreateTable
CREATE TABLE "public"."error_table" (
    "error_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "error_message" TEXT NOT NULL,
    "error_stack_trace" TEXT NOT NULL,
    "error_stack_path" TEXT NOT NULL,
    "error_function_name" TEXT NOT NULL,
    "error_date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_table_pkey" PRIMARY KEY ("error_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_table_user_email_key" ON "user_schema"."user_table"("user_email");

-- CreateIndex
CREATE UNIQUE INDEX "alliance_earnings_table_alliance_earnings_member_id_key" ON "alliance_schema"."alliance_earnings_table"("alliance_earnings_member_id");

-- CreateIndex
CREATE INDEX "idx_package_member_package_id" ON "packages_schema"."package_member_connection_table"("package_member_package_id");

-- CreateIndex
CREATE INDEX "idx_package_member_member_id" ON "packages_schema"."package_member_connection_table"("package_member_member_id");

-- CreateIndex
CREATE INDEX "idx_package_earnings_package_id" ON "packages_schema"."package_earnings_log"("package_member_package_id");

-- CreateIndex
CREATE INDEX "idx_package_earnings_member_id" ON "packages_schema"."package_earnings_log"("package_member_member_id");

-- AddForeignKey
ALTER TABLE "user_schema"."user_history_log" ADD CONSTRAINT "user_history_log_user_history_user_id_fkey" FOREIGN KEY ("user_history_user_id") REFERENCES "user_schema"."user_table"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alliance_schema"."alliance_member_table" ADD CONSTRAINT "alliance_member_table_alliance_member_user_id_fkey" FOREIGN KEY ("alliance_member_user_id") REFERENCES "user_schema"."user_table"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alliance_schema"."alliance_member_table" ADD CONSTRAINT "alliance_member_table_alliance_member_alliance_id_fkey" FOREIGN KEY ("alliance_member_alliance_id") REFERENCES "alliance_schema"."alliance_table"("alliance_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alliance_schema"."alliance_referral_link_table" ADD CONSTRAINT "alliance_referral_link_table_alliance_referral_link_member_fkey" FOREIGN KEY ("alliance_referral_link_member_id") REFERENCES "alliance_schema"."alliance_member_table"("alliance_member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alliance_schema"."alliance_referral_table" ADD CONSTRAINT "alliance_referral_table_alliance_referral_member_id_fkey" FOREIGN KEY ("alliance_referral_member_id") REFERENCES "alliance_schema"."alliance_member_table"("alliance_member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alliance_schema"."alliance_referral_table" ADD CONSTRAINT "alliance_referral_table_alliance_referral_link_id_fkey" FOREIGN KEY ("alliance_referral_link_id") REFERENCES "alliance_schema"."alliance_referral_link_table"("alliance_referral_link_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alliance_schema"."alliance_earnings_table" ADD CONSTRAINT "alliance_earnings_table_alliance_earnings_member_id_fkey" FOREIGN KEY ("alliance_earnings_member_id") REFERENCES "alliance_schema"."alliance_member_table"("alliance_member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alliance_schema"."alliance_top_up_request_table" ADD CONSTRAINT "alliance_top_up_request_table_alliance_top_up_request_memb_fkey" FOREIGN KEY ("alliance_top_up_request_member_id") REFERENCES "alliance_schema"."alliance_member_table"("alliance_member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alliance_schema"."alliance_top_up_request_table" ADD CONSTRAINT "alliance_top_up_request_table_alliance_top_up_request_appr_fkey" FOREIGN KEY ("alliance_top_up_request_approved_by") REFERENCES "alliance_schema"."alliance_member_table"("alliance_member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alliance_schema"."alliance_withdrawal_request_table" ADD CONSTRAINT "withdrawal_request_member_fkey" FOREIGN KEY ("alliance_withdrawal_request_member_id") REFERENCES "alliance_schema"."alliance_member_table"("alliance_member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alliance_schema"."alliance_withdrawal_request_table" ADD CONSTRAINT "withdrawal_request_approver_fkey" FOREIGN KEY ("alliance_withdrawal_request_approved_by") REFERENCES "alliance_schema"."alliance_member_table"("alliance_member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages_schema"."package_member_connection_table" ADD CONSTRAINT "package_member_connection_table_package_member_package_id_fkey" FOREIGN KEY ("package_member_package_id") REFERENCES "packages_schema"."package_table"("package_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages_schema"."package_member_connection_table" ADD CONSTRAINT "package_member_connection_table_package_member_member_id_fkey" FOREIGN KEY ("package_member_member_id") REFERENCES "alliance_schema"."alliance_member_table"("alliance_member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages_schema"."package_earnings_log" ADD CONSTRAINT "package_earnings_log_package_member_package_id_fkey" FOREIGN KEY ("package_member_package_id") REFERENCES "packages_schema"."package_table"("package_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages_schema"."package_earnings_log" ADD CONSTRAINT "package_earnings_log_package_member_member_id_fkey" FOREIGN KEY ("package_member_member_id") REFERENCES "alliance_schema"."alliance_member_table"("alliance_member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages_schema"."package_earnings_log" ADD CONSTRAINT "package_earnings_log_package_member_connection_id_fkey" FOREIGN KEY ("package_member_connection_id") REFERENCES "packages_schema"."package_member_connection_table"("package_member_connection_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages_schema"."package_ally_bounty_log" ADD CONSTRAINT "package_ally_bounty_log_package_ally_bounty_member_id_fkey" FOREIGN KEY ("package_ally_bounty_member_id") REFERENCES "alliance_schema"."alliance_member_table"("alliance_member_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages_schema"."package_ally_bounty_log" ADD CONSTRAINT "package_ally_bounty_log_package_ally_bounty_connection_id_fkey" FOREIGN KEY ("package_ally_bounty_connection_id") REFERENCES "packages_schema"."package_member_connection_table"("package_member_connection_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_schema"."merchant_member_table" ADD CONSTRAINT "merchant_member_table_merchant_member_merchant_id_fkey" FOREIGN KEY ("merchant_member_merchant_id") REFERENCES "alliance_schema"."alliance_member_table"("alliance_member_id") ON DELETE CASCADE ON UPDATE CASCADE;
