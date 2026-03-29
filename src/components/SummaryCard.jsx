import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import axios from "axios";

export default function SummaryCard({ summary, onBudgetUpdated }) {
  const { budget = 0, spent = 0, remaining = 0 } = summary;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pbarRef = useRef(null);
  const budgetRef = useRef(null);
  const spentRef = useRef(null);
  const remainRef = useRef(null);
  const prevSummary = useRef({ budget: 0, spent: 0, remaining: 0 });

  // count up numbers + progress bar on every summary change
  useEffect(() => {
    const prev = prevSummary.current;

    gsap.to(prev, {
      budget, duration: 1.4, ease: "power2.out",
      onUpdate: () => {
        if (budgetRef.current)
          budgetRef.current.innerText = "₹" + Math.round(prev.budget).toLocaleString("en-IN");
      }
    });
    gsap.to(prev, {
      spent, duration: 1.4, ease: "power2.out", delay: 0.1,
      onUpdate: () => {
        if (spentRef.current)
          spentRef.current.innerText = "₹" + Math.round(prev.spent).toLocaleString("en-IN");
      }
    });
    gsap.to(prev, {
      remaining, duration: 1.4, ease: "power2.out", delay: 0.2,
      onUpdate: () => {
        if (remainRef.current)
          remainRef.current.innerText = "₹" + Math.round(prev.remaining).toLocaleString("en-IN");
      }
    });

    if (pbarRef.current) {
      gsap.fromTo(pbarRef.current,
        { width: "0%" },
        { width: `${pct}%`, duration: 1.5, ease: "power2.out", delay: 0.3 }
      );
    }

    prevSummary.current = { budget, spent, remaining };
  }, [budget, spent, remaining, pct]);

  // pulse glow on edit btn
  useEffect(() => {
    gsap.to(".edit-budget-btn", {
      boxShadow: "0 0 24px rgba(245,158,11,0.45)",
      duration: 1.3, repeat: -1, yoyo: true, ease: "sine.inOut"
    });
  }, []);

  const handleEdit = () => { setInputVal(budget); setEditing(true); setError(""); };
  const handleCancel = () => { setEditing(false); setError(""); };

  const handleSave = async () => {
    const amount = Number(inputVal);
    if (!amount || amount <= 0) return setError("Enter a valid amount.");
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/api/budget/setBudget", { amount });
      // bounce the card on update
      gsap.fromTo(".budget-card-inner",
        { scale: 1 },
        { scale: 1.02, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.inOut" }
      );
      setEditing(false);
      setError("");
      onBudgetUpdated();
    } catch (err) {
      console.error(err);
      setError("Failed to update budget.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  return (
    <div className="main-card budget-card-inner" style={{
      background: "linear-gradient(145deg,#071428 0%,#050f1c 100%)",
      borderRadius: 24, padding: 28, marginBottom: 16,
      border: "1px solid rgba(56,189,248,0.1)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(56,189,248,0.08)",
      position: "relative", overflow: "hidden", opacity: 0
    }}>
      {/* orbs */}
      <div style={{ position:"absolute",top:-80,right:-80,width:260,height:260,background:"radial-gradient(circle,rgba(56,189,248,0.13) 0%,transparent 70%)",pointerEvents:"none" }} />
      <div style={{ position:"absolute",bottom:-60,left:-60,width:200,height:200,background:"radial-gradient(circle,rgba(245,158,11,0.1) 0%,transparent 70%)",pointerEvents:"none" }} />

      {/* header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,position:"relative",zIndex:1 }}>
        <span style={{ fontSize:10,fontWeight:600,letterSpacing:2,color:"rgba(56,189,248,0.5)",textTransform:"uppercase" }}>
          Budget Overview
        </span>
        {!editing ? (
          <button className="edit-budget-btn" onClick={handleEdit} style={{
            fontSize:12, fontWeight:500, padding:"6px 14px", borderRadius:10,
            border:"1px solid rgba(245,158,11,0.4)",
            background:"rgba(245,158,11,0.09)", color:"#fcd34d", cursor:"pointer",
            boxShadow:"0 0 14px rgba(245,158,11,0.18), inset 0 1px 0 rgba(255,255,255,0.06)"
          }}>
            Edit Budget
          </button>
        ) : (
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <input
              type="number" value={inputVal} autoFocus
              onChange={(e) => { setInputVal(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              placeholder="New budget"
              style={{
                width:120, padding:"6px 12px", borderRadius:10, fontSize:13,
                border:"1px solid rgba(56,189,248,0.4)",
                background:"#0e1f35", color:"#fff", outline:"none"
              }}
            />
            <button onClick={handleSave} disabled={loading} style={{
              fontSize:12, padding:"6px 14px", borderRadius:10,
              background:"rgba(56,189,248,0.7)", color:"#fff",
              border:"none", cursor:"pointer", opacity: loading ? 0.5 : 1
            }}>
              {loading ? "Saving..." : "Save"}
            </button>
            <button onClick={handleCancel} style={{
              fontSize:12, padding:"6px 10px", borderRadius:10,
              background:"transparent", color:"rgba(255,255,255,0.4)",
              border:"1px solid rgba(255,255,255,0.1)", cursor:"pointer"
            }}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {error && <p style={{ fontSize:12,color:"#f87171",marginBottom:12,position:"relative",zIndex:1 }}>{error}</p>}

      {/* stats */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24,position:"relative",zIndex:1 }}>
        {[
          { ref: budgetRef, color:"#38bdf8", glow:"rgba(56,189,248,0.55)", label:"Total Budget" },
          { ref: spentRef,  color:"#fbbf24", glow:"rgba(251,191,36,0.5)",  label:"Spent" },
          { ref: remainRef, color: remaining >= 0 ? "#a3e635" : "#f87171", glow: remaining >= 0 ? "rgba(163,230,53,0.5)" : "rgba(248,113,113,0.4)", label:"Remaining" },
        ].map((s) => (
          <div key={s.label} style={{
            background:"rgba(255,255,255,0.03)", borderRadius:16, padding:"16px 12px",
            textAlign:"center", border:"1px solid rgba(255,255,255,0.05)",
            boxShadow:"inset 0 1px 0 rgba(56,189,248,0.07), 0 4px 16px rgba(0,0,0,0.3)"
          }}>
            <div ref={s.ref} style={{ fontSize:21,fontWeight:700,letterSpacing:"-0.5px",color:s.color,textShadow:`0 0 22px ${s.glow}` }}>
              ₹0
            </div>
            <div style={{ fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* progress */}
      <div style={{ position:"relative",zIndex:1 }}>
        <div style={{ height:8,borderRadius:99,background:"rgba(255,255,255,0.05)",overflow:"hidden",boxShadow:"inset 0 2px 4px rgba(0,0,0,0.4)" }}>
          <div ref={pbarRef} style={{
            height:"100%", width:"0%", borderRadius:99,
            background: pct >= 100 ? "linear-gradient(90deg,#dc2626,#ef4444)" : "linear-gradient(90deg,#0369a1,#38bdf8,#7dd3fc)",
            boxShadow: pct >= 100 ? "0 0 14px rgba(239,68,68,0.7)" : "0 0 14px rgba(56,189,248,0.7), 0 0 28px rgba(56,189,248,0.3)",
            position:"relative", overflow:"hidden"
          }}>
            <div style={{
              position:"absolute",top:0,left:0,right:0,bottom:0,
              background:"linear-gradient(90deg,transparent 55%,rgba(255,255,255,0.45) 78%,transparent 100%)",
              animation:"shine 2.6s infinite"
            }} />
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",marginTop:7,fontSize:11,color:"rgba(56,189,248,0.4)" }}>
          {pct.toFixed(0)}% used
        </div>
      </div>
      <style>{`@keyframes shine{0%{transform:translateX(-200%)}100%{transform:translateX(400%)}}`}</style>
    </div>
  );
}