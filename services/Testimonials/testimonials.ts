export const UploadTestimonial = async (
  data: {
    company_proof_id: string;
    company_proof_video: string;
    company_proof_thumbnail: string;
  }[]
) => {
  const response = await fetch("/api/v1/proof-of-earnings/video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to upload testimonial");
  }

  const result = await response.json();

  return result;
};

export const DeleteTestimonial = async (testimonialId: string) => {
  const response = await fetch(
    `/api/v1/proof-of-earnings/video/${testimonialId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ testimonialId }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete testimonial");
  }

  const result = await response.json();

  return result;
};
