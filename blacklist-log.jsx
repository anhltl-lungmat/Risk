// ─────────────────────────────────────────────────────────────────
// blacklist-log.jsx — Màn "Nhật ký xử lý" (bl-nhatky)
// PCRT › Blacklist › Nhật ký xử lý
// Bảng các lần hệ thống quét blacklist — mỗi record là 1 lần check,
// sắp xếp theo thời điểm thẩm định gần nhất. Chọn dòng → panel chi tiết.
// ─────────────────────────────────────────────────────────────────
const { useState: useStateBL, useMemo: useMemoBL } = React;

// Dựng tập nhật ký từ MOCK_RECORDS: quét khi onboard + các lần rà soát định kỳ
function buildBlacklistLog() {
  const out = [];
  (window.MOCK_RECORDS || []).forEach((r) => {
    const isOrg = r.entityType !== "CA_NHAN";
    const cccdMst = isOrg ? (r.businessInfo && r.businessInfo.taxCode) || "—" : (r.personalInfo && r.personalInfo.citizenIdNo) || "—";
    const idLabel = isOrg ? "MST" : "CCCD";
    const services = (r.services && r.services.length ? r.services.map((s) => s.name) : [r.service]).filter(Boolean);

    // 1) Lần quét khi khởi tạo MRC (onboard) — có đầy đủ kết quả từng danh sách
    const onboardResults = r.blacklistResults || [];
    out.push({
      runId: `SCR-${r.id.replace("MRC-", "")}-ONB`,
      mrcId: r.id, mrcName: r.name, shortName: r.shortName,
      entityType: r.entityType, idLabel, cccdMst, services,
      timestamp: r.timeOnboard,
      appraisalPhase: "Thẩm định lần đầu",
      actor: "Hệ thống Risk",
      trigger: "Quét tự động khi khởi tạo MRC",
      matchedLists: onboardResults.filter((x) => x.match !== "KHONG_TRUNG_KHOP").map((x) => x.name),
      results: onboardResults,
      blacklistStatus: r.blacklistStatus,
      ccdvStatus: r.ccdvStatus,
      rrScore: r.rrScore, rrLevel: r.rrLevel,
    });

    // 2) Các lần rà soát định kỳ / thủ công trong lịch sử
    (r.screeningHistory || []).forEach((h) => {
      const matched = h.hits || [];
      const results = h.blacklistResultsSnapshot ||
        matched.map((name) => ({ name, match: "TRUNG_KHOP_1_NHOM", action: "GHI_NHAN_HIT_BLACKLIST", confidence: null, version: "—", reqId: "—", fields: [] }));
      out.push({
        runId: h.runId,
        mrcId: r.id, mrcName: r.name, shortName: r.shortName,
        entityType: r.entityType, idLabel, cccdMst, services,
        timestamp: h.timestamp,
        appraisalPhase: "Trong quá trình sử dụng DV",
        actor: h.actor,
        trigger: h.reason || "Rà soát định kỳ",
        matchedLists: matched,
        results,
        blacklistStatus: h.blacklistStatus,
        ccdvStatus: h.ccdvStatus,
        rrScore: h.rrScore, rrLevel: h.rrLevel,
      });
    });
  });

  out.sort((a, b) => (a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0));
  out.forEach((e, i) => (e.stt = i + 1));
  return out;
}

// Pill phân loại thời điểm thẩm định
function AppraisalPhasePill({ phase }) {
  const first = phase === "Thẩm định lần đầu";
  const cls = first ? "bdg-primary" : "bdg-warning";
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold border rounded px-1.5 py-0.5 ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0 bdg-dot"></span>
      {phase}
    </span>
  );
}

// Chips danh sách trùng khớp (cột "Danh sách blacklist")
function MatchedListChips({ lists }) {
  if (!lists || lists.length === 0) {
    return <span className="text-slate-400">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {lists.map((n, i) => (
        <span key={i} className="inline-flex items-center text-[11px] font-semibold border rounded px-1.5 py-0.5 bdg-danger">
          {n}
        </span>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MÀN NHẬT KÝ XỬ LÝ
// ═══════════════════════════════════════════════════════════════════
function BlacklistLogView() {
  const allLog = useMemoBL(buildBlacklistLog, []);
  const [f, setF] = useStateBL({ q: "", list: "ALL", service: "ALL", result: "ALL", fromDate: "", toDate: "" });
  const [selectedRun, setSelectedRun] = useStateBL(null);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const reset = () => setF({ q: "", list: "ALL", service: "ALL", result: "ALL", fromDate: "", toDate: "" });

  // Danh mục danh sách blacklist xuất hiện trong nhật ký
  const listOptions = useMemoBL(() => {
    const seen = new Set();
    allLog.forEach((e) => (e.results || []).forEach((x) => seen.add(x.name)));
    return Array.from(seen);
  }, [allLog]);

  const rows = useMemoBL(() => {
    const q = f.q.trim().toLowerCase();
    return allLog.filter((e) => {
      if (q) {
        const blob = `${e.mrcId} ${e.mrcName} ${e.shortName || ""} ${e.cccdMst}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      if (f.service !== "ALL" && !e.services.includes(f.service)) return false;
      if (f.list !== "ALL" && !e.matchedLists.includes(f.list)) return false;
      if (f.result === "HIT" && e.matchedLists.length === 0) return false;
      if (f.result === "CLEAN" && e.matchedLists.length > 0) return false;
      // Lọc theo khoảng Thời gian tạo (so sánh phần ngày YYYY-MM-DD)
      const day = (e.timestamp || "").slice(0, 10);
      if (f.fromDate && day && day < f.fromDate) return false;
      if (f.toDate && day && day > f.toDate) return false;
      return true;
    });
  }, [allLog, f]);

  const hasFilter = f.q || f.list !== "ALL" || f.service !== "ALL" || f.result !== "ALL" || f.fromDate || f.toDate;

  // Chọn dòng → mở MÀN chi tiết riêng (không phải popup)
  if (selectedRun) {
    return <BlacklistLogDetail run={selectedRun} onBack={() => setSelectedRun(null)} />;
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
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Tìm kiếm</label>
              <input
                type="text"
                value={f.q}
                onChange={(e) => set("q", e.target.value)}
                placeholder="Mã MRC, tên, CCCD/MST…"
                className="w-full px-2.5 py-1.5 bg-white text-[12px] text-slate-900 rounded-md border border-slate-200 focus:border-[var(--bk-primary)] focus:outline-none placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Danh sách blacklist</label>
              <Select value={f.list} onChange={(v) => set("list", v)} options={[
                { v: "ALL", label: "Tất cả danh sách" },
                ...listOptions.map((n) => ({ v: n, label: n })),
              ]} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Dịch vụ</label>
              <Select value={f.service} onChange={(v) => set("service", v)} options={[
                { v: "ALL", label: "Tất cả dịch vụ" },
                ...(window.SERVICES_LIST || []).map((n) => ({ v: n, label: n })),
              ]} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Kết quả</label>
              <Select value={f.result} onChange={(v) => set("result", v)} options={[
                { v: "ALL", label: "Tất cả kết quả" },
                { v: "HIT", label: "Có trùng khớp" },
                { v: "CLEAN", label: "Không trùng khớp" },
              ]} />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Thời gian tạo</label>
              <DateRangePicker
                fromDate={f.fromDate}
                toDate={f.toDate}
                onApply={(from, to) => setF((s) => ({ ...s, fromDate: from, toDate: to }))}
              />
            </div>
          </div>
        </div>

        {/* Bảng nhật ký */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-2.5 border-b border-slate-150 flex items-center gap-2">
            <Icon name="history" className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[12px] font-bold text-slate-700">Nhật ký check blacklist</span>
            <span className="ml-auto text-[11px] text-slate-500">{rows.length} lần quét{hasFilter ? " (đã lọc)" : ""}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-12 text-center">STT</th>
                  <th className="py-2.5 px-3">Mã MRC</th>
                  <th className="py-2.5 px-3">Tên MRC</th>
                  <th className="py-2.5 px-3">CCCD / MST</th>
                  <th className="py-2.5 px-3">Tên dịch vụ</th>
                  <th className="py-2.5 px-3">Danh sách blacklist</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Thời điểm thẩm định</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Thời gian tạo</th>
                  <th className="py-2.5 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={9} className="py-12 text-center text-[12px] text-slate-400">Không có lần quét nào phù hợp bộ lọc.</td></tr>
                ) : rows.map((e) => {
                  const on = selectedRun && selectedRun.runId === e.runId && selectedRun.mrcId === e.mrcId;
                  return (
                    <tr
                      key={`${e.mrcId}-${e.runId}`}
                      onClick={() => setSelectedRun(e)}
                      className={`border-t border-slate-150 text-[12px] text-slate-700 cursor-pointer transition-colors ${on ? "bg-[var(--bk-primary-tint)]" : "hover:bg-slate-50"}`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">{e.stt}</td>
                      <td className="py-2.5 px-3"><span className="font-mono font-semibold text-slate-900 whitespace-nowrap">{e.mrcId}</span></td>
                      <td className="py-2.5 px-3 max-w-[260px]">
                        <div className="font-semibold text-slate-900 leading-snug line-clamp-2" title={e.mrcName}>{e.mrcName}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        <span className="text-slate-400">{e.idLabel}</span> {e.cccdMst}
                      </td>
                      <td className="py-2.5 px-3 max-w-[200px]">
                        <div className="truncate" title={e.services.join(", ")}>{e.services[0]}</div>
                        {e.services.length > 1 && <div className="text-[10px] text-slate-400">+{e.services.length - 1} dịch vụ khác</div>}
                      </td>
                      <td className="py-2.5 px-3 max-w-[280px]"><MatchedListChips lists={e.matchedLists} /></td>
                      <td className="py-2.5 px-3 whitespace-nowrap"><AppraisalPhasePill phase={e.appraisalPhase} /></td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{e.timestamp}</td>
                      <td className="py-2.5 px-3 text-right">
                        <Icon name="chevronRight" className={`w-3.5 h-3.5 inline ${on ? "text-[var(--bk-primary)]" : "text-slate-300"}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MÀN CHI TIẾT (full screen) — thông tin lần quét được chọn
// Mã MRC · Tên KH · MST · Dịch vụ · Thời gian xử lý + bảng đối soát:
// Danh sách Blacklist · Kết quả xử lý · Dữ liệu xử lý · Hành động
// ═══════════════════════════════════════════════════════════════════
function BlacklistLogDetail({ run, onBack }) {
  if (!run) return null;

  const InfoCell = ({ label, children, mono }) => (
    <div className="px-4 py-3">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-[13px] text-slate-900 font-semibold ${mono ? "font-mono" : ""}`}>{children}</div>
    </div>
  );

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 mrc-screen-in">
      <div className="p-5 space-y-4 max-w-[1400px] mx-auto">

        {/* Quay lại */}
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
          <Icon name="arrowLeft" className="w-4 h-4" />
          Quay lại nhật ký
        </button>

        {/* Thông tin lần xử lý */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-2.5 border-b border-slate-150 flex items-center gap-2">
            <Icon name="history" className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[12px] font-bold text-slate-700">Thông tin lần xử lý</span>
            <span className="ml-auto text-[10px] text-slate-400 font-mono">{run.runId}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y divide-slate-150">
            <InfoCell label="Mã MRC" mono>{run.mrcId}</InfoCell>
            <InfoCell label="Tên khách hàng">{run.mrcName}</InfoCell>
            <InfoCell label="Mã số thuế / CCCD" mono>{run.cccdMst}</InfoCell>
            <div className="px-4 py-3 col-span-2 md:col-span-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dịch vụ</div>
              <div className="flex flex-wrap gap-1.5">
                {run.services.map((s, i) => (
                  <span key={i} className="text-[12px] font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded px-2 py-0.5">{s}</span>
                ))}
              </div>
            </div>
            <InfoCell label="Thời điểm thẩm định">{run.appraisalPhase}</InfoCell>
            <InfoCell label="Thời gian xử lý" mono>{run.timestamp}</InfoCell>
          </div>
        </div>

        {/* Bảng đối soát blacklist */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-2.5 border-b border-slate-150 flex items-center gap-2">
            <Icon name="shield" className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[12px] font-bold text-slate-700">Kết quả đối soát danh sách blacklist</span>
            <span className="ml-auto text-[11px] text-slate-500">{run.results.length} danh sách</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[820px]">
              <thead>
                <tr className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Danh sách Blacklist</th>
                  <th className="py-2.5 px-4">Kết quả xử lý</th>
                  <th className="py-2.5 px-4">Dữ liệu xử lý</th>
                  <th className="py-2.5 px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {run.results.length === 0 ? (
                  <tr><td colSpan={4} className="py-10 text-center text-[12px] text-slate-400">Không có dữ liệu đối soát cho lần quét này.</td></tr>
                ) : run.results.map((x, i) => {
                  const hit = x.match !== "KHONG_TRUNG_KHOP";
                  return (
                    <tr key={i} className={`border-t border-slate-150 text-[12px] align-top ${hit ? "bg-rose-50/40" : ""}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${hit ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                          <span className="font-semibold text-slate-900">{x.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4"><MatchLevelPill match={x.match} /></td>
                      <td className="py-3 px-4">
                        {x.fields && x.fields.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {x.fields.map((fld, j) => (
                              <span key={j} className="text-[11px] font-semibold text-rose-700 bg-rose-100 rounded px-1.5 py-0.5">{fld}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{mapAction(x.action)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

Object.assign(window, { BlacklistLogView });
