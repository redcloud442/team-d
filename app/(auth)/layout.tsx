import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen h-full flex items-center justify-center sm:p-0 p-0 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-bg-primary z-10 overflow-hidden" />

      {children}
    </section>
  );
}
