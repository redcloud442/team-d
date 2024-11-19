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

  const userParams = {
    email,
    password,
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
