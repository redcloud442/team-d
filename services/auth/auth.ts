import { hashData } from "@/utils/function";
import { SupabaseClient } from "@supabase/supabase-js";

export const createTriggerUser = async (
  supabaseClient: SupabaseClient,
  params: {
    email: string;
    password: string;
    referalLink?: string;
    url: string;
  }
) => {
  const { email, password, referalLink, url } = params;

  const { data: userData, error: userError } = await supabaseClient.auth.signUp(
    { email, password }
  );

  if (userError) throw userError;

  const hashedPassword = await hashData(password);

  const userParams = {
    email,
    password: hashedPassword,
    userId: userData.user?.id,
    referalLink,
    url,
  };

  const { data, error } = await supabaseClient.rpc("create_user_trigger", {
    input_data: userParams,
  });

  if (error) throw error;

  return data;
};

export const loginValidation = async (
  supabaseClient: SupabaseClient,
  params: {
    email: string;
    password: string;
  }
) => {
  const { email, password } = params;

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`, {
    method: "POST",
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      throw new Error("Unexpected HTML response from the server.");
    }

    try {
      const result = await response.json();
      throw new Error(
        result.error || "An error occurred while validating the login."
      );
    } catch (e) {
      throw new Error("An unexpected error occurred.");
    }
  }

  const result = await response.json();

  const { error: signInError } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) throw signInError;

  return result.redirect || "/";
};
