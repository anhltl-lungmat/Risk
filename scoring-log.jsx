// ─────────────────────────────────────────────────────────────────
// scoring-log.jsx — Màn "Nhật ký đánh giá" (cd-danhsach)
// PCRT › Chấm điểm rủi ro › Nhật ký đánh giá
// Bảng log quá trình chấm điểm rủi ro — mỗi record là 1 lần chấm điểm,
// sắp xếp theo thời điểm chấm điểm gần nhất.
// STT · Mã MRC · Tên MRC · MST/CCCD · Điểm rủi ro · Mức độ rủi ro
//      · Rule tăng cường · Thời điểm chấm điểm
// ─────────────────────────────────────────────────────────────────
const { useState: useStateSC, useMemo: useMemoSC } = React;

const SC_AP_TYPE = { INITIAL: "Chấm điểm khi khởi tạo MRC", PERIODIC: "Rà soát / chấm điểm định kỳ" };

// Rút gọn nội dung rule hit thành mã + mô tả ngắn
function parseRule(raw) {
  const idx = raw.indexOf(":");
  if (idx === -1) return { code: raw.trim(), desc: "" };
  return { code: raw.slice(0, idx).trim(), desc: raw.slice(idx + 1).trim() };
}

function RuleChips({ rules, full }) {
  if (!rules || rules.length === 0) return <span className="text-slate-400">—</span>;
  // Mặc định: gọn — chỉ mã rule (di chuột xem mô tả). full: hiện cả mô tả.
  if (!full) {
    return (
      <div className="flex flex-wrap gap-1">
        {rules.map((r, i) => {
          const { code, desc } = parseRule(r);
          return (
            <span key={i} className="font-mono text-[11px] font-semibold border rounded px-1.5 py-0.5 whitespace-nowrap cursor-help bdg-warning" title={desc}>{code}</span>
          );
        })}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      {rules.map((r, i) => {
        const { code, desc } = parseRule(r);
        return (
          <span key={i} className="inline-flex items-start gap-1.5 text-[11px]">
            <span className="font-mono font-semibold border rounded px-1.5 py-0.5 whitespace-nowrap shrink-0 bdg-warning">{code}</span>
            {desc && <span className="text-slate-600 leading-snug">{desc}</span>}
          </span>
        );
      })}
    </div>
  );
}

// Dựng nhật ký chấm điểm từ MOCK_RECORDS:
// gồm lần chấm khi onboard (appraisalHistory) + các lần rà soát định kỳ (screeningHistory)
function buildScoringLog() {
  const out = [];
  (window.MOCK_RECORDS || []).forEach((r) => {
    const isOrg = r.entityType !== "CA_NHAN";
    const cccdMst = isOrg ? (r.businessInfo && r.businessInfo.taxCode) || "—" : (r.personalInfo && r.personalInfo.citizenIdNo) || "—";
    const idLabel = isOrg ? "MST" : "CCCD";

    // Lần chấm điểm khi thẩm định (KSNB)
    (r.appraisalHistory || []).forEach((h) => {
      out.push({
        runId: h.code,
        mrcId: r.id, mrcName: r.name, entityType: r.entityType, idLabel, cccdMst,
        score: h.rrScore != null ? h.rrScore : r.rrScore,
        level: h.riskLevel || r.rrLevel,
        rules: r.ruleHits || [],
        apType: h.apType,
        officer: h.officer, unit: h.unit, caseCode: h.caseCode,
        timestamp: h.timestamp,
        record: r, answers: h.mrcAnswers || null,
      });
    });

    // Các lần rà soát định kỳ có chấm lại điểm
    (r.screeningHistory || []).forEach((h) => {
      if (h.rrScore == null) return;
      out.push({
        runId: h.runId,
        mrcId: r.id, mrcName: r.name, entityType: r.entityType, idLabel, cccdMst,
        score: h.rrScore,
        level: h.rrLevel,
        rules: r.ruleHits || [],
        apType: "PERIODIC",
        officer: h.actor, unit: null, caseCode: null,
        timestamp: h.timestamp,
        record: r, answers: null,
      });
    });
  });

  out.sort((a, b) => (a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0));
  out.forEach((e, i) => (e.stt = i + 1));
  return out;
}

// ═══════════════════════════════════════════════════════════════════
// MÀN NHẬT KÝ ĐÁNH GIÁ
// ═══════════════════════════════════════════════════════════════════
function ScoringLogView() {
  const allLog = useMemoSC(buildScoringLog, []);
  const [f, setF] = useStateSC({ q: "", level: "ALL", rule: "ALL" });
  const [selectedRun, setSelectedRun] = useStateSC(null);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const reset = () => setF({ q: "", level: "ALL", rule: "ALL" });

  const rows = useMemoSC(() => {
    const q = f.q.trim().toLowerCase();
    return allLog.filter((e) => {
      if (q) {
        const blob = `${e.mrcId} ${e.mrcName} ${e.cccdMst}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      if (f.level !== "ALL" && e.level !== f.level) return false;
      if (f.rule === "HAS" && (!e.rules || e.rules.length === 0)) return false;
      if (f.rule === "NONE" && e.rules && e.rules.length > 0) return false;
      return true;
    });
  }, [allLog, f]);

  const hasFilter = f.q || f.level !== "ALL" || f.rule !== "ALL";

  // Chọn dòng → mở MÀN chi tiết chấm điểm tương ứng
  if (selectedRun) {
    return <ScoringLogDetail run={selectedRun} onBack={() => setSelectedRun(null)} />;
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-5 space-y-4 max-w-[1600px] mx-auto">

        {/* Bộ lọc */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-2.5 border-b border-slate-150 flex items-center gap-2">
            <Icon name="filter" className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[12px] font-bold text-slate-700">Bộ lọc nhật ký</span>
            {hasFilter && (
              <button onClick={reset} className="ml-auto text-[11px] font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-2 cursor-pointer">
                Xóa lọc
              </button>
            )}
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Tìm kiếm</label>
              <input
                type="text"
                value={f.q}
                onChange={(e) => set("q", e.target.value)}
                placeholder="Mã MRC, tên, MST/CCCD…"
                className="w-full px-2.5 py-1.5 bg-white text-[12px] text-slate-900 rounded-md border border-slate-200 focus:border-[var(--bk-primary)] focus:outline-none placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Mức độ rủi ro</label>
              <Select value={f.level} onChange={(v) => set("level", v)} options={[
                { v: "ALL", label: "Tất cả mức độ" },
                { v: "CAO", label: "Cao" },
                { v: "TRUNG_BINH", label: "Trung bình" },
                { v: "THAP", label: "Thấp" },
              ]} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Rule tăng cường</label>
              <Select value={f.rule} onChange={(v) => set("rule", v)} options={[
                { v: "ALL", label: "Tất cả" },
                { v: "HAS", label: "Có rule kích hoạt" },
                { v: "NONE", label: "Không có rule" },
              ]} />
            </div>
          </div>
        </div>

        {/* Bảng nhật ký */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-2.5 border-b border-slate-150 flex items-center gap-2">
            <Icon name="history" className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[12px] font-bold text-slate-700">Nhật ký chấm điểm rủi ro</span>
            <span className="ml-auto text-[11px] text-slate-500">{rows.length} lần chấm điểm{hasFilter ? " (đã lọc)" : ""}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1080px]">
              <thead>
                <tr className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-12 text-center">STT</th>
                  <th className="py-2.5 px-3">Mã MRC</th>
                  <th className="py-2.5 px-3">Tên MRC</th>
                  <th className="py-2.5 px-3">MST / CCCD</th>
                  <th className="py-2.5 px-3 w-[140px]">Điểm rủi ro</th>
                  <th className="py-2.5 px-3">Mức độ rủi ro</th>
                  <th className="py-2.5 px-3">Rule tăng cường</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Thời điểm chấm điểm</th>
                  <th className="py-2.5 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={9} className="py-12 text-center text-[12px] text-slate-400">Không có lần chấm điểm nào phù hợp bộ lọc.</td></tr>
                ) : rows.map((e) => (
                  <tr key={`${e.mrcId}-${e.runId}`} onClick={() => setSelectedRun(e)} className="border-t border-slate-150 text-[12px] text-slate-700 hover:bg-slate-50 align-top cursor-pointer">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">{e.stt}</td>
                    <td className="py-2.5 px-3"><span className="font-mono font-semibold text-slate-900 whitespace-nowrap">{e.mrcId}</span></td>
                    <td className="py-2.5 px-3 max-w-[240px]">
                      <div className="font-semibold text-slate-900 leading-snug line-clamp-2" title={e.mrcName}>{e.mrcName}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      <span className="text-slate-400">{e.idLabel}</span> {e.cccdMst}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-[13px] font-bold text-slate-900 tabular-nums">{e.score}</span>
                      <span className="font-mono text-[11px] text-slate-400">/100</span>
                    </td>
                    <td className="py-2.5 px-3"><RiskLevelChip level={e.level} /></td>
                    <td className="py-2.5 px-3 max-w-[360px]"><RuleChips rules={e.rules} /></td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{e.timestamp}</td>
                    <td className="py-2.5 px-3 text-right"><Icon name="chevronRight" className="w-3.5 h-3.5 inline text-slate-300" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MÀN CHI TIẾT CHẤM ĐIỂM (full screen)
// ═══════════════════════════════════════════════════════════════════

// Suy ra đáp án + điểm đóng góp của 1 tiêu chí (best-effort để hiển thị)
function scItemRows(item, answers) {
  // Nhóm tiêu chí kép (dual): mỗi dòng con là 1 hàng
  if (item.t === "dual") {
    return item.rows.map((row) => {
      const locked = row.disabledWhen && answers[row.disabledWhen.id] !== row.disabledWhen.enabledValue;
      const c = row.cases.find((x) => x.v === answers[row.id]);
      return { n: row.n, q: row.q, label: locked ? "Không áp dụng" : (c ? c.label : "—"), pts: locked ? null : (c ? c.pts : 0) };
    });
  }
  // Thoả thuận pháp lý (multi)
  if (item.t === "multi") {
    const arr = Array.isArray(answers[item.id]) ? answers[item.id] : [];
    const labels = arr.map((v) => (item.options.find((o) => o.v === v) || {}).label || v);
    const participate = arr.some((v) => v && v !== "none");
    let pts = 0;
    if (participate) {
      const subj = [answers.legal_cn, answers.legal_to].filter(Boolean);
      const complete = subj.length > 0 && subj.every((s) => s === "complete");
      pts = complete ? 8 : 20;
    }
    return [{ n: item.n, q: item.q, label: labels.join(", ") || "Không tham gia", pts }];
  }
  // Tự điền / autofill — không tính điểm
  if (!item.cases) {
    return [{ n: item.n, q: item.q, label: answers[item.id] || "—", pts: null }];
  }
  // Lựa chọn đơn
  const c = item.cases.find((x) => x.v === answers[item.id]);
  let pts = c ? c.pts : 0;
  if (item.sub && answers[item.id] === item.sub.when) {
    const sc = item.sub.cases.find((x) => x.v === answers[item.sub.id]);
    if (sc) pts += sc.pts;
  }
  return [{ n: item.n, q: item.q, label: c ? c.label : "—", pts }];
}

function ScoringLogDetail({ run, onBack }) {
  if (!run) return null;
  const record = run.record;
  const hasAnswers = !!run.answers;
  const answers = useMemoSC(
    () => run.answers || (record && window.mrcPrefill ? window.mrcPrefill(record) : null),
    [run]
  );
  const groups = useMemoSC(
    () => (record && window.mrcCriteria ? window.mrcCriteria(record.entityType) : []),
    [run]
  );
  const score = useMemoSC(
    () => {
      if (!(record && answers && window.mrcScore)) return null;
      const recomputed = window.mrcScore(record, answers);
      // Điểm/mức phải khớp giá trị đã LOG của lần chấm này;
      // breakdown nhóm chỉ hiển khi có đáp án lưu (reconstruct chính xác)
      return { ...recomputed, total: run.score, level: run.level, breakdown: hasAnswers ? recomputed.breakdown : [] };
    },
    [run, answers]
  );

  const InfoCell = ({ label, children, mono }) => (
    <div className="px-4 py-3">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-[13px] text-slate-900 font-semibold ${mono ? "font-mono" : ""}`}>{children}</div>
    </div>
  );

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 mrc-screen-in">
      <div className="p-5 space-y-4 max-w-[1400px] mx-auto">

        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
          <Icon name="arrowLeft" className="w-4 h-4" />
          Quay lại nhật ký
        </button>

        {/* Thông tin lần chấm điểm */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-2.5 border-b border-slate-150 flex items-center gap-2">
            <Icon name="sliders" className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[12px] font-bold text-slate-700">Thông tin lần chấm điểm</span>
            <span className="ml-auto text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded px-2 py-0.5">{SC_AP_TYPE[run.apType] || "Chấm điểm"}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y divide-slate-150">
            <InfoCell label="Mã MRC" mono>{run.mrcId}</InfoCell>
            <InfoCell label="Tên MRC">{run.mrcName}</InfoCell>
            <InfoCell label="MST / CCCD" mono><span className="text-slate-400">{run.idLabel}</span> {run.cccdMst}</InfoCell>
            <InfoCell label="Loại đối tượng">{mapEntity(run.entityType)}</InfoCell>
            <InfoCell label="Người / nguồn chấm">{run.officer || "Hệ thống Risk"}</InfoCell>
            <InfoCell label="Thời điểm chấm điểm" mono>{run.timestamp}</InfoCell>
          </div>
        </div>

        {/* Kết quả điểm + phân loại */}
        {score && (
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-4 py-2.5 border-b border-slate-150 flex items-center gap-2">
              <Icon name="target" className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[12px] font-bold text-slate-700">Kết quả chấm điểm rủi ro</span>
            </div>
            <div className="p-4"><ScorePanel score={score} /></div>
          </div>
        )}

        {/* Chi tiết theo từng nhóm tiêu chí — chỉ khi có đáp án chấm điểm đã lưu */}
        {hasAnswers && score && groups.map((g, gi) => {
          const sub = score.breakdown[gi] ? score.breakdown[gi].sub : 0;
          return (
            <div key={g.code} className="bg-white rounded-lg border border-slate-200">
              <div className="px-4 py-2.5 border-b border-slate-150 flex items-center gap-2">
                <Icon name={g.icon} className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[12px] font-bold text-slate-700">Nhóm {g.code} · {g.title}</span>
                <span className="ml-auto text-[11px] text-slate-500">Điểm nhóm: <span className="font-mono font-bold text-slate-800">{sub}</span></span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[680px]">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2 px-4 w-12">#</th>
                      <th className="py-2 px-4">Tiêu chí</th>
                      <th className="py-2 px-4 w-[220px]">Kết quả đánh giá</th>
                      <th className="py-2 px-4 w-20 text-right">Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.flatMap((it) => scItemRows(it, answers).map((rr, ri) => (
                      <tr key={`${it.id}-${ri}`} className="border-t border-slate-100 text-[12px] text-slate-700 align-top">
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">{rr.n}</td>
                        <td className="py-2.5 px-4 max-w-[420px] leading-snug">{rr.q}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">{rr.label}</td>
                        <td className="py-2.5 px-4 text-right">
                          {rr.pts == null ? <span className="text-slate-300">—</span>
                            : <span className={`font-mono font-bold ${rr.pts >= 12 ? "text-rose-600" : rr.pts > 0 ? "text-amber-600" : "text-slate-400"}`}>{rr.pts}</span>}
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {/* Khi lần chấm cũ chưa lưu chi tiết đáp án */}
        {!hasAnswers && (
          <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <Icon name="info" className="w-4 h-4 text-slate-400 mt-px shrink-0" />
            <p className="text-[12px] text-slate-500 leading-relaxed">
              Lần chấm điểm này không lưu chi tiết đáp án từng tiêu chí. Điểm và mức độ rủi ro hiển thị là giá trị đã ghi nhận tại thời điểm chấm điểm.
            </p>
          </div>
        )}

        {/* Rule tăng cường */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-2.5 border-b border-slate-150 flex items-center gap-2">
            <Icon name="shield" className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[12px] font-bold text-slate-700">Rule tăng cường kích hoạt</span>
            <span className="ml-auto text-[11px] text-slate-500">{(run.rules || []).length} rule</span>
          </div>
          <div className="p-4">
            {(run.rules || []).length === 0
              ? <div className="text-[12px] text-slate-400">Không có rule tăng cường nào được kích hoạt trong lần chấm điểm này.</div>
              : <div className="flex flex-col gap-2"><RuleChips rules={run.rules} full /></div>}
          </div>
        </div>
      </div>
    </main>
  );
}

Object.assign(window, { ScoringLogView });
