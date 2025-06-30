import { RegisterSchemaType } from "@/utils/schema";
import { createClientSide } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";

export const createTriggerUser = async (params: {
  userName: string;
  firstName: string;
  lastName: string;
  password: string;
  referalLink?: string;
  url: string;
  captchaToken: string;
  botField: string;
  email: string;
}) => {
  const {
    userName,
    password,
    referalLink,
    url,
    firstName,
    lastName,
    captchaToken,
    botField,
    email,
  } = params;
  const supabase = createClientSide();

  const validate = RegisterSchemaType.safeParse(params);

  const checkUserNameResult = await checkUserName({ userName });

  if (!checkUserNameResult.ok) {
    throw new Error("Username already taken.");
  }

  if (!validate.success) {
    throw new Error(validate.error.message);
  }

  const formatUsername = userName + "@gmail.com";

  const { data: userData, error: userError } = await supabase.auth.signUp({
    email: formatUsername,
    password,
    options: {
      captchaToken,
    },
  });

  if (userError) throw userError;

  const userParams = {
    userName,
    userId: userData.user?.id,
    firstName,
    lastName,
    referalLink,
    url,
    botField,
    email,
  };

  const response = await fetch(`/api/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userParams),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || userError);
  }

  return { success: true };
};

export const loginValidation = async (
  supabaseClient: SupabaseClient,
  params: {
    userName: string;
    password: string;
    captchaToken: string;
  }
) => {
  const { userName, password, captchaToken } = params;

  const formattedUserName = userName + "@gmail.com";

  const response = await fetch(`/api/v1/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userName: userName,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  const { error: signInError } = await supabaseClient.auth.signInWithPassword({
    email: formattedUserName,
    password,
    options: {
      captchaToken,
    },
  });

  if (signInError) throw signInError;

  return;
};

export const checkUserName = async (params: { userName: string }) => {
  const response = await fetch(`/api/v1/auth?userName=${params.userName}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Username already taken.");
  }

  return response;
};

export const checkCode = async (params: { code: string }) => {
  const response = await fetch(`/api/v1/auth/code?code=${params.code}`, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Invalid code.");
  }

  return data as {
    referralLink: string;
  };
};

export const changeUserPassword = async (params: {
  email: string;
  userId: string;
  password: string;
}) => {
  const { email, password, userId } = params;

  const inputData = {
    email,
    clientpass: password,
  };

  const response = await fetch(`/api/user/` + userId, {
    method: "PUT",
    body: JSON.stringify(inputData),
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      throw new Error("Unexpected HTML response from the server.");
    }

    try {
      await response.json();
    } catch (e) {
      throw new Error("An unexpected error occurred.");
    }
  }

  const result = await response.json();

  if (!result) throw new Error();

  return result;
};

export const handleSignInAdmin = async (params: {
  userName: string;
  password: string;
}) => {
  const response = await fetch(`/api/v1/auth/digiAuth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return response;
};
