import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://expense-backend-1-6lm2.onrender.com";

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

export const getExpenses = () => API.get("/api/expenses/get");
export const createExpense = (data) => API.post("/api/expenses/create", data);
export const deleteExpense = (id) => API.delete(`/api/expenses/delete/${id}`);

export const getBudgetSummary = () => API.get("/api/budget/summary");
export const setBudget = (amount) =>
  API.post("/api/budget/setBudget", { amount });