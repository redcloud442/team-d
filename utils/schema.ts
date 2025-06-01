import { z } from "zod";

export const depositRequestSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(3, "Deposit at least 150 pesos")
    .max(6, "Amount must be less than 6 digits")
    .regex(/^\d+$/, "Amount must be a number")
    .refine((amount) => parseInt(amount, 10) >= 150, {
      message: "Amount must be at least 100 pesos",
    }),
  topUpMode: z.string().min(1, "MOP is required"),
  accountName: z.string().trim().min(1, "Field is required"),
  accountNumber: z.string().trim().min(1, "Field is required"),
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
    .trim()
    .min(3, "Minimum amount is required atleast 100 pesos")
    .refine((amount) => parseInt(amount.replace(/,/g, ""), 10) >= 100, {
      message: "Amount must be at least 100 pesos",
    }),
  bank: z.string().min(1, "Please select a bank"),
  accountName: z
    .string()
    .trim()
    .min(6, "Account name is required")
    .max(40, "Account name must be at most 24 characters"),
  phoneNumber: z
    .string()
    .trim()
    .min(10, "Phone number is required")
    .max(11, "Phone number must be at most 11 digits"),
  accountNumber: z
    .string()
    .trim()
    .min(6, "Account number is required")
    .max(24, "Account number must be at most 24 digits"),
});

export type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;

// Zod Schema for Login Form
export const LoginSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(6, "Username must be at least 6 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9._]*$/,
      "Username must start with a letter and can only contain letters, numbers, dots, and underscores"
    )
    .refine(
      (val) => !/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu.test(val),
      {
        message: "Username must not contain emojis",
      }
    )
    .refine((val) => !reservedUsernames.includes(val.toLowerCase()), {
      message: "This username is not allowed",
    }),
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
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

// Reserved usernames you want to block (add more as needed)
const reservedUsernames = [
  "admin",
  "root",
  "support",
  "superuser",
  "about",
  "contact",
  "user",
  "null",
  "undefined",
  "test",
];

export const RegisterSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(3, "First name is required")
      .max(50, "First name must be less than 50 characters"),
    lastName: z
      .string()
      .trim()
      .min(3, "Last name is required")
      .max(50, "Last name must be less than 50 characters"),
    userName: z
      .string()
      .trim()
      .min(6, "Username must be at least 6 characters long")
      .max(20, "Username must be at most 20 characters long")
      .regex(
        /^[a-zA-Z][a-zA-Z0-9._]*$/,
        "Username must start with a letter and can only contain letters, numbers, dots, and underscores"
      )
      .refine(
        (val) =>
          !/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu.test(val),
        {
          message: "Username must not contain emojis",
        }
      )
      .refine((val) => !reservedUsernames.includes(val.toLowerCase()), {
        message: "This username is not allowed",
      }),
    botField: z.string().optional(),
    password: z
      .string()
      .trim()
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .trim()
      .min(6, "Confirm Password must be at least 6 characters"),
    email: z.preprocess(
      (val) => (val === "" || val == null ? undefined : val),
      z.string().email("Invalid email address").optional()
    ),
    phoneNumber: z.preprocess(
      (val) => (val === "" || val == null ? undefined : val),
      z
        .string()
        .regex(/^\d+$/, "Phone number must only contain digits")
        .min(10, "Phone number must be at least 10 digits")
        .max(11, "Phone number must be at most 11 digits")
        .optional()
    ),
    gender: z.enum(["MALE", "FEMALE"]),
    referralLink: z.string().optional(),
    sponsor: z.string().optional(),
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

export const RegisterSchemaType = z.object({
  firstName: z
    .string()
    .trim()
    .min(3, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .trim()
    .min(3, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  userName: z
    .string()
    .trim()
    .min(6, "Username must be at least 6 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9._]*$/,
      "Username must start with a letter and can only contain letters, numbers, dots, and underscores"
    )
    .refine(
      (val) => !/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu.test(val),
      {
        message: "Username must not contain emojis",
      }
    )
    .refine((val) => !reservedUsernames.includes(val.toLowerCase()), {
      message: "This username is not allowed",
    }),
  email: z.preprocess(
    (val) => (val === "" || val == null ? undefined : val),
    z.string().email("Invalid email address").optional()
  ),
  phoneNumber: z.preprocess(
    (val) => (val === "" || val == null ? undefined : val),
    z
      .string()
      .regex(/^\d+$/, "Phone number must only contain digits")
      .min(10, "Phone number must be at least 10 digits")
      .max(11, "Phone number must be at most 11 digits")
      .optional()
  ),
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
  botField: z.string().optional(),
  referralLink: z.string().optional(),
  sponsor: z.string().optional(),
});

export type RegisterFormDataType = z.infer<typeof RegisterSchemaType>;

export const ChangePasswordSchema = z
  .object({
    password: z
      .string()
      .trim()
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .trim()
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

export type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>;

export const PromoPackageSchema = (
  maxAmount: number,
  minimumAmount: number,
  maximumAmount: number
) => {
  return z.object({
    amount: z
      .string()
      .trim()
      .min(3, `Minimum amount is ${minimumAmount} pesos`)
      .refine((val) => Number(val) >= minimumAmount, {
        message: `Minimum amount is ${minimumAmount} pesos`,
      })
      .refine((val) => Number(val) <= Number(maxAmount), {
        message: `Amount cannot exceed ${maxAmount}`,
      })
      .refine((val) => Number(val) >= maximumAmount, {
        message: `Amount exceed maximum amount ${maximumAmount}`,
      }),
    packageId: z.string(),
  });
};

export type PromoPackageFormValues = z.infer<
  ReturnType<typeof PromoPackageSchema>
>;
