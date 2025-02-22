import { alliance_testimonial_table } from "@prisma/client";

export const handleFetchTestimonials = async (params: {
  take: number;
  skip: number;
}) => {
  const response = await fetch(
    `/api/v1/testimonial?take=${params.take}&skip=${params.skip}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch testimonials");
  }

  return data as {
    testimonial: alliance_testimonial_table[];
    total: number;
  };
};

export const handleUploadTestimonial = async (url: string[]) => {
  const response = await fetch(`/api/v1/testimonial`, {
    method: "POST",
    body: JSON.stringify({ url }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to upload url");
  }

  return data as alliance_testimonial_table[];
};

export const handleDeleteTestimonial = async (testimonialId: string) => {
  const response = await fetch(`/api/v1/testimonial/${testimonialId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to delete testimonial");
  }

  return data;
};
