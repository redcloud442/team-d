import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <section className="dark:bg-pageColor bg-pageColor min-h-screen h-full flex items-center justify-center">
      {children}
    </section>
  );
}
