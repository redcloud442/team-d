export type company_member_table = {
  company_member_id: string;
  company_member_role: string;
  company_member_date_created: Date;
  company_member_company_id: string;
  company_member_user_id: string;
  company_member_restricted: boolean;
  company_member_date_updated: Date | null;
  company_member_is_active: boolean;
};

export type company_withdrawal_request_table = {
  company_withdrawal_request_id: string;
  company_withdrawal_request_amount: number;
  company_withdrawal_request_fee: number;
  company_withdrawal_request_withdraw_amount: number;
  company_withdrawal_request_bank_name: string | null;
  company_withdrawal_request_date: Date;
  company_withdrawal_request_status: string;
  company_withdrawal_request_account: string;
  company_withdrawal_request_type: string;
  company_withdrawal_request_withdraw_type: string | null;
  company_withdrawal_request_member_id: string;
  company_withdrawal_request_approved_by: string | null;
  company_withdrawal_request_date_updated: Date | null;
  company_withdrawal_request_reject_note: string | null;
};

export type company_deposit_request_table = {
  company_deposit_request_id: string;
  company_deposit_request_amount: number;
  company_deposit_request_date: Date;
  company_deposit_request_status: string;
  company_deposit_request_type: string;
  company_deposit_request_account: string;
  company_deposit_request_name: string;
  company_deposit_request_attachment: string;
  company_deposit_request_reject_note: string | null;
  company_deposit_request_member_id: string;
  company_deposit_request_approved_by: string | null;
  company_deposit_request_date_updated: Date | null;
};

export type company_referral_link_table = {
  company_referral_link_id: string;
  company_referral_link_code: string;
  company_referral_link: string;
  company_referral_link_member_id: string;
};

export type company_transaction_table = {
  company_transaction_id: string;
  company_transaction_date: Date;
  company_transaction_description: string;
  company_transaction_details: string | null;
  company_transaction_amount: number | null;
  company_transaction_member_id: string;
  company_transaction_type: string;
  company_transaction_attachment: string | null;
};

export type merchant_member_table = {
  merchant_member_id: string;
  merchant_member_date_created: Date;
  merchant_member_merchant_id: string;
  merchant_member_balance: number;
};

export type user_history_log = {
  user_history_log_id: string;
  user_history_log_date_created: Date;
  user_ip_address: string;
  user_history_user_id: string;
};

export type user_table = {
  user_id: string;
  user_date_created: Date;
  user_username: string;
  user_first_name: string;
  user_last_name: string;
  user_gender: string | null;
  user_email: string | null;
  user_phone_number: string | null;
  user_profile_picture: string | null;
  user_bot_field: boolean;
};

export type dashboard_earnings_summary = {
  member_id: string;
  total_earnings: number;
  total_withdrawals: number;
  package_income: number;
  direct_referral_amount: number;
  indirect_referral_amount: number;
  direct_referral_count: number;
  indirect_referral_count: number;
};

export type merchant_table = {
  merchant_id: string;
  merchant_date_created: Date;
  merchant_account_name: string;
  merchant_account_number: string;
  merchant_account_type: string;
  merchant_qr_attachment: string | null;
};

export type company_earnings_table = {
  company_earnings_id: string;
  company_member_wallet: number;
  company_package_earnings: number;
  company_referral_earnings: number;
  company_combined_earnings: number;
  company_earnings_member_id: string;
};

export type package_table = {
  package_id: string;
  package_name: string;
  package_description: string;
  package_percentage: number;
  packages_days: number;
  package_is_disabled: boolean;
  package_minimum_amount: number;
  package_image: string | null;
  package_is_popular: boolean;
  package_is_highlight: boolean;
};

export type merchant_balance_log = {
  merchant_balance_log_id: string;
  merchant_balance_log_date: Date;
  merchant_balance_log_amount: number;
  merchant_balance_log_user: string;
};

export type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type TopUpRequestData = company_deposit_request_table & {
  user_username: string;
  user_first_name: string;
  user_last_name: string;
  user_email: string;
  user_id: string;
  approver_username: string;
  company_member_id: string;
  count: number;
};

export type PackageHistoryData = {
  package_member_connection_id: string;
  package_name: string;
  package_member_amount: number;
  package_member_amount_earnings: number;
  package_member_status: string;
  package_member_connection_created: string;
};

export type WithdrawalRequestData = company_withdrawal_request_table & {
  user_first_name: string;
  user_last_name: string;
  user_id: string;
  user_email: string;
  company_member_id: string;
  approver_username?: string;
};

export type UserRequestdata = user_table &
  company_member_table &
  merchant_member_table &
  dashboard_earnings_summary;

export type LegionRequestData = user_table &
  company_member_table & {
    total_bounty_earnings: string;
    package_ally_bounty_log_date_created: Date;
    company_referral_date: Date;
  };

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
  is_ready_to_claim: boolean;
  package_connection_id: string;
  package_date_created: string;
  profit_amount: number;
  package_image: string;
  package_member_id: string;
  package_days: number;
  current_amount: number;
  currentPercentage: number;
  package_percentage: number;
};

export type DashboardEarnings = {
  directReferralAmount: number;
  indirectReferralAmount: number;
  totalEarnings: number;
  packageEarnings: number;
  withdrawalAmount: number;
  directReferralCount: number;
  indirectReferralCount: number;
};

export type AdminDashboardDataByDate = {
  activePackageWithinTheDay: number;
  totalActivatedUserByDate: number;
  totalEarnings: number;
  totalWithdraw: number;
  directLoot: number;
  indirectLoot: number;
  totalApprovedWithdrawal: number;
  totalApprovedReceipts: number;
  packageEarnings: number;
  chartData: ChartData[];
  reinvestorsCount: number;
  totalReinvestmentAmount: number;
};

export type AdminDashboardData = {
  numberOfRegisteredUser: number;
  totalActivatedPackage: number;
  totalActivatedUser: number;
  totalSpinPurchase: number;
  totalSpinPurchaseCount: number;
  totalWinningWithdrawal: number;
};

export type AdminTopUpRequestData = {
  data: {
    APPROVED: StatusData;
    REJECTED: StatusData;
    PENDING: StatusData;
  };
  merchantBalance?: number;
  totalPendingDeposit?: number;
  totalApprovedDeposit?: number;
};

export type MerchantTopUpRequestData = {
  data: {
    APPROVED: StatusData;
    REJECTED: StatusData;
    PENDING: StatusData;
  };
  merchantBalance: number;
};

export type StatusData = {
  data: TopUpRequestData[];
  count: number;
};

export type StatusDataWithdraw = {
  data: WithdrawalRequestData[];
  count: number;
};

export type AdminWithdrawaldata = {
  data: {
    APPROVED: StatusDataWithdraw;
    REJECTED: StatusDataWithdraw;
    PENDING: StatusDataWithdraw;
  };
  totalPendingWithdrawal: number;
  totalApprovedWithdrawal: number;
};

export type AdminWithdrawalReportData = {
  total_amount: number;
  total_request: number;
};

export type adminWithdrawalTotalReportData = {
  interval_start: string;
  interval_end: string;
  total_accounting_approvals: string;
  total_admin_approvals: string;
  total_admin_approved_amount: number;
  total_accounting_approved_amount: number;
  total_net_approved_amount: number;
};

export type adminSalesTotalReportData = {
  monthlyTotal: number;
  monthlyCount: number;
  dailyIncome: adminSalesReportData[];
};

export type adminSalesReportData = {
  date: string;
  amount: number;
};

export type adminUserReinvestedReportData = {
  package_member_connection_created: string;
  package_member_amount: number;
  package_member_connection_id: string;
  user_username: string;
  user_id: string;
  user_profile_picture: string;
  user_first_name: string;
  user_last_name: string;
};

export type HeirarchyData = {
  alliance_member_id: string;
  user_username: string;
  user_id: string;
};

export type ModalGuide = {
  isModalOpen: boolean;
  type: "package" | "withdrawal";
};

export type WithdrawListExportData = {
  "Requestor Username": string;
  Status: string;
  Amount: number;
  "Bank Account": string;
  "Bank Name": string;
  "Account Number": string;
  "Withdrawal Type": string;
  "Date Created": string;
  "Date Updated": string;
  "Approved By": string;
};

export type HistoryData = {
  data: company_transaction_table[];
  count: number;
};

export type TransactionHistoryData = {
  data: Partial<Record<"EARNINGS" | "WITHDRAWAL" | "DEPOSIT", HistoryData>>;
};
