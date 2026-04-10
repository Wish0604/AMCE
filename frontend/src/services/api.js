import axios from "axios";

const explicitApiUrl = import.meta.env.VITE_API_URL;
const fallbackApiUrls = [5000, 5001, 5002, 5003, 5004, 5005].map(
  (port) => `http://localhost:${port}/api`
);

const candidateApiUrls = explicitApiUrl
  ? [explicitApiUrl, ...fallbackApiUrls]
  : fallbackApiUrls;

let activeApiUrl = candidateApiUrls[0];

const postWithDiscovery = async (path, payload, config = {}) => {
  let lastError;

  for (const baseUrl of candidateApiUrls) {
    try {
      const res = await axios.post(`${baseUrl}${path}`, payload, {
        ...config,
        timeout: 30000 // 30 second timeout
      });
      activeApiUrl = baseUrl;
      return res;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
};

export const analyzeAnswer = async (payload) => {
  try {
    const res = await postWithDiscovery("/analyze", payload);
    return res.data;
  } catch (error) {
    console.error("Analysis request failed:", error);
    return {
      success: false,
      error: error.message || "Failed to analyze answer"
    };
  }
};

export const uploadOcr = async (image) => {
  try {
    const formData = new FormData();
    formData.append("image", image);
    const res = await postWithDiscovery("/ocr", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return res.data.data || res.data;
  } catch (error) {
    console.error("OCR upload failed:", error);
    throw error;
  }
};

export const getAnalysisHistory = async () => {
  try {
    const res = await postWithDiscovery("/history", {});
    return res.data;
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return { success: false, data: [] };
  }
};

export const startChallengeQuiz = async (payload) => {
  try {
    const res = await postWithDiscovery("/challenge/start", payload);
    return res.data;
  } catch (error) {
    console.error("Failed to start challenge quiz:", error);
    return {
      success: false,
      error: error.message || "Failed to start challenge quiz"
    };
  }
};

export const submitChallengeQuizAnswer = async (payload) => {
  try {
    const res = await postWithDiscovery("/challenge/answer", payload);
    return res.data;
  } catch (error) {
    console.error("Failed to submit challenge answer:", error);
    return {
      success: false,
      error: error.message || "Failed to submit challenge answer"
    };
  }
};

