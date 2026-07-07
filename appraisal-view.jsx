// Appraisal drawer — Thẩm định merchant (KSNB): phân loại đối tượng + phiếu thẩm định
const { useState: useStateAV, useMemo: useMemoAV } = React;

// derive default classification case from record
function deriveCase(record) {
  const svcs = (record.services || [{ name: record.service }]).map((s) => s.name).join(" ");
  const isWallet = /Ví điện tử/i.test(svcs);
  const ent = record.entityType === "CA_NHAN" ? "CA_NHAN" : "TO_CHUC";
  const found = window.APPRAISAL_CASES.find(
    (c) => !c.soon && c.entity === ent && c.svc === (isWallet ? "VDT" : "DVCNTT")
  );
  return (found || window.APPRAISAL_CASES[1]).code;
}

// ────────────────────────────── STEP 1: loại thẩm định + phân loại ──────────────────────────────
function ClassifyStep({ selected, onSelect, apType, onType, record }) {
  const lastInit = (record.appraisalHistory || []).find((h) => h.apType === "INITIAL" || !h.apType);
  const lastAny = (record.appraisalHistory || [])[0];
  const hasInitial = !!lastInit;
  return (
    <div>
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 flex items-start gap-2 mb-4">
        <Icon name="info" className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <p className="text-[12px] text-sky-900 leading-relaxed">
          <b>Bước 1 — Loại thẩm định &amp; phân loại đối tượng.</b> Chọn loại thẩm định (biểu mẫu &amp; cách tính điểm khác nhau) và loại khách hàng để hệ thống áp đúng phiếu.
        </p>
      </div>

      {/* Loại thẩm định */}
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Loại thẩm định</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-5">
        {[
        { v: "INITIAL", icon: "fingerprint", title: "Thẩm định lần đầu", desc: "Khi merchant onboard. Thẩm định toàn diện hồ sơ KYC, hàng hoá/dịch vụ, chấm điểm rủi ro nền tảng." },
        { v: "PERIODIC", icon: "history", title: "Thẩm định lại (theo chu kỳ)", desc: "Rà soát định kỳ trong quá trình sử dụng. Tập trung biến động hồ sơ, hành vi giao dịch & cập nhật blacklist." }].
        map((o) => {
          const on = apType === o.v;
          const disabled = o.v === "PERIODIC" && !hasInitial;
          return (
            <button key={o.v} disabled={disabled} onClick={() => !disabled && onType(o.v)}
              className={`text-left rounded-lg border p-3 flex gap-3 transition-all ${disabled ? "border-dashed border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed" : on ? "cursor-pointer" : "border-slate-200 bg-white hover:border-slate-300 cursor-pointer"}`}
              style={on && !disabled ? { borderColor: "var(--bk-primary)", background: "var(--bk-primary-tint)", boxShadow: "0 0 0 2px var(--bk-primary-soft)" } : {}}>
              <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${on ? "text-white" : "bg-slate-100 text-slate-500"}`} style={on ? { background: "var(--bk-primary)" } : {}}>
                <Icon name={o.icon} className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-slate-900">{o.title}</div>
                <div className="text-[11px] text-slate-500 leading-snug mt-0.5">{o.desc}</div>
                {disabled && <div className="text-[10px] text-amber-700 mt-1 font-semibold">Cần có thẩm định lần đầu trước.</div>}
              </div>
            </button>);

        })}
      </div>

      {apType === "PERIODIC" && lastAny &&
      <div className="bg-amber-50 rounded-md px-3 py-2 mb-4 flex items-center gap-2 text-[11px] text-amber-800">
        <Icon name="history" className="w-3.5 h-3.5 shrink-0" />
        Kỳ thẩm định gần nhất: <b>{lastAny.code}</b> · {lastAny.timestamp} · kết luận <b>{mapAppraisal(lastAny.conclusion)}</b>.
        </div>
      }

      {/* Phân loại đối tượng */}
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phân loại đối tượng</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {window.APPRAISAL_CASES.map((c) => {
          const on = selected === c.code;
          return (
            <button
              key={c.code}
              disabled={c.soon}
              onClick={() => !c.soon && onSelect(c.code)}
              className={`text-left rounded-lg border p-3.5 flex gap-3 transition-all ${
                c.soon
                  ? "border-dashed border-slate-200 bg-slate-50/60 opacity-70 cursor-default"
                  : on
                  ? "cursor-pointer"
                  : "border-slate-200 bg-white hover:border-slate-300 cursor-pointer"
              }`}
              style={on && !c.soon ? { borderColor: "var(--bk-primary)", background: "var(--bk-primary-tint)", boxShadow: "0 0 0 2px var(--bk-primary-soft)" } : {}}>
              <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${c.soon ? "bg-slate-100 text-slate-400" : on ? "text-white" : "bg-slate-100 text-slate-500"}`}
                style={on && !c.soon ? { background: "var(--bk-primary)" } : {}}>
                <Icon name={c.icon} className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold" style={{ color: c.soon ? "#94a3b8" : "var(--bk-primary)" }}>{c.soon ? "—" : c.code}</span>
                  {c.soon && <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 py-0">Phase sau</span>}
                </div>
                <div className="text-[13px] font-bold text-slate-900 mt-0.5">{c.name}</div>
                <div className="text-[11px] text-slate-500 leading-snug mt-1">{c.desc}</div>
              </div>
              {!c.soon &&
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${on ? "" : "border-slate-300"}`}
                style={on ? { background: "var(--bk-primary)", borderColor: "var(--bk-primary)" } : {}}>
                  {on && <Icon name="check" className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>}
            </button>);

        })}
      </div>
    </div>);

}

// ── Cách tính điểm — khác nhau giữa 2 loại thẩm định ──
function ScoreCard({ periodic, record }) {
  const prev = (record.screeningHistory || [])[0];
  const initialFactors = [
    { label: "Hồ sơ pháp lý & nhận biết KH (KYC)", w: 25, color: "bg-slate-400" },
    { label: "Ngành nghề & hàng hoá, dịch vụ", w: 20, color: "bg-sky-400" },
    { label: "Đối chiếu danh sách giám sát (Blacklist)", w: 35, color: "bg-rose-500" },
    { label: "Khu vực hoạt động & nguồn tiền", w: 20, color: "bg-amber-500" }];

  const periodicFactors = [
    { label: "Điểm rủi ro kỳ trước (kế thừa)", w: 20, color: "bg-slate-400" },
    { label: "Biến động hồ sơ KYC từ kỳ trước", w: 15, color: "bg-sky-400" },
    { label: "Đối chiếu lại Blacklist (bản cập nhật)", w: 25, color: "bg-rose-500" },
    { label: "Hành vi giao dịch trong kỳ", w: 30, color: "bg-violet-500" },
    { label: "Cảnh báo / khiếu nại phát sinh", w: 10, color: "bg-amber-500" }];

  const factors = periodic ? periodicFactors : initialFactors;
  return (
    <div className="bg-slate-50/70 rounded-md p-3 my-2">
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Cách tính điểm · {periodic ? "Thẩm định lại (chu kỳ)" : "Thẩm định lần đầu"}
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5" style={{ background: "var(--bk-primary-soft)", color: "var(--bk-primary)" }}>
          {periodic ? "Mô hình chu kỳ" : "Mô hình nền tảng"}
        </span>
      </div>
      <div className="space-y-2">
        {factors.map((f, i) =>
        <div key={i}>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="text-slate-700 font-medium">{f.label}</span>
              <span className="font-mono font-bold text-slate-900">{f.w}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${f.color}`} style={{ width: `${f.w}%` }}></div>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-slate-200 mt-2.5 pt-2.5 flex items-center justify-between flex-wrap gap-2">
        <span className="text-[11px] text-slate-500">Điểm hệ thống đề xuất</span>
        <div className="flex items-center gap-3">
          {periodic && prev &&
          <span className="text-[11px] text-slate-400 font-mono">Kỳ trước: {prev.rrScore}/105
            <span className={`ml-1 font-bold ${record.rrScore - prev.rrScore > 0 ? "text-rose-600" : record.rrScore - prev.rrScore < 0 ? "text-emerald-600" : "text-slate-400"}`}>
              ({record.rrScore - prev.rrScore > 0 ? "+" : ""}{record.rrScore - prev.rrScore})
            </span>
            </span>}
          <span className="font-mono font-bold text-[15px] text-slate-900">{record.rrScore}<span className="text-slate-400 text-[11px]">/105</span></span>
          <RiskLevelChip level={record.rrLevel} />
        </div>
      </div>
    </div>);

}

// ────────────────────────────── STEP 2 helpers: render trường thông tin ──────────────────────────────

// Lưới trường thông tin — tự động điền từ KYC, KSNB có thể chỉnh sửa
function InfoGrid({ items, record }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3 py-2.5">
      {items.map((it) => {
        const val = it.auto ? phieuValue(record, it.auto) : "";
        return (
          <div key={it.n + "-" + it.label} className="min-w-0">
            <div className="text-[11px] text-slate-500 leading-snug flex items-start gap-1.5">
              <span className="font-mono text-[10px] text-slate-400 shrink-0 mt-px">{it.n}</span>
              <span>{it.label}</span>
            </div>
            {it.note && <div className="text-[10px] text-slate-400 italic mt-0.5 ml-4 leading-snug">{it.note}</div>}
            <div className="mt-1 ml-4 relative">
              <input defaultValue={val} placeholder="Nhập thông tin…"
                className={`w-full px-2 py-1 ${val ? "pr-11" : ""} text-[12px] text-slate-900 bg-slate-50 rounded border border-transparent focus:bg-white focus:border-[var(--bk-primary)] focus:outline-none`} />
              {val && <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 rounded px-1 py-0.5 pointer-events-none">KYC</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Danh sách tài liệu / hồ sơ — trạng thái + ô nhập Tên & Link tài liệu
function DocChecklist({ items, answers, set }) {
  return (
    <div className="py-1.5">
      {items.map((it) => {
        const v = answers[it.id] || "co";
        return (
          <div key={it.id} className="py-2.5 border-b border-slate-50 last:border-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0">
                <span className="font-mono text-[10px] text-slate-400 mt-0.5 shrink-0">{it.n}</span>
                <span className="text-[12px] text-slate-700 leading-snug">{it.label}</span>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {window.PHIEU_OPT.docCo.map((o) => <Chip key={o.v} on={v === o.v} tone={o.tone} onClick={() => set(it.id, o.v)}>{o.label}</Chip>)}
              </div>
            </div>
            {v === "co" && (
              <div className="mt-2 ml-4 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-2">
                <input defaultValue="" placeholder="Tên tài liệu…"
                  className="px-2 py-1 text-[12px] text-slate-900 bg-slate-50 rounded border border-transparent focus:bg-white focus:border-[var(--bk-primary)] focus:outline-none" />
                <div className="flex items-center gap-1.5 bg-slate-50 rounded border border-transparent focus-within:bg-white focus-within:border-[var(--bk-primary)] px-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Link</span>
                  <input defaultValue="" placeholder="Dán link tài liệu (https://…)"
                    className="flex-1 min-w-0 py-1 text-[12px] text-slate-900 bg-transparent focus:outline-none" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Câu hỏi lựa chọn — đơn hoặc nhiều phương án
function PhieuChoice({ item, value, onChange }) {
  if (item.multi) {
    const arr = Array.isArray(value) ? value : [];
    const toggle = (v) => onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    if (item.vertical) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,400px)] md:gap-x-5 gap-y-2 py-2.5 items-start">
          <div className="text-[12px] text-slate-700 leading-snug min-w-0 md:pr-5 md:border-r md:border-slate-100">
            {item.n && <span className="font-mono text-[10px] text-slate-400 mr-1.5">{item.n}</span>}{item.q}
          </div>
          <div className="flex flex-col gap-1.5 ml-4 md:ml-0">
            {item.opts.map((o) => {
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
      );
    }
    return (
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="text-[12px] text-slate-700 leading-snug min-w-0">
          {item.n && <span className="font-mono text-[10px] text-slate-400 mr-1.5">{item.n}</span>}{item.q}
        </div>
        <div className="flex flex-wrap gap-1.5 justify-end shrink-0">
          {item.opts.map((o) => <Chip key={o.v} on={arr.includes(o.v)} tone={o.tone} onClick={() => toggle(o.v)}>{o.label}</Chip>)}
        </div>
      </div>
    );
  }
  return <ApRadio num={item.n} q={item.q} hint={item.hint} auto={item.auto} options={item.opts} value={value} onChange={onChange} />;
}

// Đánh giá mục đích sử dụng dịch vụ độc lập
function PurposeItem({ answers, set }) {
  const v = answers.purpose || "khong";
  return (
    <div className="py-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[12px] text-slate-700 leading-snug">Áp dụng biện pháp đánh giá mục đích sử dụng dịch vụ trung gian thanh toán</span>
        <div className="flex gap-1.5 shrink-0">
          {[{ v: "co", label: "Có" }, { v: "khong", label: "Không", tone: "ok" }].map((o) => <Chip key={o.v} on={v === o.v} tone={o.tone} onClick={() => set("purpose", o.v)}>{o.label}</Chip>)}
        </div>
      </div>
      {v === "co" && (
        <div className="flex items-center gap-2 mt-2 text-[12px] text-slate-600">
          Tần suất:
          <input defaultValue="" placeholder="…" className="w-16 px-2 py-1 bg-slate-50 rounded border border-transparent focus:bg-white focus:border-[var(--bk-primary)] focus:outline-none text-center" />
          / lần
        </div>
      )}
    </div>
  );
}

// Bảng tiêu chí xác định quy mô doanh nghiệp (tham chiếu Nghị định 80/2021/NĐ-CP)
function ScaleCriteria() {
  const cols = ["NN-LN-TS · CN-XD", "Thương mại · Dịch vụ"];
  const rows = [
    { m: "Siêu nhỏ", a: ["≤ 10 LĐ BHXH", "DT ≤ 3 tỷ hoặc vốn ≤ 3 tỷ"], b: ["≤ 10 LĐ BHXH", "DT ≤ 10 tỷ hoặc vốn ≤ 3 tỷ"] },
    { m: "Nhỏ", a: ["≤ 100 LĐ BHXH", "DT ≤ 50 tỷ hoặc vốn ≤ 20 tỷ"], b: ["≤ 50 LĐ BHXH", "DT ≤ 100 tỷ hoặc vốn ≤ 50 tỷ"] },
    { m: "Vừa", a: ["≤ 200 LĐ BHXH", "DT ≤ 200 tỷ hoặc vốn ≤ 100 tỷ"], b: ["≤ 100 LĐ BHXH", "DT ≤ 300 tỷ hoặc vốn ≤ 100 tỷ"] },
  ];
  return (
    <div className="ml-4 mt-1 mb-1.5 rounded-md border border-slate-200 bg-slate-50/60 overflow-hidden">
      <div className="px-3 py-1.5 border-b border-slate-200 flex items-center gap-1.5">
        <Icon name="info" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tiêu chí xác định quy mô</span>
        <span className="text-[10px] text-slate-400 font-mono ml-auto">NĐ 80/2021/NĐ-CP</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="px-3 py-1.5 font-bold w-20 align-bottom">Mức</th>
              {cols.map((c) => <th key={c} className="px-3 py-1.5 font-bold">{c}</th>)}
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {rows.map((r) => (
              <tr key={r.m} className="border-t border-slate-200 align-top">
                <td className="px-3 py-2 font-semibold text-slate-900">{r.m}</td>
                {[r.a, r.b].map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 leading-snug">
                    <span className="block">{cell[0]}</span>
                    <span className="block text-slate-500">{cell[1]}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-1.5 border-t border-slate-200 text-[10px] text-slate-400 leading-snug">
        Đạt mức nào khi thoả đồng thời điều kiện lao động và (doanh thu <i>hoặc</i> nguồn vốn) của mức đó. LĐ BHXH = lao động tham gia BHXH bình quân năm.
      </div>
    </div>
  );
}

// Mục đánh giá mức độ rủi ro (5 mức theo tài liệu)
function RiskItem({ item, record, periodic, value, onChange }) {
  return (
    <div className="py-1">
      <ScoreCard periodic={periodic} record={record} />
      <div className="flex items-center gap-2 flex-wrap mt-1.5 mb-1.5">
        <span className="font-mono text-[10px] text-slate-400">C.1</span>
        <span className="text-[12px] font-medium text-slate-800">{item.q}</span>
        <span className="text-[11px] text-slate-400">· điểm hệ thống <b className="font-mono text-slate-700">{record.rrScore}/105</b></span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {item.opts.map((o) => <Chip key={o.v} on={value === o.v} tone={o.tone} onClick={() => onChange(o.v)}>{o.label}</Chip>)}
      </div>
    </div>
  );
}

// Thân của một section — gom info → lưới, doc → checklist, còn lại render tuần tự
function SectionBody({ section, record, answers, set, periodic }) {
  if (section.blacklist) {
    return (
      <>
        <div className="my-1.5 px-1 flex items-center gap-2 text-[11px] text-amber-700">
          <Icon name="shield" className="w-3.5 h-3.5 shrink-0" />
          {periodic ? "Đối chiếu phiên bản danh sách mới nhất — KSNB xác nhận biến động." : "Kết quả tự động từ Risk Engine — KSNB xác nhận hoặc điều chỉnh từng danh sách."}
        </div>
        {section.items.map((it) => <ApRadio key={it.id} num={it.n} q={it.q} auto options={it.opts} value={answers[it.id]} onChange={(v) => set(it.id, v)} />)}
      </>
    );
  }
  if (section.legal) {
    const v = answers.legalArr;
    const participate = v && v !== "none";
    const LegalCard = window.LegalSubjectCard;
    return (
      <>
        <PhieuChoice item={section.items[0]} value={v} onChange={(x) => set("legalArr", x)} />
        {participate && (
          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/40 p-3">
            <div className="text-[11px] font-bold text-amber-800 mb-2.5 flex items-center gap-1.5">
              <Icon name="info" className="w-3.5 h-3.5" /> Thông tin nhận dạng của Bên uỷ thác, Bên nhận uỷ thác, Người thụ hưởng &amp; các Bên có liên quan
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <LegalCard title="Cá nhân" fields={window.LEGAL_FIELDS_CN} statusKey="legal_cn" status={answers.legal_cn} onStatus={set} />
              <LegalCard title="Tổ chức" fields={window.LEGAL_FIELDS_TC} statusKey="legal_to" status={answers.legal_to} onStatus={set} />
            </div>
          </div>
        )}
      </>
    );
  }
  const out = [];
  let infoBuf = [], docBuf = [];
  const flushInfo = (k) => { if (infoBuf.length) { out.push(<InfoGrid key={"ig" + k} items={infoBuf} record={record} />); infoBuf = []; } };
  const flushDoc = (k) => { if (docBuf.length) { out.push(<DocChecklist key={"dc" + k} items={docBuf} answers={answers} set={set} />); docBuf = []; } };
  section.items.forEach((it, i) => {
    if (it.t === "info") { infoBuf.push(it); return; }
    flushInfo(i);
    if (it.t === "doc") { docBuf.push(it); return; }
    flushDoc(i);
    if (it.t === "subhead") out.push(<div key={i} className="text-[11px] font-bold text-slate-600 pt-2.5 pb-0.5 uppercase tracking-wide">{it.label}</div>);
    else if (it.t === "choice") out.push(<PhieuChoice key={i} item={it} value={answers[it.id]} onChange={(v) => set(it.id, v)} />);
    else if (it.t === "risk") out.push(<RiskItem key={i} item={it} record={record} periodic={periodic} value={answers[it.id]} onChange={(v) => set(it.id, v)} />);
    else if (it.t === "scalecriteria") out.push(<ScaleCriteria key={i} />);
    else if (it.t === "purpose") out.push(<PurposeItem key={i} answers={answers} set={set} />);
  });
  flushInfo("end"); flushDoc("end");
  return <>{out}</>;
}

function GroupDivider({ label }) {
  return (
    <div className="flex items-center gap-2.5 pt-2 pb-0.5">
      <span className="h-5 w-1 rounded-full" style={{ background: "var(--bk-primary)" }}></span>
      <h3 className="text-[12px] font-extrabold uppercase tracking-wide text-slate-900">{label}</h3>
      <span className="flex-1 h-px bg-slate-200"></span>
    </div>
  );
}

// Ý kiến KSNB + chữ ký (phiếu lưu trữ nội bộ — không phải kết luận Đạt/Không đạt)
function ConclusionSection({ periodic, answers, set }) {
  return (
    <ApSection code="KL" title="Ý kiến & lưu trữ phiếu (KSNB)">
      <div className="py-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-slate-400">KL.1</span>
          <span className="text-[12px] font-medium text-slate-800">Ý kiến / ghi chú thẩm định <span className="text-slate-400 font-normal">(tuỳ chọn)</span></span>
        </div>
        <textarea rows="2" value={answers.note || ""} onChange={(e) => set("note", e.target.value)}
          placeholder="Nhập ý kiến thẩm định, ghi chú lưu trữ hồ sơ…"
          className="mt-1.5 w-full px-3 py-2 text-[12px] text-slate-900 bg-slate-50 rounded-md focus:bg-white focus:ring-1 focus:ring-[var(--bk-primary)] focus:outline-none resize-y" />
      </div>
      <div className="grid grid-cols-2 gap-3 py-2.5">
        <div className="border border-dashed border-slate-200 rounded-md p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Người lập phiếu</div>
          <div className="text-[13px] font-bold text-slate-900 mt-5">Lưu Thế Anh</div>
          <div className="text-[10px] text-slate-400 font-mono">Phòng KSNB</div>
        </div>
        <div className="border border-dashed border-slate-200 rounded-md p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Trưởng phòng KSNB</div>
          <div className="text-[13px] font-bold text-slate-300 mt-5">Chờ ký duyệt</div>
          <div className="text-[10px] text-slate-400 font-mono">Lưu Bảo Hoa</div>
        </div>
      </div>
    </ApSection>
  );
}

// ────────────────────────────── STEP 2: phiếu thẩm định ──────────────────────────────
function PhieuStep({ record, caseDef, form, set, apType }) {
  const periodic = apType === "PERIODIC";
  const spec = window.PHIEU_FORMS[caseDef.code] || window.PHIEU_FORMS["BM01"];
  const answers = form.answers || {};
  let blocks = spec.blocks;
  if (periodic) blocks = blocks.filter((b) => !(b.kind === "section" && b.goods));

  return (
    <div className="space-y-2.5">
      {/* Đầu phiếu */}
      <div className="bg-white border border-slate-200 rounded-lg px-4 py-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-white rounded px-1.5 py-0.5" style={{ background: periodic ? "var(--bk-secondary)" : "var(--bk-primary)" }}>{periodic ? "Thẩm định lại" : "Lần đầu"}</span>
              <span className="font-mono text-[12px] font-bold" style={{ color: "var(--bk-primary)" }}>{spec.code}</span>
            </div>
            <h3 className="text-[13.5px] font-bold text-slate-900 mt-1 leading-snug">{spec.title}</h3>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Số phiếu</div>
            <div className="font-mono text-[12px] text-slate-700">{spec.docNo}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Hà Nội, …/…/2026</div>
          </div>
        </div>
      </div>

      {/* Periodic — kỳ thẩm định lại */}
      {periodic && (
        <ApSection code="K" title="Kỳ thẩm định lại">
          <ApRadio num="K.1" q="Lý do thẩm định lại"
            options={[{ v: "cycle", label: "Đến chu kỳ định kỳ" }, { v: "blacklist", label: "Cập nhật Blacklist" }, { v: "change", label: "Thay đổi thông tin" }, { v: "suspicious", label: "Dấu hiệu bất thường", tone: "warn" }]}
            value={answers.reason} onChange={(v) => set("reason", v)} />
          <div className="my-2 grid grid-cols-3 gap-2">
            {[{ k: "Số giao dịch trong kỳ", v: "4.182" }, { k: "Tổng giá trị", v: "₫ 18,6 tỷ" }, { k: "GD đáng ngờ", v: "3" }].map((s, i) => (
              <div key={i} className="bg-slate-50 rounded-md p-2.5">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{s.k}</div>
                <div className="text-[13px] font-bold text-slate-900 font-mono mt-0.5">{s.v}</div>
              </div>
            ))}
          </div>
          <ApRadio num="K.2" q="Hành vi giao dịch trong kỳ phù hợp ngành nghề đăng ký?" options={[{ v: "yes", label: "Phù hợp", tone: "ok" }, { v: "no", label: "Bất thường", tone: "danger" }]} value={answers.txMatch} onChange={(v) => set("txMatch", v)} />
          <ApRadio num="K.3" q="Có giao dịch đáng ngờ cần báo cáo (STR)?" options={[{ v: "no", label: "Không", tone: "ok" }, { v: "yes", label: "Có — đã lập STR", tone: "danger" }]} value={answers.txStr} onChange={(v) => set("txStr", v)} />
        </ApSection>
      )}

      {/* Các block theo biểu mẫu */}
      {blocks.map((b, i) => {
        if (b.kind === "group") return <GroupDivider key={"g" + i} label={b.label} />;
        if (b.edd && answers.riskLevel !== "CAO") return null;
        return (
          <ApSection key={b.code + i} code={b.code} title={b.title} done={b.blacklist}>
            {b.edd && (
              <div className="my-1.5 px-1 flex items-center gap-2 text-[11px] text-rose-700">
                <Icon name="alert" className="w-3.5 h-3.5 shrink-0" /> Khách hàng rủi ro Cao — bắt buộc áp dụng các biện pháp tăng cường.
              </div>
            )}
            <SectionBody section={b} record={record} answers={answers} set={set} periodic={periodic} />
          </ApSection>
        );
      })}

      <ConclusionSection periodic={periodic} answers={answers} set={set} />
    </div>
  );
}

// ────────────────────────────── DRAWER SHELL ──────────────────────────────
function AppraisalDrawer({ record, instance, open, onClose, onComplete }) {
  const [step, setStep] = useStateAV(2);
  const [selCase, setSelCase] = useStateAV(() => record ? deriveCase(record) : "BM02");
  const [apType, setApType] = useStateAV("INITIAL");
  const [form, setForm] = useStateAV(null);

  // (re)initialise when a record opens
  React.useEffect(() => {
    if (!record) return;
    // Phiếu luôn mở thẳng vào bước lập phiếu — phân loại đã xác định khi chấm điểm
    setStep(2);
    setSelCase(instance ? instance.caseCode : deriveCase(record));
    setApType(instance ? (instance.apType || "INITIAL") : ((record.appraisalHistory || []).length > 0 ? "PERIODIC" : "INITIAL"));
    // Prefill blacklist bl1..bl6 từ kết quả Risk Engine (đối chiếu theo từ khoá)
    const blKey = [
      ["bl1", ["đen", "black"]],
      ["bl2", ["bị can", "bị cáo", "convict"]],
      ["bl3", ["cảnh báo", "cic", "alert"]],
      ["bl4", ["simo"]],
      ["bl5", ["trốn thuế", "tax"]],
      ["bl6", ["pep"]],
    ];
    const norm = (s) => (s || "").toLowerCase();
    const answers = {};
    const confirmed = (instance && instance.blacklistConfirmed) || record.blacklistConfirmed;   // 6-list đã xác nhận từ màn chấm điểm
    const clampBL = window.clampBlacklist || ((id, m) => m);
    blKey.forEach(([id, kws]) => {
      if (confirmed && confirmed[id]) { answers[id] = clampBL(id, confirmed[id]); return; }
      const hit = (record.blacklistResults || []).find((r) => kws.some((k) => norm(r.name).includes(k)));
      answers[id] = clampBL(id, hit ? hit.match : "KHONG_TRUNG_KHOP");
    });
    answers.riskLevel = (instance && instance.riskLevel) || record.rrLevel;            // mức rủi ro đã chấm
    answers.legalArr = "none";
    answers.prohibited = "khong";
    answers.eligible = "co";
    answers.channel = ["web"];
    answers.reason = "cycle";
    answers.txMatch = "yes";
    answers.txStr = "no";
    answers.purpose = "khong";
    answers.conclusion = null;
    answers.note = "";
    setForm({ answers });
  }, [record && record.id, instance && instance.code, open]);

  if (!open || !record || !form) return null;

  const caseDef = window.APPRAISAL_CASES.find((c) => c.code === selCase) || window.APPRAISAL_CASES[1];
  const set = (k, v) => setForm((f) => ({ ...f, answers: { ...f.answers, [k]: v } }));

  // map 5 mức rủi ro của biểu mẫu → 3 mức gốc dùng trong toàn hệ thống
  const map5to3 = (r) => ({ THAP: "THAP", TB_THAP: "THAP", TRUNG_BINH: "TRUNG_BINH", TB_CAO: "CAO", CAO: "CAO" }[r] || r);

  const finish = () => {
    const a = form.answers || {};
    const blMatched = ["bl1", "bl2", "bl3", "bl4", "bl5", "bl6"].filter((id) => a[id] && a[id] !== "KHONG_TRUNG_KHOP").length;
    onComplete(record.id, {
      instanceCode: instance ? instance.code : record.appraisalCode,
      appraisalStatus: a.conclusion,
      caseCode: caseDef.code,
      apType: apType,
      riskLevel: map5to3(a.riskLevel),
      note: a.note,
      blacklistMatched: blMatched,
      eddApplied: a.riskLevel === "CAO"
    });
    onClose();
  };

  const periodic = apType === "PERIODIC";

  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col mrc-screen-in">
      {/* app-bar — đồng bộ với màn Phần thẩm định */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-4 shrink-0">
        <button onClick={onClose} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-slate-600 text-[12px] font-semibold">
          <Icon name="arrowLeft" className="w-4 h-4" /> Quay lại hồ sơ
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
            <span>Hồ sơ thẩm định</span>
            <Icon name="chevronRight" className="w-3 h-3" />
            <span className="text-slate-600">Phiếu thẩm định · {caseDef.code}</span>
          </div>
          <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2 mt-0.5">
            Phiếu thẩm định — {caseDef.code}
            <span className="text-[10px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 rounded" style={{ background: "var(--bk-secondary)" }}>KSNB</span>
            <span className="text-[11px] font-normal text-slate-500">· <span className="font-mono font-bold" style={{ color: "var(--bk-primary)" }}>{record.id}</span> · {record.name} · {mapEntityFull(record.entityType)}</span>
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-white px-2 py-1 rounded" style={{ background: periodic ? "var(--bk-secondary)" : "var(--bk-primary)" }}>{periodic ? "Thẩm định lại" : "Lần đầu"}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mức rủi ro</span>
            <RiskLevelChip level={map5to3(form.answers.riskLevel)} />
          </div>
        </div>
      </div>

      {/* body — nội dung phiếu */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 overflow-y-auto p-4 min-w-0">
          <div className="max-w-[1100px] mx-auto">
            <PhieuStep record={record} caseDef={caseDef} form={form} set={set} apType={apType} />
          </div>
        </div>
      </div>

      {/* foot */}
      <div className="bg-white border-t border-slate-200 px-5 py-3 flex items-center gap-3 shrink-0">
        <span className="text-[11px] text-slate-500 flex items-center gap-1.5"><Icon name="file" className="w-3.5 h-3.5 text-slate-400" /> Phiếu lưu trữ nội bộ · không ảnh hưởng trạng thái thẩm định</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer">Huỷ</button>
          <button className="px-3 py-1.5 text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer">Lưu nháp</button>
          <button onClick={finish}
            className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-bold text-white rounded-md cursor-pointer" style={{ background: "var(--bk-primary)" }}>
            <Icon name="check" className="w-3.5 h-3.5" /> Hoàn thiện &amp; lưu phiếu
          </button>
        </div>
      </div>
    </div>);

}

window.AppraisalDrawer = AppraisalDrawer;
window.deriveCase = deriveCase;
