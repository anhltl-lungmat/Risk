/* ===== Shared controls for appraisal form — compact / minimal ===== */

/* ── Choice chip — segmented style, no border, no dot (fast to scan) ── */
function Chip({ on, tone, onClick, children }) {
  const onTone = {
    danger: "bg-rose-100 text-rose-700",
    warn: "bg-amber-100 text-amber-700",
    ok: "bg-emerald-100 text-emerald-700",
    primary: "text-white"
  }[tone] || "text-white";
  const usePrimaryBg = on && (!tone || tone === "primary");
  return (
    <button onClick={onClick}
      style={usePrimaryBg ? { background: "var(--bk-primary)" } : {}}
      className={`px-2.5 py-1 text-[11.5px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${on ? onTone : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
      {children}
    </button>);

}

/* ── Section — light card, single subtle border, hairline header ── */
function ApSection({ code, title, done, children }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200/70">
      <div className="px-3.5 h-9 flex items-center gap-2 border-b border-slate-100">
        <span className="font-mono text-[10px] font-bold" style={{ color: "var(--bk-primary)" }}>{code}</span>
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex-1">{title}</h3>
        {done && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 whitespace-nowrap shrink-0"><Icon name="check" className="w-3 h-3" />Đã ghi nhận</span>}
      </div>
      <div className="px-3.5 py-1 divide-y divide-slate-100">{children}</div>
    </div>);

}

/* ── Question row — label left, options right, tight ── */
function ApRadio({ num, q, hint, auto, options, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <div className="text-[12px] text-slate-700 leading-snug">
          {num && <span className="font-mono text-[10px] text-slate-400 mr-1.5">{num}</span>}
          {q}
          {auto && <span className="ml-1.5 text-[10px] font-semibold text-teal-600 whitespace-nowrap">· Hệ thống điền</span>}
        </div>
        {hint && <div className="text-[11px] text-slate-400 mt-0.5">{hint}</div>}
      </div>
      <div className="flex flex-wrap gap-1.5 justify-end shrink-0">
        {options.map((o) =>
        <Chip key={o.v} on={value === o.v} tone={o.tone} onClick={() => onChange(o.v)}>{o.label}</Chip>
        )}
      </div>
    </div>);

}

window.Chip = Chip;
window.ApSection = ApSection;
window.ApRadio = ApRadio;
