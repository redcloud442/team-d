"use client";

import { createContext, ReactNode, useContext, useState } from "react";

type RoleContextType = {
  role: string;
  userName: string;
  setRole: ({ role, userName }: { role: string; userName: string }) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({
  children,
  initialRole,
  initialUserName,
}: {
  children: ReactNode;
  initialRole: string;
  initialUserName: string;
}) => {
  const [state, setState] = useState({
    role: initialRole,
    userName: initialUserName,
  });

  const setRole = ({ role, userName }: { role: string; userName: string }) => {
    setState({ role, userName });
  };

  return (
    <RoleContext.Provider
      value={{ role: state.role, userName: state.userName, setRole }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within a RoleProvider");
  return context;
};
