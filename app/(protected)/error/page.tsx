"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Custom500() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-red-100 rounded-full blur-2xl opacity-20"></div>
      </div>

      <Card className="relative w-full max-w-lg p-8 shadow-2xl bg-white rounded-2xl border-t-4 border-red-500">
        <CardHeader className="flex items-center justify-center">
          <AlertTriangle className="w-20 h-20 text-red-500 animate-bounce" />
        </CardHeader>
        <CardTitle className="text-6xl font-extrabold text-center text-red-600 mb-6 drop-shadow-lg">
          500
        </CardTitle>
        <CardContent>
          <p className="text-gray-700 text-lg text-center mb-8 leading-relaxed">
            We&apos;re experiencing some technical difficulties. Please bear
            with us while we resolve the issue.
          </p>
          <div className="flex justify-center">
            <Button
              onClick={handleGoHome}
              variant="default"
              className="px-6 py-3 text-lg font-semibold bg-red-500 hover:bg-red-600 text-white transition-transform transform hover:scale-105"
            >
              Go Back Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
