// ─────────────────────────────────────────────────────────────────
// date-range-picker.jsx — Lịch chọn khoảng thời gian (Material-style)
// Dùng: <DateRangePicker fromDate toDate onApply={(from,to)=>...} />
// fromDate / toDate: chuỗi "YYYY-MM-DD" hoặc "".
// ─────────────────────────────────────────────────────────────────
const { useState: useStateDR, useRef: useRefDR, useEffect: useEffectDR } = React;

const DR_WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const DR_MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

// "YYYY-MM-DD" → số ngày tuyệt đối để so sánh (an toàn, không lệch timezone)
function drYmd(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function drDisplay(s) {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

function DateRangePicker({ fromDate, toDate, onApply, placeholder = "Chọn khoảng thời gian" }) {
  const [open, setOpen] = useStateDR(false);
  const [start, setStart] = useStateDR(fromDate || "");
  const [end, setEnd] = useStateDR(toDate || "");
  const [hover, setHover] = useStateDR("");
  const wrapRef = useRefDR(null);

  // Tháng đang hiển thị (mặc định: tháng của fromDate, hoặc tháng hiện tại)
  const initRef = (fromDate || toDate || "").slice(0, 7);
  const [view, setView] = useStateDR(() => {
    if (initRef) { const [y, m] = initRef.split("-"); return { y: +y, m: +m - 1 }; }
    const now = new Date(); return { y: now.getFullYear(), m: now.getMonth() };
  });

  // Mở popup → đồng bộ draft với giá trị đang áp dụng
  const openPanel = () => {
    setStart(fromDate || "");
    setEnd(toDate || "");
    setHover("");
    const ref = (fromDate || toDate || "").slice(0, 7);
    if (ref) { const [y, m] = ref.split("-"); setView({ y: +y, m: +m - 1 }); }
    setOpen(true);
  };

  // Đóng khi click ra ngoài
  useEffectDR(() => {
    if (!open) return;
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const pickDay = (ymd) => {
    if (!start || (start && end)) {
      // Bắt đầu chọn mới
      setStart(ymd); setEnd(""); setHover("");
    } else {
      // Đã có start, chọn end
      if (ymd < start) { setStart(ymd); setEnd(start); }
      else { setEnd(ymd); }
      setHover("");
    }
  };

  // Khoảng hiệu lực để tô (gồm cả preview khi đang hover chọn end)
  const effEnd = end || (start && hover && hover >= start ? hover : "");
  const inRange = (ymd) => start && effEnd && ymd >= start && ymd <= effEnd;
  const isStart = (ymd) => start && ymd === start;
  const isEnd = (ymd) => effEnd && ymd === effEnd;

  // Lưới ngày của tháng đang xem
  const firstDow = new Date(view.y, view.m, 1).getDay();
  const daysIn = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(d);

  const prevMonth = () => setView((v) => v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 });
  const nextMonth = () => setView((v) => v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 });

  const apply = () => { onApply(start, end || start); setOpen(false); };
  const clearSel = () => { setStart(""); setEnd(""); setHover(""); };

  const hasValue = fromDate || toDate;
  const label = hasValue
    ? `${drDisplay(fromDate)}${toDate && toDate !== fromDate ? " – " + drDisplay(toDate) : ""}`
    : placeholder;

  const headerText = start
    ? `${drDisplay(start)}${effEnd && effEnd !== start ? " – " + drDisplay(effEnd) : ""}`
    : "Chọn ngày bắt đầu";

  return (
    <div className="relative" ref={wrapRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={`w-full flex items-center gap-2 px-2.5 py-1.5 bg-white text-[12px] rounded-md border text-left cursor-pointer transition-colors ${open ? "border-[var(--bk-primary)]" : "border-slate-200 hover:border-slate-300"} ${hasValue ? "text-slate-900" : "text-slate-400"}`}
      >
        <Icon name="history" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="flex-1 truncate">{label}</span>
        {hasValue && (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onApply("", ""); }}
            className="text-slate-400 hover:text-slate-700 shrink-0"
            title="Xóa khoảng thời gian"
          >
            <Icon name="x" className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {/* Popup lịch */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-[300px] bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-3 pb-3 border-b border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chọn khoảng thời gian</div>
            <div className="text-[17px] font-bold text-slate-900 mt-0.5">{headerText}</div>
          </div>

          {/* Điều hướng tháng */}
          <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer">
              <Icon name="chevronLeft" className="w-4 h-4" />
            </button>
            <span className="text-[13px] font-bold text-slate-800">{DR_MONTHS[view.m]} {view.y}</span>
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer">
              <Icon name="chevronRight" className="w-4 h-4" />
            </button>
          </div>

          {/* Thứ */}
          <div className="grid grid-cols-7 px-2 pb-1">
            {DR_WEEKDAYS.map((w) => (
              <div key={w} className="h-7 flex items-center justify-center text-[10px] font-bold text-slate-400">{w}</div>
            ))}
          </div>

          {/* Ngày */}
          <div className="grid grid-cols-7 px-2 pb-2">
            {cells.map((d, i) => {
              if (d === null) return <div key={`b${i}`} className="h-9"></div>;
              const ymd = drYmd(view.y, view.m, d);
              const s = isStart(ymd), e = isEnd(ymd), within = inRange(ymd);
              const endpoint = s || e;
              // Dải nền nối liền: start mở từ giữa sang phải, end đóng tới giữa
              let band = null;
              if (within) {
                let style = { background: "var(--bk-primary-tint)" };
                if (s && e) style = null; // chỉ 1 ngày → không cần dải
                else if (s) style.left = "50%";
                else if (e) style.right = "50%";
                if (style) band = <div className="absolute inset-y-0.5 left-0 right-0" style={style}></div>;
              }
              return (
                <div
                  key={ymd}
                  className="relative h-9 flex items-center justify-center"
                  onMouseEnter={() => start && !end && setHover(ymd)}
                >
                  {band}
                  <button
                    type="button"
                    onClick={() => pickDay(ymd)}
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-[12.5px] cursor-pointer transition-colors ${endpoint ? "font-bold text-white" : within ? "text-slate-800 font-semibold" : "text-slate-700 hover:bg-slate-100"}`}
                    style={endpoint ? { background: "var(--bk-primary)" } : {}}
                  >
                    {d}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-1 px-3 py-2 border-t border-slate-100">
            <button type="button" onClick={clearSel} className="text-[12px] font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded cursor-pointer">
              Xóa
            </button>
            <div className="ml-auto flex items-center gap-1">
              <button type="button" onClick={() => setOpen(false)} className="text-[12px] font-bold text-slate-600 hover:bg-slate-100 px-3 py-1 rounded cursor-pointer">
                Hủy
              </button>
              <button
                type="button"
                onClick={apply}
                disabled={!start}
                className="text-[12px] font-bold px-3 py-1 rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: "var(--bk-primary)" }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { DateRangePicker });
