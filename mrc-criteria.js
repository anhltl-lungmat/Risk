// ───────────────────────────────────────────────────────────────────────────
// mrc-criteria.js — Bộ tiêu chí THẨM ĐỊNH MERCHANT (chấm điểm rủi ro RT/TTKB)
// Số hoá từ Bảng tiêu chí đánh giá rủi ro của BaoKim. Khác với Phiếu thẩm định.
//
// Cấu trúc: 3 nhóm yếu tố rủi ro
//   I.   Khách hàng           (1.1 PEP · 1.2 Lĩnh vực NRA · 1.3 Blacklist · 1.4 Thoả thuận PL)
//   II.  Sản phẩm, dịch vụ    (2.1 Điều kiện kinh doanh · 2.2 Che giấu danh tính)
//   III. Vị trí địa lý        (3.1 Xung đột · 3.2 Thiên đường thuế · 3.3 FATF grey · 3.4 FATF ML · 3.5 Cấm vận LHQ)
//
// Mỗi tiêu chí gồm các "case" — mỗi case có trọng số điểm (pts) + sắc thái (tone).
// Tổng điểm (chặn trần 100) → quy ra mức: Thấp / Trung bình / Cao.
// Bảng điểm dưới đây là ĐỀ XUẤT — có thể điều chỉnh theo khẩu vị rủi ro của Công ty.
// ───────────────────────────────────────────────────────────────────────────

// Ngưỡng quy mức (trên thang điểm đã chặn trần 100)
const MRC_BANDS = { TRUNG_BINH: 30, CAO: 60 };

// Chủ thể đánh giá theo loại đối tượng (CN / TC / Hộ KD)
function mrcSubject(entityType) {
  if (entityType === "CA_NHAN") return "Khách hàng";
  if (entityType === "HO_KINH_DOANH") return "Chủ hộ kinh doanh";
  return "Khách hàng hoặc Người đại diện theo pháp luật";
}

// Helper tạo case
const C = (v, label, pts, tone) => ({ v, label, pts, tone: tone || (pts >= 40 ? "danger" : pts >= 12 ? "warn" : "ok") });

// Trường thông tin nhận dạng — Cá nhân (Bên tham gia thoả thuận pháp lý)
const LEGAL_FIELDS_CN = [
  "Họ và tên",
  "Mã số thuế",
  "Ngày, tháng, năm sinh",
  "Số CMND/CCCD/Số định danh cá nhân/Hộ chiếu/Thị thực nhập cảnh",
  "Quốc tịch",
  "Nghề nghiệp/Chức vụ",
  "Số điện thoại",
  "Nơi ở hiện tại (người VN)/Nơi đăng ký cư trú ở VN (người nước ngoài)",
  "Địa chỉ thường trú (người VN)/Nơi đăng ký cư trú ở nước ngoài (người nước ngoài)",
];
// Trường thông tin nhận dạng — Tổ chức (chia 2 nhóm)
const LEGAL_FIELDS_TC = [
  { sub: "Thông tin chung" },
  "Tên giao dịch bằng tiếng Việt",
  "Tên viết tắt",
  "Địa chỉ trụ sở chính",
  "Số giấy phép thành lập/mã số thuế/mã số doanh nghiệp",
  "Số điện thoại",
  "Email",
  "Website/App tích hợp Dịch vụ trung gian thanh toán (nếu có)",
  "Mục đích sử dụng Dịch vụ trung gian thanh toán của Khách hàng",
  "Ngành nghề, lĩnh vực kinh doanh",
  { sub: "Thông tin người đại diện pháp luật" },
  "Họ và tên",
  "Ngày, tháng, năm sinh",
  "Số CMND/CCCD/Số định danh cá nhân/Hộ chiếu/Thị thực nhập cảnh",
  "Quốc tịch",
  "Nghề nghiệp/Chức vụ",
  "Số điện thoại",
  "Nơi ở hiện tại (người VN)/Nơi đăng ký cư trú ở VN (người nước ngoài)",
  "Địa chỉ thường trú (người VN)/Nơi đăng ký cư trú ở nước ngoài (người nước ngoài)",
];

// Sinh bộ tiêu chí theo loại đối tượng
function mrcCriteria(entityType) {
  const subj = mrcSubject(entityType);
  const foreignSubj = entityType === "CA_NHAN"
    ? "Khách hàng nước ngoài là cá nhân"
    : entityType === "HO_KINH_DOANH"
      ? "Chủ hộ kinh doanh là người nước ngoài"
      : "Người đại diện theo pháp luật là người nước ngoài";

  return [
    {
      code: "I", title: "Yếu tố khách hàng", icon: "user",
      items: [
        {
          id: "legal", n: "1", t: "multi",
          q: "Khách hàng có tham gia thoả thuận pháp lý",
          options: [
            { v: "uythac", label: "Thoả thuận uỷ thác", legal: true },
            { v: "uyquyen", label: "Thoả thuận uỷ quyền", legal: true },
            { v: "khac", label: "Thoả thuận khác", legal: true },
            { v: "none", label: "Không tham gia" },
          ],
        },
      ],
    },
    {
      code: "II", title: "Yếu tố sản phẩm, dịch vụ của KH tích hợp thanh toán với DVTGTT", icon: "card",
      items: [
        {
          id: "bizType", n: "1", t: "autofill", autoKey: "businessType",
          q: "Tên ngành nghề kinh doanh",
          hint: "Hệ thống tự điền — KSNB có thể sửa",
        },
        {
          id: "sector_law", n: "2", t: "dual",
          q: "Loại ngành nghề kinh doanh",
          rows: [
            {
              id: "sector_law", n: "2.1", q: "Ngành nghề kinh doanh có trong quy định pháp luật",
              cases: [C("co", "Có", 0), C("khong", "Không", 18)],
            },
            {
              id: "sector_cond", n: "2.2", q: "Ngành nghề kinh doanh có điều kiện",
              cases: [C("co", "Có", 8), C("khong", "Không", 0)],
              disabledWhen: { id: "sector_law", enabledValue: "co" },   // mờ/khoá khi 2.1 ≠ Có
            },
          ],
        },
        {
          id: "license", n: "3", t: "single",
          q: "Giấy chứng nhận đủ điều kiện kinh doanh",
          cases: [
            C("co", "Đã có", 0),
            C("chua", "Chưa có", 18),
          ],
        },
        {
          id: "webreg", n: "4", t: "single",
          q: "Website/ứng dụng của khách hàng tích hợp với dịch vụ TGTT công ty đã thực hiện thủ tục thông báo/đăng ký theo quy định của pháp luật về thương mại điện tử hoặc quy định khác với Cơ quan nhà nước có thẩm quyền",
          cases: [
            C("none", "Chưa thực hiện", 20),
            C("pending", "Đang thực hiện", 10),
            C("done", "Đã hoàn thành", 0),
          ],
        },
        {
          id: "anon", n: "5", t: "single",
          q: "Thông tin nhận dạng (họ tên, số điện thoại/địa chỉ/email) của người mua/người thanh toán hàng hoá, dịch vụ ẩn danh",
          cases: [
            C("khong_thu_thap", "Không thu thập", 25),
            C("co_thu_thap", "Có thu thập", 0),
            C("khong_chia_se", "Có thu thập nhưng không chia sẻ thông tin khi nhận được yêu cầu của công ty", 15),
          ],
        },
      ],
    },
  ];
}

// ── Prefill từ dữ liệu hệ thống ──
const _norm = (s) => (s || "").toLowerCase();

// Gom 6 danh sách blacklist của bản ghi về { pep, core } để suy ra 1.1 & 1.3
function mrcBlacklistDigest(record) {
  const rank = { TRUNG_KHOP_TOAN_BO: 3, TRUNG_KHOP_1_NHOM: 2, KHONG_TRUNG_KHOP: 1 };
  const res = record.blacklistResults || [];
  const pick = (kws) => {
    let best = "KHONG_TRUNG_KHOP";
    res.forEach((r) => {
      if (kws.some((k) => _norm(r.name).includes(k)) && (rank[r.match] || 0) > (rank[best] || 0)) best = r.match;
    });
    return best;
  };
  return {
    pep: pick(["pep", "ảnh hưởng chính trị"]),
    core: pick(["đen", "black", "cảnh báo", "cic", "bị can", "bị cáo", "kết án", "trốn thuế", "tax"]),
  };
}

function matchToCase(match) {
  return match === "TRUNG_KHOP_TOAN_BO" ? "full" : match === "TRUNG_KHOP_1_NHOM" ? "partial" : "none";
}

// Khởi tạo đáp án prefill cho toàn bộ tiêu chí
function mrcPrefill(record) {
  const nat = _norm(record.personalInfo && record.personalInfo.nationality);
  const isVN = nat === "" || nat.includes("việt");
  const hasLicence = !!(record.businessInfo && record.businessInfo.businessLicenceNo);

  const a = {
    // I — Yếu tố khách hàng
    legal: ["none"],          // thoả thuận pháp lý (đa lựa chọn)
    legal_cn: null,           // trạng thái thu thập thông tin — Cá nhân
    legal_to: null,           // trạng thái thu thập thông tin — Tổ chức
    // II — Sản phẩm, dịch vụ
    bizType: record.businessType && record.businessType !== "—" ? record.businessType : "",  // tự điền, sửa được
    license: hasLicence ? "co" : "chua",
    sector_law: "co",
    sector_cond: "khong",
    webreg: "done",
    anon: "co_thu_thap",
  };
  if (!isVN) a._foreignFlag = true;
  return a;
}

// ── Chấm điểm ──
function mrcScore(record, answers) {
  const groups = mrcCriteria(record.entityType);
  const ptsOf = (item, val) => {
    // Nhóm tiêu chí kép (vd: 3.1 + 3.2): cộng điểm từng dòng; dòng bị khoá không tính
    if (item.t === "dual") {
      return item.rows.reduce((s, row) => {
        const locked = row.disabledWhen && answers[row.disabledWhen.id] !== row.disabledWhen.enabledValue;
        if (locked) return s;
        const c = row.cases.find((x) => x.v === answers[row.id]);
        return s + (c ? c.pts : 0);
      }, 0);
    }
    // Thoả thuận pháp lý (đa lựa chọn): tham gia + chưa thu thập đủ → rủi ro cao hơn
    if (item.t === "multi" && item.id === "legal") {
      const arr = Array.isArray(val) ? val : [];
      const participate = arr.some((v) => v && v !== "none");
      if (!participate) return 0;
      const subj = [answers.legal_cn, answers.legal_to].filter(Boolean);
      const complete = subj.length > 0 && subj.every((s) => s === "complete");
      return complete ? 8 : 20;
    }
    // Tự điền / KSNB nhập: không tính điểm
    if (!item.cases) return 0;
    const c = item.cases.find((x) => x.v === val);
    let pts = c ? c.pts : 0;
    // Lựa chọn phụ có điều kiện (vd: Loại ngành nghề → Có/Không điều kiện)
    if (item.sub && val === item.sub.when) {
      const sc = item.sub.cases.find((x) => x.v === answers[item.sub.id]);
      if (sc) pts += sc.pts;
    }
    return pts;
  };
  const breakdown = groups.map((g) => {
    const sub = g.items.reduce((s, it) => s + ptsOf(it, answers[it.id]), 0);
    return { code: g.code, title: g.title, icon: g.icon, sub };
  });
  const raw = breakdown.reduce((s, b) => s + b.sub, 0);
  const total = Math.min(100, raw);
  const level = total >= MRC_BANDS.CAO ? "CAO" : total >= MRC_BANDS.TRUNG_BINH ? "TRUNG_BINH" : "THAP";
  return { raw, total, level, breakdown };
}

// 6-list blacklist để chuyển sang Phiếu (giữ nguyên độ chi tiết của Phiếu)
function mrcSixList(record) {
  const rank = { TRUNG_KHOP_TOAN_BO: 3, TRUNG_KHOP_1_NHOM: 2, KHONG_TRUNG_KHOP: 1 };
  const res = record.blacklistResults || [];
  const clamp = window.clampBlacklist || ((id, m) => m);
  const pick = (kws) => {
    let best = "KHONG_TRUNG_KHOP";
    res.forEach((r) => { if (kws.some((k) => _norm(r.name).includes(k)) && (rank[r.match] || 0) > (rank[best] || 0)) best = r.match; });
    return best;
  };
  return {
    bl1: clamp("bl1", pick(["đen", "black"])),
    bl2: clamp("bl2", pick(["bị can", "bị cáo", "kết án", "convict"])),
    bl3: clamp("bl3", pick(["cảnh báo", "cic", "alert"])),
    bl4: clamp("bl4", pick(["simo"])),
    bl5: clamp("bl5", pick(["trốn thuế", "tax"])),
    bl6: clamp("bl6", pick(["pep", "ảnh hưởng chính trị"])),
  };
}

window.MRC_BANDS = MRC_BANDS;
window.LEGAL_FIELDS_CN = LEGAL_FIELDS_CN;
window.LEGAL_FIELDS_TC = LEGAL_FIELDS_TC;
window.mrcCriteria = mrcCriteria;
window.mrcPrefill = mrcPrefill;
window.mrcScore = mrcScore;
window.mrcBlacklistDigest = mrcBlacklistDigest;
window.mrcSixList = mrcSixList;
