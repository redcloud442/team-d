import { alliance_wheel_settings_table } from "@prisma/client";

export const handleUpdateWheelSetting = async (params: {
  color: string;
  label: string;
  percentage: number;
  id: string;
}) => {
  const { id, ...rest } = params;
  const response = await fetch(`/api/v1/wheel/${id}/settings`, {
    method: "PUT",
    body: JSON.stringify(rest),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Something went wrong");
  }

  return data.wheelSettings as alliance_wheel_settings_table;
};
