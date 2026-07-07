// ─────────────────────────────────────────────────────────────────
// appraisal-history.jsx — Màn "Lịch sử thẩm định" (td-lichsu)
// PCRT › Thẩm định › Lịch sử thẩm định
// Danh sách tổng quan lưu lịch sử các lần thẩm định đã xử lý,
// sắp xếp theo thời gian xử lý gần nhất.
// STT · Mã MRC · Tên MRC · MST/CCCD · Loại thẩm định · Nguyên nhân
//      · Kết quả xử lý · Người xử lý · Thời gian xử lý
// ─────────────────────────────────────────────────────────────────
const { useState: useStateAH, useMemo: useMemoAH } = React;

function ahReasons(r) {
  const out = [];
  if (r.ccdvStatus === "KHONG_DUOC_CCDV") out.push("Bị từ chối CCDV");
  if (r.blacklistStatus === "HIT") out.push("Trùng khớp blacklist");
  if (r.reviewState === "CHO_LAI") out.push("Đến kỳ thẩm định lại");
  if (r.rrLevel === "CAO") out.push("Điểm rủi ro cao");
  else if (r.rrLevel === "TRUNG_BINH") out.push("Rủi ro trung bình");
  if (out.length === 0) out.push("Rà soát định kỳ");
  return out.slice(0, 2);
}

function buildAppraisalHistory() {
  const out = [];
  (window.MOCK_RECORDS || []).forEach((r) => {
    const isOrg = r.entityType !== "CA_NHAN";
    const cccdMst = isOrg ? (r.businessInfo && r.businessInfo.taxCode) || "—" : (r.personalInfo && r.personalInfo.citizenIdNo) || "—";
    const idLabel = isOrg ? "MST" : "CCCD";
    const reason = window.apReasonOf(r);

    (r.appraisalHistory || []).forEach((h) => {
      if (!h.conclusion && !h.code) return;
      out.push({
        record: r,
        caseCode: h.code,
        mrcId: r.id, mrcName: r.name, entityType: r.entityType, idLabel, cccdMst,
        apType: window.apTypeOf(r, h),
        reason,
        result: window.apResultOf(h.conclusion),
        officer: h.officer || "—",
        unit: h.unit || null,
        timestamp: h.timestamp,
      });
    });
  });

  out.sort((a, b) => (a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0));
  out.forEach((e, i) => (e.stt = i + 1));
  return out;
}

// ═══════════════════════════════════════════════════════════════════
// MÀN LỊCH SỬ THẨM ĐỊNH
// ═══════════════════════════════════════════════════════════════════
function AppraisalHistoryView({ onView }) {
  const all = useMemoAH(buildAppraisalHistory, [window.MOCK_RECORDS]);
  const [f, setF] = useStateAH({ q: "", type: "ALL", result: "ALL" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const reset = () => setF({ q: "", type: "ALL", result: "ALL" });

  const rows = useMemoAH(() => {
    const q = f.q.trim().toLowerCase();
    return all.filter((e) => {
      if (q) {
        const blob = `${e.mrcId} ${e.mrcName} ${e.cccdMst} ${e.caseCode || ""}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      if (f.type !== "ALL" && e.apType !== f.type) return false;
      if (f.result !== "ALL" && e.result !== f.result) return false;
      return true;
    });
  }, [all, f]);

  const hasFilter = f.q || f.type !== "ALL" || f.result !== "ALL";

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-5 space-y-4 max-w-[1600px] mx-auto">

        {/* Bộ lọc */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-2.5 border-b border-slate-150 flex items-center gap-2">
            <Icon name="filter" className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[12px] font-bold text-slate-700">Bộ lọc lịch sử</span>
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
                placeholder="Mã MRC, tên, MST/CCCD, mã phiếu…"
                className="w-full px-2.5 py-1.5 bg-white text-[12px] text-slate-900 rounded-md border border-slate-200 focus:border-[var(--bk-primary)] focus:outline-none placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Loại thẩm định</label>
              <Select value={f.type} onChange={(v) => set("type", v)} options={[
                { v: "ALL", label: "Tất cả loại" },
                { v: "Lần đầu", label: "Lần đầu" },
                { v: "Tái thẩm định", label: "Tái thẩm định" },
              ]} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Kết quả xử lý</label>
              <Select value={f.result} onChange={(v) => set("result", v)} options={[
                { v: "ALL", label: "Tất cả kết quả" },
                { v: "Đã hoàn thành", label: "Đã hoàn thành" },
                { v: "Đang xử lý", label: "Đang xử lý" },
                { v: "Từ chối", label: "Từ chối" },
                { v: "Đã hủy", label: "Đã hủy" },
              ]} />
            </div>
          </div>
        </div>

        {/* Bảng lịch sử */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-2.5 border-b border-slate-150 flex items-center gap-2">
            <Icon name="history" className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[12px] font-bold text-slate-700">Lịch sử thẩm định</span>
            <span className="ml-auto text-[11px] text-slate-500">{rows.length} lượt thẩm định{hasFilter ? " (đã lọc)" : ""}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1120px]">
              <thead>
                <tr className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-12 text-center">STT</th>
                  <th className="py-2.5 px-3">Mã MRC</th>
                  <th className="py-2.5 px-3">Tên MRC</th>
                  <th className="py-2.5 px-3">MST / CCCD</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Loại thẩm định</th>
                  <th className="py-2.5 px-3">Nguyên nhân</th>
                  <th className="py-2.5 px-3">Kết quả xử lý</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Người xử lý</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Thời gian xử lý</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={9} className="py-12 text-center text-[12px] text-slate-400">Không có lượt thẩm định nào phù hợp bộ lọc.</td></tr>
                ) : rows.map((e) => (
                  <tr
                    key={`${e.mrcId}-${e.caseCode}-${e.stt}`}
                    onClick={() => onView && onView(e.record)}
                    className={`border-t border-slate-150 text-[12px] text-slate-700 align-top ${onView ? "hover:bg-slate-50 cursor-pointer" : ""}`}
                  >
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">{e.stt}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-semibold text-slate-900 whitespace-nowrap">{e.mrcId}</span>
                      {e.caseCode && <div className="text-[10px] font-mono text-slate-400">{e.caseCode}</div>}
                    </td>
                    <td className="py-2.5 px-3 max-w-[240px]">
                      <div className="font-semibold text-slate-900 leading-snug line-clamp-2" title={e.mrcName}>{e.mrcName}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      <span className="text-slate-400">{e.idLabel}</span> {e.cccdMst}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">{e.apType}</td>
                    <td className="py-2.5 px-3 max-w-[220px]">
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">{e.reason}</span>
                    </td>
                    <td className="py-2.5 px-3"><AppStatusBadge status={e.result} size="sm" /></td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="text-slate-700">{e.officer}</div>
                      {e.unit && <div className="text-[10px] text-slate-400">{e.unit}</div>}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{e.timestamp}</td>
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

Object.assign(window, { AppraisalHistoryView });
