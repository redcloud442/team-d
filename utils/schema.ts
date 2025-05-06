import { z } from "zod";

export const depositRequestSchema = z.object({
  amount: z
    .string()
    .min(3, "Amount is required and must be at least 200 pesos")
    .max(6, "Amount must be less than 6 digits")
    .regex(/^\d+$/, "Amount must be a number")
    .refine((amount) => parseInt(amount, 10) >= 200, {
      message: "Amount must be at least 200 pesos",
    }),
  topUpMode: z.string().min(1, "Top up mode is required"),
  accountName: z.string().min(1, "Field is required"),
  accountNumber: z.string().min(1, "Field is required"),
  file: z
    .instanceof(File)
    .refine((file) => !!file, { message: "File is required" })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/jpg"].includes(file.type) &&
        file.size <= 12 * 1024 * 1024, // 12MB limit
      { message: "File must be a valid image and less than 12MB." }
    ),
});

export type DepositRequestFormValues = z.infer<typeof depositRequestSchema>;

export const withdrawalFormSchema = z.object({
  earnings: z.string(),
  amount: z
    .string()
    .min(2, "Minimum amount is required atleast 50 pesos")
    .refine((amount) => parseInt(amount.replace(/,/g, ""), 10) >= 50, {
      message: "Amount must be at least 50 pesos",
    }),

  bank: z.string().min(1, "Please select a bank"),
  accountName: z
    .string()
    .min(6, "Account name is required")
    .max(40, "Account name must be at most 24 characters"),
  accountNumber: z
    .string()
    .min(6, "Account number is required")
    .max(24, "Account number must be at most 24 digits"),
});

export type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;

// Zod Schema for Login Form
export const LoginSchema = z.object({
  userName: z
    .string()
    .min(6, "Username must be at least 6 characters long")
    .max(20, "Username must be at most 50 characters long")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9._]*$/,
      "Username must start with a letter and can only contain letters, numbers, dots, and underscores"
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Zod Schema for OTP Form
export const OtpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;
export type OtpFormValues = z.infer<typeof OtpSchema>;

export const RegisterSchema = z
  .object({
    firstName: z
      .string()
      .min(3, "First name is required")
      .max(50, "First name must be less than 50 characters"),
    lastName: z
      .string()
      .min(3, "Last name is required")
      .max(50, "Last name must be less than 50 characters"),
    userName: z
      .string()
      .min(6, "Username must be at least 6 characters long")
      .max(20, "Username must be at most 50 characters long")
      .regex(
        /^[a-zA-Z][a-zA-Z0-9._]*$/,
        "Username must start with a letter and can only contain letters, numbers, dots, and underscores"
      ),
    botField: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters"),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

export type RegisterFormData = z.infer<typeof RegisterSchema>;
