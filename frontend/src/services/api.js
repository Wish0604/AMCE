import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const analyzeAnswer = async (payload) => {
  const res = await axios.post(`${API_URL}/analyze`, payload);
  return res.data;
};

export const uploadOcr = async (image) => {
  const formData = new FormData();
  formData.append("image", image);
  const res = await axios.post(`${API_URL}/ocr`, formData);
  return res.data;
};
