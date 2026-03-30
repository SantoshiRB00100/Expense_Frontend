import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { deleteExpense } from "../api";

const CAT_STYLES = {
  Food:          { bg:"rgba(251,191,36,0.1)",  color:"#fbbf24", border:"rgba(251,191,36,0.22)" },
  Transport:     { bg:"rgba(56,189,248,0.1)",  color:"#38bdf8", border:"rgba(56,189,248,0.22)" },
  Shopping:      { bg:"rgba(163,230,53,0.1)",  color:"#a3e635", border:"rgba(163,230,53,0.22)" },
  Health:        { bg:"rgba(167,139,250,0.1)", color:"#a78bfa", border:"rgba(167,139,250,0.22)" },
  Bills:         { bg:"rgba(251,146,60,0.1)",  color:"#fb923c", border:"rgba(251,146,60,0.22)" },
  Entertainment: { bg:"rgba(244,114,182,0.1)", color:"#f472b6", border:"rgba(244,114,182,0.22)" },
  Other:         { bg:"rgba(148,163,184,0.1)", color:"#94a3b8", border:"rgba(148,163,184,0.22)" },
};

export default function ExpenseList({ expenses, onDelete }) {
  const listRef = useRef(null);
  const rowRefs = useRef({});   // ✅ stable ref map keyed by expense id
  const prevLen = useRef(0);

  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll(".exp-row");
    if (expenses.length > prevLen.current) {
      gsap.fromTo(items[0],
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.5, ease: "back.out(1.5)" }
      );
    } else {
      // ✅ animate ALL items to opacity 1 on initial load
      gsap.fromTo(items,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.3 }
      );
    }
    prevLen.current = expenses.length;
  }, [expenses]);

  // ✅ animate the card itself on mount
  useEffect(() => {
    if (listRef.current) {
      gsap.to(listRef.current, { opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.2 });
    }
  }, []);

  // ✅ uses rowRefs map — el is never null
  const handleDelete = (id) => {
    const el = rowRefs.current[id];
    if (!el) return;
    gsap.to(el, {
      opacity: 0, x: 60, height: 0,
      paddingTop: 0, paddingBottom: 0,
      duration: 0.4, ease: "power2.in",
      onComplete: async () => {
        try { await deleteExpense(id); onDelete(); }
        catch { alert("Failed to delete."); }
      }
    });
  };

  const card = {
    background:"linear-gradient(145deg,#071428 0%,#050f1c 100%)",
    borderRadius:24, overflow:"hidden",
    border:"1px solid rgba(56,189,248,0.08)",
    boxShadow:"0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(56,189,248,0.05)"
  };

  if (expenses.length === 0) return (
    <div ref={listRef} style={{...card, padding:"40px 24px", textAlign:"center", opacity:0}}>
      <p style={{ color:"rgba(255,255,255,0.25)", fontSize:14 }}>No expenses yet. Add one above!</p>
    </div>
  );

  return (
    <div ref={listRef} style={{...card, opacity:0}}>
      <div style={{ padding:"16px 24px",borderBottom:"1px solid rgba(255,255,255,0.05)",fontSize:10,fontWeight:600,letterSpacing:2,color:"rgba(56,189,248,0.45)",textTransform:"uppercase" }}>
        Expenses · {expenses.length}
      </div>
      {expenses.map((exp, i) => {
        const s = CAT_STYLES[exp.category] || CAT_STYLES.Other;
        return (
          <div
            key={exp._id}
            className="exp-row"
            ref={el => rowRefs.current[exp._id] = el}  // ✅ stable ref
            style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"16px 24px",
              borderBottom: i < expenses.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              opacity: 0
            }}
            onMouseEnter={e => gsap.to(e.currentTarget, { background:"rgba(56,189,248,0.04)", duration:0.2 })}
            onMouseLeave={e => gsap.to(e.currentTarget, { background:"transparent", duration:0.2 })}
          >
            <div style={{ display:"flex",alignItems:"center",gap:14 }}>
              <span style={{ fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:8,background:s.bg,color:s.color,border:`1px solid ${s.border}` }}>
                {exp.category}
              </span>
              <div>
                <div style={{ fontSize:14,fontWeight:500,color:"rgba(255,255,255,0.82)" }}>{exp.title}</div>
                <div style={{ fontSize:11,color:"rgba(255,255,255,0.28)",marginTop:2 }}>
                  {new Date(exp.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                </div>
              </div>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:16 }}>
              <span style={{ fontSize:15,fontWeight:600,color:"#e2e8f0" }}>₹{exp.amount.toLocaleString()}</span>
              <button
                onClick={() => handleDelete(exp._id)}  // ✅ no longer passing rowEl
                style={{ background:"none",border:"none",color:"rgba(255,255,255,0.18)",fontSize:22,cursor:"pointer",lineHeight:1 }}
                onMouseEnter={e => gsap.to(e.currentTarget, { color:"#f87171", scale:1.2, duration:0.2 })}
                onMouseLeave={e => gsap.to(e.currentTarget, { color:"rgba(255,255,255,0.18)", scale:1, duration:0.2 })}
              >×</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}