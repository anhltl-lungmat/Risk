// ─────────────────────────────────────────────────────────────────
// blacklist-detail.jsx — Màn "Danh sách chi tiết" (PCRT › Blacklist › Quản lý danh sách)
// Bộ lọc ở trên · các tab danh sách nằm ngang · mỗi danh sách có bộ cột riêng.
// ─────────────────────────────────────────────────────────────────
const { useState: useStateBD, useMemo: useMemoBD } = React;

const BD_VERSIONS = ["v2026.06", "v2026.05", "v2026.04", "v2026.03"];

// Cột chung: act (Thao tác) + stt (STT) luôn đứng đầu mỗi danh sách.
const COL_ACT = { k: "act", label: "Thao tác", w: "w-[92px]", center: true };
const COL_STT = { k: "stt", label: "STT", w: "w-12", center: true };

// 8 danh sách — mỗi danh sách khai báo cột (cols) + dữ liệu (rows) theo đúng key cột.
const BD_TABS = [
  // 1 ── Danh sách đen
  {
    key: "den", label: "Danh sách đen",
    cols: [
      COL_ACT, COL_STT,
      { k: "doiTuong", label: "Đối tượng", w: "w-24" },
      { k: "hoTen", label: "Họ tên", strong: true },
      { k: "biDanh", label: "Bí danh" },
      { k: "cccd", label: "CMND/CCCD/HV", mono: true },
      { k: "tenToChuc", label: "Tên tổ chức" },
      { k: "mst", label: "Mã số thuế", mono: true },
      { k: "ngaySinh", label: "Ngày sinh", mono: true },
      { k: "namSinh", label: "Năm sinh", mono: true, center: true },
      { k: "quocTich", label: "Quốc tịch" },
      { k: "diaChi", label: "Địa chỉ" },
      { k: "noiSinh", label: "Nơi sinh" },
      { k: "ghiChu", label: "Ghi chú" },
      { k: "nguon", label: "Nguồn dữ liệu" },
      { k: "ngayImport", label: "Ngày import", mono: true },
    ],
    rows: [
      { _ver: "v2026.06", doiTuong: "Cá nhân", hoTen: "Nguyễn Văn Hùng", biDanh: "Hùng \"Sói\"", cccd: "001088xxxx217", tenToChuc: "—", mst: "—", ngaySinh: "12/03/1988", namSinh: "1988", quocTich: "Việt Nam", diaChi: "P. Cầu Giấy, Hà Nội", noiSinh: "Hà Nội", ghiChu: "Liên quan tín dụng đen", nguon: "Nội bộ BaoKim", ngayImport: "2026-06-10" },
      { _ver: "v2026.06", doiTuong: "Tổ chức", hoTen: "—", biDanh: "—", cccd: "—", tenToChuc: "CTY TNHH TM Đại Phát", mst: "0109482771", ngaySinh: "—", namSinh: "—", quocTich: "Việt Nam", diaChi: "Q.1, TP. HCM", noiSinh: "—", ghiChu: "Nghi vấn rửa tiền", nguon: "Nội bộ BaoKim", ngayImport: "2026-06-08" },
      { _ver: "v2026.05", doiTuong: "Cá nhân", hoTen: "Trần Thị Mai", biDanh: "Mai Lê", cccd: "079190xxxx044", tenToChuc: "—", mst: "—", ngaySinh: "05/09/1990", namSinh: "1990", quocTich: "Việt Nam", diaChi: "P. Bến Thành, TP. HCM", noiSinh: "TP. HCM", ghiChu: "—", nguon: "Cảnh báo đối tác", ngayImport: "2026-05-22" },
      { _ver: "v2026.04", doiTuong: "Cá nhân", hoTen: "Lê Quang Đạo", biDanh: "—", cccd: "036085xxxx903", tenToChuc: "—", mst: "—", ngaySinh: "18/11/1985", namSinh: "1985", quocTich: "Việt Nam", diaChi: "TP. Nam Định", noiSinh: "Nam Định", ghiChu: "—", nguon: "Nội bộ BaoKim", ngayImport: "2026-04-30" },
    ],
  },
  // 2 ── Danh sách bị can, bị cáo, bị kết án
  {
    key: "bican", label: "Danh sách bị can, bị cáo, bị kết án",
    cols: [
      COL_ACT, COL_STT,
      { k: "doiTuong", label: "Đối tượng", w: "w-24" },
      { k: "hoTen", label: "Họ tên", strong: true },
      { k: "cccd", label: "CMND/CCCD/ĐDCN", mono: true },
      { k: "tenToChuc", label: "Tên tổ chức" },
      { k: "mst", label: "Mã số thuế", mono: true },
      { k: "nguoiDaiDien", label: "Người đại diện" },
      { k: "ngaySinh", label: "Ngày sinh", mono: true },
      { k: "quocTich", label: "Quốc tịch" },
      { k: "diaChi", label: "Địa chỉ" },
      { k: "hanhVi", label: "Hành vi" },
      { k: "nguon", label: "Nguồn dữ liệu" },
      { k: "ngayImport", label: "Ngày import", mono: true },
    ],
    rows: [
      { _ver: "v2026.06", doiTuong: "Cá nhân", hoTen: "Phạm Minh Tuấn", cccd: "024083xxxx551", tenToChuc: "—", mst: "—", nguoiDaiDien: "—", ngaySinh: "22/07/1983", quocTich: "Việt Nam", diaChi: "Q. Hà Đông, Hà Nội", hanhVi: "Lừa đảo chiếm đoạt tài sản", nguon: "Bộ Công an", ngayImport: "2026-06-02" },
      { _ver: "v2026.05", doiTuong: "Cá nhân", hoTen: "Đỗ Thị Hồng", cccd: "038191xxxx120", tenToChuc: "—", mst: "—", nguoiDaiDien: "—", ngaySinh: "14/02/1991", quocTich: "Việt Nam", diaChi: "TP. Hải Phòng", hanhVi: "Tổ chức đánh bạc", nguon: "Toà án ND tối cao", ngayImport: "2026-05-15" },
      { _ver: "v2026.04", doiTuong: "Cá nhân", hoTen: "Vũ Đức Long", cccd: "001079xxxx488", tenToChuc: "—", mst: "—", nguoiDaiDien: "—", ngaySinh: "30/06/1979", quocTich: "Việt Nam", diaChi: "P. Hoàng Mai, Hà Nội", hanhVi: "Cho vay lãi nặng", nguon: "Bộ Công an", ngayImport: "2026-04-18" },
    ],
  },
  // 3 ── Danh sách cảnh báo NHNN
  {
    key: "nhnn", label: "Danh sách cảnh báo NHNN",
    cols: [
      COL_ACT, COL_STT,
      { k: "doiTuong", label: "Đối tượng", w: "w-24" },
      { k: "loaiHinh", label: "Loại hình" },
      { k: "hoTen", label: "Họ tên", strong: true },
      { k: "cccd", label: "CMND/CCCD/ĐDCN", mono: true },
      { k: "tenToChuc", label: "Tên tổ chức" },
      { k: "mst", label: "Mã số thuế", mono: true },
      { k: "nguoiDaiDien", label: "Người đại diện" },
      { k: "ngaySinh", label: "Ngày sinh", mono: true },
      { k: "quocTich", label: "Quốc tịch" },
      { k: "diaChi", label: "Địa chỉ" },
      { k: "nguon", label: "Nguồn dữ liệu" },
      { k: "ngayImport", label: "Ngày import", mono: true },
    ],
    rows: [
      { _ver: "v2026.06", doiTuong: "Tổ chức", loaiHinh: "Công ty tài chính", hoTen: "—", cccd: "—", tenToChuc: "CTY CP Đầu tư Tài chính Lạc Hồng", mst: "0301928372", nguoiDaiDien: "Nguyễn Đình Khoa", ngaySinh: "—", quocTich: "Việt Nam", diaChi: "Q.3, TP. HCM", nguon: "NHNN — CV 2026", ngayImport: "2026-06-05" },
      { _ver: "v2026.05", doiTuong: "Cá nhân", loaiHinh: "Chủ tài khoản", hoTen: "Hoàng Văn Khôi", cccd: "030085xxxx771", tenToChuc: "—", mst: "—", nguoiDaiDien: "—", ngaySinh: "09/04/1980", quocTich: "Việt Nam", diaChi: "TP. Vinh, Nghệ An", nguon: "NHNN", ngayImport: "2026-05-09" },
    ],
  },
  // 4 ── Danh sách PEPs
  {
    key: "pep", label: "Danh sách PEPs",
    cols: [
      COL_ACT, COL_STT,
      { k: "hoTen", label: "Họ tên", strong: true },
      { k: "quocGia", label: "Quốc gia" },
      { k: "coQuan", label: "Cơ quan" },
      { k: "chucVu", label: "Chức vụ" },
      { k: "lenhCIA", label: "Lệnh CIA", center: true },
      { k: "danhMucPEP", label: "Danh mục PEP" },
      { k: "nguon", label: "Nguồn dữ liệu" },
      { k: "thoiGianCapNhat", label: "Thời gian cập nhật", mono: true },
      { k: "ngayImport", label: "Ngày import", mono: true },
    ],
    rows: [
      { _ver: "v2026.06", hoTen: "Nguyễn Thanh Bình", quocGia: "Việt Nam", coQuan: "Bộ Tài chính", chucVu: "Thứ trưởng", lenhCIA: "Không", danhMucPEP: "PEP trong nước", nguon: "PEP_V4.9 — Quốc tế", thoiGianCapNhat: "2026-05-30 08:12", ngayImport: "2026-06-01" },
      { _ver: "v2026.05", hoTen: "Trương Mỹ Linh", quocGia: "Việt Nam", coQuan: "UBND TP. HCM", chucVu: "Phó Chủ tịch", lenhCIA: "Không", danhMucPEP: "PEP trong nước", nguon: "PEP_V4.9 — Quốc tế", thoiGianCapNhat: "2026-05-18 10:40", ngayImport: "2026-05-20" },
      { _ver: "v2026.04", hoTen: "Đặng Quốc Việt", quocGia: "Việt Nam", coQuan: "Ngân hàng NN", chucVu: "Vụ trưởng", lenhCIA: "Có", danhMucPEP: "Thân nhân PEP", nguon: "PEP_V4.8 — Quốc tế", thoiGianCapNhat: "2026-04-10 14:05", ngayImport: "2026-04-12" },
    ],
  },
  // 5 ── Danh sách SIMO
  {
    key: "simo", label: "Danh sách SIMO",
    cols: [
      COL_ACT, COL_STT,
      { k: "donVi", label: "Đơn vị" },
      { k: "doiTuong", label: "Đối tượng", w: "w-24" },
      { k: "maCIF", label: "Mã CIF", mono: true },
      { k: "maDN", label: "Mã số DN/HKD", mono: true },
      { k: "cccd", label: "CMND/CCCD", mono: true },
      { k: "loaiID", label: "Loại ID" },
      { k: "tenNguoiDaiDien", label: "Tên người đại diện" },
      { k: "tenKhachHang", label: "Tên khách hàng", strong: true },
      { k: "tenVietTat", label: "Tên viết tắt" },
      { k: "ngaySinh", label: "Ngày sinh", mono: true },
      { k: "quocTich", label: "Quốc tịch" },
      { k: "tenDVCNTT", label: "Tên ĐVCNTT" },
      { k: "maDDDT", label: "Mã ĐDĐT/MST", mono: true },
      { k: "sdt", label: "Số điện thoại", mono: true },
      { k: "mac", label: "MAC Address", mono: true },
      { k: "imei", label: "IMEI", mono: true },
      { k: "soTK", label: "Số tài khoản", mono: true },
      { k: "chuTK", label: "Chủ tài khoản" },
      { k: "nganHang", label: "Ngân hàng" },
      { k: "loaiTK", label: "Loại TK" },
      { k: "trangThaiTK", label: "Trạng thái TK" },
      { k: "diaChi", label: "Địa chỉ" },
      { k: "loaiVDT", label: "Loại VĐT" },
      { k: "trangThaiVDT", label: "Trạng thái VĐT" },
      { k: "stkLienKet", label: "STK/Thẻ liên kết VĐT", mono: true },
      { k: "gioiTinh", label: "Giới tính", center: true },
      { k: "lyDo", label: "Lý do nghi ngờ" },
      { k: "ngayImport", label: "Ngày import", mono: true },
    ],
    rows: [
      { _ver: "v2026.06", donVi: "VPBank", doiTuong: "Cá nhân", maCIF: "CIF0928173", maDN: "—", cccd: "001090xxxx552", loaiID: "CCCD", tenNguoiDaiDien: "—", tenKhachHang: "NGUYEN VAN A", tenVietTat: "—", ngaySinh: "01/01/1990", quocTich: "Việt Nam", tenDVCNTT: "—", maDDDT: "—", sdt: "0912xxx678", mac: "3C:5A:B4:xx:xx:01", imei: "356938xxxxx1234", soTK: "02039281 7263", chuTK: "NGUYEN VAN A", nganHang: "VPBank", loaiTK: "Thanh toán", trangThaiTK: "Đang phong toả", diaChi: "Q. Đống Đa, Hà Nội", loaiVDT: "—", trangThaiVDT: "—", stkLienKet: "—", gioiTinh: "Nam", lyDo: "Nhận tiền lừa đảo", ngayImport: "2026-06-07" },
      { _ver: "v2026.05", donVi: "Vietcombank", doiTuong: "Cá nhân", maCIF: "CIF1029384", maDN: "—", cccd: "079188xxxx311", loaiID: "CCCD", tenNguoiDaiDien: "—", tenKhachHang: "LE THI B", tenVietTat: "—", ngaySinh: "15/07/1988", quocTich: "Việt Nam", tenDVCNTT: "—", maDDDT: "—", sdt: "0987xxx210", mac: "A0:1B:C2:xx:xx:09", imei: "358214xxxxx0092", soTK: "11003829 0182", chuTK: "LE THI B", nganHang: "Vietcombank", loaiTK: "Thanh toán", trangThaiTK: "Nghi vấn", diaChi: "Q.7, TP. HCM", loaiVDT: "MoMo", trangThaiVDT: "Đang hoạt động", stkLienKet: "9704xxxx0182", gioiTinh: "Nữ", lyDo: "Trung gian chuyển tiền", ngayImport: "2026-05-11" },
      { _ver: "v2026.04", donVi: "Sacombank", doiTuong: "Tổ chức", maCIF: "CIF2038471", maDN: "0301928372", cccd: "—", loaiID: "MST", tenNguoiDaiDien: "TRAN VAN C", tenKhachHang: "CTY TNHH C&C", tenVietTat: "C&C", ngaySinh: "—", quocTich: "Việt Nam", tenDVCNTT: "Cổng TT ABC", maDDDT: "DDDT002918", sdt: "0283xxx900", mac: "—", imei: "—", soTK: "03019283 7261", chuTK: "CTY TNHH C&C", nganHang: "Sacombank", loaiTK: "Doanh nghiệp", trangThaiTK: "Đang phong toả", diaChi: "Q. Bình Thạnh, TP. HCM", loaiVDT: "—", trangThaiVDT: "—", stkLienKet: "—", gioiTinh: "—", lyDo: "Tài khoản shadow", ngayImport: "2026-04-25" },
    ],
  },
  // 6 ── Danh sách trốn thuế
  {
    key: "tronthue", label: "Danh sách trốn thuế",
    cols: [
      COL_ACT, COL_STT,
      { k: "doiTuong", label: "Đối tượng", w: "w-24" },
      { k: "hoTen", label: "Họ tên", strong: true },
      { k: "tenToChuc", label: "Tên tổ chức" },
      { k: "mst", label: "MST", mono: true },
      { k: "namSinh", label: "Năm sinh", mono: true, center: true },
      { k: "diaChi", label: "Địa chỉ" },
      { k: "nguon", label: "Nguồn dữ liệu" },
      { k: "ghiChu", label: "Ghi chú" },
      { k: "ngayImport", label: "Ngày import", mono: true },
    ],
    rows: [
      { _ver: "v2026.06", doiTuong: "Tổ chức", hoTen: "—", tenToChuc: "CTY TNHH XNK Thành Đạt", mst: "0108771920", namSinh: "—", diaChi: "Q. Long Biên, Hà Nội", nguon: "Tổng cục Thuế", ghiChu: "Nợ thuế 4,2 tỷ", ngayImport: "2026-06-03" },
      { _ver: "v2026.05", doiTuong: "Cá nhân", hoTen: "Phan Thị Duyên", tenToChuc: "HKD Duyên Phát", mst: "8271039182", namSinh: "1986", diaChi: "TP. Đà Nẵng", nguon: "Tổng cục Thuế", ghiChu: "Bỏ trốn khỏi địa chỉ ĐKKD", ngayImport: "2026-05-17" },
    ],
  },
  // 7 ── TKNH lừa đảo
  {
    key: "tknh", label: "TKNH lừa đảo",
    cols: [
      COL_ACT, COL_STT,
      { k: "stk", label: "STK", mono: true, strong: true },
      { k: "nganHang", label: "Ngân hàng" },
      { k: "chuTK", label: "Chủ tài khoản" },
      { k: "nguon", label: "Nguồn dữ liệu" },
      { k: "ngayImport", label: "Ngày import", mono: true },
    ],
    rows: [
      { _ver: "v2026.06", stk: "9988 7766 5544", nganHang: "Techcombank", chuTK: "NGO VAN D", nguon: "Cảnh báo cộng đồng", ngayImport: "2026-06-09" },
      { _ver: "v2026.06", stk: "1234 5678 9012", nganHang: "MB Bank", chuTK: "BUI THI E", nguon: "Nội bộ BaoKim", ngayImport: "2026-06-06" },
      { _ver: "v2026.05", stk: "5566 7788 9900", nganHang: "ACB", chuTK: "DINH VAN F", nguon: "Cảnh báo đối tác", ngayImport: "2026-05-13" },
    ],
  },
  // 8 ── Black word
  {
    key: "word", label: "Black word",
    cols: [
      COL_ACT, COL_STT,
      { k: "nhomTu", label: "Nhóm từ" },
      { k: "tuCoDau", label: "Từ có dấu", strong: true },
      { k: "tuKhongDau", label: "Từ không dấu", mono: true },
      { k: "ngayImport", label: "Ngày import", mono: true },
    ],
    rows: [
      { _ver: "v2026.06", nhomTu: "Cờ bạc", tuCoDau: "đánh bạc online", tuKhongDau: "danh bac online", ngayImport: "2026-06-10" },
      { _ver: "v2026.06", nhomTu: "Tài chính cấm", tuCoDau: "đáo hạn thẻ tín dụng", tuKhongDau: "dao han the tin dung", ngayImport: "2026-06-10" },
      { _ver: "v2026.05", nhomTu: "Lừa đảo", tuCoDau: "tiền ảo đa cấp", tuKhongDau: "tien ao da cap", ngayImport: "2026-05-12" },
      { _ver: "v2026.05", nhomTu: "Tín dụng đen", tuCoDau: "cho vay nặng lãi", tuKhongDau: "cho vay nang lai", ngayImport: "2026-05-12" },
      { _ver: "v2026.04", nhomTu: "AML", tuCoDau: "rửa tiền", tuKhongDau: "rua tien", ngayImport: "2026-04-22" },
    ],
  },
];

function BDFilterField({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function BDTextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2.5 py-1.5 bg-white text-[12px] text-slate-900 rounded-md border border-slate-200 focus:border-[var(--bk-primary)] focus:outline-none placeholder:text-slate-400"
    />
  );
}

function BlacklistDetailView() {
  const [active, setActive] = useStateBD(BD_TABS[0].key);
  const [f, setF] = useStateBD({ kw: "", ver: "ALL" });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const reset = () => setF({ kw: "", ver: "ALL" });

  const tab = BD_TABS.find((t) => t.key === active);

  const rows = useMemoBD(() => {
    const kwQ = f.kw.trim().toLowerCase();
    return tab.rows.filter((r) => {
      if (f.ver !== "ALL" && r._ver !== f.ver) return false;
      if (kwQ) {
        const blob = Object.keys(r).filter((k) => k !== "_ver").map((k) => r[k]).join(" ").toLowerCase();
        if (!blob.includes(kwQ)) return false;
      }
      return true;
    });
  }, [tab, f]);

  const hasFilter = f.kw || f.ver !== "ALL";

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-5 space-y-4 max-w-[1600px] mx-auto">
        {/* Bộ lọc */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-2.5 border-b border-slate-150 flex items-center gap-2">
            <Icon name="filter" className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[12px] font-bold text-slate-700">Bộ lọc danh sách</span>
            {hasFilter && (
              <button onClick={reset} className="ml-auto text-[11px] font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-2 cursor-pointer">
                Xóa lọc
              </button>
            )}
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <BDFilterField label="Từ khoá">
                <BDTextInput value={f.kw} onChange={(v) => set("kw", v)} placeholder="Tìm theo tên, CCCD, MST, số TK, địa chỉ…" />
              </BDFilterField>
            </div>
            <BDFilterField label="Phiên bản">
              <Select value={f.ver} onChange={(v) => set("ver", v)} options={[
                { v: "ALL", label: "Tất cả phiên bản" },
                ...BD_VERSIONS.map((v) => ({ v, label: v })),
              ]} />
            </BDFilterField>
          </div>
        </div>

        {/* Tabs ngang + nội dung */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="flex items-end gap-0.5 px-2 pt-2 border-b border-slate-200 overflow-x-auto">
            {BD_TABS.map((t) => {
              const on = t.key === active;
              return (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={`shrink-0 px-3 py-2 text-[12px] font-semibold rounded-t-md transition-colors cursor-pointer border-b-2 -mb-px ${on ? "text-[var(--bk-primary)] border-[var(--bk-primary)] bg-slate-50" : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50"}`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="p-3">
            <BDTable cols={tab.cols} rows={rows} />
          </div>
        </div>
      </div>
    </main>
  );
}

function BDCellValue({ col, value, index }) {
  if (col.k === "act") {
    return (
      <div className="flex items-center justify-center gap-1.5">
        <button title="Xem chi tiết" className="p-1 rounded text-slate-400 hover:text-[var(--bk-primary)] hover:bg-slate-100 cursor-pointer">
          <Icon name="eye" className="w-4 h-4" />
        </button>
        <button title="Thao tác khác" className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
          <Icon name="moreV" className="w-4 h-4" />
        </button>
      </div>
    );
  }
  if (col.k === "stt") {
    return <span className="text-slate-400 font-mono text-[11px]">{index + 1}</span>;
  }
  const v = value == null || value === "" ? "—" : value;
  const isEmpty = v === "—";
  const cls = [
    col.mono ? "font-mono text-[11px]" : "",
    col.strong && !isEmpty ? "font-semibold text-slate-900" : isEmpty ? "text-slate-300" : "text-slate-600",
    col.center ? "text-center" : "",
  ].join(" ");
  return <span className={cls}>{v}</span>;
}

function BDTable({ cols, rows }) {
  const minW = Math.max(760, cols.length * 150);
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-md">
      <table className="w-full text-left border-collapse" style={{ minWidth: `${minW}px` }}>
        <thead>
          <tr className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {cols.map((c) => (
              <th key={c.k} className={`py-2.5 px-3 whitespace-nowrap ${c.w || ""} ${c.center ? "text-center" : ""}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={cols.length} className="py-10 text-center text-[12px] text-slate-400">Không có bản ghi phù hợp bộ lọc.</td>
            </tr>
          ) : rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-150 text-[12px] text-slate-700 hover:bg-slate-50">
              {cols.map((c) => (
                <td key={c.k} className={`py-2.5 px-3 ${c.center ? "text-center" : ""} ${c.mono ? "whitespace-nowrap" : ""}`}>
                  <BDCellValue col={c} value={r[c.k]} index={i} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, { BlacklistDetailView });
