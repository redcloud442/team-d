import {
  alliance_member_table,
  alliance_top_up_request_table,
  alliance_withdrawal_request_table,
  merchant_member_table,
  user_history_log,
  user_table,
} from "@prisma/client";

export type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type TopUpRequestData = alliance_top_up_request_table & {
  user_username: string;
  user_first_name: string;
  user_last_name: string;
  user_email: string;
  approver_username: string;
  alliance_member_id: string;
};

export type WithdrawalRequestData = alliance_withdrawal_request_table & {
  user_first_name: string;
  user_last_name: string;
  user_email: string;
  alliance_member_id: string;
  approver_username?: string;
};

export type UserRequestdata = user_table &
  alliance_member_table &
  merchant_member_table;

export type LegionRequestData = user_table & alliance_member_table;

export type UserLog = user_table & user_history_log;

export type ChartData = {
  date: string;
  earnings: number;
  withdraw: number;
};

export type ChartDataMember = {
  package: string;
  completion: number;
  completion_date: string;
  amount: number;
};

export type DashboardEarnings = {
  directReferralAmount: number;
  indirectReferralAmount: number;
  totalEarnings: number;
  withdrawalAmount: number;
};
