// ───────────────────────────────────────────────────────────────────────────
// phieu-forms.js — Cấu trúc trường thông tin của 4 biểu mẫu phiếu thẩm định
// Số hoá nguyên văn từ tài liệu nghiệp vụ BaoKim:
//   BM01  — ĐVCNTT · Cá nhân
//   BM02  — ĐVCNTT · Tổ chức / Hộ kinh doanh
//   BM1.1 — Ví điện tử · Cá nhân
//   BM2.1 — Ví điện tử · Tổ chức / Hộ kinh doanh
// Mỗi phiếu = danh sách "block": group divider hoặc section (mã La Mã + items).
// ───────────────────────────────────────────────────────────────────────────

// ── Bộ phương án dùng lại ──
const OPT = {
  match3: [
    { v: "TRUNG_KHOP_TOAN_BO", label: "Trùng khớp toàn bộ", tone: "danger" },
    { v: "TRUNG_KHOP_1_NHOM", label: "Trùng khớp một nhóm", tone: "warn" },
    { v: "KHONG_TRUNG_KHOP", label: "Không trùng khớp", tone: "ok" },
  ],
  match2: [
    { v: "TRUNG_KHOP_TOAN_BO", label: "Trùng khớp toàn bộ", tone: "danger" },
    { v: "KHONG_TRUNG_KHOP", label: "Không trùng khớp", tone: "ok" },
  ],
  coDanger: [{ v: "co", label: "Có", tone: "danger" }, { v: "khong", label: "Không", tone: "ok" }],
  coOk: [{ v: "co", label: "Có", tone: "ok" }, { v: "khong", label: "Không", tone: "danger" }],
  docCo: [{ v: "co", label: "Đã có", tone: "ok" }, { v: "thieu", label: "Thiếu", tone: "warn" }, { v: "na", label: "Không áp dụng" }],
  channel: [
    { v: "web", label: "Sàn TMĐT / Website" },
    { v: "contract", label: "Hợp đồng mẫu" },
    { v: "social", label: "Mạng xã hội" },
    { v: "onsite", label: "Trực tiếp tại địa điểm" },
  ],
  scale: [
    { v: "micro", label: "Siêu nhỏ" },
    { v: "small", label: "Nhỏ" },
    { v: "medium", label: "Vừa" },
  ],
  relCN: [
    { v: "vi", label: "Cá nhân sở hữu một tài khoản Ví điện tử" },
    { v: "company", label: "Cá nhân thiết lập mối quan hệ với Công ty" },
    { v: "other", label: "Tiêu chí khác theo hướng dẫn Chính phủ" },
  ],
  relTC: [
    { v: "own25", label: "Nắm giữ trực/gián tiếp ≥ 25% vốn điều lệ" },
    { v: "control", label: "Cá nhân cuối cùng có quyền chi phối" },
    { v: "listed", label: "Cá nhân được công bố khi niêm yết" },
  ],
  legal: [
    { v: "uythac", label: "Thoả thuận uỷ thác" },
    { v: "uyquyen", label: "Thoả thuận uỷ quyền" },
    { v: "khac", label: "Thoả thuận khác" },
    { v: "none", label: "Không tham gia", tone: "ok" },
  ],
  risk5: [
    { v: "THAP", label: "Thấp", tone: "ok" },
    { v: "TB_THAP", label: "Trung bình thấp", tone: "ok" },
    { v: "TRUNG_BINH", label: "Trung bình", tone: "warn" },
    { v: "TB_CAO", label: "Trung bình cao", tone: "warn" },
    { v: "CAO", label: "Cao", tone: "danger" },
  ],
};

// ── Item helpers ──
const info = (n, label, auto, note) => ({ t: "info", n, label, auto: auto || null, note: note || null });
const choice = (id, n, q, opts, o) => ({ t: "choice", id, n, q, opts, auto: !!(o && o.auto), multi: !!(o && o.multi), vertical: !!(o && o.vertical), hint: (o && o.hint) || null });
const doc = (id, n, label) => ({ t: "doc", id, n, label });
const subhead = (label) => ({ t: "subhead", label });

const grp = (label) => ({ kind: "group", label });
const sec = (code, title, items, flags) => Object.assign({ kind: "section", code, title, items }, flags || {});

// ── Khối dùng lại ──

// Blacklist — 6 bộ danh sách theo đúng tài liệu (2 hoặc 3 mức)
function blacklistSection(code) {
  const lists = [
    ["bl1", "1", "Danh sách Đen", 3],
    ["bl2", "2", "Danh sách bị can, bị cáo, bị kết án", 2],
    ["bl3", "3", "Danh sách cảnh báo", 3],
    ["bl4", "4", "Danh sách Simo", 2],
    ["bl5", "5", "Danh sách trốn thuế", 2],
    ["bl6", "6", "Danh sách PEPs", 3],
  ];
  return sec(code, "BLACKLIST", lists.map(([id, n, q, lv]) =>
    choice(id, n, q, lv === 3 ? OPT.match3 : OPT.match2, { auto: true })
  ), { blacklist: true });
}

// Hàng hoá, dịch vụ (chỉ ĐVCNTT)
const goodsInfoSec = () => sec("II", "THÔNG TIN HÀNG HOÁ, DỊCH VỤ", [
  info("1", "Danh mục hàng hoá, dịch vụ người bán cung cấp (liệt kê chi tiết)"),
  choice("channel", "2", "Phương thức cung cấp hàng hoá, dịch vụ cho người mua", OPT.channel, { multi: true, vertical: true }),
], { goods: true });

const verifyDocsSec = () => sec("III", "TÀI LIỆU XÁC MINH", [
  doc("vd1", "1", "Link website/ứng dụng/Nền tảng mạng xã hội (nếu có)"),
  doc("vd2", "2", "Hợp đồng/thoả thuận mẫu cung ứng HHDV giữa KH và người mua (nếu có)"),
  doc("vd3", "3", "Ảnh chụp các bước đặt mua HHDV trên website/ứng dụng (nếu có)"),
  doc("vd4", "4", "GCN đăng ký kinh doanh, danh mục ngành nghề & giấy phép HHDV"),
  doc("vd5", "5", "Ảnh chụp địa điểm kinh doanh của khách hàng"),
  doc("vd6", "6", "Hợp đồng/thoả thuận thuê/mượn địa điểm kinh doanh"),
], { goods: true });

const goodsResultSec = () => sec("IV", "KẾT QUẢ ĐÁNH GIÁ", [
  choice("prohibited", "1", "HHDV thuộc danh mục hàng hoá, ngành nghề cấm đầu tư kinh doanh, lưu thông?", OPT.coDanger, { auto: true }),
  choice("eligible", "2", "HHDV đã đáp ứng đầy đủ điều kiện kinh doanh theo quy định pháp luật Việt Nam (hoặc WTO/Hiệp định mà VN tham gia)?", OPT.coOk),
], { goods: true });

// Chủ sở hữu hưởng lợi — cá nhân
const beneficialCNSec = (code) => sec(code, "THÔNG TIN VỀ CHỦ SỞ HỮU HƯỞNG LỢI", [
  choice("benRel", "1", "Mối quan hệ với Khách hàng là:", OPT.relCN),
  info("2", "Họ tên đầy đủ theo CMND/CCCD/Hộ chiếu", "fullName"),
  info("3", "Ngày, tháng, năm sinh", "dob"),
  info("4", "Số CMND/CCCD/Định danh cá nhân/Hộ chiếu/Thị thực", "idNo"),
  info("5", "Quốc tịch", "nationality"),
  info("6", "Nghề nghiệp / Chức vụ", "pos"),
  info("7", "Số điện thoại", "phone"),
  info("8", "Nơi ở hiện tại / Nơi đăng ký cư trú ở VN", "curAddr"),
  info("9", "Địa chỉ thường trú / Nơi đăng ký cư trú ở nước ngoài", "permAddr"),
]);

// Chủ sở hữu hưởng lợi — tổ chức
const beneficialTCSec = (code) => sec(code, "THÔNG TIN VỀ CHỦ SỞ HỮU HƯỞNG LỢI", [
  choice("benRel", "1", "Mối quan hệ với Khách hàng là:", OPT.relTC),
  info("2", "Họ tên đầy đủ theo CMND/CCCD/Hộ chiếu"),
  info("3", "Ngày, tháng, năm sinh"),
  info("4", "Quốc tịch"),
  info("5", "Nghề nghiệp, chức vụ"),
  info("6", "Số CMND/CCCD/Hộ chiếu/Thị thực, ngày cấp và nơi cấp"),
  info("7", "Nơi đăng ký thường trú / cư trú ở nước ngoài"),
  info("8", "Nơi ở hiện tại / Nơi đăng ký cư trú ở Việt Nam"),
  info("9", "Số điện thoại"),
  info("10", "Email"),
]);

// Thoả thuận pháp lý (dùng chung)
const legalSec = (code) => sec(code, "KHÁCH HÀNG CÓ THAM GIA THOẢ THUẬN PHÁP LÝ", [
  choice("legalArr", "", "Hình thức thoả thuận pháp lý", OPT.legal),
], { legal: true });

// Đánh giá mức độ rủi ro (5 mức theo tài liệu)
const riskSec = (code) => sec(code, "ĐÁNH GIÁ MỨC ĐỘ RỦI RO CỦA KHÁCH HÀNG", [
  { t: "risk", id: "riskLevel", n: "", q: "Phân loại theo mức độ rủi ro về rửa tiền", opts: OPT.risk5 },
], { risk: true });

// EDD — cá nhân
const eddCNSec = (code) => sec(code, "ÁP DỤNG BIỆN PHÁP ĐÁNH GIÁ TĂNG CƯỜNG (EDD)", [
  choice("edd1", "1", "Phê duyệt của Giám đốc/Người đại diện PL về thiết lập/duy trì quan hệ KD với KH", OPT.coOk),
  subhead("2. Thu thập, cập nhật, xác minh bổ sung thông tin khách hàng"),
  choice("edd21", "2.1", "Mức thu nhập trung bình hàng tháng (≥ 6 tháng gần nhất)", OPT.coOk),
  choice("edd22", "2.2", "Thông tin liên lạc cơ quan/tổ chức nơi KH có thu nhập chính", OPT.coOk),
  choice("edd23", "2.3", "Thông tin nguồn tiền / nguồn gốc tài sản trong giao dịch", OPT.coOk),
  choice("edd24", "2.4", "Thông tin, tài liệu khác (nếu có)", OPT.coOk),
  choice("edd3", "3", "Giám sát tăng cường các giao dịch của KH phát sinh tại Công ty", OPT.coOk),
  choice("edd4", "4", "Tăng tần suất thẩm định lại thông tin KH lên 06 tháng/lần", OPT.coOk),
], { edd: true });

// EDD — tổ chức
const eddTCSec = (code) => sec(code, "ÁP DỤNG BIỆN PHÁP ĐÁNH GIÁ TĂNG CƯỜNG (EDD)", [
  choice("edd1", "1", "Phê duyệt của Giám đốc/Người đại diện PL về thiết lập/duy trì quan hệ KD với KH", OPT.coOk),
  subhead("2. Thu thập, cập nhật, xác minh bổ sung thông tin khách hàng"),
  choice("edd21", "2.1", "Ngành, nghề sản xuất, kinh doanh, dịch vụ tạo doanh thu chính", OPT.coOk),
  choice("edd22", "2.2", "Tổng doanh thu trong 2 năm gần nhất trước thời điểm đánh giá", OPT.coOk),
  choice("edd23", "2.3", "Thông tin nguồn tiền / nguồn gốc tài sản trong giao dịch", OPT.coOk),
  choice("edd24", "2.4", "Thông tin, tài liệu khác (nếu có)", OPT.coOk),
  choice("edd3", "3", "Giám sát tăng cường các giao dịch của KH phát sinh tại Công ty", OPT.coOk),
  choice("edd4", "4", "Tăng tần suất thẩm định lại thông tin KH lên 06 tháng/lần", OPT.coOk),
], { edd: true });

// Đánh giá mục đích sử dụng dịch vụ độc lập
const purposeSec = (code) => sec(code, "ÁP DỤNG ĐÁNH GIÁ MỤC ĐÍCH SỬ DỤNG DỊCH VỤ ĐỘC LẬP", [
  { t: "purpose", id: "purpose" },
]);

// ── Section: Thông tin chung KYC cá nhân ──
function kycGeneralCN(withWebsite) {
  const items = [
    info("1", "Họ tên đầy đủ theo CMND/CCCD/Hộ chiếu", "fullName"),
    info("2", "Ngày, tháng, năm sinh", "dob"),
    info("3", "Quốc tịch", "nationality"),
    info("4", "Nghề nghiệp, chức vụ", "job"),
    info("5", "Số CMND/CCCD/Định danh cá nhân/Hộ chiếu, ngày cấp và nơi cấp", "idFull"),
    info("6", "Địa chỉ đăng ký hộ khẩu thường trú / cư trú ở nước ngoài", "permAddr"),
    info("7", "Địa chỉ nơi ở hiện tại / cư trú ở Việt Nam", "curAddr"),
  ];
  let n = 8;
  if (withWebsite) items.push(info(String(n++), "Website/App tích hợp Dịch vụ trung gian thanh toán (nếu có)"));
  items.push(info(String(n++), "Mục đích của KH khi sử dụng Dịch vụ trung gian thanh toán"));
  items.push(info(String(n++), "Ngành nghề, lĩnh vực kinh doanh", "businessType"));
  items.push(info(String(n++), "Số điện thoại", "phone"));
  items.push(info(String(n++), "Email"));
  return sec("I", "THÔNG TIN CHUNG", items);
}

// ── Section: Thông tin chung KYC tổ chức ──
function kycGeneralTC(withWebsite) {
  const items = [
    info("1", "Tên giao dịch bằng tiếng Việt", "bizVN"),
    info("2", "Tên viết tắt", "shortName"),
    info("3", "Địa chỉ trụ sở chính", "hq"),
    info("4", "Số giấy phép thành lập / mã số thuế / mã số doanh nghiệp", "taxCode", "Với Hộ KD: số GP là số ĐK hộ KD, MST là MST cá nhân của chủ hộ"),
    info("5", "Số điện thoại", "phone"),
    info("6", "Email"),
  ];
  let n = 7;
  if (withWebsite) items.push(info(String(n++), "Website/App tích hợp Dịch vụ trung gian thanh toán (nếu có)"));
  items.push(info(String(n++), "Mục đích sử dụng Dịch vụ trung gian thanh toán của KH"));
  items.push(info(String(n++), "Ngành nghề, lĩnh vực kinh doanh", "businessType", "Theo ngành nghề đăng ký với cơ quan quản lý nhà nước về ĐKDN"));
  items.push(choice("scale", String(n++), "Quy mô doanh nghiệp", OPT.scale));
  items.push({ t: "scalecriteria" });
  return sec("I", "THÔNG TIN CHUNG", items);
}

// ── Section: Chủ sở hữu / Người đại diện PL / Chủ hộ KD ──
const ownerRepTCSec = (code) => sec(code, "THÔNG TIN CHỦ SỞ HỮU / NGƯỜI ĐẠI DIỆN PHÁP LUẬT / CHỦ HỘ KINH DOANH", [
  info("1", "Họ và tên", "fullName"),
  info("2", "Ngày, tháng, năm sinh", "dob"),
  info("3", "Số CMND/CCCD/Định danh cá nhân/Hộ chiếu/Thị thực", "idNo"),
  info("4", "Quốc tịch", "nationality"),
  info("5", "Nghề nghiệp / Chức vụ", "pos"),
  info("6", "Số điện thoại", "phone"),
  info("7", "Nơi ở hiện tại / cư trú ở Việt Nam", "curAddr"),
  info("8", "Địa chỉ thường trú / cư trú ở nước ngoài", "permAddr"),
]);

// ── Section: Kế toán trưởng / Người phụ trách kế toán ──
const accountantPerson = [
  info("1", "Họ và tên"),
  info("2", "Ngày, tháng, năm sinh"),
  info("3", "Số CMND/CCCD/Định danh cá nhân/Hộ chiếu/Thị thực"),
  info("4", "Quốc tịch"),
  info("5", "Nghề nghiệp / Chức vụ"),
  info("6", "Số điện thoại"),
  info("7", "Nơi ở hiện tại / cư trú ở Việt Nam"),
  info("8", "Địa chỉ thường trú / cư trú ở nước ngoài"),
];
const accountantOrg = [
  info("1", "Tên doanh nghiệp"),
  info("2", "Địa chỉ trụ sở chính"),
  info("3", "Số giấy phép thành lập / mã số thuế / mã số doanh nghiệp"),
  info("4", "Người đại diện theo pháp luật"),
  info("5", "Chức vụ"),
  info("6", "Ngành nghề kinh doanh"),
];
const accountantSec = (code, withOrg) => sec(code, "THÔNG TIN KẾ TOÁN TRƯỞNG HOẶC NGƯỜI PHỤ TRÁCH KẾ TOÁN",
  withOrg
    ? [subhead("Cá nhân"), ...accountantPerson, subhead("Tổ chức"), ...accountantOrg]
    : accountantPerson
);

// ── Seller info (A.I) ──
const sellerCNSec = () => sec("I", "THÔNG TIN NGƯỜI BÁN", [
  info("1", "Họ tên đầy đủ theo CMND/CCCD/Hộ chiếu", "fullName"),
  info("2", "Địa điểm bán hàng"),
  info("3", "Mã số thuế", "taxCode"),
  info("4", "Nghề nghiệp, chức vụ", "job"),
], { goods: true });
const sellerTCSec = () => sec("I", "THÔNG TIN NGƯỜI BÁN", [
  info("1", "Tên doanh nghiệp", "bizVN"),
  info("2", "Địa chỉ trụ sở chính", "hq"),
  info("3", "Số giấy phép thành lập / mã số thuế / mã số doanh nghiệp", "taxCode"),
  info("4", "Người đại diện theo pháp luật", "rep"),
  info("5", "Chức vụ", "pos"),
], { goods: true });

// ── Hồ sơ đính kèm ──
const attachCN = (code, extraFace) => {
  const items = [doc("at1", "1", "CMND/CCCD/Hộ chiếu còn thời hạn sử dụng")];
  let n = 2;
  if (extraFace) items.push(doc("at_face", String(n++), "Ảnh chụp thẳng khuôn mặt cá nhân khách hàng"));
  items.push(doc("at2", String(n++), "GCN đủ điều kiện kinh doanh (với ngành nghề cần chứng nhận)"));
  items.push(doc("at3", String(n++), "Giấy tờ khác (nếu có)"));
  return sec(code, "HỒ SƠ ĐÍNH KÈM", items, { attach: true });
};
const attachTC = (code, extraFace) => {
  const base = [
    "Giấy chứng nhận đăng ký doanh nghiệp / đăng ký hộ kinh doanh",
    "Giấy phép hoạt động hoặc quyết định thành lập (nếu có)",
    "Giấy chứng nhận đầu tư (nếu có)",
    "Điều lệ công ty",
    "Quyết định đổi tên gọi, chia tách, sáp nhập (nếu có)",
    "QĐ bổ nhiệm / HĐ thuê Giám đốc (Tổng Giám đốc) hoặc tương đương",
    "QĐ bổ nhiệm / HĐ thuê Kế toán trưởng / người phụ trách kế toán",
    "CMND/CCCD người đại diện PL hoặc người được uỷ quyền ký",
    "CMND/CCCD của chủ sở hữu hưởng lợi (nếu có)",
    "GCN đủ điều kiện kinh doanh (với ngành nghề cần chứng nhận)",
  ];
  const items = base.map((l, i) => doc("at" + (i + 1), String(i + 1), l));
  let n = base.length + 1;
  if (extraFace) items.push(doc("at_face", String(n++), "Ảnh chụp thẳng khuôn mặt người đại diện theo PL / người được uỷ quyền"));
  items.push(doc("at_auth", String(n++), "Văn bản uỷ quyền của người đại diện PL (nếu người ký không phải NĐD PL)"));
  items.push(doc("at_other", String(n++), "Giấy tờ khác (nếu có)"));
  return sec(code, "HỒ SƠ ĐÍNH KÈM", items, { attach: true });
};

// ───────────────────────────────────────────────────────────────────────────
// 4 PHIẾU
// ───────────────────────────────────────────────────────────────────────────
const PHIEU_FORMS = {
  // BM01 — ĐVCNTT · Cá nhân
  "BM01": {
    code: "BM01",
    docNo: "……/2026/PTĐTT/KSNB",
    title: "Phiếu thẩm định thông tin nhận biết — Khách hàng cá nhân (ĐVCNTT)",
    blocks: [
      grp("[A] THẨM ĐỊNH HÀNG HOÁ, DỊCH VỤ"),
      sellerCNSec(),
      goodsInfoSec(),
      verifyDocsSec(),
      goodsResultSec(),
      grp("[B] THẨM ĐỊNH THÔNG TIN NHẬN BIẾT KHÁCH HÀNG"),
      kycGeneralCN(true),
      blacklistSection("II"),
      beneficialCNSec("III"),
      legalSec("IV"),
      attachCN("V", false),
      riskSec("VI"),
      eddCNSec("VII"),
      purposeSec("VIII"),
    ],
  },

  // BM02 — ĐVCNTT · Tổ chức / Hộ KD
  "BM02": {
    code: "BM02",
    docNo: "……/2026/PTĐTT/Baokim",
    title: "Phiếu thẩm định thông tin nhận biết — Khách hàng tổ chức & hộ KD (ĐVCNTT)",
    blocks: [
      grp("[A] THẨM ĐỊNH HÀNG HOÁ, DỊCH VỤ"),
      sellerTCSec(),
      goodsInfoSec(),
      verifyDocsSec(),
      goodsResultSec(),
      grp("[B] THẨM ĐỊNH THÔNG TIN NHẬN BIẾT KHÁCH HÀNG"),
      kycGeneralTC(true),
      ownerRepTCSec("II"),
      blacklistSection("III"),
      accountantSec("IV", true),
      beneficialTCSec("V"),
      legalSec("VI"),
      attachTC("VII", false),
      riskSec("VIII"),
      eddTCSec("IX"),
      purposeSec("X"),
    ],
  },

  // BM1.1 — Ví điện tử · Cá nhân
  "BM1.1": {
    code: "BM1.1",
    docNo: "……/2026/PTĐTT-VĐT/KSNB",
    title: "Phiếu thẩm định thông tin nhận biết — Khách hàng cá nhân (Ví điện tử)",
    blocks: [
      grp("[A] THẨM ĐỊNH THÔNG TIN NHẬN BIẾT KHÁCH HÀNG"),
      kycGeneralCN(false),
      blacklistSection("II"),
      beneficialCNSec("III"),
      legalSec("IV"),
      attachCN("V", true),
      riskSec("VI"),
      eddCNSec("VII"),
      purposeSec("VIII"),
    ],
  },

  // BM2.1 — Ví điện tử · Tổ chức / Hộ KD
  "BM2.1": {
    code: "BM2.1",
    docNo: "……/2026/PTĐTT-VĐT/Baokim",
    title: "Phiếu thẩm định thông tin nhận biết — Khách hàng tổ chức & hộ KD (Ví điện tử)",
    blocks: [
      grp("THẨM ĐỊNH THÔNG TIN NHẬN BIẾT KHÁCH HÀNG"),
      kycGeneralTC(false),
      ownerRepTCSec("II"),
      blacklistSection("III"),
      accountantSec("IV", false),
      beneficialTCSec("V"),
      legalSec("VI"),
      attachTC("VII", true),
      riskSec("VIII"),
      eddTCSec("IX"),
      purposeSec("X"),
    ],
  },
};

// ── Resolver: lấy giá trị tự động từ hồ sơ KYC của merchant ──
function phieuValue(rec, key) {
  if (!rec || !key) return "";
  const pi = rec.personalInfo || {}, bi = rec.businessInfo || {}, e = rec.erp || {};
  const idFull = pi.citizenIdNo
    ? [pi.citizenIdNo, e.docIssueDate, e.docIssuePlace].filter(Boolean).join(" · ")
    : "";
  const map = {
    name: rec.name,
    bizVN: bi.businessNameVN,
    shortName: bi.shortName,
    taxCode: bi.taxCode,
    licence: bi.businessLicenceNo,
    hq: bi.headquarters,
    rep: bi.representative,
    fullName: pi.fullName,
    dob: pi.dob,
    nationality: pi.nationality,
    idNo: pi.citizenIdNo,
    idFull: idFull,
    job: e.repJob,
    pos: pi.position,
    permAddr: pi.permanentAddress,
    curAddr: pi.currentAddress,
    phone: pi.phoneNumber,
    businessType: rec.businessType,
  };
  const v = map[key];
  return v && v !== "—" ? v : "";
}

window.PHIEU_FORMS = PHIEU_FORMS;
window.phieuValue = phieuValue;
window.PHIEU_OPT = OPT;

// Số mức của từng danh sách blacklist trong Phiếu (3 = có "một nhóm", 2 = chỉ toàn bộ/không)
const BL_LEVELS = { bl1: 3, bl2: 2, bl3: 3, bl4: 2, bl5: 2, bl6: 3 };
// Ép giá trị về một phương án hợp lệ cho danh sách 2 mức:
// trùng khớp một nhóm → nâng lên "Trùng khớp toàn bộ" (xử lý thận trọng, không để dòng trống lựa chọn)
function clampBlacklist(id, match) {
  if (BL_LEVELS[id] === 2 && match === "TRUNG_KHOP_1_NHOM") return "TRUNG_KHOP_TOAN_BO";
  return match;
}
window.BL_LEVELS = BL_LEVELS;
window.clampBlacklist = clampBlacklist;
