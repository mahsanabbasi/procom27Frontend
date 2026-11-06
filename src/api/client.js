const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const apiClient = {
  getBaseUrl() {
    return API_BASE_URL;
  },
};

export default apiClient;
