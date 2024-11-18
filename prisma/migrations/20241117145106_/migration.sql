-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "user_schema";

-- CreateTable
CREATE TABLE "user_schema"."user_table" (
    "user_id" SERIAL NOT NULL,
    "user_first_name" TEXT NOT NULL,
    "user_last_name" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "user_password" TEXT NOT NULL,
    "user_step" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "user_table_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_table_email_key" ON "user_schema"."user_table"("email");
