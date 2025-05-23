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

export const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://www.digi-wealth.vip";

export const MAX_FILE_SIZE_MB = 12;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ACTIVE = "ACTIVE";
export const ENDED = "ENDED";

export const bankData = [
  { bank_name: "Gotyme", bank_image: BANK_IMAGE.GOTYME },
  { bank_name: "Gcash", bank_image: BANK_IMAGE.GOTYME },
  { bank_name: "BPI", bank_image: BANK_IMAGE.GOTYME },
  { bank_name: "PayMaya", bank_image: BANK_IMAGE.GOTYME },
];
