import axios from "axios";

const BASE_URL = "https://expense-backend-220g.onrender.com/api";

export const getExpenses = () => axios.get(`${BASE_URL}/expenses/get`);
export const createExpense = (data) => axios.post(`${BASE_URL}/expenses/create`, data);
export const deleteExpense = (id) => axios.delete(`${BASE_URL}/expenses/delete/${id}`);
export const getBudgetSummary = () => axios.get(`${BASE_URL}/budget/summary`);
export const setBudget = (amount) => axios.post(`${BASE_URL}/budget/setBudget`, { amount });