// ───────────────────────────────────────────────────────────────────────────
// mrc-view.jsx — Drawer THẨM ĐỊNH MERCHANT (chấm điểm rủi ro RT/TTKB)
// Bước độc lập trước Phiếu: trả lời bộ tiêu chí 3 nhóm → ra điểm & mức rủi ro.
// Hoàn tất → ghi điểm/mức + kết quả Blacklist sang Phiếu thẩm định.
// ───────────────────────────────────────────────────────────────────────────
const { useState: useStateMV, useMemo: useMemoMV } = React;

const MRC_LEVEL_CFG = {
  THAP: { label: "Thấp", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", bar: "#10b981", dot: "bg-emerald-500" },
  TRUNG_BINH: { label: "Trung bình", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", bar: "#f59e0b", dot: "bg-amber-500" },
  CAO: { label: "Cao", text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", bar: "#e11d48", dot: "bg-rose-500" },
};

// ── Bảng nhập thông tin nhận dạng một bên (Cá nhân / Tổ chức) ──
function LegalSubjectCard({ title, fields, statusKey, status, onStatus, invalid }) {
  return (
    <div className={`rounded-lg border bg-white overflow-hidden ${invalid ? "border-rose-300 ring-1 ring-rose-200 mrc-required-missing" : "border-slate-200"}`}>
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
        <span className="text-[12px] font-bold text-slate-800">{title}</span>
        <span className="text-[10px] font-bold text-rose-500">Bắt buộc</span>
      </div>
      <div className="p-3">
        <div className="flex flex-col gap-1.5 mb-3">
          {[{ v: "complete", label: "Đã thu thập đủ thông tin" }, { v: "incomplete", label: "Chưa thu thập đủ thông tin" }].map((o) => {
            const on = status === o.v;
            return (
              <button key={o.v} onClick={() => onStatus(statusKey, on ? null : o.v)}
                className={`w-full text-left px-2.5 py-1.5 text-[11.5px] font-semibold rounded-md transition-colors cursor-pointer ${on ? "bg-slate-900 text-white" : invalid ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {o.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          {fields.map((f, i) => (typeof f === "object" && f.sub) ? (
            <div key={i} className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pt-1.5 first:pt-0">{f.sub}</div>
          ) : (
            <label key={i} className="block">
              <span className="block text-[11px] text-slate-500 leading-snug mb-0.5">{f}</span>
              <input className="w-full px-2 py-1.5 text-[12px] text-slate-900 bg-slate-50 rounded border border-transparent focus:bg-white focus:border-[var(--bk-primary)] focus:outline-none" placeholder="Nhập thông tin…" />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Một dòng tiêu chí ──
function CriterionRow({ item, value, answers, record, onChange, errors }) {
  const err = errors || [];
  const missing = err.includes(item.id);
  const head = (
    <div className="flex items-start gap-1.5 min-w-0 md:pr-5 md:border-r md:border-slate-100">
      <span className="font-mono text-[11px] font-bold text-slate-400 mt-0.5 shrink-0 tabular-nums">{item.n}</span>
      <div className="text-[12px] text-slate-700 leading-snug">
        {item.q}
        {item.fromGeo && <span className="ml-1.5 text-[10px] font-semibold text-teal-600 whitespace-nowrap">· từ quốc tịch/trụ sở</span>}
        {item.hint && <span className="block text-[10px] text-slate-400 italic mt-0.5">{item.hint}</span>}
      </div>
    </div>
  );

  // ── Thoả thuận pháp lý (đa lựa chọn) + bảng thông tin nhận dạng có điều kiện ──
  if (item.t === "multi") {
    const arr = Array.isArray(value) ? value : [];
    const toggle = (v) => {
      let next;
      if (v === "none") next = arr.includes("none") ? [] : ["none"];
      else { next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr.filter((x) => x !== "none"), v]; }
      onChange(item.id, next.length ? next : ["none"]);
    };
    const participate = arr.some((v) => v && v !== "none");
    return (
      <div className="py-2.5">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,400px)] md:gap-x-5 gap-y-2 items-start">
          {head}
          <div className="flex flex-col gap-1.5 ml-4 md:ml-0">
            {item.options.map((o) => {
              const on = arr.includes(o.v);
              return (
                <button key={o.v} onClick={() => toggle(o.v)}
                  className={`w-full flex items-center gap-2 text-left px-2.5 py-1.5 text-[11.5px] font-semibold rounded-md transition-colors cursor-pointer ${on ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  <span className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center shrink-0 ${on ? "bg-white border-white" : "border-slate-400"}`}>
                    {on && <Icon name="check" className="w-2.5 h-2.5 text-slate-900" strokeWidth={3} />}
                  </span>
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
        {participate && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3">
            <div className="text-[11px] font-bold text-amber-800 mb-2.5 flex items-center gap-1.5">
              <Icon name="info" className="w-3.5 h-3.5" /> Thông tin nhận dạng của Bên uỷ thác, Bên nhận uỷ thác, Người thụ hưởng &amp; các Bên có liên quan
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <LegalSubjectCard title="Cá nhân" fields={window.LEGAL_FIELDS_CN} statusKey="legal_cn" status={answers.legal_cn} onStatus={onChange} invalid={err.includes("legal_cn")} />
              <LegalSubjectCard title="Tổ chức" fields={window.LEGAL_FIELDS_TC} statusKey="legal_to" status={answers.legal_to} onStatus={onChange} invalid={err.includes("legal_to")} />
            </div>
            {(err.includes("legal_cn") || err.includes("legal_to")) &&
              <div className="mt-2 text-[11px] font-semibold text-rose-600 flex items-center gap-1.5">
                <Icon name="alert" className="w-3.5 h-3.5" /> Bắt buộc chọn trạng thái thu thập thông tin cho cả Cá nhân và Tổ chức.
              </div>}
          </div>
        )}
      </div>
    );
  }

  // ── Ô nhập văn bản (tự điền / KSNB nhập) ──
  if (item.t === "autofill" || item.t === "ksnbtext") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,400px)] md:gap-x-5 gap-y-2 py-2.5 items-start">
        {head}
        <div className="ml-4 md:ml-0">
          <textarea rows="2" value={value || ""} onChange={(e) => onChange(item.id, e.target.value)}
            placeholder={item.placeholder || "Nhập thông tin…"}
            className="w-full px-2.5 py-1.5 text-[12px] text-slate-900 bg-slate-50 rounded-md border border-transparent focus:bg-white focus:border-[var(--bk-primary)] focus:outline-none resize-y" />
          {item.t === "autofill" && <span className="text-[10px] text-teal-700 font-semibold mt-0.5 inline-block">Hệ thống tự điền · có thể chỉnh sửa</span>}
        </div>
      </div>
    );
  }

  // ── Nhóm tiêu chí kép (vd: 3.1 + 3.2), dòng phụ thuộc bị khoá/mờ ──
  if (item.t === "dual") {
    return (
      <div className="py-2.5">
        <div className="flex items-start gap-1.5 mb-1.5">
          <span className="font-mono text-[11px] font-bold text-slate-400 mt-0.5 shrink-0 tabular-nums">{item.n}</span>
          <div className="text-[12px] font-semibold text-slate-700 leading-snug">{item.q}</div>
        </div>
        <div className="flex flex-col gap-2">
          {item.rows.map((row) => {
            const locked = row.disabledWhen && answers[row.disabledWhen.id] !== row.disabledWhen.enabledValue;
            const rowMissing = err.includes(row.id) && !locked;
            return (
              <div key={row.id} className={`grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,400px)] md:gap-x-5 gap-y-2 items-start ${rowMissing ? "mrc-required-missing" : ""} ${locked ? "opacity-40 pointer-events-none select-none" : ""}`}>
                <div className="flex items-start gap-1.5 min-w-0 md:pr-5 md:border-r md:border-slate-100 pl-4">
                  <span className="font-mono text-[10px] font-bold text-slate-400 mt-0.5 shrink-0 tabular-nums">{row.n}</span>
                  <div className="text-[12px] text-slate-700 leading-snug">{row.q}</div>
                </div>
                <div className="flex flex-col gap-1.5 ml-4 md:ml-0">
                  {row.cases.map((c) => {
                    const on = answers[row.id] === c.v;
                    return (
                      <button key={c.v} disabled={locked} onClick={() => onChange(row.id, c.v)}
                        className={`w-full text-left px-2.5 py-1.5 text-[11.5px] font-semibold rounded-md transition-colors cursor-pointer ${on ? "bg-slate-900 text-white" : rowMissing ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                        {c.label}
                      </button>
                    );
                  })}
                  {rowMissing && <span className="text-[10px] font-semibold text-rose-600">Bắt buộc chọn một kết quả.</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Lựa chọn đơn (mặc định) ──
  const subActive = item.sub && value === item.sub.when;
  const subMissing = err.includes(item.sub && item.sub.id);
  return (
    <div className={`grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,400px)] md:gap-x-5 gap-y-2 py-2.5 items-start ${missing ? "mrc-required-missing" : ""}`}>
      {head}
      <div className="flex flex-col gap-1.5 ml-4 md:ml-0">
        {item.cases.map((c) => {
          const on = value === c.v;
          return (
            <button key={c.v} onClick={() => onChange(item.id, c.v)}
              className={`w-full text-left px-2.5 py-1.5 text-[11.5px] font-semibold rounded-md transition-colors cursor-pointer ${on ? "bg-slate-900 text-white" : missing ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {c.label}
            </button>
          );
        })}
        {missing && <span className="text-[10px] font-semibold text-rose-600">Bắt buộc chọn một kết quả.</span>}
        {/* Lựa chọn phụ có điều kiện */}
        {subActive &&
          <div className={`mt-1 pl-3 border-l-2 ${subMissing ? "border-rose-300 mrc-required-missing" : "border-slate-200"}`}>
            <div className="text-[11px] text-slate-600 mb-1.5">{item.sub.q}</div>
            <div className="flex flex-col gap-1.5">
              {item.sub.cases.map((c) => {
                const on = answers[item.sub.id] === c.v;
                return (
                  <button key={c.v} onClick={() => onChange(item.sub.id, c.v)}
                    className={`w-full text-left px-2.5 py-1.5 text-[11.5px] font-semibold rounded-md transition-colors cursor-pointer ${on ? "bg-slate-900 text-white" : subMissing ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    {c.label}
                  </button>
                );
              })}
            </div>
            {subMissing && <span className="text-[10px] font-semibold text-rose-600">Bắt buộc chọn một kết quả.</span>}
          </div>}
      </div>
    </div>
  );
}

// ── Bảng điểm sống (live score) ──
function ScorePanel({ score }) {
  const cfg = MRC_LEVEL_CFG[score.level];
  const pct = Math.min(100, score.total);
  return (
    <div className={`rounded-lg border ${cfg.border} ${cfg.bg} p-3.5`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Điểm rủi ro RT/TTKB</div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-mono text-[30px] font-extrabold leading-none text-slate-900 tabular-nums">{score.total}</span>
            <span className="font-mono text-[13px] text-slate-400">/100</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mức phân loại</div>
          <div className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-md font-bold text-[13px] ${cfg.text} bg-white border ${cfg.border}`}>
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>{cfg.label}
          </div>
        </div>
      </div>
      {/* thanh điểm + ngưỡng */}
      <div className="mt-3 relative h-2 rounded-full bg-white/70 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: pct + "%", background: cfg.bar }}></div>
      </div>
      <div className="relative h-3 mt-0.5">
        <span className="absolute text-[9px] font-mono text-slate-400 -translate-x-1/2" style={{ left: window.MRC_BANDS.TRUNG_BINH + "%" }}>{window.MRC_BANDS.TRUNG_BINH}</span>
        <span className="absolute text-[9px] font-mono text-slate-400 -translate-x-1/2" style={{ left: window.MRC_BANDS.CAO + "%" }}>{window.MRC_BANDS.CAO}</span>
      </div>
      {/* breakdown theo nhóm */}
      <div className="mt-1.5 grid gap-2" style={{ gridTemplateColumns: `repeat(${score.breakdown.length}, minmax(0,1fr))` }}>
        {score.breakdown.map((b) => (
          <div key={b.code} className="bg-white/70 rounded-md px-2 py-1.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
              <Icon name={b.icon} className="w-3 h-3" />{b.code}
            </div>
            <div className="font-mono text-[15px] font-bold text-slate-800 mt-0.5">{b.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Drawer ──
function MrcDrawer({ record, instance, open, onClose, onComplete }) {
  const editing = !!instance;
  const [answers, setAnswers] = useStateMV(null);
  const [phase, setPhase] = useStateMV("fill");   // fill → scoring → scored
  const [revealed, setRevealed] = useStateMV(null); // điểm chốt sau khi bấm chấm điểm
  const [errors, setErrors] = useStateMV([]);       // các mục bắt buộc còn thiếu lựa chọn

  React.useEffect(() => {
    if (!record) return;
    if (instance && instance.mrcAnswers) {
      // Xem lại / chỉnh sửa: nạp lại đánh giá đã lưu, hiển điểm ngay
      setAnswers(instance.mrcAnswers);
      setRevealed(window.mrcScore(record, instance.mrcAnswers));
      setPhase("scored");
    } else {
      setAnswers(window.mrcPrefill(record));
      setRevealed(null);
      setPhase("fill");
    }
  }, [record && record.id, instance && instance.code, open]);

  const groups = useMemoMV(() => record ? window.mrcCriteria(record.entityType) : [], [record && record.entityType]);
  const score = useMemoMV(() => (record && answers) ? window.mrcScore(record, answers) : null, [record, answers]);

  if (!open || !record || !answers || !score) return null;

  const set = (id, v) => { setAnswers((a) => ({ ...a, [id]: v })); setErrors([]); if (phase !== "fill") { setPhase("fill"); setRevealed(null); } };

  // Kiểm tra các lựa chọn bắt buộc (checkbox/chọn) — ô nhập tay được bỏ qua
  const validate = () => {
    const groups = window.mrcCriteria(record.entityType);
    const miss = [];
    groups.forEach((g) => g.items.forEach((it) => {
      if (it.t === "autofill" || it.t === "ksnbtext") return;   // nhập tay — không bắt buộc
      if (it.t === "dual") {
        it.rows.forEach((row) => {
          const locked = row.disabledWhen && answers[row.disabledWhen.id] !== row.disabledWhen.enabledValue;
          if (!locked && !answers[row.id]) miss.push(row.id);
        });
        return;
      }
      if (it.t === "multi") {
        const arr = answers[it.id];
        if (!Array.isArray(arr) || arr.length === 0) { miss.push(it.id); return; }
        // Tham gia thoả thuận → bắt buộc chọn trạng thái thu thập cho Bên liên quan
        if (it.id === "legal" && arr.some((v) => v && v !== "none")) {
          if (!answers.legal_cn) miss.push("legal_cn");
          if (!answers.legal_to) miss.push("legal_to");
        }
        return;
      }
      if (!answers[it.id]) miss.push(it.id);   // lựa chọn đơn bắt buộc
      // lựa chọn phụ có điều kiện (vd: Loại ngành nghề → Có/Không điều kiện)
      if (it.sub && answers[it.id] === it.sub.when && !answers[it.sub.id]) miss.push(it.sub.id);
    }));
    return miss;
  };

  // Bấm "Chấm điểm rủi ro": chặn nếu thiếu lựa chọn bắt buộc; nếu đủ → chấm theo barem
  const runScoring = () => {
    const miss = validate();
    if (miss.length) {
      setErrors(miss);
      return;
    }
    setErrors([]);
    setPhase("scoring");
    setTimeout(() => { setRevealed(window.mrcScore(record, answers)); setPhase("scored"); }, 850);
  };

  const result = revealed || score;
  const cfg = MRC_LEVEL_CFG[result.level];

  const finish = () => {
    onComplete(record.id, {
      instanceCode: instance ? instance.code : null,
      rrScore: result.total,
      rrLevel: result.level,
      mrcAnswers: answers,
      caseCode: window.deriveCase ? window.deriveCase(record) : "BM02",
      blacklistConfirmed: window.mrcSixList(record),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col mrc-screen-in">
      {/* app-bar */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-4 shrink-0">
        <button onClick={onClose} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-slate-600 text-[12px] font-semibold">
          <Icon name="arrowLeft" className="w-4 h-4" /> Quay lại hồ sơ
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
            <span>Hồ sơ thẩm định</span>
            <Icon name="chevronRight" className="w-3 h-3" />
            <span className="text-slate-600">{editing ? "Xem / sửa thẩm định" : "Thẩm định merchant"}</span>
          </div>
          <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2 mt-0.5">
            {editing ? "Thẩm định merchant — Xem / sửa" : "Thẩm định merchant"}
            <span className="text-[10px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 rounded" style={{ background: "var(--bk-secondary)" }}>KSNB</span>
            <span className="text-[11px] font-normal text-slate-500">· <span className="font-mono font-bold" style={{ color: "var(--bk-primary)" }}>{record.id}</span> · {record.name} · {mapEntityFull(record.entityType)}</span>
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "var(--bk-primary)" }}>1</span>
            <span className="text-[11px] font-bold text-slate-900">Đánh giá yếu tố</span>
          </div>
          <span className="w-7 h-px bg-slate-200"></span>
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${phase === "scored" ? "text-white" : "border-2 border-slate-300 text-slate-400"}`} style={phase === "scored" ? { background: "var(--bk-primary)" } : {}}>2</span>
            <span className={`text-[11px] font-bold ${phase === "scored" ? "text-slate-900" : "text-slate-400"}`}>Chấm điểm rủi ro</span>
          </div>
        </div>
      </div>

      {/* body — nội dung thẩm định */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 overflow-y-auto p-4 min-w-0">
          <div className="max-w-[1100px] mx-auto space-y-2.5">
            {phase === "scored" && (
              <div>
                <div className="flex items-center gap-2 mb-1.5 text-[11px] font-bold text-emerald-700">
                  <Icon name="check" className="w-3.5 h-3.5" strokeWidth={3} /> Hệ thống đã chấm điểm theo barem đã lưu
                </div>
                <ScorePanel score={result} />
              </div>
            )}

            {groups.map((g) => (
              <ApSection key={g.code} code={g.code} title={g.title}>
                {g.items.map((it) => <CriterionRow key={it.id} item={it} value={answers[it.id]} answers={answers} record={record} onChange={set} errors={errors} />)}
              </ApSection>
            ))}
          </div>
        </div>
      </div>

        {/* foot */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex items-center gap-3 shrink-0">
          {phase === "scored" ? (
            <>
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-slate-500">Điểm rủi ro:</span>
                <span className="font-mono font-bold text-slate-900">{result.total}/100</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-bold ${cfg.text} ${cfg.bg} border ${cfg.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>{cfg.label}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => { setPhase("fill"); setRevealed(null); }} className="px-3 py-1.5 text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer">← Điều chỉnh đánh giá</button>
                <button onClick={finish} className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-bold text-white rounded-md cursor-pointer" style={{ background: "var(--bk-primary)" }}>
                  <Icon name="check" className="w-3.5 h-3.5" strokeWidth={3} /> {editing ? "Lưu thay đổi" : "Hoàn tất thẩm định"}
                </button>
              </div>
            </>
          ) : (
            <>
              {errors.length
                ? <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1.5"><Icon name="alert" className="w-3.5 h-3.5" /> Còn {errors.length} mục bắt buộc chưa chọn — vui lòng hoàn tất trước khi chấm điểm.</span>
                : <span className="text-[11px] text-slate-500">Hoàn tất các lựa chọn bắt buộc, sau đó chấm điểm rủi ro. <span className="text-slate-400">(Ô nhập tay có thể bỏ qua)</span></span>}
              <div className="ml-auto flex items-center gap-2">
                <button onClick={onClose} className="px-3 py-1.5 text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer">Huỷ</button>
                <button onClick={runScoring} disabled={phase === "scoring"}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-bold text-white rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-wait" style={{ background: "var(--bk-primary)" }}>
                  {phase === "scoring"
                    ? <><Icon name="refresh" className="w-3.5 h-3.5 animate-spin" /> Đang chấm điểm…</>
                    : <><Icon name="scale" className="w-3.5 h-3.5" /> Chấm điểm rủi ro</>}
                </button>
              </div>
            </>
          )}
        </div>
    </div>
  );
}

window.MrcDrawer = MrcDrawer;
window.LegalSubjectCard = LegalSubjectCard;
