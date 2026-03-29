import { useState, useEffect } from "react";
import { gsap } from "gsap";
import { createExpense } from "../api";

const CATEGORIES = ["Food","Transport","Shopping","Health","Bills","Entertainment","Other"];

export default function ExpenseForm({ onExpenseAdded }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ title:"", amount:"", category:"Food" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // pulse glow on add button
  useEffect(() => {
    gsap.to(".add-expense-btn", {
      boxShadow: "0 0 38px rgba(56,189,248,0.5), 0 4px 14px rgba(0,0,0,0.4)",
      duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut"
    });
  }, []);

  // animate form open
  useEffect(() => {
    if (step > 0) {
      gsap.fromTo(".expense-form-inner",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
      );
    }
  }, [step]);

  const handleChange = (e) => { setForm({...form, [e.target.name]: e.target.value}); setError(""); };

  const handleTitleNext = (e) => {
    if (e.key === "Enter") { if (!form.title.trim()) return setError("Enter a title."); setError(""); setStep(2); }
    if (e.key === "Escape") handleClose();
  };

  const handleSave = async () => {
  if (!form.amount || Number(form.amount) <= 0) return setError("Enter a valid amount.");
  setLoading(true);

  try {
    await createExpense({ ...form, amount: Number(form.amount) });

    handleClose();

    if (onExpenseAdded) onExpenseAdded();
  } catch {
    setError("Failed to add expense.");
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => { setStep(0); setForm({title:"",amount:"",category:"Food"}); setError(""); };

  const card = {
    background:"linear-gradient(145deg,#071428 0%,#050e1b 100%)",
    borderRadius:24, padding:24, marginBottom:16,
    border:"1px solid rgba(56,189,248,0.08)",
    boxShadow:"0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(56,189,248,0.05)",
  };

  const inputStyle = {
    padding:"10px 16px", borderRadius:12, fontSize:13,
    border:"1px solid rgba(255,255,255,0.1)",
    background:"#0a1628", color:"#fff",
    outline:"none", width:"100%"
  };

  if (step === 0) return (
    <div className="main-card" style={{...card, textAlign:"center", opacity:1}}>
      <button className="add-expense-btn" onClick={() => setStep(1)} style={{
        display:"inline-flex", alignItems:"center", gap:8,
        padding:"12px 28px", borderRadius:14,
        border:"1px solid rgba(56,189,248,0.4)",
        background:"linear-gradient(135deg,rgba(3,105,161,0.28) 0%,rgba(56,189,248,0.1) 100%)",
        color:"#7dd3fc", fontSize:14, fontWeight:600, cursor:"pointer",
        boxShadow:"0 0 22px rgba(56,189,248,0.22), 0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        position:"relative", overflow:"hidden"
      }}>
        + Add Expense
      </button>
    </div>
  );

  return (
    <div style={{...card, opacity:1}}>
      <div className="expense-form-inner" style={{ opacity:1 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
          <span style={{ fontSize:10,fontWeight:600,letterSpacing:2,color:"rgba(56,189,248,0.5)",textTransform:"uppercase" }}>
            {step === 1 ? "Expense Name" : "Amount & Category"}
          </span>
          <button onClick={handleClose} style={{ background:"none",border:"none",color:"rgba(255,255,255,0.3)",fontSize:22,cursor:"pointer",lineHeight:1 }}>×</button>
        </div>

        {step === 1 && (
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <input name="title" type="text" placeholder="e.g. Groceries, Uber, Netflix..."
              value={form.title} onChange={handleChange} onKeyDown={handleTitleNext}
              autoFocus style={inputStyle} />
            <button onClick={() => { if(!form.title.trim()) return setError("Enter a title."); setError(""); setStep(2); }}
              style={{ padding:"10px 20px",borderRadius:12,background:"rgba(56,189,248,0.6)",color:"#fff",border:"none",cursor:"pointer",fontSize:13, minWidth:90, fontWeight:600,whiteSpace:"nowrap" }}>
              Next →
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",borderRadius:12,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ fontSize:14,fontWeight:500,color:"rgba(255,255,255,0.8)" }}>{form.title}</span>
              <button onClick={() => setStep(1)} style={{ fontSize:11,color:"rgba(255,255,255,0.35)",background:"none",border:"none",cursor:"pointer" }}>edit</button>
            </div>
            <div style={{ display:"flex",gap:10 }}>
              <input name="amount" type="number" placeholder="Amount (₹)" value={form.amount} min="0"
                onChange={handleChange}
                onKeyDown={(e) => { if(e.key==="Enter") handleSave(); if(e.key==="Escape") handleClose(); }}
                autoFocus style={inputStyle} />
              <select name="category" value={form.category} onChange={handleChange}
                style={{ ...inputStyle, minWidth:120, flex:"1", background:"#0a1628", cursor:"pointer" }}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c} style={{ background:"#0a1628",color:"#fff" }}>{c}</option>
                ))}
              </select>
              <button onClick={handleSave} disabled={loading}
                style={{ padding:"10px 20px",borderRadius:12,background:"rgba(56,189,248,0.6)",color:"#fff",border:"none", flexShrink:0 ,cursor:"pointer",fontSize:13,fontWeight:600,opacity:loading?0.5:1,whiteSpace:"nowrap" }}>
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {error && <p style={{ fontSize:12,color:"#f87171",marginTop:10 }}>{error}</p>}
      </div>
    </div>
  );
}