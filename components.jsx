// Shared visual components for BaoKim Risk dashboard

const { useState, useEffect, useRef, useMemo } = React;

// ──────────────────────────────────────────────────────────────────────────
// MAPPERS
// ──────────────────────────────────────────────────────────────────────────
function mapEntity(t) {
  return { CA_NHAN: "Cá nhân", TO_CHUC: "Tổ chức", HO_KINH_DOANH: "Hộ KD" }[t] || t;
}
function mapEntityFull(t) {
  return { CA_NHAN: "Cá nhân", TO_CHUC: "Tổ chức / Doanh nghiệp", HO_KINH_DOANH: "Hộ kinh doanh cá thể" }[t] || t;
}
function mapSource(s) {
  return { PORTAL_B2B: "Portal B2B", ERP: "ERP", DV_KHAC: "Dịch vụ khác" }[s] || s;
}
function mapMatchLevel(m) {
  return {
    TRUNG_KHOP_TOAN_BO: "Trùng khớp toàn bộ",
    TRUNG_KHOP_1_NHOM: "Trùng khớp một nhóm",
    KHONG_TRUNG_KHOP: "Không trùng khớp"
  }[m] || m;
}
function mapAction(a) {
  return {
    DUNG_CCDV: "Dừng CCDV",
    TIEP_TUC_CCDV: "Tiếp tục cung cấp dịch vụ",
    AP_DUNG_THEM_RULE: "Áp dụng thêm quy tắc",
    GHI_NHAN_HIT_BLACKLIST: "Ghi nhận hit Blacklist"
  }[a] || a;
}
function mapLevel(l) {
  return { CAO: "Cao", TRUNG_BINH: "Trung bình", THAP: "Thấp" }[l] || l;
}
function mapAppraisal(a) {
  return {
    CHO_THAM_DINH: "Chờ thẩm định",
    DANG_THAM_DINH: "Đang thẩm định",
    DAT: "Đạt",
    DAT_DIEU_KIEN: "Đạt có điều kiện",
    KHONG_DAT: "Không đạt"
  }[a] || a;
}
function mapReviewState(s) {
  return { KHONG: "Không thẩm định", CHO: "Chờ thẩm định", DA: "Đã thẩm định", CHO_LAI: "Chờ thẩm định lại" }[s] || s;
}
// Điểm & Mức rủi ro chỉ hiển thị khi đã có kết quả thẩm định (Đã thẩm định / Chờ thẩm định lại)
function riskVisible(state) {
  return state === "DA" || state === "CHO_LAI";
}

// ──────────────────────────────────────────────────────────────────────────
// BADGES
// ──────────────────────────────────────────────────────────────────────────
function CCDVBadge({ status, size = "md", fullWidth }) {
  const s = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5";
  const w = fullWidth ? "flex w-full justify-center" : "inline-flex";
  if (status === "KHONG_DUOC_CCDV") {
    return (
      <span className={`${w} items-center gap-1.5 ${s} font-bold border rounded bdg-danger`}>
        <span className="w-1.5 h-1.5 rounded-full bdg-dot"></span>
        Từ chối
      </span>);

  }
  return (
    <span className={`${w} items-center gap-1.5 ${s} font-bold border rounded bdg-success`}>
      <span className="w-1.5 h-1.5 rounded-full bdg-dot"></span>
      Cho phép
    </span>);

}

function BlacklistBadge({ status, hits = 0, size = "md", fullWidth }) {
  const s = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5";
  const w = fullWidth ? "flex w-full justify-center" : "inline-flex";
  if (status === "HIT") {
    return (
      <span className={`${w} items-center gap-1.5 ${s} font-bold border rounded bdg-danger`}>
        <span className="w-1.5 h-1.5 rounded-full bdg-dot"></span>
        Có
      </span>);

  }
  return (
    <span className={`${w} items-center gap-1.5 ${s} font-bold border rounded bdg-success`}>
      <span className="w-1.5 h-1.5 rounded-full bdg-dot"></span>
      Không
    </span>);

}

function RiskLevelChip({ level, score, size = "md" }) {
  const cfg = {
    CAO: { bdg: "bdg-danger" },
    TRUNG_BINH: { bdg: "bdg-warning" },
    THAP: { bdg: "bdg-success" }
  }[level] || { bdg: "bdg-secondary" };
  const s = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5";
  return (
    <span className={`inline-flex items-center gap-1.5 ${s} font-bold border rounded ${cfg.bdg}`}>
      <span className="w-1.5 h-1.5 rounded-full bdg-dot"></span>
      {mapLevel(level)}{score != null ? <span className="font-mono font-bold tabular-nums">· {score}</span> : null}
    </span>);

}

// Inline risk gauge — horizontal bar with marker
function RiskGauge({ score, level, style = "bar" }) {
  const max = 105;
  const pct = Math.min(100, score / max * 100);
  const cfg = {
    CAO: { fill: "var(--sem-danger)", text: "var(--sem-danger)", track: "#fdecec" },
    TRUNG_BINH: { fill: "var(--sem-warning)", text: "#c6781d", track: "#fff2e5" },
    THAP: { fill: "var(--sem-success)", text: "#1f9254", track: "#e6f8ee" }
  }[level] || { fill: "#94a3b8", text: "#475569", track: "#f1f5f9" };

  if (style === "dots") {
    const total = 10;
    const filled = Math.round(score / max * total);
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {Array.from({ length: total }).map((_, i) =>
          <span key={i} className="w-1 h-3 rounded-sm" style={{ background: i < filled ? cfg.fill : "#e8edf3" }} />
          )}
        </div>
        <span className="font-mono text-xs font-bold tabular-nums" style={{ color: cfg.text }}>{score}</span>
      </div>);

  }
  if (style === "pill") {
    return <RiskLevelChip level={level} score={score} />;
  }
  // bar (default)
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: cfg.track }}>
        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: cfg.fill }}></div>
      </div>
      <span className="font-mono text-[12px] font-bold tabular-nums w-7 text-right" style={{ color: cfg.text }}>{score}</span>
    </div>);

}

// Appraisal status badge (KSNB)
function AppraisalBadge({ status, size = "md" }) {
  const cls = {
    CHO_THAM_DINH: "bdg-secondary",
    DANG_THAM_DINH: "bdg-info",
    DAT: "bdg-success",
    DAT_DIEU_KIEN: "bdg-warning",
    KHONG_DAT: "bdg-danger"
  }[status] || "bdg-secondary";
  const s = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5";
  return (
    <span className={`inline-flex items-center gap-1.5 ${s} font-bold rounded border ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bdg-dot"></span>
      {mapAppraisal(status)}
    </span>);

}

// Kết quả thẩm định (chỉ 2 giá trị): "Cho phép CCDV" / "Từ chối CCDV".
// Trả về "ALLOW" | "DENY" | null (chưa có kết quả).
function apResult(r) {
  if (r.ccdvStatus === "KHONG_DUOC_CCDV" || r.appraisalStatus === "KHONG_DAT") return "DENY";
  if (r.appraisalStatus === "DAT" || r.appraisalStatus === "DAT_DIEU_KIEN") return "ALLOW";
  return null;
}
function AppraisalResultBadge({ record, size = "md" }) {
  const res = apResult(record);
  const s = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5";
  if (!res) return <span className="text-slate-300 font-mono">—</span>;
  const cls = res === "DENY" ? "bdg-danger" : "bdg-success";
  return (
    <span className={`inline-flex items-center gap-1.5 ${s} font-bold rounded border ${cls} whitespace-nowrap`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0 bdg-dot"></span>
      {res === "DENY" ? "Từ chối CCDV" : "Cho phép CCDV"}
    </span>);

}

// Review state badge for merchant list column (Trạng thái thẩm định)
function ReviewStateBadge({ state, size = "md", fullWidth }) {
  const cls = {
    KHONG: "bdg-secondary",
    CHO: "bdg-secondary",
    DA: "bdg-success",
    CHO_LAI: "bdg-warning"
  }[state] || "bdg-secondary";
  const s = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5";
  const w = fullWidth ? "flex w-full justify-center" : "inline-flex";
  return (
    <span className={`${w} items-center gap-1.5 ${s} font-bold rounded border ${cls} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 bdg-dot ${state === "CHO_LAI" ? "animate-pulse" : ""}`}></span>
      {mapReviewState(state)}
    </span>);

}

// Match level pill for blacklist results
function MatchLevelPill({ match }) {
  const cls = {
    TRUNG_KHOP_TOAN_BO: "bdg-danger",
    TRUNG_KHOP_1_NHOM: "bdg-warning",
    KHONG_TRUNG_KHOP: "bdg-secondary"
  }[match] || "bdg-secondary";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${cls}`}>
      {mapMatchLevel(match)}
    </span>);

}

// ──────────────────────────────────────────────────────────────────────────
// ICONS — small inline SVGs to avoid lucide dependency
// ──────────────────────────────────────────────────────────────────────────
function Icon({ name, className = "w-4 h-4", strokeWidth = 1.75 }) {
  const paths = {
    shield: "M12 2.5l8 3.5v6c0 5-3.5 8.7-8 10.5-4.5-1.8-8-5.5-8-10.5v-6l8-3.5z",
    search: "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.3-4.3",
    filter: "M3 5h18M6 12h12M10 19h4",
    download: "M12 4v12m0 0l-4-4m4 4l4-4M4 20h16",
    upload: "M12 20V8m0 0l-4 4m4-4l4 4M4 4h16",
    import: "M14 3h5a2 2 0 012 2v14a2 2 0 01-2 2h-5M3 12h11m0 0l-4-4m4 4l-4 4",
    refresh: "M3 12a9 9 0 1015.5-6.4M21 4v5h-5",
    chevronDown: "M6 9l6 6 6-6",
    chevronUp: "M6 15l6-6 6 6",
    chevronLeft: "M15 18l-6-6 6-6",
    chevronRight: "M9 18l6-6-6-6",
    arrowLeft: "M19 12H5m0 0l6 6m-6-6l6-6",
    arrowRight: "M5 12h14m0 0l-6-6m6 6l-6 6",
    x: "M18 6L6 18M6 6l12 12",
    eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 15a3 3 0 100-6 3 3 0 000 6z",
    bell: "M6 8a6 6 0 1112 0v4l2 4H4l2-4V8zM10 20a2 2 0 004 0",
    user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
    building: "M4 21V5a2 2 0 012-2h8a2 2 0 012 2v16M9 8h2M9 12h2M9 16h2M14 12h2M14 16h2M14 8h2M2 21h20",
    card: "M2 8h20M2 8a2 2 0 012-2h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8zM6 14h4",
    file: "M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6zM14 3v6h6",
    copy: "M9 9h10a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2V11a2 2 0 012-2zM5 15H4a2 2 0 01-2-2V3a2 2 0 012-2h10a2 2 0 012 2v1",
    check: "M5 12l5 5L20 7",
    alert: "M12 9v4m0 4h0M4.93 19h14.14a2 2 0 001.74-3l-7.07-12a2 2 0 00-3.48 0l-7.07 12a2 2 0 001.74 3z",
    history: "M3 12a9 9 0 109-9 9.7 9.7 0 00-7 3.1L3 9M3 3v6h6M12 7v5l4 2",
    sliders: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
    grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
    layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    plus: "M12 5v14m-7-7h14",
    menu: "M3 6h18M3 12h18M3 18h18",
    book: "M4 4a2 2 0 012-2h12v20H6a2 2 0 01-2-2V4zM18 2v20",
    moreV: "M12 5v.01M12 12v.01M12 19v.01",
    info: "M12 8h.01M11 12h1v4h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    flag: "M4 21V4m0 0h12l-3 5 3 5H4",
    activity: "M22 12h-4l-3 9L9 3l-3 9H2",
    network: "M12 6a3 3 0 100-6 3 3 0 000 6zM5 24a3 3 0 100-6 3 3 0 000 6zM19 24a3 3 0 100-6 3 3 0 000 6zM12 9v6m-6 4l5-5m8 5l-5-5",
    fingerprint: "M12 11a3 3 0 00-3 3v3M16 17v-3a4 4 0 00-7.9-1M20 17v-3a8 8 0 10-16 0v3M4 21h16",
    target: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z",
    scale: "M12 3v18M7 21h10M5 7h14M5 7l-3 6a3 3 0 006 0L5 7zm14 0l-3 6a3 3 0 006 0l-3-6zM12 3a2 2 0 100 4 2 2 0 000-4z",
    // Translate / ngôn ngữ (文A)
    translate: ["M4 5h7M9 3v2c0 4-2.5 7-6 8", "M5 9c0 2.5 2.5 4.5 6 5.5", "M13 20l4-9 4 9M14.5 17h5"],
    // Light / dark theme (mặt trời)
    sun: ["M12 8a4 4 0 100 8 4 4 0 000-8z", "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"],
    // Apps / thêm shortcut (lưới +)
    gridPlus: ["M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z", "M17 14v6M14 17h6"]
  };
  const d = paths[name] || paths.info;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>);

}

// ──────────────────────────────────────────────────────────────────────────
// Mini sparkline for KPI strip
// ──────────────────────────────────────────────────────────────────────────
function Sparkline({ values, color = "currentColor", width = 60, height = 18 }) {
  if (!values || values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1 || 1);
  const points = values.map((v, i) => `${i * step},${height - (v - min) / range * height}`).join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(values.length - 1) * step} cy={height - (values[values.length - 1] - min) / range * height} r="1.75" fill={color} />
    </svg>);

}

// ──────────────────────────────────────────────────────────────────────────
// Toast
// ──────────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const cfg = {
    success: { icon: "check", color: "text-emerald-400" },
    info: { icon: "info", color: "text-sky-400" },
    warn: { icon: "alert", color: "text-amber-400" }
  }[toast.type] || { icon: "info", color: "text-sky-400" };
  return (
    <div className="fixed bottom-5 right-5 z-[60] max-w-sm bg-slate-900 text-white rounded-lg p-3 shadow-2xl border border-slate-700 flex items-start gap-2.5 animate-toast-in">
      <div className={`mt-0.5 shrink-0 ${cfg.color}`}>
        <Icon name={cfg.icon} className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <span className="text-[10px] font-bold block uppercase tracking-wider text-slate-300">BaoKim Risk</span>
        <p className="text-[12px] text-white mt-0.5 leading-snug">{toast.text}</p>
      </div>
    </div>);

}

// Expose
Object.assign(window, {
  mapEntity, mapEntityFull, mapSource, mapMatchLevel, mapAction, mapLevel, mapAppraisal, mapReviewState, riskVisible,
  CCDVBadge, BlacklistBadge, RiskLevelChip, RiskGauge, MatchLevelPill, AppraisalBadge, AppraisalResultBadge, apResult, ReviewStateBadge,
  Icon, Sparkline, Toast
});