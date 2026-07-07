// ─────────────────────────────────────────────────────────────────
// appraisal-queue.jsx — Màn "Hồ sơ cần xử lý" (td-danhsach)
// PCRT › Thẩm định › Hồ sơ cần xử lý
// Bảng tổng quát các hồ sơ cần thẩm định.
// Cột: Mã Merchant · Tên Merchant · MST/CCCD · Loại thẩm định · Nguyên nhân
//      · Mức rủi ro · Trạng thái · Người xử lý · Hạn xử lý · Thao tác
// Cột Thao tác (Xem · Thẩm định ngay) ghim cố định cuối bảng; các cột khác cuộn ngang.
// Chọn dòng → mở chi tiết hồ sơ (MerchantDetail).
// ─────────────────────────────────────────────────────────────────
const { useState: useStateAQ, useMemo: useMemoAQ } = React;

const AQ_NOW = new Date("2026-06-29T00:00:00");          // mốc "hôm nay" của hệ thống
const AQ_SLA = { CAO: 2, TRUNG_BINH: 5, THAP: 7 };       // SLA (ngày) theo mức rủi ro

// Hồ sơ cần xử lý: chờ / đang thẩm định / chờ thẩm định lại / phê duyệt có điều kiện
function aqNeedsAction(r) {
  return ["CHO_THAM_DINH", "DANG_THAM_DINH", "DAT_DIEU_KIEN"].includes(r.appraisalStatus)
    || r.reviewState === "CHO_LAI";
}

function aqParseDate(s) {
  // "2026-05-25 14:32" → Date
  const [d, t] = (s || "").split(" ");
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, (m || 1) - 1, day || 1);
}
function aqFmt(date) {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(date.getDate())}/${p(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function buildAppraisalQueue() {
  return (window.MOCK_RECORDS || [])
    .filter(aqNeedsAction)
    .map((r) => {
      const isOrg = r.entityType !== "CA_NHAN";
      const cccdMst = isOrg ? (r.businessInfo && r.businessInfo.taxCode) || "—" : (r.personalInfo && r.personalInfo.citizenIdNo) || "—";
      const idLabel = isOrg ? "MST" : "CCCD";

      // Loại thẩm định + nguyên nhân + trạng thái (khái niệm chuẩn)
      const apType = window.apTypeOf(r);
      const reason = window.apReasonOf(r);

      // Người xử lý
      const last = (r.appraisalHistory || [])[0];
      const officer = (r.appraisalStatus !== "CHO_THAM_DINH" && last && last.officer) ? last.officer : null;

      // Hạn xử lý = ngày onboard + SLA theo mức rủi ro
      const due = aqParseDate(r.timeOnboard);
      due.setDate(due.getDate() + (AQ_SLA[r.rrLevel] || 5));
      const overdueDays = Math.round((AQ_NOW - due) / 86400000);
      const status = window.apStatusQueue(r);

      return {
        record: r,
        id: r.id, name: r.name, shortName: r.shortName,
        entityType: r.entityType, idLabel, cccdMst,
        apType,
        reason,
        rrLevel: r.rrLevel, rrScore: r.rrScore,
        reviewState: r.reviewState,
        appraisalStatus: r.appraisalStatus,
        status,
        officer,
        due, overdueDays,
        onboard: r.timeOnboard,
      };
    })
    // Quá hạn nhiều nhất lên đầu; cùng mức thì hồ sơ rủi ro cao trước
    .sort((a, b) => (b.overdueDays - a.overdueDays) || (b.rrScore - a.rrScore));
}

// Nút thao tác dạng icon + tooltip
function AQAction({ icon, label, tone, onClick }) {
  const tones = {
    view: "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
    appraise: "text-[var(--bk-primary)] hover:bg-[var(--bk-primary-tint)]",
  };
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`group/aq relative w-7 h-7 inline-flex items-center justify-center rounded-md cursor-pointer transition-colors ${tones[tone]}`}
    >
      <Icon name={icon} className="w-4 h-4" />
      <span className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 group-hover/aq:opacity-100 transition-opacity z-20">
        {label}
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MÀN HỒ SƠ CẦN XỬ LÝ
// ═══════════════════════════════════════════════════════════════════
function AppraisalQueueView({ onView, onAppraise }) {
  const all = useMemoAQ(buildAppraisalQueue, [window.MOCK_RECORDS]);
  const [f, setF] = useStateAQ({ q: "", type: "ALL", level: "ALL", status: "ALL" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const reset = () => setF({ q: "", type: "ALL", level: "ALL", status: "ALL" });

  const rows = useMemoAQ(() => {
    const q = f.q.trim().toLowerCase();
    return all.filter((e) => {
      if (q) {
        const blob = `${e.id} ${e.name} ${e.shortName || ""} ${e.cccdMst}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      if (f.type !== "ALL" && e.apType !== f.type) return false;
      if (f.level !== "ALL" && e.rrLevel !== f.level) return false;
      if (f.status === "Quá hạn") { if (e.overdueDays <= 0) return false; }
      else if (f.status !== "ALL" && e.status !== f.status) return false;
      return true;
    });
  }, [all, f]);

  const hasFilter = f.q || f.type !== "ALL" || f.level !== "ALL" || f.status !== "ALL";
  const overdueCount = all.filter((e) => e.overdueDays > 0).length;

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-5 space-y-4 max-w-[1700px] mx-auto">

        {/* Bộ lọc */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-2.5 border-b border-slate-150 flex items-center gap-2">
            <Icon name="filter" className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[12px] font-bold text-slate-700">Bộ lọc hồ sơ</span>
            {overdueCount > 0 && (
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded px-2 py-0.5">{overdueCount} hồ sơ quá hạn</span>
            )}
            {hasFilter && (
              <button onClick={reset} className="ml-auto text-[11px] font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-2 cursor-pointer">
                Xóa lọc
              </button>
            )}
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Tìm kiếm</label>
              <input
                type="text"
                value={f.q}
                onChange={(e) => set("q", e.target.value)}
                placeholder="Mã, tên merchant, MST/CCCD…"
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
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Mức rủi ro</label>
              <Select value={f.level} onChange={(v) => set("level", v)} options={[
                { v: "ALL", label: "Tất cả mức độ" },
                { v: "CAO", label: "Cao" },
                { v: "TRUNG_BINH", label: "Trung bình" },
                { v: "THAP", label: "Thấp" },
              ]} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Trạng thái</label>
              <Select value={f.status} onChange={(v) => set("status", v)} options={[
                { v: "ALL", label: "Tất cả trạng thái" },
                { v: "Chờ xử lý", label: "Chờ xử lý" },
                { v: "Đang xử lý", label: "Đang xử lý" },
                { v: "Chờ bổ sung hồ sơ", label: "Chờ bổ sung hồ sơ" },
                { v: "Chờ phê duyệt", label: "Chờ phê duyệt" },
                { v: "Quá hạn", label: "Quá hạn" },
              ]} />
            </div>
          </div>
        </div>

        {/* Bảng hồ sơ */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-2.5 border-b border-slate-150 flex items-center gap-2">
            <Icon name="fingerprint" className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[12px] font-bold text-slate-700">Hồ sơ cần thẩm định</span>
            <span className="ml-auto text-[11px] text-slate-500">{rows.length} hồ sơ{hasFilter ? " (đã lọc)" : ""}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1180px]">
              <thead>
                <tr className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Mã Merchant</th>
                  <th className="py-2.5 px-3">Tên Merchant</th>
                  <th className="py-2.5 px-3">MST / CCCD</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Loại thẩm định</th>
                  <th className="py-2.5 px-3">Nguyên nhân</th>
                  <th className="py-2.5 px-3">Mức rủi ro</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Người xử lý</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Hạn xử lý</th>
                  <th className="py-2.5 px-3 text-center sticky right-0 z-10 bg-slate-100 border-l border-slate-200 w-[96px]">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={10} className="py-12 text-center text-[12px] text-slate-400">Không có hồ sơ nào cần xử lý phù hợp bộ lọc.</td></tr>
                ) : rows.map((e) => (
                  <tr key={e.id} onClick={() => onView(e.record)} className="group border-t border-slate-150 text-[12px] text-slate-700 hover:bg-slate-50 cursor-pointer align-top">
                    <td className="py-2.5 px-3"><span className="font-mono font-semibold text-slate-900 whitespace-nowrap">{e.id}</span></td>
                    <td className="py-2.5 px-3 max-w-[240px]">
                      <div className="font-semibold text-slate-900 leading-snug line-clamp-2" title={e.name}>{e.name}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      <span className="text-slate-400">{e.idLabel}</span> {e.cccdMst}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">{e.apType}</td>
                    <td className="py-2.5 px-3 max-w-[220px]">
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">{e.reason}</span>
                    </td>
                    <td className="py-2.5 px-3"><RiskLevelChip level={e.rrLevel} /></td>
                    <td className="py-2.5 px-3"><AppStatusBadge status={e.status} size="sm" /></td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {e.officer ? <span className="text-slate-700">{e.officer}</span> : <span className="text-slate-400 italic">Chưa phân công</span>}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-mono text-[11px] text-slate-700">{aqFmt(e.due)}</div>
                      {e.overdueDays > 0
                        ? <div className="text-[10px] font-bold text-rose-600">Quá hạn {e.overdueDays} ngày</div>
                        : <div className="text-[10px] text-emerald-600">Còn {Math.abs(e.overdueDays)} ngày</div>}
                    </td>
                    <td className="py-2.5 px-3 sticky right-0 z-10 bg-white group-hover:bg-slate-50 border-l border-slate-200">
                      <div className="flex items-center justify-center gap-1">
                        <AQAction icon="eye" label="Xem" tone="view" onClick={() => onView(e.record)} />
                        <AQAction icon="fingerprint" label="Thẩm định ngay" tone="appraise" onClick={() => onAppraise(e.record)} />
                      </div>
                    </td>
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

Object.assign(window, { AppraisalQueueView });
