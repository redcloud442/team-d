// context/RoleContext.tsx
"use client";

import { createContext, useContext, useState } from "react";

type RoleContextType = {
  role: string;
  setRole: (role: string) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({
  children,
  initialRole,
}: {
  children: React.ReactNode;
  initialRole: string;
}) => {
  const [role, setRole] = useState(initialRole);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within a RoleProvider");
  return context;
};
