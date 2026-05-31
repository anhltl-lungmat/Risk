// Main app shell — sidebar, topbar, view router, tweaks

const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA } = React;

// ──────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ──────────────────────────────────────────────────────────────────────────
function Sidebar({ activeMenu, onSelect, collapsed }) {
  const groups = [
    {
      label: "Hệ thống vận hành",
      items: [
        { id: "tong-quan", label: "Tổng quan", icon: "grid" },
        { id: "import-file", label: "Import file", icon: "download" },
        { id: "loi-import", label: "Lỗi import", icon: "alert", badge: "2" },
        { id: "phien-ban", label: "Phiên bản DS", icon: "layers" },
        { id: "du-lieu", label: "Danh sách dữ liệu", icon: "file" },
      ],
    },
    {
      label: "Quản lý danh sách đen",
      items: [
        { id: "lich-su-check", label: "Lịch sử check Blacklist", icon: "history", isNew: true },
        { id: "rules", label: "Quy tắc rà soát", icon: "sliders" },
        { id: "pep", label: "Đối soát PEP quốc tế", icon: "flag" },
      ],
    },
    {
      label: "Kiểm toán nội bộ",
      items: [
        { id: "aml-audit", label: "Hồ sơ AML", icon: "fingerprint" },
        { id: "settings", label: "Cấu hình hệ thống", icon: "sliders" },
      ],
    },
  ];

  return (
    <aside className={`bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-200 ${collapsed ? "w-14" : "w-56"}`}>
      <div className={`h-14 px-3 flex items-center gap-2.5 border-b border-slate-200 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center text-white shrink-0" style={{ background: "var(--bk-primary)" }}>
          <Icon name="shield" className="w-4 h-4" strokeWidth={2.25} />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-[12px] font-bold text-slate-900 tracking-tight">BAOKIM RISK</div>
            <div className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">Compliance Unit</div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        {groups.map((g, gi) => (
          <div key={gi} className={gi > 0 ? "mt-4" : ""}>
            {!collapsed && (
              <div className="px-4 mb-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">{g.label}</div>
            )}
            <div className="px-1.5 space-y-px">
              {g.items.map(item => {
                const active = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    title={collapsed ? item.label : ""}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-[12px] font-semibold rounded-md transition-colors cursor-pointer ${active ? "" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                    style={active ? { background: "var(--bk-primary-tint)", color: "var(--bk-primary)" } : {}}
                  >
                    <Icon name={item.icon} className="w-3.5 h-3.5 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {item.isNew && <span className="px-1 py-0 text-[8px] font-bold text-white rounded uppercase tracking-wider" style={{ background: "var(--bk-secondary)" }}>Mới</span>}
                        {item.badge && <span className="px-1 py-0 text-[9px] font-bold text-slate-700 bg-slate-100 rounded">{item.badge}</span>}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!collapsed && (
        <div className="border-t border-slate-200 px-4 py-2.5">
          <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
            <span>BaoKim Risk · v2.4</span>
            <span className="flex items-center gap-1 font-bold" style={{ color: "var(--bk-secondary)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--bk-secondary)" }}></span>
              LIVE
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// TOPBAR
// ──────────────────────────────────────────────────────────────────────────
function Topbar({ onToggleSidebar, breadcrumb }) {
  const [showNotif, setShowNotif] = useStateA(false);
  const [showProfile, setShowProfile] = useStateA(false);

  const hasCrumb = breadcrumb && breadcrumb.length > 0;

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onToggleSidebar} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer">
          <Icon name="menu" className="w-4 h-4" />
        </button>
        {hasCrumb && (
          <div className="hidden md:flex flex-col leading-tight">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium tracking-wide">
              {breadcrumb.slice(0, -1).map((b, i) => <React.Fragment key={i}>
                <span>{b}</span>
                <span>/</span>
              </React.Fragment>)}
              <span style={{ color: "var(--bk-primary)" }} className="font-bold">{breadcrumb[breadcrumb.length - 1]}</span>
            </div>
            <h1 className="text-[13px] font-bold text-slate-900">{breadcrumb[breadcrumb.length - 1]}</h1>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-[10px] text-slate-600 bg-white border border-slate-200 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--bk-secondary)" }}></span>
          <span className="font-bold uppercase tracking-wider">Môi trường: LIVE</span>
        </div>

        <div className="relative hidden lg:block">
          <Icon name="search" className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm nhanh MRC, MST…"
            className="w-56 pl-8 pr-3 py-1.5 bg-slate-50 text-[12px] text-slate-900 rounded-md border border-slate-200 focus:bg-white focus:border-[var(--bk-primary)] focus:outline-none"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-mono bg-white border border-slate-200 px-1 rounded">⌘K</span>
        </div>

        <button className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer" title="Trợ giúp">
          <Icon name="book" className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => { setShowNotif(s => !s); setShowProfile(false); }}
            className={`p-1.5 rounded-md cursor-pointer relative ${showNotif ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-100"}`}
          >
            <Icon name="bell" className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          </button>
          {showNotif && <NotifDropdown onClose={() => setShowNotif(false)} />}
        </div>

        <div className="relative">
          <button
            onClick={() => { setShowProfile(s => !s); setShowNotif(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-slate-100 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-[11px]">LA</div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-[11px] font-semibold text-slate-900">Lưu Thế Anh</span>
              <span className="text-[9px] text-slate-500 font-mono">anhltl@baokim.vn</span>
            </div>
            <Icon name="chevronDown" className="w-3 h-3 text-slate-400 hidden md:block" />
          </button>
          {showProfile && <ProfileDropdown onClose={() => setShowProfile(false)} />}
        </div>
      </div>
    </header>
  );
}

function NotifDropdown({ onClose }) {
  const notifs = [
    { title: "Trùng khớp PEP nghiêm trọng", desc: "MRC-99482 vừa hit 98% danh sách PEP quốc tế.", time: "10 phút trước", level: "critical" },
    { title: "Cấm khởi tạo từ ERP", desc: "MST 0108392103 nằm trong dải doanh nghiệp bỏ địa chỉ thuế.", time: "2 giờ trước", level: "warning" },
    { title: "Cập nhật quy tắc thành công", desc: "Hệ số tương đồng ký tự rủi ro về mặc định 90%.", time: "1 ngày trước", level: "info" },
  ];
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50">
      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Cảnh báo rủi ro mới</span>
        <span className="px-1.5 py-0 text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-full">2 chưa đọc</span>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifs.map((n, i) => (
          <div key={i} className="px-3 py-2.5 border-b border-slate-100 hover:bg-slate-50/50 flex gap-2.5 cursor-pointer">
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.level === "critical" ? "bg-rose-500" : n.level === "warning" ? "bg-amber-500" : "bg-slate-300"}`}></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-bold text-slate-900 truncate">{n.title}</span>
                <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="w-full px-3 py-2 text-[11px] font-bold text-center cursor-pointer border-t border-slate-100 bg-slate-50/50 hover:bg-slate-50" style={{ color: "var(--bk-primary)" }}>
        Xem tất cả cảnh báo →
      </button>
    </div>
  );
}

function ProfileDropdown({ onClose }) {
  return (
    <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50">
      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Quản lý hệ thống</div>
        <div className="text-[13px] font-bold text-slate-900 mt-0.5">Lưu Thế Anh</div>
        <div className="text-[10px] text-slate-500 font-mono">anhltl@baokim.vn</div>
      </div>
      <div className="py-1 text-[11px]">
        <div className="px-3 py-1.5 text-slate-500">Đơn vị: Kiểm soát Rủi ro &amp; Tuân thủ</div>
        <div className="border-t border-slate-100 my-1"></div>
        <button className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 cursor-pointer">
          <Icon name="arrowRight" className="w-3.5 h-3.5" />
          <span className="font-semibold">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// MAIN VIEW (table mode)
// ──────────────────────────────────────────────────────────────────────────
function ListView({ records, allRecords, params, setParams, onApply, onReset, onExport, onView, onRecheck, recheckingId, density, riskStyle, primary }) {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-5 space-y-4 max-w-[1600px] mx-auto">
        <FilterBar params={params} setParams={setParams} onApply={onApply} onReset={onReset} onExport={onExport} primary={primary} />
        <OnboardingTable
          records={records}
          onView={onView}
          onRecheck={onRecheck}
          recheckingId={recheckingId}
          density={density}
          riskStyle={riskStyle}
          primary={primary}
        />
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Icon name="shield" className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[12px] font-bold text-slate-900">Nguyên tắc soát xét KYC &amp; phòng chống rửa tiền BaoKim (AML Desk)</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-1 max-w-3xl">
                Toàn bộ thông tin người đại diện và doanh nghiệp được đối soát qua Cổng đăng ký kinh doanh quốc gia (Bộ KH&amp;ĐT), danh sách cấm vận PEP quốc tế và CIC. Quy trình nhằm ngăn chặn công ty ma, giấy tờ giả mạo, rửa tiền trong hệ thống thanh toán.
              </p>
            </div>
          </div>
          <button className="px-3 py-1.5 text-[11px] font-bold rounded-md cursor-pointer shrink-0 border" style={{ color: "var(--bk-primary)", borderColor: "var(--bk-primary)", background: "var(--bk-primary-tint)" }}>
            Xem quy chế →
          </button>
        </div>
      </div>
    </main>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// APP
// ──────────────────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primary": "#006EA8",
  "secondary": "#32AC4A",
  "density": "regular",
  "riskStyle": "bar",
  "sidebarCollapsed": false
}/*EDITMODE-END*/;

const PRIMARY_OPTIONS = ["#006EA8", "#0F172A", "#7C3AED", "#0E7490"];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [allRecords, setAllRecords] = useStateA(window.MOCK_RECORDS);
  const [params, setParams] = useStateA({
    search: "", entityType: "ALL", source: "ALL", ccdvStatus: "ALL",
    blacklistStatus: "ALL", rrLevel: "ALL", service: "", blacklistType: "",
  });
  const [selected, setSelected] = useStateA(null);
  const [recheckingId, setRecheckingId] = useStateA(null);
  const [toast, setToast] = useStateA(null);
  const [activeMenu, setActiveMenu] = useStateA("lich-su-check");
  const [sidebarCollapsed, setSidebarCollapsed] = useStateA(t.sidebarCollapsed);

  useEffectA(() => {
    document.documentElement.style.setProperty("--bk-primary", t.primary);
    document.documentElement.style.setProperty("--bk-primary-tint", hexA(t.primary, 0.08));
    document.documentElement.style.setProperty("--bk-primary-soft", hexA(t.primary, 0.14));
    document.documentElement.style.setProperty("--bk-secondary", t.secondary);
  }, [t.primary, t.secondary]);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = useMemoA(() => {
    return allRecords.filter(r => {
      if (params.search) {
        const s = params.search.toLowerCase();
        const blob = `${r.id} ${r.name} ${r.businessInfo.taxCode} ${r.personalInfo.fullName} ${r.shortName}`.toLowerCase();
        if (!blob.includes(s)) return false;
      }
      if (params.entityType !== "ALL" && r.entityType !== params.entityType) return false;
      if (params.source !== "ALL" && r.source !== params.source) return false;
      if (params.ccdvStatus !== "ALL" && r.ccdvStatus !== params.ccdvStatus) return false;
      if (params.blacklistStatus !== "ALL" && r.blacklistStatus !== params.blacklistStatus) return false;
      if (params.rrLevel !== "ALL" && r.rrLevel !== params.rrLevel) return false;
      if (params.service && r.service !== params.service) return false;
      if (params.blacklistType && !r.blacklistHits.some(h => h.includes(params.blacklistType))) return false;
      return true;
    });
  }, [allRecords, params]);

  const onView = (r) => setSelected(r);
  const onReset = () => {
    setParams({ search: "", entityType: "ALL", source: "ALL", ccdvStatus: "ALL", blacklistStatus: "ALL", rrLevel: "ALL", service: "", blacklistType: "" });
    showToast("Bộ lọc đã được đặt lại.", "info");
  };
  const onExport = () => showToast(`Đang xuất ${filtered.length} hồ sơ ra BaoKim_Risk_Export.xlsx`, "info");

  const onRecheck = (id) => {
    setRecheckingId(id);
    showToast(`Đang rà soát khẩn cấp ${id} qua danh sách an ninh…`, "info");
    setTimeout(() => {
      setRecheckingId(null);
      const stamp = new Date().toISOString().replace("T", " ").substring(0, 16);
      setAllRecords(rs => rs.map(r => {
        if (r.id !== id) return r;
        const newHistory = {
          runId: `RUN-${Date.now()}`,
          timestamp: stamp,
          actor: "Rà soát thủ công (Compliance Admin)",
          reason: "Rà soát thủ công",
          rrScore: r.rrScore,
          rrLevel: r.rrLevel,
          blacklistStatus: r.blacklistStatus,
          ccdvStatus: r.ccdvStatus,
          hits: [...r.blacklistHits],
          blacklistResultsSnapshot: r.blacklistResults,
        };
        const updated = { ...r, screeningHistory: [newHistory, ...(r.screeningHistory || [])] };
        if (selected && selected.id === id) setSelected(updated);
        return updated;
      }));
      showToast(`Hoàn tất rà soát ${id}. Đã ghi nhận lịch sử mới.`, "success");
    }, 1400);
  };

  const onMenuSelect = (id) => {
    setActiveMenu(id);
    if (id !== "lich-su-check") {
      showToast(`Mục "${id}" là phân hệ phụ. Quay về Lịch sử check Blacklist.`, "info");
      setTimeout(() => setActiveMenu("lich-su-check"), 1200);
    }
  };

  const breadcrumb = ["BaoKim Core", "Quản lý DS đen", "Lịch sử check Blacklist"];

  return (
    <div className="h-screen bg-slate-50 flex font-sans text-slate-900">
      <Sidebar activeMenu={activeMenu} onSelect={onMenuSelect} collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onToggleSidebar={() => setSidebarCollapsed(c => !c)} breadcrumb={selected ? null : breadcrumb} />
        {selected ? (
          <MerchantDetail
            record={selected}
            onClose={() => setSelected(null)}
            onRecheck={onRecheck}
            rechecking={recheckingId === selected.id}
            primary={t.primary}
          />
        ) : (
          <ListView
            records={filtered}
            allRecords={allRecords}
            params={params}
            setParams={setParams}
            onReset={onReset}
            onExport={onExport}
            onView={onView}
            onRecheck={onRecheck}
            recheckingId={recheckingId}
            density={t.density}
            riskStyle={t.riskStyle}
            primary={t.primary}
          />
        )}
      </div>
      <Toast toast={toast} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density} options={["compact", "regular"]} onChange={(v) => setTweak("density", v)} />
        <TweakRadio label="Risk visualization" value={t.riskStyle} options={["bar", "dots", "pill"]} onChange={(v) => setTweak("riskStyle", v)} />
        <TweakToggle label="Sidebar collapsed" value={sidebarCollapsed} onChange={(v) => { setSidebarCollapsed(v); setTweak("sidebarCollapsed", v); }} />

        <TweakSection label="Brand color" />
        <TweakColor label="Primary" value={t.primary} options={PRIMARY_OPTIONS} onChange={(v) => setTweak("primary", v)} />
        <TweakColor label="Secondary" value={t.secondary} options={["#32AC4A", "#0EA371", "#2563EB", "#0F766E"]} onChange={(v) => setTweak("secondary", v)} />

        <TweakSection label="Actions" />
        <TweakButton label="Reset filters" onClick={onReset} />
        <TweakButton label="Trigger demo recheck" onClick={() => allRecords[0] && onRecheck(allRecords[0].id)} />
      </TweaksPanel>
    </div>
  );
}

// helper: hex + alpha → rgba()
function hexA(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
