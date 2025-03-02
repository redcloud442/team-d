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
