import axios from "axios";
import ENV from "./env.js";

const aiServiceClient = axios.create({
  baseURL: ENV.AI_SERVICE.URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

export default aiServiceClient;
