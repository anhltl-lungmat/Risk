// ─────────────────────────────────────────────────────────────────
// appraisal-taxonomy.jsx — Khái niệm dùng chung cho 2 màn Thẩm định
// (Hồ sơ cần xử lý + Lịch sử thẩm định)
//
// Loại thẩm định : Lần đầu | Tái thẩm định
// Nguyên nhân     : Merchant mới (Onboarding) · Định kỳ · Thay đổi thông tin
//                   Merchant · Hit Blacklist · Thay đổi mức rủi ro ·
//                   Theo yêu cầu KSNB / Pháp chế / BLĐ · Theo cảnh báo giao dịch · Khác
// Trạng thái hồ sơ: Chờ xử lý · Đang xử lý · Chờ bổ sung hồ sơ · Chờ phê duyệt ·
//                   Đã hoàn thành · Từ chối · Đã hủy · Quá hạn
// ─────────────────────────────────────────────────────────────────

const AP_TYPE = { FIRST: "Lần đầu", RE: "Tái thẩm định" };

// Loại thẩm định — theo record (queue) hoặc theo từng lượt (history entry)
function apTypeOf(r, hEntry) {
  if (hEntry) return hEntry.apType === "INITIAL" ? AP_TYPE.FIRST : AP_TYPE.RE;
  const isFirst = (r.appraisalHistory || []).length === 0 || r.appraisalStatus === "CHO_THAM_DINH";
  return isFirst && r.reviewState !== "CHO_LAI" ? AP_TYPE.FIRST : AP_TYPE.RE;
}

// Nguyên nhân phát sinh (một giá trị, theo thứ tự ưu tiên)
function apReasonOf(r) {
  const isFirst = ((r.appraisalHistory || []).length === 0 || r.appraisalStatus === "CHO_THAM_DINH") && r.reviewState !== "CHO_LAI";
  if (isFirst) return "Merchant mới (Onboarding)";
  if (r.blacklistStatus === "HIT") return "Hit Blacklist";
  if (r.reviewState === "CHO_LAI") return "Định kỳ";
  if (r.rrLevel === "CAO") return "Thay đổi mức rủi ro";
  const rotate = ["Thay đổi thông tin Merchant", "Theo yêu cầu KSNB", "Theo yêu cầu Pháp chế", "Theo yêu cầu BLĐ", "Theo cảnh báo giao dịch", "Khác"];
  return rotate[(r.stt || 0) % rotate.length];
}

// Trạng thái hồ sơ (màn Hồ sơ cần xử lý) — định hướng tiến trình
// (Quá hạn được thể hiện riêng ở cột "Hạn xử lý", không ghi đè trạng thái nghiệp vụ)
function apStatusQueue(r) {
  if (r.appraisalStatus === "CHO_THAM_DINH") return "Chờ xử lý";
  if (r.appraisalStatus === "DANG_THAM_DINH") return r.blacklistStatus === "HIT" ? "Chờ phê duyệt" : "Đang xử lý";
  if (r.appraisalStatus === "DAT_DIEU_KIEN") return "Chờ bổ sung hồ sơ";
  if (r.appraisalStatus === "DAT") return "Đã hoàn thành";
  if (r.appraisalStatus === "KHONG_DAT") return "Từ chối";
  return "Chờ xử lý";
}

// Kết quả xử lý (màn Lịch sử thẩm định) — kết luận của lượt thẩm định
function apResultOf(conclusion) {
  return {
    DAT: "Đã hoàn thành",
    DAT_DIEU_KIEN: "Đã hoàn thành",
    KHONG_DAT: "Từ chối",
    DANG_THAM_DINH: "Đang xử lý",
    CHO_THAM_DINH: "Chờ xử lý",
  }[conclusion] || "Đã hoàn thành";
}

// Cấu hình màu badge cho 8 trạng thái
const AP_STATUS_CFG = {
  "Chờ xử lý":          { cls: "bdg-secondary" },
  "Đang xử lý":         { cls: "bdg-info" },
  "Chờ bổ sung hồ sơ":  { cls: "bdg-warning" },
  "Chờ phê duyệt":      { cls: "bdg-primary" },
  "Đã hoàn thành":      { cls: "bdg-success" },
  "Từ chối":            { cls: "bdg-danger" },
  "Đã hủy":             { cls: "bdg-secondary" },
  "Quá hạn":            { cls: "bdg-danger" },
};

function AppStatusBadge({ status, size = "md" }) {
  const cfg = AP_STATUS_CFG[status] || AP_STATUS_CFG["Chờ xử lý"];
  const s = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5";
  return (
    <span className={`inline-flex items-center gap-1.5 ${s} font-bold rounded border whitespace-nowrap ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bdg-dot"></span>
      {status}
    </span>
  );
}

Object.assign(window, { AP_TYPE, apTypeOf, apReasonOf, apStatusQueue, apResultOf, AP_STATUS_CFG, AppStatusBadge });
