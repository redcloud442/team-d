import { SupabaseClient } from "@supabase/supabase-js";

export const logError = async (
  supabase: SupabaseClient,
  params: {
    errorMessage: string;
    stackTrace?: string;
    stackPath?: string;
  }
) => {
  const functionName = getFunctionNameFromStack();
  const data = {
    error_message: params.errorMessage,
    stack_trace: params.stackTrace || "",
    stack_path: params.stackPath || "",
    function_name: functionName,
  };
  const { error } = await supabase.rpc("get_error_post", {
    input_data: data,
  });

  if (error) throw error;
};

const getFunctionNameFromStack = (): string => {
  const error = new Error();
  const stackLines = error.stack?.split("\n") || [];
  const callerLine = stackLines[2] || "";
  const match = callerLine.match(/at (\w+)/);
  return match ? match[1] : "UnknownFunction";
};
