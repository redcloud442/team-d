"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import NavigationLoader from "./NavigationLoader";

const NavigationLoaderClient = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = () => {
    setLoading(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const stopLoading = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLoading(false);
  };

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      stopLoading();
    }
  }, [pathname]);

  useEffect(() => {
    const originalPush = router.push;
    const originalReplace = router.replace;

    router.push = async (...args) => {
      startLoading();
      return originalPush(...args);
    };

    router.replace = async (...args) => {
      startLoading();
      return originalReplace(...args);
    };

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;

      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router]);

  return <NavigationLoader visible={loading} />;
};

export default NavigationLoaderClient;
