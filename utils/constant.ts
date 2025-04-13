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
  BANKO: "/assets/bank/BANKO.png",
  BYBIT: "/assets/bank/BYBIT.png",
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

export const REINVESTMENT_TYPE = {
  "12 days":
    process.env.NODE_ENV === "development"
      ? "a82d6bf8-d43a-4399-983f-ac6a5332d9a7"
      : "a82d6bf8-d43a-4399-983f-ac6a5332d9a7",
  "14 days":
    process.env.NODE_ENV === "development"
      ? "0987a46a-a314-4434-a692-9d6e3008e72a"
      : "f3c72305-9292-4e88-a33d-ec2ab061299d",
  "6 days":
    process.env.NODE_ENV === "development"
      ? "ed3f5652-fa9b-48d1-80b7-f5acc4daa21d"
      : "ed3f5652-fa9b-48d1-80b7-f5acc4daa21d",
  "1 month": "901724b0-6691-4538-81ba-b359e9f15074",
  "3 months": "3262b247-ef56-47b2-aa51-0c45b9c8dbc4",
  "5 months": "b37e0385-8028-4497-8a5b-4f1396e2e790",
};

export const BONUS_MAPPING = {
  "12 days": 0.06,
  "14 days": 0.006,
  "6 days": 0.006,
  "1 month": 0.01,
  "3 months": 0.03,
  "5 months": 0.05,
};
