// Table view — filters + KPI strip + onboarding history table

const { useState: useStateT, useMemo: useMemoT } = React;

function KpiStrip({ records, density }) {
  const total = records.length;
  const hits = records.filter((r) => r.blacklistStatus === "HIT").length;
  const denied = records.filter((r) => r.ccdvStatus === "KHONG_DUOC_CCDV").length;
  const high = records.filter((r) => r.rrLevel === "CAO").length;
  const avgScore = total ? Math.round(records.reduce((a, r) => a + r.rrScore, 0) / total) : 0;

  // fake trend sparklines
  const trends = {
    total: [38, 42, 41, 45, 50, 52, 48, total],
    hits: [4, 5, 3, 6, 8, 7, 9, hits],
    denied: [2, 3, 2, 3, 4, 5, 4, denied],
    high: [5, 4, 6, 7, 8, 9, 8, high]
  };

  const pad = density === "compact" ? "py-3 px-4" : "py-4 px-5";

  const items = [
  { label: "Hồ sơ onboard 7 ngày", value: total, trend: trends.total, color: "text-slate-500", accent: "text-slate-900" },
  { label: "Hit Blacklist", value: hits, trend: trends.hits, color: "text-rose-500", accent: "text-rose-700", sub: total ? `${Math.round(hits / total * 100)}%` : "0%" },
  { label: "Dừng CCDV", value: denied, trend: trends.denied, color: "text-rose-500", accent: "text-rose-700", sub: total ? `${Math.round(denied / total * 100)}%` : "0%" },
  { label: "Rủi ro mức Cao", value: high, trend: trends.high, color: "text-amber-500", accent: "text-amber-700", sub: `điểm TB ${avgScore}` }];


  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-lg overflow-hidden">
      {items.map((k, i) =>
      <div key={i} className={`${pad} ${i > 0 ? "border-l border-slate-150" : ""} flex flex-col gap-1.5`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{k.label}</span>
            <span className={k.color}><Sparkline values={k.trend} color="currentColor" width={48} height={14} /></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-sans tabular-nums ${k.accent} leading-none`}>{k.value}</span>
            {k.sub && <span className="text-[11px] text-slate-400 font-mono">{k.sub}</span>}
          </div>
        </div>
      )}
    </div>);

}

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-full">
      {label}
      <button onClick={onRemove} className="text-slate-400 hover:text-slate-700 cursor-pointer">
        <Icon name="x" className="w-3 h-3" strokeWidth={2.5} />
      </button>
    </span>);

}

function FilterBar({ params, setParams, onApply, onReset, onExport, primary }) {
  const [expanded, setExpanded] = useStateT(false);

  const update = (k, v) => setParams((p) => ({ ...p, [k]: v }));

  const activeChips = useMemoT(() => {
    const chips = [];
    if (params.search) chips.push({ key: "search", label: `Tìm: "${params.search}"` });
    if (params.entityType !== "ALL") chips.push({ key: "entityType", label: `Đối tượng: ${mapEntityFull(params.entityType)}` });
    if (params.ccdvStatus !== "ALL") chips.push({ key: "ccdvStatus", label: `CCDV: ${params.ccdvStatus === "DUOC_CCDV" ? "Cho phép" : "Từ chối"}` });
    if (params.blacklistStatus !== "ALL") chips.push({ key: "blacklistStatus", label: `Blacklist: ${params.blacklistStatus === "HIT" ? "Có" : "Không"}` });
    if (params.rrLevel !== "ALL") chips.push({ key: "rrLevel", label: `Rủi ro: ${mapLevel(params.rrLevel)}` });
    if (params.reviewState !== "ALL") chips.push({ key: "reviewState", label: `Thẩm định: ${mapReviewState(params.reviewState)}` });
    if (params.service) chips.push({ key: "service", label: `Dịch vụ: ${params.service}` });
    if (params.blacklistType) chips.push({ key: "blacklistType", label: `DS: ${params.blacklistType}` });
    return chips;
  }, [params]);

  const removeChip = (k) => {
    const defaults = { search: "", entityType: "ALL", source: "ALL", ccdvStatus: "ALL", blacklistStatus: "ALL", rrLevel: "ALL", reviewState: "ALL", service: "", blacklistType: "" };
    update(k, defaults[k]);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-150">
        <div className="relative flex-1 max-w-md">
          <Icon name="search" className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={params.search}
            onChange={(e) => update("search", e.target.value)}
            placeholder="Tìm theo MRC ID, tên merchant, MST, người đại diện…"
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 text-[13px] text-slate-900 placeholder-slate-400 rounded-md border border-slate-200 focus:bg-white focus:border-[var(--bk-primary)] focus:outline-none transition-colors" />
          
        </div>

        <button
          onClick={() => onApply && onApply()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white rounded-md cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: "var(--bk-primary)" }}>
          <Icon name="search" className="w-3.5 h-3.5" />
          Tìm kiếm
        </button>

        <button
          onClick={() => setExpanded((e) => !e)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-md border transition-colors cursor-pointer ${expanded ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}>
          
          <Icon name="filter" className="w-3.5 h-3.5" />
          Bộ lọc {activeChips.length > 0 && <span className="px-1.5 py-0 text-[10px] font-bold bg-white text-slate-900 rounded-full">{activeChips.length}</span>}
        </button>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={onReset}
            title="Làm mới"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer">
            <Icon name="refresh" className="w-3.5 h-3.5" />
            Làm mới
          </button>
          <button
            onClick={onExport}
            title="Xuất Excel"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer">
            
            <Icon name="download" className="w-3.5 h-3.5" />
            Xuất Excel
          </button>
        </div>
      </div>

      {activeChips.length > 0 &&
      <div className="px-4 py-2 flex items-center gap-2 flex-wrap border-b border-slate-150 bg-slate-50/50">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Đang lọc:</span>
          {activeChips.map((c) => <FilterChip key={c.key} label={c.label} onRemove={() => removeChip(c.key)} />)}
          <button onClick={onReset} className="ml-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-2 cursor-pointer">
            Xóa tất cả
          </button>
        </div>
      }

      {expanded &&
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 border-b border-slate-150">
          <FilterField label="Trạng thái CCDV">
            <Select value={params.ccdvStatus} onChange={(v) => update("ccdvStatus", v)} options={[
          { v: "ALL", label: "Tất cả" },
          { v: "DUOC_CCDV", label: "Cho phép" },
          { v: "KHONG_DUOC_CCDV", label: "Từ chối" }]
          } />
          </FilterField>
          <FilterField label="Trạng thái thẩm định">
            <Select value={params.reviewState} onChange={(v) => update("reviewState", v)} options={[
          { v: "ALL", label: "Tất cả" },
          { v: "CHO", label: "Chờ thẩm định" },
          { v: "DA", label: "Đã thẩm định" },
          { v: "CHO_LAI", label: "Chờ thẩm định lại" }]
          } />
          </FilterField>
          <FilterField label="Dịch vụ đăng ký">
            <Select value={params.service} onChange={(v) => update("service", v)} options={[
          { v: "", label: "Tất cả dịch vụ" },
          ...window.SERVICES_LIST.map((s) => ({ v: s, label: s }))]
          } />
          </FilterField>
          <FilterField label="Danh sách Blacklist">
            <Select value={params.blacklistType} onChange={(v) => update("blacklistType", v)} options={[
          { v: "", label: "Tất cả" },
          ...window.BLACKLIST_GROUPS.map((s) => ({ v: s, label: s }))]
          } />
          </FilterField>
        </div>
      }
    </div>);

}

function FilterField({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">{label}</label>
      {children}
    </div>);

}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2.5 py-1.5 bg-white text-[12px] text-slate-900 rounded-md border border-slate-200 focus:border-[var(--bk-primary)] focus:outline-none cursor-pointer appearance-none pr-7"
      style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center", backgroundSize: "12px 12px" }}>
      
      {options.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
    </select>);

}

function SegmentedFilter({ value, onChange, options, primary }) {
  return (
    <div className="inline-flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200">
      {options.map((o) =>
      <button
        key={o.v}
        onClick={() => onChange(o.v)}
        className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors cursor-pointer ${value === o.v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
        
          {o.label}
        </button>
      )}
    </div>);

}

// ──────────────────────────────────────────────────────────────────────────
// MAIN TABLE
// ──────────────────────────────────────────────────────────────────────────
function OnboardingTable({ records, onView, onRecheck, recheckingId, density, riskStyle, primary }) {
  const [page, setPage] = useStateT(1);
  const [perPage, setPerPage] = useStateT(10);

  const totalPages = Math.ceil(records.length / perPage) || 1;
  const start = (page - 1) * perPage;
  const visible = records.slice(start, start + perPage);

  const rowPy = density === "compact" ? "py-2" : "py-3";
  const cellPx = "px-3";

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="layers" className="w-4 h-4 text-slate-400" />
          <h2 className="text-[13px] font-bold text-slate-900">Danh sách Merchant</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1660px]">
          <colgroup>
            <col style={{ width: 48 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 240 }} />
            <col style={{ width: 200 }} />
            <col style={{ width: 140 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 170 }} />
            <col style={{ width: 150 }} />
            <col style={{ width: 140 }} />
            <col style={{ width: 140 }} />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
              <th className={`${rowPy} ${cellPx} text-center stk stk-head`} style={{ left: 0 }}>STT</th>
              <th className={`${rowPy} ${cellPx} text-center stk stk-head`} style={{ left: 48 }}>MÃ MRC</th>
              <th className={`${rowPy} ${cellPx} text-center stk stk-head`} style={{ left: 168 }}>ĐỐI TƯỢNG</th>
              <th className={`${rowPy} ${cellPx} text-center stk stk-head stk-l-shadow`} style={{ left: 268 }}>TÊN KHÁCH HÀNG</th>
              <th className={`${rowPy} ${cellPx} text-center`}>DỊCH VỤ</th>
              <th className={`${rowPy} ${cellPx} text-center`}>TRẠNG THÁI THẨM ĐỊNH</th>
              <th className={`${rowPy} ${cellPx} text-center`}>THANG ĐIỂM</th>
              <th className={`${rowPy} ${cellPx} text-center`}>MỨC ĐỘ RỦI RO</th>
              <th className={`${rowPy} ${cellPx} text-center`}>RULE QTRR</th>
              <th className={`${rowPy} ${cellPx} text-center`}>TRẠNG THÁI CCDV</th>
              <th className={`${rowPy} ${cellPx} text-center`}>THỜI GIAN THẨM ĐỊNH</th>
              <th className={`${rowPy} ${cellPx} text-center`}>NGƯỜI THẨM ĐỊNH</th>
            </tr>
          </thead>
          <tbody className="text-[12px] text-slate-700">
            {visible.length === 0 &&
            <tr><td colSpan={12} className="py-16 text-center text-slate-400 italic">Không tìm thấy hồ sơ khớp bộ lọc.</td></tr>
            }
            {visible.map((r, i) => {
              const ap = r.appraisalHistory && r.appraisalHistory[0];
              return (
                <tr
                  key={r.id}
                  onClick={() => onView(r)}
                  className="border-b border-slate-100 hover:bg-[color:var(--bk-primary-tint)] transition-colors cursor-pointer">
                  
                  <td className={`${rowPy} ${cellPx} text-center font-mono text-[11px] text-slate-400 stk`} style={{ left: 0 }}>{start + i + 1}</td>
                  <td className={`${rowPy} ${cellPx} stk`} style={{ left: 48 }}>
                    <span className="font-mono text-[12px] text-slate-700">{r.id}</span>
                  </td>
                  <td className={`${rowPy} ${cellPx} text-slate-600 text-[12px] whitespace-nowrap stk`} style={{ left: 168 }}>{mapEntity(r.entityType)}</td>
                  <td className={`${rowPy} ${cellPx} stk stk-l-shadow`} style={{ left: 268 }}>
                    <span className="font-semibold text-slate-900 leading-snug line-clamp-2 max-w-[240px] block" title={r.name}>{r.name}</span>
                  </td>
                  <td className={`${rowPy} ${cellPx} text-slate-600 align-top`}>
                    <div className="flex flex-col gap-1">
                      {(r.services || [{ name: r.service }]).map((s, si) => (
                        <div key={si} className="text-[12px] leading-snug">
                          {s.name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className={`${rowPy} ${cellPx} text-center`}>
                    <div className="flex justify-center"><ReviewStateBadge state={r.reviewState} /></div>
                  </td>
                  <td className={`${rowPy} ${cellPx} text-center`}>
                    {riskVisible(r.reviewState)
                      ? <span className={`font-mono text-[13px] font-bold tabular-nums ${r.rrLevel === "CAO" ? "text-rose-700" : r.rrLevel === "TRUNG_BINH" ? "text-amber-700" : "text-emerald-700"}`}>{r.rrScore}</span>
                      : <span className="text-slate-300 font-mono">—</span>}
                  </td>
                  <td className={`${rowPy} ${cellPx} text-center`}>
                    {riskVisible(r.reviewState)
                      ? <RiskLevelChip level={r.rrLevel} />
                      : <span className="text-slate-300 font-mono">—</span>}
                  </td>
                  <td className={`${rowPy} ${cellPx} align-top`}>
                    {r.ruleHits && r.ruleHits.length
                      ? <div className="flex flex-col gap-1">
                          {r.ruleHits.map((rule, ri) => (
                            <span key={ri} className="font-mono text-[10px] font-bold border rounded px-1.5 py-0.5 w-fit bdg-warning" title={rule}>{rule.split(":")[0]}</span>
                          ))}
                        </div>
                      : <span className="text-slate-300 font-mono">—</span>}
                  </td>
                  <td className={`${rowPy} ${cellPx} text-center`}>
                    <div className="flex justify-center"><CCDVBadge status={r.ccdvStatus} size="sm" /></div>
                  </td>
                  <td className={`${rowPy} ${cellPx} font-mono text-[11px] text-slate-500 whitespace-nowrap`}>{ap ? ap.timestamp : "—"}</td>
                  <td className={`${rowPy} ${cellPx} text-[12px] text-slate-700 whitespace-nowrap`}>{ap ? ap.officer : "—"}</td>
                </tr>);

            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50/40">
        <div className="flex items-center gap-2">
          <span>Hiển thị</span>
          <select
            value={perPage}
            onChange={(e) => {setPerPage(Number(e.target.value));setPage(1);}}
            className="px-1.5 py-0.5 border border-slate-200 rounded bg-white cursor-pointer">
            
            {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>· {start + 1}–{Math.min(start + perPage, records.length)} / {records.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1 rounded border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer">
            <Icon name="chevronLeft" className="w-3.5 h-3.5" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) =>
          <button key={i} onClick={() => setPage(i + 1)} className={`min-w-[24px] h-6 px-1.5 text-[11px] font-bold rounded cursor-pointer ${page === i + 1 ? "text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`} style={page === i + 1 ? { background: "var(--bk-primary)" } : {}}>{i + 1}</button>
          )}
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-1 rounded border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer">
            <Icon name="chevronRight" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>);

}

Object.assign(window, { KpiStrip, FilterBar, OnboardingTable, Select, FilterField, SegmentedFilter });