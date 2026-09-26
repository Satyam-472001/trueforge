import axios from "axios";
import ENV from "./env.js";

const headers = ENV.TRUEFORGE.TOKEN
  ? { Authorization: `Bearer ${ENV.TRUEFORGE.TOKEN}` }
  : {};

const trueforgeClient = axios.create({
  baseURL: `${ENV.TRUEFORGE.URL.replace(/\/$/, "")}/api/v1`,
  headers,
  timeout: 30000
});

export default trueforgeClient;