import api from "./api";

export const getIndustryTypes = async () => {
  try {
    const response = await api.get("/industry-types");
    return response.data;
  } catch (error) {
    console.error("getIndustryTypes error:", error.response?.data || error.message);
    throw error.response?.data || {
      success: false,
      message: "Error loading industry types",
      industryTypes: [],
    };
  }
};

export const createIndustryType = async (payload) => {
  try {
    const response = await api.post("/industry-types", payload);
    return response.data;
  } catch (error) {
    console.error("createIndustryType error:", error.response?.data || error.message);
    throw error.response?.data || { success: false, message: "Error creating industry type" };
  }
};

export const deleteIndustryType = async (industryTypeId) => {
  try {
    const response = await api.delete(`/industry-types/${industryTypeId}`);
    return response.data;
  } catch (error) {
    console.error("deleteIndustryType error:", error.response?.data || error.message);
    throw error.response?.data || { success: false, message: "Error deleting industry type" };
  }
};
