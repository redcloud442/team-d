"use client";

import { createClientSide } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LogoutPage = () => {
  const router = useRouter();
  const supabase = createClientSide();
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    const logout = async () => {
      try {
        await supabase.auth.signOut();
        router.refresh();
      } finally {
        setIsLoggingOut(false);
        router.push("/login");
      }
    };

    logout();
  }, [router, supabase]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-bg-primary text-white">
      {isLoggingOut ? (
        <>
          <Loader2 className="animate-spin w-10 h-10 text-blue-400 mb-4" />
          <p className="text-lg font-semibold">Signing you out...</p>
        </>
      ) : (
        <p className="text-lg">Redirecting...</p>
      )}
    </div>
  );
};

export default LogoutPage;
