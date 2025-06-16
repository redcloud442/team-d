import crypto from "crypto";
import { RegisterFormData } from "./types";

// export const hashData = async (data: string) => {
//   const saltRounds = 10;
//   const hashedPassword = await bcrypt.hash(data, saltRounds);

//   return hashedPassword;
// };

export const decryptData = async (encryptedData: string, ivHex: string) => {
  const key = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY;

  if (!key) {
    throw new Error("CRYPTO_SECRET_KEY is not defined");
  }

  if (key.length !== 64) {
    throw new Error(
      "CRYPTO_SECRET_KEY must be a 32-byte (64 characters) hex string"
    );
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key, "hex"),
    Buffer.from(ivHex, "hex")
  );

  let decrypted = decipher.update(encryptedData, "hex", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
};

export const hashData = async (data: string) => {
  const iv = crypto.randomBytes(16);

  const allowedKey = process.env.ALLOWED_CRYPTO_KEY;

  if (!allowedKey) {
    throw new Error("ALLOWED_CRYPTO_KEY is not defined");
  }

  // Ensure only the allowed key is accepted
  if (!allowedKey) {
    throw new Error("The provided key does not match the allowed key");
  }
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(allowedKey, "hex"),
    iv
  );

  let encrypted = cipher.update(data, "utf-8", "hex");
  encrypted += cipher.final("hex");

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
  };
};

export const sanitizeData = (data: RegisterFormData) => {
  const unescapeHtml = (input: string): string => {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = input;
    return textArea.value;
  };

  const sanitizeString = (input: string): string => {
    const unescaped = unescapeHtml(input);
    return unescaped.replace(/<script.*?>.*?<\/script>/gi, "").trim();
  };

  return {
    email: sanitizeString(data.email),
    password: sanitizeString(data.password),
    confirmPassword: sanitizeString(data.confirmPassword),
  };
};

// Utility function to escape special characters in strings
export const escapeString = (value: string): string => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

export const escapeFormData = <T>(data: T): T => {
  const escapeString = (str: string): string => {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
  };

  if (typeof data === "string") {
    return escapeString(data) as T;
  } else if (data instanceof Date) {
    // Handle Date objects by converting them to ISO strings
    return data.toISOString() as unknown as T;
  } else if (Array.isArray(data)) {
    return data.map((item) => escapeFormData(item)) as unknown as T;
  } else if (data instanceof File) {
    // Handle file objects
    const escapedFile = new File(
      [data],
      escapeString(data.name), // Escape the file name
      { type: data.type }
    );
    return escapedFile as unknown as T;
  } else if (typeof data === "object" && data !== null) {
    return Object.keys(data).reduce((acc, key) => {
      acc[key as keyof T] = escapeFormData(data[key as keyof T]);
      return acc;
    }, {} as T);
  }
  return data;
};

export const formatDateToYYYYMMDD = (date: Date | string): string => {
  const inputDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(inputDate.getTime())) {
    return "Invalid date"; // Handle invalid dates gracefully
  }

  // Extract LOCAL time-based date components (adjusted for PH Time)
  const year = String(inputDate.getFullYear()); // Use `getFullYear()` instead of `getUTCFullYear()`
  const month = String(inputDate.getMonth() + 1).padStart(2, "0"); // Use `getMonth()`
  const day = String(inputDate.getDate()).padStart(2, "0"); // Use `getDate()`

  return `${year}-${month}-${day}`;
};

export const formateMonthDateYear = (date: Date | string): string => {
  const inputDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(inputDate.getTime())) {
    return "Invalid date"; // Handle invalid dates gracefully
  }

  const year = String(inputDate.getFullYear()); // Full year
  const month = String(inputDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(inputDate.getDate()).padStart(2, "0");

  return `${month} ${day}, ${year}`;
};

export const formateMonthDateYearv2 = (date: Date | string): string => {
  const inputDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(inputDate.getTime())) {
    return "Invalid date"; // Handle invalid dates gracefully
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const month = monthNames[inputDate.getMonth()]; // Get full month name
  const day = inputDate.getDate(); // No padding for human-friendly format

  return `${month} ${day}`;
};

export const formatTime = (date: Date | string): string => {
  const inputDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(inputDate.getTime())) {
    return "Invalid date"; // Handle invalid dates gracefully
  }

  let hours = inputDate.getHours(); // Get hours (0-23)
  const minutes = String(inputDate.getMinutes()).padStart(2, "0"); // Get minutes with leading zero
  const ampm = hours >= 12 ? "PM" : "AM"; // Determine AM or PM

  hours = hours % 12 || 12; // Convert 24-hour format to 12-hour format (0 becomes 12)

  return `${hours}:${minutes} ${ampm}`;
};

export const formatDay = (date: Date | string): string => {
  const inputDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(inputDate.getTime())) {
    return "Invalid date"; // Handle invalid dates gracefully
  }

  // Force UTC-based day extraction
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = daysOfWeek[inputDate.getUTCDay()]; // Use `getUTCDay()` instead of `getDay()`

  return dayName;
};

export const calculateFinalAmount = (
  amount: number,
  selectedEarnings: string
): number => {
  if (selectedEarnings === "PACKAGE") {
    const fee = amount * 0.1;
    return amount - fee;
  } else if (selectedEarnings === "REFERRAL") {
    const fee = amount * 0.1;
    return amount - fee;
  } else if (selectedEarnings === "WINNING") {
    const fee = amount * 0.1;
    return amount - fee;
  }
  return amount;
};

export const calculateFee = (
  amount: number,
  selectedEarnings: string
): number => {
  if (selectedEarnings === "PACKAGE") {
    const fee = amount * 0.1;
    return fee;
  } else if (selectedEarnings === "REFERRAL") {
    const fee = amount * 0.1;
    return fee;
  } else if (selectedEarnings === "WINNING") {
    return 0;
  }
  return 0;
};

export const userNameToEmail = (userName: string) => {
  // Trim whitespace and sanitize username
  const sanitizedUserName = userName
    .trim() // Remove leading/trailing spaces
    .replace(/[^a-zA-Z0-9._-]/g, ""); // Allow only letters, digits, dots, underscores, and hyphens

  return `${sanitizedUserName}@gmail.com`;
};

export const formatDateToLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const newPackageBonus = (amount: number) => {
  const depositTiers = [{ deposit: 20000, percentage: 0.05 }];

  if (amount < 20000) {
    return {
      amount: 0,
    };
  }

  const lowestTier = depositTiers
    .filter((tier) => tier.deposit <= amount)
    .reduce(
      (prev, curr) => (curr.deposit > prev.deposit ? curr : prev),
      depositTiers[0]
    );

  const depositBonus = lowestTier.percentage * amount;

  return {
    amount: depositBonus,
  };
};

export const supremePlanBonus = (amount: number) => {
  if (amount < 200) {
    return {
      bonusPercentage: 0,
      bonusAmount: 0,
    };
  }

  if (amount >= 200 && amount < 50000) {
    const bonus = amount * 0.25;
    return {
      bonusPercentage: 25,
      bonusAmount: bonus,
    };
  }

  if (amount >= 50000 && amount <= 1000000) {
    const bonus = amount * 0.5;
    return {
      bonusPercentage: 50,
      bonusAmount: bonus,
    };
  }

  return {
    bonusPercentage: 0,
    bonusAmount: 0,
  };
};

export const formatNumberLocale = (number: number) => {
  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const getPhilippinesTime = (
  date: Date,
  time: "start" | "end"
): string => {
  // Adjust the date to Philippine Time (UTC+8)
  const philippinesOffset = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
  const adjustedDate = new Date(date.getTime() + philippinesOffset);

  // Set the start or end of the day based on the time parameter
  if (time === "start") {
    adjustedDate.setUTCHours(0, 0, 0, 0);
  } else {
    adjustedDate.setUTCHours(23, 59, 59, 999);
  }

  // Convert back to UTC for accurate comparisons
  const resultDate = new Date(adjustedDate.getTime() - philippinesOffset);

  // Return ISO string for database queries
  return resultDate.toISOString();
};

export const colorPicker = (text: string) => {
  if (text.toUpperCase().includes("REJECTED")) {
    return "text-red-500";
  }

  if (text.toUpperCase().includes("PENDING")) {
    return "text-bg-primary-blue";
  }

  if (text.toUpperCase().includes("APPROVED")) {
    return "text-green-500";
  }

  if (text.toUpperCase().includes("SUBSCRIPTION")) {
    return "text-green-500";
  }

  if (text.toUpperCase().includes("COLLECTED")) {
    return "text-red-500";
  }

  return "text-gray-400";
};
