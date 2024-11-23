import bcrypt from "bcryptjs";
import { LRUCache } from "lru-cache";
import { RegisterFormData } from "./types";

export const hashData = async (data: string) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(data, saltRounds);

  return hashedPassword;
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

const rateLimiter = new LRUCache({
  max: 1000,
  ttl: 60 * 1000, // 1 minute time-to-live
});

export const applyRateLimit = async (
  teamMemberId: string,
  ipAddress: string
) => {
  if (!teamMemberId) {
    throw new Error("teamMemberId is required for rate limiting.");
  }

  if (!ipAddress) {
    throw new Error("IP address is required for rate limiting.");
  }

  const rateLimitKey = `${teamMemberId}-${ipAddress}`;

  const currentCount = (rateLimiter.get(rateLimitKey) as number) || 0;

  if (currentCount >= 5) {
    throw new Error("Too many requests. Please try again later.");
  }

  rateLimiter.set(rateLimitKey, currentCount + 1);
};

export const loginRateLimit = (ip: string) => {
  const currentCount = (rateLimiter.get(ip) as number) || 0;

  if (currentCount >= 3) {
    throw new Error("Too many requests. Please try again later.");
  }

  rateLimiter.set(ip, currentCount + 1);
};

export const formatDateToYYYYMMDD = (date: Date | string): string => {
  const inputDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(inputDate.getTime())) {
    return "Invalid date"; // Handle invalid dates gracefully
  }

  const year = String(inputDate.getFullYear()); // Full year
  const month = String(inputDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(inputDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
