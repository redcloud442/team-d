import bcrypt from "bcryptjs";
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

// Recursive function to escape all string values in an object
export const escapeFormData = <T>(data: T): T => {
  if (typeof data === "string") {
    return escapeString(data) as T;
  } else if (Array.isArray(data)) {
    return data.map((item) => escapeFormData(item)) as unknown as T;
  } else if (typeof data === "object" && data !== null) {
    return Object.keys(data).reduce((acc, key) => {
      acc[key as keyof T] = escapeFormData(data[key as keyof T]);
      return acc;
    }, {} as T);
  }
  return data;
};
