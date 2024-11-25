import {
  alliance_member_table,
  alliance_top_up_request_table,
  alliance_withdrawal_request_table,
  user_table,
} from "@prisma/client";

export type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type TopUpRequestData = alliance_top_up_request_table & {
  user_first_name: string;
  user_last_name: string;
  user_email: string;
  alliance_member_id: string;
};

export type WithdrawalRequestData = alliance_withdrawal_request_table & {
  user_first_name: string;
  user_last_name: string;
  user_email: string;
  alliance_member_id: string;
};

export type UserRequestdata = user_table & alliance_member_table;
