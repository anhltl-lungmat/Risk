// Condensed BaoKim Risk mock data — adapted from the source codebase

const MOCK_RECORDS = [
  {
    stt: 1,
    id: "MRC-99482",
    timeOnboard: "2026-05-25 14:32",
    name: "CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ MINH PHONG",
    shortName: "Minh Phong Tech",
    service: "Cổng thanh toán BaoKim",
    ccdvStatus: "KHONG_DUOC_CCDV",
    services: [
      { name: "Thu hộ / Chi hộ BaoKim" },
      { name: "Cổng thanh toán BaoKim" },
    ],
    blacklistStatus: "HIT",
    blacklistHits: ["Danh sách PEP", "Danh sách trốn thuế"],
    ruleHits: [
      "RULE_PEP_003: Trùng khớp họ tên và ngày sinh với PEP",
      "RULE_TAX_009: Mã số thuế liên đới doanh nghiệp nợ thuế"
    ],
    rrScore: 92,
    rrLevel: "CAO",
    source: "ERP",
    entityType: "TO_CHUC",
    mrcClass: "Master",
    personalInfo: {
      fullName: "Nguyễn Minh Phong",
      alias: "Phong Phong",
      dob: "15/08/1984",
      nationality: "Việt Nam",
      permanentAddress: "12 Láng Hạ, P. Thành Công, Q. Ba Đình, Hà Nội",
      currentAddress: "Vinhomes Metropolis, 29 Liễu Giai, Ba Đình, Hà Nội",
      country: "Việt Nam",
      idCardNo: "001084203920",
      citizenIdNo: "001084203920",
      passportNo: "B9281203",
      position: "Giám đốc điều hành (CEO)",
      phoneNumber: "0912 345 678",
    },
    businessInfo: {
      businessNameVN: "CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ MINH PHONG",
      businessNameEN: "MINH PHONG TECHNOLOGY SOLUTIONS CO., LTD",
      shortName: "MINH PHONG TECH",
      businessLicenceNo: "0109283120",
      taxCode: "0109283120",
      headquarters: "Tầng 5, Tòa nhà Harec, 4A Láng Hạ, Ba Đình, Hà Nội",
      representative: "Nguyễn Minh Phong",
    },
    bankInfo: {
      accountNo: "19034820391023",
      bankName: "Techcombank",
      accountHolder: "CONG TY TNHH GP CN MINH PHONG",
    },
    businessType: "Công nghệ thông tin & Thương mại số",
    blacklistResults: [
      { name: "Danh sách PEP", match: "TRUNG_KHOP_TOAN_BO", action: "DUNG_CCDV", confidence: 98, version: "PEP_V4.9.2026_LIVE", reqId: "REQ-BK-99482-A01", fields: ["Họ tên", "Ngày sinh", "Quốc tịch"] },
      { name: "Danh sách trốn thuế", match: "TRUNG_KHOP_1_NHOM", action: "AP_DUNG_THEM_RULE", confidence: 72, version: "TAX_EVADERS_2026_Q2", reqId: "REQ-BK-99482-A02", fields: ["Mã số thuế", "Họ tên người đại diện"] },
      { name: "Danh sách đen nội bộ", match: "KHONG_TRUNG_KHOP", action: "TIEP_TUC_CCDV", confidence: 0, version: "BK_INTERNAL_BLACK_V9.2", reqId: "REQ-BK-99482-A03", fields: [] },
      { name: "Danh sách bị can, bị cáo", match: "KHONG_TRUNG_KHOP", action: "TIEP_TUC_CCDV", confidence: 0, version: "MPS_CONVICTED_DAILY_2026", reqId: "REQ-BK-99482-A04", fields: [] },
      { name: "Danh sách cảnh báo CIC", match: "KHONG_TRUNG_KHOP", action: "TIEP_TUC_CCDV", confidence: 0, version: "CIC_CREDIT_ALERTS_V1.0", reqId: "REQ-BK-99482-A05", fields: [] },
      { name: "Danh sách SIMO", match: "KHONG_TRUNG_KHOP", action: "TIEP_TUC_CCDV", confidence: 0, version: "SIMO_VOIP_SHADOW_V3.8", reqId: "REQ-BK-99482-A06", fields: [] },
    ],
    screeningHistory: [
      { runId: "RUN-20260510-0900", timestamp: "2026-05-10 09:00", actor: "Hệ thống Risk (Quét định kỳ)", reason: "Rà soát định kỳ", rrScore: 45, rrLevel: "TRUNG_BINH", blacklistStatus: "HIT", ccdvStatus: "DUOC_CCDV", hits: ["Danh sách trốn thuế"] },
      { runId: "RUN-20260318-1432", timestamp: "2026-03-18 14:32", actor: "Hệ thống Risk (Quét định kỳ)", reason: "Rà soát định kỳ", rrScore: 28, rrLevel: "THAP", blacklistStatus: "KHONG_HIT", ccdvStatus: "DUOC_CCDV", hits: [] },
    ],
  },
  {
    stt: 2,
    id: "MRC-99120",
    timeOnboard: "2026-05-25 11:20",
    name: "HỘ KINH DOANH NGUYỄN VĂN HÙNG",
    shortName: "HKD Nguyễn Văn Hùng",
    service: "Thu hộ / Chi hộ BaoKim",
    ccdvStatus: "DUOC_CCDV",
    services: [
      { name: "Thu hộ / Chi hộ BaoKim" },
    ],
    blacklistStatus: "KHONG_HIT",
    blacklistHits: [],
    ruleHits: [],
    rrScore: 8,
    rrLevel: "THAP",
    source: "PORTAL_B2B",
    entityType: "HO_KINH_DOANH",
    mrcClass: "Direct",
    personalInfo: {
      fullName: "Nguyễn Văn Hùng",
      alias: "Hùng Béo",
      dob: "12/05/1990",
      nationality: "Việt Nam",
      permanentAddress: "Khối 5, TT. Đô Lương, H. Đô Lương, Nghệ An",
      currentAddress: "45 Ngõ 192 Lê Trọng Tấn, Thanh Xuân, Hà Nội",
      country: "Việt Nam",
      idCardNo: "036090012345",
      citizenIdNo: "036090012345",
      passportNo: "—",
      position: "Chủ hộ kinh doanh",
      phoneNumber: "0987 654 321",
    },
    businessInfo: {
      businessNameVN: "HỘ KINH DOANH NGUYỄN VĂN HÙNG",
      businessNameEN: "—",
      shortName: "HKD HÙNG",
      businessLicenceNo: "8001029301",
      taxCode: "8001029301",
      headquarters: "45 Ngõ 192 Lê Trọng Tấn, Thanh Xuân, Hà Nội",
      representative: "Nguyễn Văn Hùng",
    },
    bankInfo: {
      accountNo: "1010 0123 4567",
      bankName: "Vietcombank",
      accountHolder: "NGUYEN VAN HUNG",
    },
    businessType: "Kinh doanh tạp hóa & dịch vụ thanh toán",
    blacklistResults: [
      { name: "Danh sách PEP", match: "KHONG_TRUNG_KHOP", action: "TIEP_TUC_CCDV", confidence: 0, version: "PEP_V4.9.2026_LIVE", reqId: "REQ-BK-99120-01", fields: [] },
      { name: "Danh sách trốn thuế", match: "KHONG_TRUNG_KHOP", action: "TIEP_TUC_CCDV", confidence: 0, version: "TAX_EVADERS_2026_Q2", reqId: "REQ-BK-99120-02", fields: [] },
      { name: "Danh sách đen nội bộ", match: "KHONG_TRUNG_KHOP", action: "TIEP_TUC_CCDV", confidence: 0, version: "BK_INTERNAL_BLACK_V9.2", reqId: "REQ-BK-99120-03", fields: [] },
      { name: "Danh sách bị can, bị cáo", match: "KHONG_TRUNG_KHOP", action: "TIEP_TUC_CCDV", confidence: 0, version: "MPS_CONVICTED_DAILY_2026", reqId: "REQ-BK-99120-04", fields: [] },
    ],
    screeningHistory: [
      { runId: "RUN-20260501-0900", timestamp: "2026-05-01 09:00", actor: "Hệ thống tự động", reason: "Rà soát định kỳ", rrScore: 8, rrLevel: "THAP", blacklistStatus: "KHONG_HIT", ccdvStatus: "DUOC_CCDV", hits: [] },
    ],
  },
  {
    stt: 3,
    id: "MRC-98711",
    timeOnboard: "2026-05-25 09:15",
    name: "CÔNG TY CỔ PHẦN BÁN LẺ AN BÌNH",
    shortName: "An Bình Retail",
    service: "Tài khoản định danh ảo (VA)",
    ccdvStatus: "DUOC_CCDV",
    services: [
      { name: "Tài khoản định danh ảo (VA)" },
      { name: "Thu hộ / Chi hộ BaoKim" },
    ],
    blacklistStatus: "KHONG_HIT",
    blacklistHits: [],
    ruleHits: ["RULE_KYC_021: Cảnh báo địa chỉ trụ sở thuê chung"],
    rrScore: 34,
    rrLevel: "TRUNG_BINH",
    source: "PORTAL_B2B",
    entityType: "TO_CHUC",
    mrcClass: "Direct",
    personalInfo: {
      fullName: "Trần Thị Bình",
      alias: "—",
      dob: "22/11/1981",
      nationality: "Việt Nam",
      permanentAddress: "Số 88, đường Nguyễn Văn Cừ, Long Biên, Hà Nội",
      currentAddress: "Số 88, đường Nguyễn Văn Cừ, Long Biên, Hà Nội",
      country: "Việt Nam",
      idCardNo: "001181029384",
      citizenIdNo: "001181029384",
      passportNo: "C2810392",
      position: "Chủ tịch HĐQT",
      phoneNumber: "0903 281 920",
    },
    businessInfo: {
      businessNameVN: "CÔNG TY CỔ PHẦN BÁN LẺ AN BÌNH",
      businessNameEN: "AN BINH RETAIL JSC.",
      shortName: "AN BÌNH RETAIL",
      businessLicenceNo: "0312842091",
      taxCode: "0312842091",
      headquarters: "Tầng 12, Tòa nhà Mipec Riverside, Long Biên, Hà Nội",
      representative: "Trần Thị Bình",
    },
    bankInfo: {
      accountNo: "0091 2884 7263",
      bankName: "MB Bank",
      accountHolder: "CONG TY CO PHAN AN BINH",
    },
    businessType: "Bán lẻ hàng tiêu dùng & FMCG",
    blacklistResults: [
      { name: "Danh sách PEP", match: "KHONG_TRUNG_KHOP", action: "TIEP_TUC_CCDV", confidence: 0, version: "PEP_V4.9.2026_LIVE", reqId: "REQ-BK-98711-01", fields: [] },
      { name: "Danh sách trốn thuế", match: "KHONG_TRUNG_KHOP", action: "TIEP_TUC_CCDV", confidence: 0, version: "TAX_EVADERS_2026_Q2", reqId: "REQ-BK-98711-02", fields: [] },
      { name: "Danh sách đen nội bộ", match: "KHONG_TRUNG_KHOP", action: "AP_DUNG_THEM_RULE", confidence: 18, version: "BK_INTERNAL_BLACK_V9.2", reqId: "REQ-BK-98711-03", fields: ["Địa chỉ trụ sở"] },
    ],
    screeningHistory: [],
  },
  {
    stt: 4,
    id: "MRC-98640",
    timeOnboard: "2026-05-24 17:48",
    name: "CÔNG TY TNHH THƯƠNG MẠI HOÀNG LONG",
    shortName: "Hoàng Long Trading",
    service: "Cổng thanh toán BaoKim",
    ccdvStatus: "KHONG_DUOC_CCDV",
    services: [
      { name: "Cổng thanh toán BaoKim" },
      { name: "Tài khoản định danh ảo (VA)" },
    ],
    blacklistStatus: "HIT",
    blacklistHits: ["Danh sách đen nội bộ"],
    ruleHits: ["RULE_FRAUD_014: Lịch sử chargeback lặp lại trên 3 lần"],
    rrScore: 85,
    rrLevel: "CAO",
    source: "PORTAL_B2B",
    entityType: "TO_CHUC",
    mrcClass: "Direct",
    personalInfo: {
      fullName: "Phạm Hoàng Long",
      alias: "Long Bốn Mắt",
      dob: "04/07/1978",
      nationality: "Việt Nam",
      permanentAddress: "Số 9, đường Phạm Văn Đồng, Cầu Giấy, Hà Nội",
      currentAddress: "Số 9, đường Phạm Văn Đồng, Cầu Giấy, Hà Nội",
      country: "Việt Nam",
      idCardNo: "001078201938",
      citizenIdNo: "001078201938",
      passportNo: "B4029182",
      position: "Giám đốc",
      phoneNumber: "0978 102 384",
    },
    businessInfo: {
      businessNameVN: "CÔNG TY TNHH THƯƠNG MẠI HOÀNG LONG",
      businessNameEN: "HOANG LONG TRADING CO., LTD",
      shortName: "HOÀNG LONG",
      businessLicenceNo: "0109385721",
      taxCode: "0109385721",
      headquarters: "Số 9, Phạm Văn Đồng, Cầu Giấy, Hà Nội",
      representative: "Phạm Hoàng Long",
    },
    bankInfo: {
      accountNo: "1102 0093 8472",
      bankName: "BIDV",
      accountHolder: "CONG TY TNHH TM HOANG LONG",
    },
    businessType: "Thương mại điện tử xuyên biên giới",
    blacklistResults: [
      { name: "Danh sách PEP", match: "KHONG_TRUNG_KHOP", action: "TIEP_TUC_CCDV", confidence: 0, version: "PEP_V4.9.2026_LIVE", reqId: "REQ-BK-98640-01", fields: [] },
      { name: "Danh sách đen nội bộ", match: "TRUNG_KHOP_TOAN_BO", action: "DUNG_CCDV", confidence: 100, version: "BK_INTERNAL_BLACK_V9.2", reqId: "REQ-BK-98640-02", fields: ["MST", "Mã merchant cũ"] },
    ],
    screeningHistory: [
      { runId: "RUN-20260201-1100", timestamp: "2026-02-01 11:00", actor: "Hệ thống Risk", reason: "Rà soát định kỳ", rrScore: 60, rrLevel: "TRUNG_BINH", blacklistStatus: "KHONG_HIT", ccdvStatus: "DUOC_CCDV", hits: [] },
    ],
  },
  {
    stt: 5,
    id: "MRC-98552",
    timeOnboard: "2026-05-24 14:02",
    name: "NGUYỄN THỊ LAN ANH",
    shortName: "Cá nhân — Lan Anh",
    service: "Ví điện tử BaoKim",
    ccdvStatus: "DUOC_CCDV",
    services: [
      { name: "Ví điện tử BaoKim" },
    ],
    blacklistStatus: "KHONG_HIT",
    blacklistHits: [],
    ruleHits: [],
    rrScore: 5,
    rrLevel: "THAP",
    source: "DV_KHAC",
    entityType: "CA_NHAN",
    mrcClass: "Sub",
    personalInfo: {
      fullName: "Nguyễn Thị Lan Anh",
      alias: "—",
      dob: "30/03/1995",
      nationality: "Việt Nam",
      permanentAddress: "Số 22, đường Trần Phú, Hà Đông, Hà Nội",
      currentAddress: "Số 22, đường Trần Phú, Hà Đông, Hà Nội",
      country: "Việt Nam",
      idCardNo: "030195013820",
      citizenIdNo: "030195013820",
      passportNo: "—",
      position: "Cá nhân",
      phoneNumber: "0912 884 002",
    },
    businessInfo: { businessNameVN: "—", businessNameEN: "—", shortName: "—", businessLicenceNo: "—", taxCode: "—", headquarters: "—", representative: "—" },
    bankInfo: { accountNo: "0203 9281 7263", bankName: "VPBank", accountHolder: "NGUYEN THI LAN ANH" },
    businessType: "Cá nhân — sử dụng ví",
    blacklistResults: [
      { name: "Danh sách PEP", match: "KHONG_TRUNG_KHOP", action: "TIEP_TUC_CCDV", confidence: 0, version: "PEP_V4.9.2026_LIVE", reqId: "REQ-BK-98552-01", fields: [] },
      { name: "Danh sách SIMO", match: "KHONG_TRUNG_KHOP", action: "TIEP_TUC_CCDV", confidence: 0, version: "SIMO_VOIP_SHADOW_V3.8", reqId: "REQ-BK-98552-02", fields: [] },
    ],
    screeningHistory: [],
  },
  {
    stt: 6,
    id: "MRC-98401",
    timeOnboard: "2026-05-24 10:30",
    name: "CÔNG TY CỔ PHẦN GIÁO DỤC EDUTECH VIỆT",
    shortName: "Edutech Việt",
    service: "Thu hộ / Chi hộ BaoKim",
    ccdvStatus: "DUOC_CCDV",
    services: [
      { name: "Thu hộ / Chi hộ BaoKim" },
      { name: "Cổng thanh toán BaoKim" },
      { name: "Tài khoản định danh ảo (VA)" },
    ],
    blacklistStatus: "KHONG_HIT",
    blacklistHits: [],
    ruleHits: [],
    rrScore: 12,
    rrLevel: "THAP",
    source: "PORTAL_B2B",
    entityType: "TO_CHUC",
    mrcClass: "Master",
    personalInfo: {
      fullName: "Lê Văn Khôi",
      alias: "—",
      dob: "18/02/1986",
      nationality: "Việt Nam",
      permanentAddress: "Số 5, Khu đô thị Văn Phú, Hà Đông, Hà Nội",
      currentAddress: "Số 5, Khu đô thị Văn Phú, Hà Đông, Hà Nội",
      country: "Việt Nam",
      idCardNo: "001086019283",
      citizenIdNo: "001086019283",
      passportNo: "—",
      position: "Tổng Giám đốc",
      phoneNumber: "0901 824 738",
    },
    businessInfo: {
      businessNameVN: "CÔNG TY CỔ PHẦN GIÁO DỤC EDUTECH VIỆT",
      businessNameEN: "EDUTECH VIET JSC.",
      shortName: "EDUTECH VIỆT",
      businessLicenceNo: "0108374829",
      taxCode: "0108374829",
      headquarters: "Tòa nhà CT4, KĐT Văn Phú, Hà Đông, Hà Nội",
      representative: "Lê Văn Khôi",
    },
    bankInfo: { accountNo: "1100 3829 0182", bankName: "Vietcombank", accountHolder: "CTY CP GD EDUTECH VIET" },
    businessType: "Giáo dục trực tuyến & nội dung số",
    blacklistResults: [
      { name: "Danh sách PEP", match: "KHONG_TRUNG_KHOP", action: "TIEP_TUC_CCDV", confidence: 0, version: "PEP_V4.9.2026_LIVE", reqId: "REQ-BK-98401-01", fields: [] },
      { name: "Danh sách trốn thuế", match: "KHONG_TRUNG_KHOP", action: "TIEP_TUC_CCDV", confidence: 0, version: "TAX_EVADERS_2026_Q2", reqId: "REQ-BK-98401-02", fields: [] },
    ],
    screeningHistory: [
      { runId: "RUN-20260424-1030", timestamp: "2026-04-24 10:30", actor: "Hệ thống tự động", reason: "Rà soát định kỳ", rrScore: 14, rrLevel: "THAP", blacklistStatus: "KHONG_HIT", ccdvStatus: "DUOC_CCDV", hits: [] },
    ],
  },
  {
    stt: 7,
    id: "MRC-98123",
    timeOnboard: "2026-05-23 16:55",
    name: "CÔNG TY TNHH TƯ VẤN ĐẦU TƯ LẠC HỒNG",
    shortName: "Lạc Hồng Invest",
    service: "Cổng thanh toán BaoKim",
    ccdvStatus: "DUOC_CCDV",
    services: [
      { name: "Cổng thanh toán BaoKim" },
      { name: "Thu hộ / Chi hộ BaoKim" },
    ],
    blacklistStatus: "HIT",
    blacklistHits: ["Danh sách cảnh báo CIC"],
    ruleHits: ["RULE_CIC_018: Doanh nghiệp có dư nợ nhóm 3 tại tổ chức tín dụng"],
    rrScore: 58,
    rrLevel: "TRUNG_BINH",
    source: "ERP",
    entityType: "TO_CHUC",
    mrcClass: "Direct",
    personalInfo: {
      fullName: "Đặng Quốc Việt",
      alias: "—",
      dob: "09/09/1975",
      nationality: "Việt Nam",
      permanentAddress: "Số 19, đường Lê Đại Hành, Hai Bà Trưng, Hà Nội",
      currentAddress: "Số 19, đường Lê Đại Hành, Hai Bà Trưng, Hà Nội",
      country: "Việt Nam",
      idCardNo: "001075203847",
      citizenIdNo: "001075203847",
      passportNo: "B8273645",
      position: "Giám đốc",
      phoneNumber: "0918 273 645",
    },
    businessInfo: {
      businessNameVN: "CÔNG TY TNHH TƯ VẤN ĐẦU TƯ LẠC HỒNG",
      businessNameEN: "LAC HONG INVESTMENT CONSULTING CO., LTD",
      shortName: "LẠC HỒNG INVEST",
      businessLicenceNo: "0107382910",
      taxCode: "0107382910",
      headquarters: "Số 19, Lê Đại Hành, Hai Bà Trưng, Hà Nội",
      representative: "Đặng Quốc Việt",
    },
    bankInfo: { accountNo: "0301 9283 7261", bankName: "Sacombank", accountHolder: "CTY TNHH TVDT LAC HONG" },
    businessType: "Tư vấn tài chính & đầu tư",
    blacklistResults: [
      { name: "Danh sách cảnh báo CIC", match: "TRUNG_KHOP_1_NHOM", action: "AP_DUNG_THEM_RULE", confidence: 65, version: "CIC_CREDIT_ALERTS_V1.0", reqId: "REQ-BK-98123-01", fields: ["Mã số thuế"] },
    ],
    screeningHistory: [
      { runId: "RUN-20260423-1655", timestamp: "2026-04-23 16:55", actor: "Hệ thống Risk", reason: "Rà soát định kỳ", rrScore: 42, rrLevel: "TRUNG_BINH", blacklistStatus: "KHONG_HIT", ccdvStatus: "DUOC_CCDV", hits: [] },
    ],
  },
  {
    stt: 8,
    id: "MRC-98014",
    timeOnboard: "2026-05-23 09:20",
    name: "HỘ KINH DOANH PHẠM THỊ MỸ DUYÊN",
    shortName: "HKD Mỹ Duyên",
    service: "Tài khoản định danh ảo (VA)",
    ccdvStatus: "DUOC_CCDV",
    services: [
      { name: "Tài khoản định danh ảo (VA)" },
    ],
    blacklistStatus: "KHONG_HIT",
    blacklistHits: [],
    ruleHits: [],
    rrScore: 15,
    rrLevel: "THAP",
    source: "PORTAL_B2B",
    entityType: "HO_KINH_DOANH",
    mrcClass: "Sub",
    personalInfo: {
      fullName: "Phạm Thị Mỹ Duyên",
      alias: "—",
      dob: "21/12/1988",
      nationality: "Việt Nam",
      permanentAddress: "Số 78, đường Nguyễn Trãi, TP. Vinh, Nghệ An",
      currentAddress: "Số 78, đường Nguyễn Trãi, TP. Vinh, Nghệ An",
      country: "Việt Nam",
      idCardNo: "040088012394",
      citizenIdNo: "040088012394",
      passportNo: "—",
      position: "Chủ hộ kinh doanh",
      phoneNumber: "0944 829 102",
    },
    businessInfo: {
      businessNameVN: "HỘ KINH DOANH PHẠM THỊ MỸ DUYÊN",
      businessNameEN: "—",
      shortName: "HKD MỸ DUYÊN",
      businessLicenceNo: "8003827191",
      taxCode: "8003827191",
      headquarters: "Số 78, đường Nguyễn Trãi, TP. Vinh, Nghệ An",
      representative: "Phạm Thị Mỹ Duyên",
    },
    bankInfo: { accountNo: "0203 8472 1029", bankName: "Agribank", accountHolder: "PHAM THI MY DUYEN" },
    businessType: "Nhà hàng & dịch vụ ăn uống",
    blacklistResults: [
      { name: "Danh sách PEP", match: "KHONG_TRUNG_KHOP", action: "TIEP_TUC_CCDV", confidence: 0, version: "PEP_V4.9.2026_LIVE", reqId: "REQ-BK-98014-01", fields: [] },
    ],
    screeningHistory: [],
  },
];

const SERVICES_LIST = [
  "Cổng thanh toán BaoKim",
  "Thu hộ / Chi hộ BaoKim",
  "Tài khoản định danh ảo (VA)",
  "Ví điện tử BaoKim",
];

const BLACKLIST_GROUPS = [
  "Danh sách PEP",
  "Danh sách trốn thuế",
  "Danh sách đen nội bộ",
  "Danh sách bị can, bị cáo",
  "Danh sách cảnh báo CIC",
  "Danh sách SIMO",
];

// ── Trạng thái thẩm định KSNB ──
// CHO_THAM_DINH | DANG_THAM_DINH | DAT | DAT_DIEU_KIEN | KHONG_DAT
MOCK_RECORDS.forEach((r) => {
  if (r.appraisalStatus) return;
  if (r.ccdvStatus === "KHONG_DUOC_CCDV") r.appraisalStatus = "CHO_THAM_DINH";
  else if (r.rrLevel === "CAO") r.appraisalStatus = "DANG_THAM_DINH";
  else if (r.rrLevel === "TRUNG_BINH") r.appraisalStatus = "DAT_DIEU_KIEN";
  else r.appraisalStatus = "DAT";
  r.appraisalCode = r.appraisalStatus === "CHO_THAM_DINH" ? null : `PTD-2026-${String(r.stt).padStart(4, "0")}`;
  // Trạng thái thẩm định ở cột danh sách: KHONG | CHO | DA | CHO_LAI
  //  - Từ chối CCDV          → KHONG (Không thẩm định)
  //  - Cho phép, chờ TĐ      → CHO   (Chờ thẩm định) — chưa có điểm/mức rủi ro
  //  - Cho phép, đã TĐ       → DA    (Đã thẩm định)   — hiển thị điểm/mức
  //  - Đến kỳ thẩm định lại  → CHO_LAI                — hiển thị điểm/mức
  if (r.ccdvStatus === "KHONG_DUOC_CCDV") r.reviewState = "CHO";
  else r.reviewState = r.appraisalStatus === "CHO_THAM_DINH" ? "CHO" : "DA";
  if ([3, 7].includes(r.stt) && r.ccdvStatus !== "KHONG_DUOC_CCDV") r.reviewState = "CHO_LAI";
  if (r.stt === 8) { r.reviewState = "CHO"; r.appraisalStatus = "CHO_THAM_DINH"; r.appraisalCode = null; }  // Cho phép · chờ thẩm định → ẩn điểm/mức

  // ── Bổ sung trường theo ERP BaoKim ──
  const isOrg = r.entityType !== "CA_NHAN";
  r.erp = r.erp || {
    salesRep: r.screeningHistory && r.screeningHistory[0] && r.screeningHistory[0].actor && /—/.test(r.screeningHistory[0].actor) ? "Cao Vi Long" : "Cao Vi Long",
    kycStatus: r.appraisalStatus === "CHO_THAM_DINH" ? "KHOI_TAO" : "HOAN_TAT",
    gc: "016 - Dịch vụ khác",
    mcc: "7399 - Dịch vụ khác",
    mccWarn: r.rrLevel === "CAO",
    subMcc: "-",
    segment: isOrg ? "Doanh nghiệp SME" : "Cá nhân / Hộ KD",
    mstDate: isOrg ? "12/03/2019" : "",
    dkkdDate: isOrg ? "05/03/2019" : "",
    repPosition: isOrg ? r.personalInfo.position : "Chủ tài khoản",
    repJob: isOrg ? "Quản lý doanh nghiệp" : "Kinh doanh tự do",
    docType: "Căn cước công dân",
    docIssueDate: "20/06/2021",
    docExpiry: "20/06/2031",
    docIssuePlace: "Cục Cảnh sát QLHC về TTXH",
  };

  // ── Tài khoản ngân hàng hưởng thụ: 1 STK chính + danh sách STK khác ──
  // Mỗi STK được đối soát với Danh sách TKNH lừa đảo khi onboard.
  // STK trùng (FRAUD_HIT) bị CHẶN QUYẾT TOÁN trong quá trình sử dụng dịch vụ.
  if (!r.bankAccounts) {
    const FRAUD_VER = "FRAUD_ACC_DB_2026_Q2";
    const at = r.timeOnboard.slice(0, 10);
    const primary = {
      accountNo: r.bankInfo.accountNo,
      bankName: r.bankInfo.bankName,
      accountHolder: r.bankInfo.accountHolder,
      role: "PRIMARY",
      screen: "CLEAN",
      settlement: "ALLOWED",
      version: FRAUD_VER,
      addedAt: at,
    };
    const extras = {
      1: [
        { accountNo: "1903 4820 5566", bankName: "VPBank", accountHolder: "NGUYEN MINH PHONG", screen: "CLEAN" },
        { accountNo: "0071 0009 8842", bankName: "ACB", accountHolder: "CONG TY TNHH GP CN MINH PHONG", screen: "FRAUD_HIT" },
      ],
      3: [{ accountNo: "0091 2884 0011", bankName: "Techcombank", accountHolder: "CONG TY CO PHAN AN BINH", screen: "CLEAN" }],
      4: [{ accountNo: "1102 8845 0091", bankName: "VIB", accountHolder: "PHAM HOANG LONG", screen: "FRAUD_HIT" }],
      6: [{ accountNo: "1100 3829 7766", bankName: "MB Bank", accountHolder: "CTY CP GD EDUTECH VIET", screen: "CLEAN" }],
      7: [{ accountNo: "0301 9283 0042", bankName: "VietinBank", accountHolder: "CTY TNHH TVDT LAC HONG", screen: "CLEAN" }],
    }[r.stt] || [];
    const others = extras.map((a) => ({
      ...a,
      role: "OTHER",
      version: FRAUD_VER,
      addedAt: at,
      settlement: a.screen === "FRAUD_HIT" ? "BLOCKED" : "ALLOWED",
    }));
    r.bankAccounts = [primary, ...others];
  }

  // ── Giấy tờ KYC do merchant cung cấp (không theo danh mục cố định) ──
  if (!r.kycDocs) {
    const base = isOrg
      ? [
          { name: "CCCD người đại diện (mặt trước)", type: "CCCD", file: "cccd-truoc.jpg", at: r.timeOnboard.slice(0, 10), by: "Merchant" },
          { name: "CCCD người đại diện (mặt sau)", type: "CCCD", file: "cccd-sau.jpg", at: r.timeOnboard.slice(0, 10), by: "Merchant" },
          { name: "Giấy phép đăng ký kinh doanh", type: "ĐKKD", file: "gpkd.pdf", at: r.timeOnboard.slice(0, 10), by: "Merchant" },
          { name: "Điều lệ công ty", type: "Khác", file: "dieu-le-cty.pdf", at: r.timeOnboard.slice(0, 10), by: "Merchant" },
        ]
      : [
          { name: "CCCD (mặt trước)", type: "CCCD", file: "cccd-truoc.jpg", at: r.timeOnboard.slice(0, 10), by: "Merchant" },
          { name: "CCCD (mặt sau)", type: "CCCD", file: "cccd-sau.jpg", at: r.timeOnboard.slice(0, 10), by: "Merchant" },
        ];
    // hồ sơ chưa nộp gì (giống màn ERP "Chưa có giấy tờ")
    r.kycDocs = r.stt === 2 ? [] : base;
  }
  if (!r.salesChannelDocs) {
    r.salesChannelDocs = r.stt === 2 || r.stt === 5 ? [] : [
      { name: "Ảnh chụp website bán hàng", type: "Kênh bán", file: "website.png", at: r.timeOnboard.slice(0, 10), by: "Merchant" },
      { name: "Link gian hàng / ứng dụng", type: "Kênh bán", file: "gian-hang-url.txt", at: r.timeOnboard.slice(0, 10), by: "Merchant" },
    ];
  }
  // Seed lịch sử thẩm định KSNB cho hồ sơ đã xử lý
  if (!r.appraisalHistory) {
    if (r.appraisalStatus === "CHO_THAM_DINH") {
      r.appraisalHistory = [];
    } else {
      const ent = r.entityType === "CA_NHAN" ? "CA_NHAN" : "TO_CHUC";
      const svcWallet = (r.services || [{ name: r.service }]).some((s) => /Ví điện tử/i.test(s.name));
      const cc = ent === "CA_NHAN" ? (svcWallet ? "BM1.1" : "BM01") : (svcWallet ? "BM2.1" : "BM02");
      r.appraisalHistory = [{
        code: r.appraisalCode,
        timestamp: r.timeOnboard,
        officer: "Lưu Thế Anh",
        unit: "Phòng KSNB",
        caseCode: cc,
        apType: "INITIAL",
        riskLevel: r.rrLevel,
        conclusion: r.appraisalStatus,
        blacklistMatched: (r.blacklistResults || []).filter((x) => x.match !== "KHONG_TRUNG_KHOP").length,
        eddApplied: r.rrLevel === "CAO",
        note: r.appraisalStatus === "KHONG_DAT"
          ? "Hồ sơ trùng khớp danh sách giám sát, không đủ điều kiện cung cấp dịch vụ."
          : r.appraisalStatus === "DAT_DIEU_KIEN"
          ? "Phê duyệt có điều kiện: bổ sung giấy phép con và giám sát định kỳ."
          : "Hồ sơ hợp lệ, đủ điều kiện cung cấp dịch vụ."
      }];
    }
  }
});

// ── 5 trường hợp phân loại đối tượng khi onboard ──
// Mã phiếu BM theo nghiệp vụ BaoKim
const APPRAISAL_CASES = [
  { code: "BM01", entity: "CA_NHAN", svc: "DVCNTT", icon: "user",
    name: "ĐVCNTT — Cá nhân",
    desc: "Khách hàng cá nhân là Đơn vị chấp nhận thẻ/thanh toán. Có khối thẩm định hàng hoá, dịch vụ.",
    hasGoods: true },
  { code: "BM02", entity: "TO_CHUC", svc: "DVCNTT", icon: "building",
    name: "ĐVCNTT — Tổ chức / Hộ KD",
    desc: "Tổ chức, doanh nghiệp, hộ kinh doanh là ĐVCNTT. Thẩm định hàng hoá + thông tin pháp nhân.",
    hasGoods: true },
  { code: "BM1.1", entity: "CA_NHAN", svc: "VDT", icon: "user",
    name: "Ví điện tử — Cá nhân",
    desc: "Khách hàng cá nhân sử dụng Ví điện tử BaoKim. Tập trung nhận biết khách hàng (KYC).",
    hasGoods: false },
  { code: "BM2.1", entity: "TO_CHUC", svc: "VDT", icon: "building",
    name: "Ví điện tử — Tổ chức / Hộ KD",
    desc: "Tổ chức, hộ kinh doanh sử dụng Ví điện tử BaoKim. KYC pháp nhân + kế toán trưởng.",
    hasGoods: false },
  { code: "PHASE_SAU", entity: "KHAC", svc: "KHAC", icon: "history", soon: true,
    name: "Loại khác",
    desc: "Các đối tượng đặc thù khác — sẽ được bổ sung ở phase sau.",
    hasGoods: false },
];

// 6 bộ danh sách giám sát chuẩn của BaoKim (Blacklist)
const BLACKLIST_SCREEN_SETS = [
  { id: 1, name: "Danh sách đen nội bộ", levels: 3 },
  { id: 2, name: "Danh sách bị can, bị cáo, bị kết án", levels: 2 },
  { id: 3, name: "Danh sách cảnh báo CIC", levels: 3 },
  { id: 4, name: "Danh sách SIMO", levels: 2 },
  { id: 5, name: "Danh sách trốn thuế", levels: 2 },
  { id: 6, name: "Danh sách PEP", levels: 3 },
];

window.MOCK_RECORDS = MOCK_RECORDS;
window.SERVICES_LIST = SERVICES_LIST;
window.BLACKLIST_GROUPS = BLACKLIST_GROUPS;
window.APPRAISAL_CASES = APPRAISAL_CASES;
window.BLACKLIST_SCREEN_SETS = BLACKLIST_SCREEN_SETS;
