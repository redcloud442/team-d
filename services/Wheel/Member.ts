import { alliance_wheel_table } from "@prisma/client";

export const handleWheelSpin = async () => {
  const response = await fetch("/api/v1/wheel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Something went wrong");
  }

  return data as {
    prize: number | string;
    count: number;
  };
};

export const handleGetWheenlSpin = async () => {
  const response = await fetch("/api/v1/wheel", {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Something went wrong");
  }

  return data as {
    dailyTask: alliance_wheel_table;
    wheelLog: {
      alliance_wheel_spin_count: number;
    };
  };
};

export const handleBuyWheelSpin = async (quantity: number) => {
  const response = await fetch("/api/v1/wheel", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Something went wrong");
  }

  return data;
};
