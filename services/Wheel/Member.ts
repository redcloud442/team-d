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
    prize: string;
    count: number;
  };
};
