import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { getExpenses, getBudgetSummary } from "./api";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import SummaryCard from "./components/SummaryCard";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ budget: 0, spent: 0, remaining: 0 });
  const [loading, setLoading] = useState(true);
  const appRef = useRef(null);

  const fetchAll = async () => {
    try {
      const [expRes, sumRes] = await Promise.all([getExpenses(), getBudgetSummary()]);
      setExpenses(expRes.data.expenses || []);
      setSummary(sumRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo(".app-header",
        { opacity: 0, y: -24 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
      gsap.fromTo(".main-card",
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.15, delay: 0.2 }
      );
    }
  }, [loading]);

  return (
    <div style={{ minHeight: "100vh", background: "#060d18", padding: "24px 16px" }}>
      <div ref={appRef} style={{ maxWidth: 600, margin: "0 auto" }}>

        <div className="app-header" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", marginBottom: 20,
          background: "linear-gradient(135deg, #071428 0%, #050f1e 100%)",
          borderRadius: 20,
          border: "1px solid rgba(56,189,248,0.12)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(56,189,248,0.08)",
          opacity: 0
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", margin: 0 }}>
              Expense Tracker
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>
              Keep tabs on your spending
            </p>
          </div>
          <span style={{ fontSize: 28, filter: "drop-shadow(0 0 14px rgba(56,189,248,0.6))" }}>💰</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            Loading...
          </div>
        ) : (
          <>
            <SummaryCard summary={summary} onBudgetUpdated={fetchAll} />
            <ExpenseForm onExpenseAdded={fetchAll} />
            <ExpenseList expenses={expenses} onDelete={fetchAll} />
          </>
        )}
      </div>
    </div>
  );
}