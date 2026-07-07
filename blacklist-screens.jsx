// ─────────────────────────────────────────────────────────────────
// blacklist-screens.jsx — Màn "Nhập danh sách" (bl-nhap) & "Phiên bản" (bl-phienban)
// PCRT › Blacklist › Quản lý danh sách
// ─────────────────────────────────────────────────────────────────
const { useState: useStateBS, useRef: useRefBS, useMemo: useMemoBS } = React;

const BL_LIST_NAMES = [
  "Danh sách đen",
  "Danh sách bị can, bị cáo, bị kết án",
  "Danh sách cảnh báo NHNN",
  "Danh sách PEPs",
  "Danh sách SIMO",
  "Danh sách trốn thuế",
  "TKNH lừa đảo",
  "Black word",
];

const fmtSize = (b) => b >= 1048576 ? (b / 1048576).toFixed(1) + " MB" : (b / 1024).toFixed(0) + " KB";
const nowStamp = () => new Date().toISOString().replace("T", " ").substring(0, 16);

// Các loại lỗi mô phỏng cho từng dòng nhập
const BL_ERR_TYPES = [
  { field: "CCCD", reason: "Sai định dạng — không đủ 12 chữ số", val: () => "03920" + Math.floor(Math.random() * 9000 + 1000) },
  { field: "MST", reason: "Mã số thuế không hợp lệ", val: () => Math.floor(Math.random() * 900000 + 100000) + "-abc" },
  { field: "Họ tên", reason: "Thiếu trường bắt buộc", val: () => "" },
  { field: "Ngày sinh", reason: "Ngày sinh không hợp lệ", val: () => "31/02/199" + Math.floor(Math.random() * 9) },
  { field: "CCCD", reason: "Trùng bản ghi đã tồn tại trong danh sách", val: () => "0" + Math.floor(Math.random() * 900000000000 + 100000000000) },
  { field: "Họ tên", reason: "Chứa ký tự không hợp lệ", val: () => "Nguyễn V@n #A" },
];
// Sinh danh sách dòng lỗi cho 1 bản ghi đã nhập (mô phỏng)
function genErrRows(u) {
  const rows = [];
  const usedLines = new Set();
  for (let i = 0; i < u.err; i++) {
    let line;
    do { line = Math.floor(Math.random() * u.total) + 2; } while (usedLines.has(line));
    usedLines.add(line);
    const t = BL_ERR_TYPES[Math.floor(Math.random() * BL_ERR_TYPES.length)];
    rows.push({ line, sheet: u.list, field: t.field, value: t.val(), reason: t.reason });
  }
  return rows.sort((a, b) => a.line - b.line);
}

// ═══════════════════════════════════════════════════════════════════
// MÀN NHẬP DANH SÁCH
// ═══════════════════════════════════════════════════════════════════
function ImportListView() {
  const inputRef = useRefBS(null);
  const [drag, setDrag] = useStateBS(false);
  const [error, setError] = useStateBS(null);
  const [job, setJob] = useStateBS(null);   // { name, size, pct, phase, sheets }
  const [errView, setErrView] = useStateBS(null); // { upload, rows } — slide-over chi tiết lỗi
  const openErrors = (u) => { if (u.err > 0) setErrView({ upload: u, rows: genErrRows(u) }); };
  // Demo tiến trình xử lý — gồm danh sách đang xử lý & đã xử lý xong
  const [procJobs] = useStateBS([
    { list: "Danh sách đen",        imported: 1240, total: 1240, status: "done" },
    { list: "Danh sách PEPs",       imported: 6120, total: 8930, status: "processing" },
    { list: "Danh sách cảnh báo NHNN", imported: 430, total: 2050, status: "processing" },
    { list: "TKNH lừa đảo",         imported: 980,  total: 980,  status: "done" },
  ]);
  const [uploads, setUploads] = useStateBS([
    { name: "danh_sach_den_2026_06.xlsx", size: 2411724, list: "Danh sách đen", total: 1240, ok: 1236, err: 4, date: "2026-06-10 09:12", status: "done" },
    { name: "pep_quoc_te_v4_9.xlsx", size: 5872026, list: "Danh sách PEPs", total: 8930, ok: 8930, err: 0, date: "2026-06-01 14:30", status: "done" },
    { name: "simo_shadow_t5.xls", size: 1310720, list: "Danh sách SIMO", total: 540, ok: 512, err: 28, date: "2026-05-28 11:05", status: "warn" },
  ]);

  const validate = (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(ext)) return "Định dạng không hợp lệ. Chỉ chấp nhận tệp .xlsx hoặc .xls.";
    if (file.size > 50 * 1048576) return `Tệp vượt quá dung lượng cho phép (${fmtSize(file.size)} > 50 MB).`;
    return null;
  };

  const handleFile = (file) => {
    if (!file) return;
    const err = validate(file);
    if (err) { setError({ file: file.name, msg: err }); return; }
    setError(null);
    // Mỗi sheet trong file = 1 danh sách. Mô phỏng phát hiện 2–4 sheet.
    const nSheets = Math.floor(Math.random() * 3) + 2;
    const sheetNames = BL_LIST_NAMES.slice(0, nSheets);
    setJob({ name: file.name, size: file.size, pct: 0, phase: "Đang tải lên", sheets: sheetNames });
    let pct = 0;
    const tick = setInterval(() => {
      pct += Math.random() * 12 + 5;
      if (pct >= 100) {
        clearInterval(tick);
        const recs = sheetNames.map((n) => {
          const total = Math.floor(Math.random() * 1500) + 200;
          const errN = Math.random() < 0.4 ? Math.floor(Math.random() * 30) : 0;
          return { name: file.name, size: file.size, list: n, total, ok: total - errN, err: errN, date: nowStamp(), status: errN > 0 ? "warn" : "done" };
        });
        setJob(null);
        setUploads((u) => [...recs, ...u]);
        const totalErr = recs.reduce((a, r) => a + r.err, 0);
        if (totalErr > 0) setError({ file: file.name, msg: `Đã nhập ${recs.length} danh sách từ ${recs.length} sheet. Có ${totalErr} dòng lỗi (sai định dạng CCCD/MST hoặc thiếu trường bắt buộc). Tải tệp log để xem chi tiết.`, warn: true });
      } else {
        const p = Math.min(99, Math.round(pct));
        const phase = p < 30 ? "Đang tải lên" : p < 60 ? "Đang đọc các sheet" : p < 85 ? "Đang kiểm tra dữ liệu" : "Đang ghi danh sách";
        setJob((j) => j && ({ ...j, pct: p, phase }));
      }
    }, 400);
  };

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    handleFile(e.dataTransfer.files && e.dataTransfer.files[0]);
  };

  const progressPct = job ? job.pct : 0;
  const doneSheets = job ? Math.floor((job.pct / 100) * job.sheets.length) : 0;

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-5 space-y-4 max-w-[1200px] mx-auto">

        {/* Import file — 1 nút duy nhất */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-bold text-slate-900">Tải tệp danh sách blacklist</div>
              <div className="text-[11.5px] text-slate-500 mt-0.5">Tải lên 1 file Excel tổng — mỗi sheet trong file tương ứng với 1 danh sách. Hỗ trợ .xlsx, .xls · Tối đa 50 MB.</div>
            </div>
            <button
              onClick={() => inputRef.current && inputRef.current.click()}
              disabled={!!job}
              className="flex items-center gap-2 px-5 py-3 text-[13px] font-bold text-white rounded-lg cursor-pointer shrink-0 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--bk-primary)" }}>
              <Icon name={job ? "refresh" : "import"} className={`w-4 h-4 ${job ? "animate-spin" : ""}`} /> {job ? "Đang xử lý…" : "Nhập danh sách"}
            </button>
            <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden"
              onChange={(e) => { handleFile(e.target.files[0]); e.target.value = ""; }} />
          </div>

          {/* Cảnh báo lỗi */}
          {error && (
            <div className={`mt-3 flex items-start gap-2.5 rounded-md border px-3 py-2.5 ${error.warn ? "bg-amber-50 border-amber-200" : "bg-rose-50 border-rose-200"}`}>
              <Icon name="alert" className={`w-4 h-4 mt-px shrink-0 ${error.warn ? "text-amber-600" : "text-rose-600"}`} />
              <div className="min-w-0">
                <div className={`text-[12px] font-bold ${error.warn ? "text-amber-800" : "text-rose-800"}`}>{error.warn ? "Cảnh báo xử lý" : "Không thể nhập tệp"}</div>
                <div className={`text-[11px] ${error.warn ? "text-amber-700" : "text-rose-700"}`}><span className="font-mono">{error.file}</span> — {error.msg}</div>
              </div>
              <button onClick={() => setError(null)} className="ml-auto text-slate-400 hover:text-slate-700 text-[15px] leading-none cursor-pointer">×</button>
            </div>
          )}
        </div>

        {/* Tiến trình xử lý  ▮  Danh sách đã tải lên — song song */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_1fr] gap-4 items-start">

          {/* Tiến trình xử lý */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-4 py-2.5 border-b border-slate-150 flex items-center gap-2">
              <span className="text-[15px] font-bold text-slate-900">Tiến trình xử lý</span>
            </div>
            <div className="p-4">
              {job && (
                <div className="mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Icon name="file" className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-[12px] font-semibold text-slate-800 truncate">{job.name}</span>
                    <span className="text-[11px] text-slate-400 shrink-0">{fmtSize(job.size)}</span>
                    <span className="ml-auto text-[13px] font-bold tabular-nums shrink-0" style={{ color: "var(--bk-primary)" }}>{progressPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progressPct}%`, background: "var(--bk-primary)" }}></div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">{job.phase}…</div>

                  {/* Các sheet phát hiện trong file */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{job.sheets.length} sheet = {job.sheets.length} danh sách</div>
                    <div className="space-y-1.5">
                      {job.sheets.map((sn, si) => {
                        const st = si < doneSheets ? "done" : si === doneSheets ? "active" : "wait";
                        return (
                          <div key={si} className="flex items-center gap-2 text-[12px]">
                            {st === "done"
                              ? <Icon name="check" className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              : st === "active"
                                ? <Icon name="refresh" className="w-3.5 h-3.5 shrink-0 animate-spin" style={{ color: "var(--bk-primary)" }} />
                                : <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"></span>}
                            <span className={st === "wait" ? "text-slate-400" : "text-slate-700"}>{sn}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tiến trình theo từng danh sách */}
              <div className="space-y-3">
                {procJobs.map((p, i) => {
                  const pct = Math.round((p.imported / p.total) * 100);
                  const isDone = p.status === "done";
                  return (
                    <div key={i}>
                      <div className="flex items-center gap-2">
                        {isDone
                          ? <Icon name="check" className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          : <Icon name="refresh" className="w-3.5 h-3.5 shrink-0 animate-spin" style={{ color: "var(--bk-primary)" }} />}
                        <span className="text-[12px] font-semibold text-slate-800 truncate flex-1">{p.list}</span>
                        <span className={`text-[10px] font-bold rounded px-1.5 py-0.5 shrink-0 ${isDone ? "bdg-success" : "bdg-info"}`}>
                          {isDone ? "Đã xử lý xong" : "Đang xử lý"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%`, background: isDone ? "var(--sem-success)" : "var(--bk-primary)" }}
                          ></div>
                        </div>
                        <span className="text-[11px] font-mono tabular-nums text-slate-500 shrink-0">
                          <b className="text-slate-700">{p.imported.toLocaleString("vi-VN")}</b>
                          <span className="text-slate-400"> / {p.total.toLocaleString("vi-VN")} dòng</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Danh sách đã tải lên */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-4 py-2.5 border-b border-slate-150 flex items-center gap-2">
              <span className="text-[15px] font-bold text-slate-900">Danh sách đã tải lên</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              {uploads.map((u, i) => {
                const clickable = u.err > 0;
                return (
                <div
                  key={i}
                  onClick={() => openErrors(u)}
                  className={`px-4 py-2.5 ${clickable ? "cursor-pointer hover:bg-rose-50/60" : "hover:bg-slate-50"}`}
                  title={clickable ? "Bấm để xem chi tiết dòng lỗi" : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-slate-800 truncate flex-1">{u.list}</span>
                    <UploadStatus status={u.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <Icon name="file" className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-mono truncate max-w-[150px]" title={u.name}>{u.name}</span>
                    <span className="ml-auto tabular-nums">
                      <span className="text-emerald-700 font-semibold">{u.ok.toLocaleString("vi-VN")}</span>
                      <span className="text-slate-400"> / {u.total.toLocaleString("vi-VN")} dòng</span>
                      {u.err > 0 && <span className="text-rose-600 font-semibold"> · {u.err} lỗi</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-slate-400">{u.date}</span>
                    {clickable && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-semibold text-rose-600">
                        Xem chi tiết lỗi <Icon name="chevronRight" className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {errView && <ErrorDetailPanel data={errView} onClose={() => setErrView(null)} />}
    </main>
  );
}

function UploadStatus({ status }) {
  const cfg = {
    done: { label: "Thành công", cls: "bdg-success" },
    warn: { label: "Có dòng lỗi", cls: "bdg-warning" },
    fail: { label: "Thất bại", cls: "bdg-danger" },
  }[status] || { label: status, cls: "bdg-secondary" };
  return (
    <span className={`inline-flex items-center text-[11px] font-bold rounded border px-2 py-0.5 ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MÀN PHIÊN BẢN
// ═══════════════════════════════════════════════════════════════════
const BL_VERSION_ROWS = [
  { list: "Danh sách đen", ver: "v2026.06", status: "active", total: 1240, ok: 1236, err: 4, date: "2026-06-10 09:12" },
  { list: "Danh sách đen", ver: "v2026.05", status: "stopped", total: 1198, ok: 1198, err: 0, date: "2026-05-12 08:40" },
  { list: "Danh sách PEPs", ver: "v2026.06", status: "active", total: 8930, ok: 8930, err: 0, date: "2026-06-01 14:30" },
  { list: "Danh sách SIMO", ver: "v2026.06", status: "done", total: 540, ok: 512, err: 28, date: "2026-05-28 11:05" },
  { list: "Danh sách trốn thuế", ver: "v2026.05", status: "active", total: 372, ok: 370, err: 2, date: "2026-05-17 10:20" },
  { list: "TKNH lừa đảo", ver: "v2026.06", status: "active", total: 1502, ok: 1499, err: 3, date: "2026-06-09 16:48" },
  { list: "Danh sách cảnh báo NHNN", ver: "v2026.06", status: "done", total: 86, ok: 86, err: 0, date: "2026-06-05 09:00" },
  { list: "Black word", ver: "v2026.04", status: "stopped", total: 214, ok: 214, err: 0, date: "2026-04-22 13:15" },
];

const VER_STATUS = {
  active: { label: "Đang hoạt động", cls: "bdg-success" },
  done: { label: "Hoàn thành - Chưa kích hoạt", cls: "bdg-info" },
  stopped: { label: "Ngừng hoạt động", cls: "bdg-secondary" },
};

function VersionListView() {
  const [draft, setDraft] = useStateBS({ list: "ALL", status: "ALL" });
  const [applied, setApplied] = useStateBS({ list: "ALL", status: "ALL" });

  const rows = useMemoBS(() => BL_VERSION_ROWS.filter((r) => {
    if (applied.list !== "ALL" && r.list !== applied.list) return false;
    if (applied.status !== "ALL" && r.status !== applied.status) return false;
    return true;
  }), [applied]);

  const search = () => setApplied(draft);
  const reset = () => { const d = { list: "ALL", status: "ALL" }; setDraft(d); setApplied(d); };

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-5 space-y-4 max-w-[1400px] mx-auto">

        {/* Bộ lọc */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-60">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Tên danh sách</label>
              <Select value={draft.list} onChange={(v) => setDraft((s) => ({ ...s, list: v }))} options={[
                { v: "ALL", label: "Tất cả danh sách" },
                ...BL_LIST_NAMES.map((n) => ({ v: n, label: n })),
              ]} />
            </div>
            <div className="w-60">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Trạng thái</label>
              <Select value={draft.status} onChange={(v) => setDraft((s) => ({ ...s, status: v }))} options={[
                { v: "ALL", label: "Tất cả trạng thái" },
                { v: "active", label: "Đang hoạt động" },
                { v: "done", label: "Hoàn thành - Chưa kích hoạt" },
                { v: "stopped", label: "Ngừng hoạt động" },
              ]} />
            </div>
            <button onClick={search} className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold text-white rounded-md cursor-pointer" style={{ background: "var(--bk-primary)" }}>
              <Icon name="search" className="w-3.5 h-3.5" /> Tìm kiếm
            </button>
            <button onClick={reset} className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer">
              <Icon name="refresh" className="w-3.5 h-3.5" /> Làm mới
            </button>
          </div>
        </div>

        {/* Bảng chi tiết */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-4 py-2.5 border-b border-slate-150 flex items-center gap-2">
            <span className="text-[15px] font-bold text-slate-900">Chi tiết phiên bản danh sách</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Tên danh sách</th>
                  <th className="py-2.5 px-3">Phiên bản</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3 text-right">Tổng dòng</th>
                  <th className="py-2.5 px-3 text-right">Thành công</th>
                  <th className="py-2.5 px-3 text-right">Lỗi</th>
                  <th className="py-2.5 px-3">Ngày nhập</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={7} className="py-10 text-center text-[12px] text-slate-400">Không có phiên bản phù hợp bộ lọc.</td></tr>
                ) : rows.map((r, i) => {
                  const st = VER_STATUS[r.status] || {};
                  return (
                    <tr key={i} className="border-t border-slate-150 text-[12px] text-slate-700 hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{r.list}</td>
                      <td className="py-2.5 px-3"><span className="font-mono text-[11px] text-slate-600">{r.ver}</span></td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center text-[11px] font-bold rounded border px-2 py-0.5 whitespace-nowrap ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{r.total.toLocaleString("vi-VN")}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700 font-semibold">{r.ok.toLocaleString("vi-VN")}</td>
                      <td className={`py-2.5 px-3 text-right font-mono tabular-nums font-semibold ${r.err > 0 ? "text-rose-600" : "text-slate-400"}`}>{r.err}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{r.date}</td>
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
// SLIDE-OVER — CHI TIẾT DÒNG LỖI
// ═══════════════════════════════════════════════════════════════════
function ErrorDetailPanel({ data, onClose }) {
  const { upload: u, rows } = data;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/30"></div>
      <div
        className="relative w-[700px] max-w-[92vw] h-full bg-white shadow-2xl flex flex-col bl-slideover-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-start gap-3 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chi tiết dòng lỗi</div>
            <div className="text-[15px] font-bold text-slate-900 truncate">{u.list}</div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              <Icon name="file" className="w-3 h-3 text-slate-400" />
              <span className="font-mono truncate">{u.name}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer shrink-0">
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>

        {/* Tóm tắt */}
        <div className="px-5 py-3 border-b border-slate-150 flex items-center gap-4 shrink-0 bg-slate-50/60">
          <div>
            <div className="text-[18px] font-bold text-slate-900 tabular-nums">{u.total.toLocaleString("vi-VN")}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Tổng dòng</div>
          </div>
          <div>
            <div className="text-[18px] font-bold text-emerald-600 tabular-nums">{u.ok.toLocaleString("vi-VN")}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Thành công</div>
          </div>
          <div>
            <div className="text-[18px] font-bold text-rose-600 tabular-nums">{u.err.toLocaleString("vi-VN")}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Dòng lỗi</div>
          </div>
        </div>

        {/* Bảng dòng lỗi */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="py-2 px-4 w-[64px]">Dòng</th>
                <th className="py-2 px-3 w-[92px]">Trường</th>
                <th className="py-2 px-3">Giá trị</th>
                <th className="py-2 px-4">Lý do lỗi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-rose-50/40 align-top">
                  <td className="py-2.5 px-4 font-mono tabular-nums text-[12px] text-slate-500">{r.line}</td>
                  <td className="py-2.5 px-3 text-[12px] font-semibold text-slate-700">{r.field}</td>
                  <td className="py-2.5 px-3 font-mono text-[12px]">
                    {r.value === "" || r.value == null
                      ? <span className="text-slate-400 italic">(trống)</span>
                      : <span className="text-slate-800 break-all">{r.value}</span>}
                  </td>
                  <td className="py-2.5 px-4 text-[12px] text-rose-700">{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ImportListView, VersionListView });