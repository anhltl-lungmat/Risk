// Main app shell — sidebar, topbar, view router, tweaks

const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA } = React;

// ──────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ──────────────────────────────────────────────────────────────────────────
function Sidebar({ activeMenu, onSelect, collapsed }) {
  // Menu chính: 2 mục đơn ở trên + nhóm PCRT (cha → con 2 cấp)
  const topItems = [
    { id: "lich-su-check", label: "Danh sách Merchant", icon: "file" },
  ];
  const pcrt = [
    { label: "Blacklist", icon: "shield", children: [
      { label: "Quản lý danh sách", children: [
        { id: "bl-nhap", label: "Nhập danh sách" },
        { id: "bl-phienban", label: "Phiên bản" },
        { id: "bl-chitiet", label: "Danh sách chi tiết" },
      ]},
      { id: "bl-nhatky", label: "Nhật ký xử lý" },
    ]},
    { label: "Chấm điểm rủi ro", icon: "sliders", children: [
      { id: "cd-danhsach", label: "Nhật ký đánh giá" },
      { id: "cd-barem", label: "Bộ tiêu chí & Barem" },
      { id: "cd-rule", label: "Rule tăng cường" },
    ]},
    { label: "Thẩm định", icon: "fingerprint", children: [
      { id: "td-danhsach", label: "Hồ sơ cần xử lý" },
      { id: "td-lichsu", label: "Lịch sử thẩm định" },
    ]},
    { label: "Giám sát giao dịch", icon: "activity", children: [
      { id: "gs-canhbao", label: "Cảnh báo giao dịch" },
      { id: "gs-trasoat", label: "Tra soát giao dịch" },
      { id: "gs-lichsu", label: "Lịch sử xử lý" },
    ]},
  ];

  const hasActiveIn = (node) => node.id === activeMenu || (node.children || []).some(hasActiveIn);
  const firstLeaf = (node) => node.id ? node.id : firstLeaf(node.children[0]);

  const [expanded, setExpanded] = useStateA(() => {
    const init = {};
    const walk = (nodes) => nodes.forEach(n => {
      if (n.children) { init[n.label] = n.children.some(hasActiveIn); walk(n.children); }
    });
    walk(pcrt);
    return init;
  });
  const toggle = (label) => setExpanded(e => ({ ...e, [label]: !e[label] }));

  // Khoảng thụt lề theo cấp (Vuexy style: icon cha → bullet con thẳng hàng)
  const padL = (depth) => ({ paddingLeft: `${12 + depth * 16}px` });

  // Vùng icon/bullet bên trái — menu cấp 1 bỏ icon (khi mở rộng), cấp con dùng bullet
  const LeftSlot = ({ icon, active, depth }) => {
    if (collapsed) {
      return icon ? <Icon name={icon} className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} /> : null;
    }
    if (depth === 0) return null;
    return (
      <span className="w-[18px] flex items-center justify-center shrink-0">
        <span
          className={`rounded-full transition-all ${active ? "w-[7px] h-[7px]" : "w-[6px] h-[6px] border-[1.5px] border-slate-400"}`}
          style={active ? { background: "#fff" } : {}}
        ></span>
      </span>
    );
  };

  const Badge = ({ value }) => (
    <span
      className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white rounded-full shrink-0"
      style={{ background: "var(--bk-primary)" }}
    >
      {value}
    </span>
  );

  const leafBtn = (item, depth) => {
    const active = activeMenu === item.id;
    return (
      <button
        key={item.id}
        onClick={() => onSelect(item.id)}
        title={collapsed ? item.label : ""}
        style={{
          ...(collapsed ? {} : padL(depth)),
          ...(active
            ? {
                background:
                  "linear-gradient(72deg, var(--bk-primary) 0%, var(--bk-primary-lite) 100%)",
                boxShadow: "0 2px 6px 0 var(--bk-primary-glow)",
                color: "#fff",
              }
            : {}),
        }}
        className={`group w-full flex items-center gap-2.5 ${collapsed ? "px-2.5 justify-center" : "pr-3"} py-2 text-[13px] ${depth === 0 ? "font-bold" : "font-medium"} rounded-md transition-colors cursor-pointer ${
          active ? "" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <LeftSlot icon={item.icon} active={active} depth={depth} />
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.label}</span>
            {item.badge && <Badge value={item.badge} />}
          </>
        )}
      </button>
    );
  };

  // Render đệ quy: nút lá → leafBtn; nút có con → accordion
  const renderNode = (node, depth) => {
    if (!node.children) return leafBtn(node, depth);
    const open = !!expanded[node.label];
    const active = hasActiveIn(node);
    return (
      <div key={node.label}>
        <button
          onClick={() => toggle(node.label)}
          style={padL(depth)}
          className={`w-full flex items-center gap-2.5 pr-3 py-2 text-[13px] font-medium rounded-md transition-colors cursor-pointer ${
            open ? "bg-slate-100 text-slate-900" : active ? "text-slate-900 hover:bg-slate-100" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <LeftSlot icon={node.icon} active={active && !open} depth={depth} />
          <span className="flex-1 text-left truncate">{node.label}</span>
          <Icon name="chevronRight" className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-90" : ""}`} />
        </button>
        {open && <div className="space-y-1 mt-1">{node.children.map(c => renderNode(c, depth + 1))}</div>}
      </div>
    );
  };

  return (
    <aside className={`bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-200 ${collapsed ? "w-14" : "w-60"}`}>
      <div className={`h-14 px-4 flex items-center gap-2.5 border-b border-slate-200 ${collapsed ? "justify-center px-3" : ""}`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: "var(--bk-primary)" }}>
            <Icon name="shield" className="w-[18px] h-[18px]" strokeWidth={2.25} />
          </div>
        ) : (
          <img src="baokim-logo.png" alt="BaoKim b2b" className="h-[42px] w-auto mx-auto" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-3 space-y-1">
          {topItems.map(item => leafBtn(item, 0))}
        </div>

        <div className="mt-5">
          {!collapsed && (
            <div className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">PCRT</div>
          )}
          <div className="px-3 space-y-1">
            {pcrt.map(group => {
              const open = !!expanded[group.label];
              const hasActive = hasActiveIn(group);
              if (collapsed) {
                return (
                  <button
                    key={group.label}
                    onClick={() => onSelect(firstLeaf(group))}
                    title={group.label}
                    className={`w-full flex items-center justify-center px-2.5 py-2 rounded-md transition-colors cursor-pointer ${hasActive ? "" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}
                    style={hasActive ? { background: "var(--bk-primary-tint)", color: "var(--bk-primary)" } : {}}
                  >
                    <Icon name={group.icon} className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
                  </button>
                );
              }
              return (
                <div key={group.label}>
                  <button
                    onClick={() => toggle(group.label)}
                    style={padL(0)}
                    className={`w-full flex items-center gap-2.5 pr-3 py-2 text-[13px] font-bold rounded-md transition-colors cursor-pointer ${
                      open ? "bg-slate-100 text-slate-900" : hasActive ? "text-slate-900 hover:bg-slate-100" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span className="flex-1 text-left truncate">{group.label}</span>
                    <Icon name="chevronRight" className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-90" : ""}`} />
                  </button>
                  {open && (
                    <div className="space-y-1 mt-1">
                      {group.children.map(child => renderNode(child, 1))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
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
            <div className="flex items-center gap-1.5 text-[13px] text-slate-400 font-medium tracking-wide">
              {breadcrumb.slice(0, -1).map((b, i) => <React.Fragment key={i}>
                <span>{b}</span>
                <span>/</span>
              </React.Fragment>)}
              <span style={{ color: "var(--bk-primary)" }} className="font-bold">{breadcrumb[breadcrumb.length - 1]}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer" title="Ngôn ngữ">
          <Icon name="translate" className="w-[18px] h-[18px]" />
        </button>
        <button className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer" title="Giao diện sáng / tối">
          <Icon name="sun" className="w-[18px] h-[18px]" />
        </button>
        <button className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer" title="Truy cập nhanh">
          <Icon name="gridPlus" className="w-[18px] h-[18px]" />
        </button>
        <div className="relative">
          <button
            onClick={() => { setShowNotif(s => !s); setShowProfile(false); }}
            className={`p-1.5 rounded-md cursor-pointer relative ${showNotif ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-100"}`}
          >
            <Icon name="bell" className="w-[18px] h-[18px]" />
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-4 text-center">2</span>
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

// Nhãn breadcrumb theo từng menu
const MENU_LABELS = {
  "lich-su-check": ["Danh sách Merchant"],
  "bl-nhap": ["PCRT", "Blacklist", "Quản lý danh sách", "Nhập danh sách"],
  "bl-phienban": ["PCRT", "Blacklist", "Quản lý danh sách", "Phiên bản"],
  "bl-chitiet": ["PCRT", "Blacklist", "Quản lý danh sách", "Danh sách chi tiết"],
  "bl-nhatky": ["PCRT", "Blacklist", "Nhật ký xử lý"],
  "cd-danhsach": ["PCRT", "Chấm điểm rủi ro", "Nhật ký đánh giá"],
  "cd-barem": ["PCRT", "Chấm điểm rủi ro", "Bộ tiêu chí & Barem"],
  "cd-rule": ["PCRT", "Chấm điểm rủi ro", "Rule tăng cường"],
  "td-danhsach": ["PCRT", "Thẩm định", "Hồ sơ cần xử lý"],
  "td-lichsu": ["PCRT", "Thẩm định", "Lịch sử thẩm định"],
  "gs-canhbao": ["PCRT", "Giám sát giao dịch", "Cảnh báo giao dịch"],
  "gs-trasoat": ["PCRT", "Giám sát giao dịch", "Tra soát giao dịch"],
  "gs-lichsu": ["PCRT", "Giám sát giao dịch", "Lịch sử xử lý"],
};

// Màn placeholder cho các menu chưa có nội dung
function PlaceholderView({ label }) {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center">
      <div className="text-center max-w-sm px-6">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--bk-primary-tint)", color: "var(--bk-primary)" }}>
          <Icon name="layers" className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <div className="text-[15px] font-bold text-slate-900">{label}</div>
        <div className="text-[12px] text-slate-500 mt-1.5 leading-relaxed">Phân hệ đang được xây dựng. Nội dung màn này sẽ được bổ sung sau.</div>
      </div>
    </main>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [allRecords, setAllRecords] = useStateA(window.MOCK_RECORDS);
  const [params, setParams] = useStateA({
    search: "", entityType: "ALL", source: "ALL", ccdvStatus: "ALL",
    blacklistStatus: "ALL", rrLevel: "ALL", reviewState: "ALL", service: "", blacklistType: "",
  });
  const [selected, setSelected] = useStateA(window.MOCK_RECORDS[0]);
  const [recheckingId, setRecheckingId] = useStateA(null);
  const [appraisalRec, setAppraisalRec] = useStateA(null);
  const [mrcRec, setMrcRec] = useStateA(null);
  const [ksnbSignal, setKsnbSignal] = useStateA(0);
  const [toast, setToast] = useStateA(null);
  const [activeMenu, setActiveMenu] = useStateA("lich-su-check");
  const [sidebarCollapsed, setSidebarCollapsed] = useStateA(t.sidebarCollapsed);

  useEffectA(() => {
    document.documentElement.style.setProperty("--bk-primary", t.primary);
    document.documentElement.style.setProperty("--bk-primary-tint", hexA(t.primary, 0.08));
    document.documentElement.style.setProperty("--bk-primary-soft", hexA(t.primary, 0.14));
    document.documentElement.style.setProperty("--bk-primary-glow", hexA(t.primary, 0.40));
    document.documentElement.style.setProperty("--bk-primary-lite", lightenHex(t.primary, 0.38));
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
      if (params.reviewState !== "ALL" && r.reviewState !== params.reviewState) return false;
      if (params.service && r.service !== params.service) return false;
      if (params.blacklistType && !r.blacklistHits.some(h => h.includes(params.blacklistType))) return false;
      return true;
    });
  }, [allRecords, params]);

  const onView = (r) => setSelected(r);
  // Thẩm định merchant: mở màn chấm điểm rủi ro (đánh giá 3 nhóm yếu tố → chấm điểm)
  const onAppraise = (r) => setMrcRec({ record: r, instance: null });
  // Xem lại / chỉnh sửa phần thẩm định (đánh giá yếu tố + điểm) của một bản ghi
  const onReviewAppraisal = (record, instance) => setMrcRec({ record, instance });

  // Hoàn tất chấm điểm rủi ro → hệ thống TẠO bản ghi phiếu thẩm định (1 trong 4 mẫu) ở
  // trạng thái CHƯA hoàn thiện. KSNB sẽ bấm "Hoàn thiện form phiếu thẩm định" sau.
  // Nếu mrc.instanceCode có → đang XEM/SỬA: cập nhật lại bản ghi đó.
  const onMrcComplete = (id, mrc) => {
    const stamp = new Date().toISOString().replace("T", " ").substring(0, 16);
    const editing = !!mrc.instanceCode;
    setAllRecords((rs) => rs.map((r) => {
      if (r.id !== id) return r;
      const blMatched = Object.values(mrc.blacklistConfirmed || {}).filter((v) => v && v !== "KHONG_TRUNG_KHOP").length;
      let history;
      if (editing) {
        history = (r.appraisalHistory || []).map((h) =>
          h.code === mrc.instanceCode
            ? { ...h, rrScore: mrc.rrScore, riskLevel: mrc.rrLevel, mrcAnswers: mrc.mrcAnswers,
                caseCode: mrc.caseCode, blacklistConfirmed: mrc.blacklistConfirmed,
                blacklistMatched: blMatched, eddApplied: mrc.rrLevel === "CAO", revisedAt: stamp }
            : h
        );
      } else {
        const seq = (r.appraisalHistory || []).length + 1;
        const draft = {
          code: `PTD-2026-${String(r.stt).padStart(4, "0")}-${String(seq).padStart(2, "0")}`,
          timestamp: stamp,
          officer: "Lưu Thế Anh",
          unit: "Phòng KSNB",
          caseCode: mrc.caseCode,
          apType: (r.appraisalHistory || []).length > 0 ? "PERIODIC" : "INITIAL",
          rrScore: mrc.rrScore,
          riskLevel: mrc.rrLevel,
          mrcAnswers: mrc.mrcAnswers,
          blacklistConfirmed: mrc.blacklistConfirmed,
          formCompleted: false,           // phiếu chưa hoàn thiện
          conclusion: null,
          blacklistMatched: blMatched,
          eddApplied: mrc.rrLevel === "CAO",
          note: ""
        };
        history = [draft, ...(r.appraisalHistory || [])];
      }
      const updated = {
        ...r,
        rrScore: mrc.rrScore,
        rrLevel: mrc.rrLevel,
        reviewState: r.reviewState === "CHO_LAI" ? "CHO_LAI" : "DA",   // đã chấm điểm → Đã thẩm định (điểm/mức hiển thị)
        appraisalHistory: history
      };
      if (selected && selected.id === id) setSelected(updated);
      return updated;
    }));
    setMrcRec(null);
    setKsnbSignal((n) => n + 1);   // chuyển detail sang tab Hồ sơ thẩm định KSNB
    showToast(editing
      ? `Đã cập nhật thẩm định ${id}: ${mrc.rrScore}/100 · ${mapLevel(mrc.rrLevel)}.`
      : `Đã chấm điểm rủi ro ${id}: ${mrc.rrScore}/100 · ${mapLevel(mrc.rrLevel)}. Hệ thống đã khởi tạo phiếu ${mrc.caseCode} — bấm "Hoàn thiện form phiếu thẩm định".`, "success");
  };

  // Mở phiếu thẩm định để hoàn thiện theo đúng bản ghi (instance) đã tạo
  const onFinishForm = (record, instance) => setAppraisalRec({ record, instance });

  // Hoàn thiện phiếu (lưu trữ nội bộ) — KHÔNG đổi trạng thái thẩm định; chỉ đánh dấu đã hoàn thiện form & lưu chứng từ
  const onAppraisalComplete = (id, result) => {
    setAllRecords((rs) => rs.map((r) => {
      if (r.id !== id) return r;
      const history = (r.appraisalHistory || []).map((h) =>
        h.code === result.instanceCode
          ? {
              ...h,
              formCompleted: true,
              caseCode: result.caseCode || h.caseCode,
              note: result.note && result.note.trim() ? result.note.trim() : h.note
            }
          : h
      );
      const updated = { ...r, appraisalHistory: history };
      if (selected && selected.id === id) setSelected(updated);
      return updated;
    }));
    setAppraisalRec(null);
    showToast(`Đã hoàn thiện & lưu phiếu thẩm định ${result.caseCode} cho ${id} (lưu trữ nội bộ).`, "success");
  };
  const onReset = () => {
    setParams({ search: "", entityType: "ALL", source: "ALL", ccdvStatus: "ALL", blacklistStatus: "ALL", rrLevel: "ALL", reviewState: "ALL", service: "", blacklistType: "" });
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
    setSelected(null);
  };

  const breadcrumb = ["BaoKim Risk", ...(MENU_LABELS[activeMenu] || [])];

  return (
    <div className="h-screen bg-slate-50 flex font-sans text-slate-900">
      <Sidebar activeMenu={activeMenu} onSelect={onMenuSelect} collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onToggleSidebar={() => setSidebarCollapsed(c => !c)} breadcrumb={selected ? null : breadcrumb} />
        {activeMenu === "bl-chitiet" ? (
          <BlacklistDetailView />
        ) : activeMenu === "bl-nhap" ? (
          <ImportListView />
        ) : activeMenu === "bl-phienban" ? (
          <VersionListView />
        ) : activeMenu === "bl-nhatky" ? (
          <BlacklistLogView />
        ) : activeMenu === "cd-danhsach" ? (
          <ScoringLogView />
        ) : activeMenu === "td-danhsach" ? (
          selected ? (
            <MerchantDetail
              record={selected}
              onClose={() => setSelected(null)}
              onRecheck={onRecheck}
              rechecking={recheckingId === selected.id}
              primary={t.primary}
              onAppraise={onAppraise}
              onFinishForm={onFinishForm}
              onReviewAppraisal={onReviewAppraisal}
              ksnbSignal={ksnbSignal}
            />
          ) : (
            <AppraisalQueueView onView={onView} onAppraise={onAppraise} />
          )
        ) : activeMenu === "td-lichsu" ? (
          selected ? (
            <MerchantDetail
              record={selected}
              onClose={() => setSelected(null)}
              onRecheck={onRecheck}
              rechecking={recheckingId === selected.id}
              primary={t.primary}
              onAppraise={onAppraise}
              onFinishForm={onFinishForm}
              onReviewAppraisal={onReviewAppraisal}
              ksnbSignal={ksnbSignal}
            />
          ) : (
            <AppraisalHistoryView onView={onView} />
          )
        ) : activeMenu !== "lich-su-check" ? (
          <PlaceholderView label={(MENU_LABELS[activeMenu] || [""]).slice(-1)[0]} />
        ) : selected ? (
          <MerchantDetail
            record={selected}
            onClose={() => setSelected(null)}
            onRecheck={onRecheck}
            rechecking={recheckingId === selected.id}
            primary={t.primary}
            onAppraise={onAppraise}
            onFinishForm={onFinishForm}
            onReviewAppraisal={onReviewAppraisal}
            ksnbSignal={ksnbSignal}
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

      <MrcDrawer
        record={mrcRec ? mrcRec.record : null}
        instance={mrcRec ? mrcRec.instance : null}
        open={!!mrcRec}
        onClose={() => setMrcRec(null)}
        onComplete={onMrcComplete}
      />

      <AppraisalDrawer
        record={appraisalRec ? appraisalRec.record : null}
        instance={appraisalRec ? appraisalRec.instance : null}
        open={!!appraisalRec}
        onClose={() => setAppraisalRec(null)}
        onComplete={onAppraisalComplete}
      />

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

// helper: trộn hex với trắng (t = tỉ lệ trắng) → hex sáng hơn
function lightenHex(hex, t) {
  const h = hex.replace("#", "");
  const mix = (c) => Math.round(parseInt(c, 16) * (1 - t) + 255 * t).toString(16).padStart(2, "0");
  return `#${mix(h.substring(0, 2))}${mix(h.substring(2, 4))}${mix(h.substring(4, 6))}`;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
