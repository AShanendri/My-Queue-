import client from "../api/client";

export const getIndustryTypes = async () => {
  const { data } = await client.get("/industry-types");

  if (!data || !Array.isArray(data.industryTypes)) {
    return [];
  }

  return data.industryTypes;
};
