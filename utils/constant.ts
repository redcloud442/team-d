export const DIRECTYPE = {
  DIRECT: "DIRECT",
  INDIRECT: "INDIRECT",
};

export const BONUS_TYPE = {
  DIRECT: "alliance_ally_bounty",
  INDIRECT: "alliance_legion_bounty",
};

export const TOP_UP_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

export const WITHDRAWAL_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

export const ROLE = {
  MEMBER: "MEMBER",
  ADMIN: "ADMIN",
};

export const BANK_IMAGE = {
  PAYMAYA: "/assets/bank/MAYA.png",
  "QR PH": "/assets/bank/QRPH.png",
  GOTYME: "/assets/bank/GOTYME.jpg",
};

export const BASE_URL = "https://primepinas.com";

export const MAX_FILE_SIZE_MB = 12;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ACTIVE = "ACTIVE";
export const ENDED = "ENDED";

export const ROADMAP_STEPS = [
  { id: 1, label: "3 referrals + 2 spin", key: "three_referrals" },
  {
    id: 2,
    label: "10 referrals + 5 spin",
    key: "ten_referrals",
  },
  {
    id: 3,
    label: "25 referrals + 15 spin",
    key: "twenty_five_referrals",
  },
  {
    id: 4,
    label: "50 referrals + 35 spin",
    key: "fifty_referrals",
  },
  {
    id: 5,
    label: "100 referrals + 50 spin",
    key: "one_hundred_referrals",
  },
];

export const RECIPT_MAPPING = [
  {
    id: 1,
    label: "Wrong receipt",
    value: "Wrong receipt",
  },
  {
    id: 2,
    label: "Put exact amount",
    value: "Put exact amount",
  },
  {
    id: 3,
    label: "Duplicate receipt",
    value: "Duplicate receipt",
  },
  {
    id: 4,
    label: "Show the reference number",
    value: "Show the reference number",
  },
  {
    id: 5,
    label: "200 is the minimum amount",
    value: "200 is the minimum amount",
  },
  {
    id: 6,
    label: "Please include the date and time of the transaction",
    value: "Please include the date and time of the transaction",
  },
  {
    id: 7,
    label: "Please include the reference number/ID",
    value: "Please include the reference number/ID",
  },
  {
    id: 8,
    label: "Please include the correct amount",
    value: "Please include the correct amount",
  },
];
