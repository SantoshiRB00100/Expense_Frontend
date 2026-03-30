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
    <div style={{ minHeight: "100vh", background: "#060d18", padding: "16px 12px" }}>

      {/* global mobile fixes */}
      <style>{`
        * { box-sizing: border-box; }
        body { overflow-x: hidden; }

        .budget-card-inner { padding: 24px; }
        .stat-val-text { font-size: clamp(11px, 3.8vw, 21px) !important; word-break: break-all; }
        .stat-lbl-text { font-size: clamp(8px, 2.2vw, 11px) !important; }
        .stat-cell {
          padding: clamp(8px, 2vw, 16px) clamp(4px, 1.5vw, 10px) !important;
          min-width: 0 !important;
          overflow: hidden !important;
        }
        .stats-grid {
          gap: clamp(6px, 2vw, 16px) !important;
        }

        @media (max-width: 380px) {
          .budget-card-inner { padding: 14px !important; }
          .app-header-inner  { padding: 14px 16px !important; }
          .edit-form-wrap input { font-size: 16px !important; }
        }
      `}</style>

      <div ref={appRef} style={{ maxWidth: 600, margin: "0 auto" }}>

        <div className="app-header app-header-inner" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px", marginBottom: 16,
          background: "linear-gradient(135deg, #071428 0%, #050f1e 100%)",
          borderRadius: 20,
          border: "1px solid rgba(56,189,248,0.12)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(56,189,248,0.08)",
          opacity: 0
        }}>
          <div>
            <h1 style={{ fontSize: "clamp(16px, 4vw, 20px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", margin: 0 }}>
              Expense Tracker
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>
              Keep tabs on your spending
            </p>
          </div>
          <span style={{ fontSize: 26, filter: "drop-shadow(0 0 14px rgba(56,189,248,0.6))" }}>💰</span>
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