"use client";

import {
  company_member_table,
  company_referral_link_table,
  user_table,
} from "@/utils/types";
import { createContext, ReactNode, useContext, useState } from "react";

type RoleContextType = {
  profile: user_table;
  teamMemberProfile: company_member_table;
  referral: company_referral_link_table;
  setProfile: ({ profile }: { profile: user_table }) => void;
  setTeamMemberProfile: (
    updater:
      | { teamMemberProfile: company_member_table & user_table }
      | ((
          prev: company_member_table & user_table
        ) => company_member_table & user_table)
  ) => void;

  setReferral: ({
    referral,
  }: {
    referral: company_referral_link_table;
  }) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({
  children,
  initialProfile,
  initialTeamMemberProfile,
  initialReferral,
}: {
  children: ReactNode;
  initialProfile: user_table;
  initialTeamMemberProfile: company_member_table;
  initialReferral: company_referral_link_table;
}) => {
  const [state, setState] = useState({
    profile: initialProfile,
    teamMemberProfile: initialTeamMemberProfile,
    referral: initialReferral,
  });

  const setProfile = ({ profile }: { profile: user_table }) => {
    setState((prev) => ({ ...prev, profile }));
  };

  const setTeamMemberProfile = (
    updater:
      | { teamMemberProfile: company_member_table & user_table }
      | ((
          prev: company_member_table & user_table
        ) => company_member_table & user_table)
  ) => {
    setState((prev) => ({
      ...prev,
      teamMemberProfile:
        typeof updater === "function"
          ? updater({ ...prev.teamMemberProfile, ...prev.profile })
          : updater.teamMemberProfile,
    }));
  };

  const setReferral = ({
    referral,
  }: {
    referral: company_referral_link_table;
  }) => {
    setState((prev) => ({
      ...prev,
      referral,
    }));
  };

  return (
    <RoleContext.Provider
      value={{
        teamMemberProfile: state.teamMemberProfile,
        referral: state.referral,
        setTeamMemberProfile,
        setReferral,
        profile: state.profile,
        setProfile,
      }}
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
