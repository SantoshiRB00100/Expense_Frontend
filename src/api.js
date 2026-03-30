import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://expense-backend-3dls.onrender.com/api";

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 20000
});

export const getExpenses = () => API.get("/expenses/get");
export const createExpense = (data) => API.post("/expenses/create", data);
export const deleteExpense = (id) => API.delete(`/expenses/delete/${id}`);
export const getBudgetSummary = () => API.get("/budget/summary");
export const setBudget = (amount) => API.post("/budget/setBudget", { amount });