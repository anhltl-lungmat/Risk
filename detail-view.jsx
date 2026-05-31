// Merchant detail view — split-pane layout with KYC / Onboard / Reevaluation tabs

const { useState: useStateD, useEffect: useEffectD, useMemo: useMemoD } = React;

function DetailHeader({ record, onClose, onRecheck, rechecking, primary }) {
  return (
    <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onClose} className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-slate-600 shrink-0">
          <Icon name="arrowLeft" className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <h1 className="text-[15px] font-bold text-slate-900 truncate" title={record.name}>{record.name}</h1>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
            <span className="font-mono font-bold" style={{ color: "var(--bk-primary)" }}>{record.id}</span>
            <span>·</span>
            <span>{mapEntityFull(record.entityType)}</span>
            <span>·</span>
            <span>Onboard {record.timeOnboard}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer">
          <Icon name="download" className="w-3.5 h-3.5" />
          Xuất hồ sơ PDF
        </button>
        <button
          onClick={() => onRecheck(record.id)}
          disabled={rechecking}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-bold text-white rounded-md cursor-pointer disabled:opacity-60"
          style={{ background: "var(--bk-primary)" }}>
          
          <Icon name="refresh" className={`w-3.5 h-3.5 ${rechecking ? "animate-spin" : ""}`} />
          {rechecking ? "Đang chạy lại…" : "Chạy lại thẩm định AML"}
        </button>
      </div>
    </div>);

}

function SummaryStrip({ record }) {
  const svcs = record.services || [{ name: record.service }];
  const cards = [
  {
    label: "Trạng thái CCDV",
    content: <CCDVBadge status={record.ccdvStatus} />,
    sub: `Áp dụng cho ${svcs.length} dịch vụ đăng ký`
  },
  {
    label: "Trạng thái hit Blacklist",
    content: <BlacklistBadge status={record.blacklistStatus} hits={record.blacklistHits.length} />,
    sub: record.blacklistHits.length > 0 ? record.blacklistHits.join(", ") : "Không phát hiện trùng khớp"
  },
  {
    label: "Mức rủi ro",
    content: (
      <div className="flex items-baseline gap-2">
        <RiskLevelChip level={record.rrLevel} />
        <span className="font-mono text-[13px] font-bold tabular-nums text-slate-900">· {record.rrScore}</span>
      </div>
    ),
    sub: "Điểm AML / 105"
  }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 bg-white border border-slate-200 rounded-lg overflow-hidden">
      {cards.map((c, i) =>
      <div key={i} className={`p-4 ${i > 0 ? "border-l border-slate-150" : ""} flex flex-col gap-2 min-w-0`}>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{c.label}</span>
          <div>{c.content}</div>
          <span className="text-[11px] text-slate-500 truncate" title={typeof c.sub === "string" ? c.sub : ""}>{c.sub}</span>
        </div>
      )}
    </div>);

}

function DetailTabs({ active, setActive }) {
  const tabs = [
  { k: "kyc", label: "Thông tin KYC", icon: "user" },
  { k: "onboard", label: "Lịch sử Onboard", icon: "history" },
  { k: "reeval", label: "Trong quá trình sử dụng dịch vụ", icon: "activity" }];

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex">
        {tabs.map((t, i) =>
        <button
          key={t.k}
          onClick={() => setActive(t.k)}
          className={`px-4 py-2.5 text-[12px] font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${active === t.k ? "text-[var(--bk-primary)] border-[var(--bk-primary)]" : "text-slate-500 border-transparent hover:text-slate-900"}`}>
          
            <span className="text-[10px] font-mono opacity-60">0{i + 1}</span>
            <Icon name={t.icon} className="w-3.5 h-3.5" />
            {t.label}
          </button>
        )}
      </div>
    </div>);

}

function KvRow({ label, value, copyable, mono }) {
  const [copied, setCopied] = useStateD(false);
  const v = value && value !== "undefined" ? value : "—";
  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(v);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="flex items-start gap-3 py-2 px-3 border-b border-slate-100 hover:bg-slate-50/50 text-[12px] group">
      <div className="w-44 shrink-0 text-slate-500 font-medium leading-snug">{label}</div>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <span className={`${mono ? "font-mono text-[12px]" : ""} text-slate-900 font-medium break-all leading-snug`}>{v}</span>
        {copyable && v !== "—" &&
        <button onClick={copy} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-700 cursor-pointer shrink-0">
            {copied ? <Icon name="check" className="w-3.5 h-3.5 text-emerald-500" /> : <Icon name="copy" className="w-3.5 h-3.5" />}
          </button>
        }
      </div>
    </div>);

}

function KvCard({ title, icon, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
        <Icon name={icon} className="w-4 h-4 text-slate-500" />
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">{title}</h3>
      </div>
      <div>{children}</div>
    </div>);

}

function KycTab({ record }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <KvCard title="Thông tin Merchant" icon="building">
          <KvRow label="Mã MRC ID" value={record.id} copyable mono />
          <KvRow label="Tên Merchant" value={record.name} copyable />
          <KvRow label="Tên viết tắt" value={record.businessInfo.shortName} />
          <div className="flex items-start gap-3 py-2 px-3 border-b border-slate-100 text-[12px]">
            <div className="w-44 shrink-0 text-slate-500 font-medium leading-snug">Dịch vụ đăng ký</div>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              {(record.services || [{ name: record.service }]).map((s, i) => (
                <span key={i} className="text-slate-900 font-medium">• {s.name}</span>
              ))}
            </div>
          </div>
          <KvRow label="Ngành nghề" value={record.businessType} />
          <KvRow label="Hình thức pháp nhân" value={mapEntityFull(record.entityType)} />
          <KvRow label="Phân loại Merchant" value={record.mrcClass || "Direct"} />
          <KvRow label="Tình trạng kết nối" value={record.ccdvStatus === "DUOC_CCDV" ? "Đang phục vụ" : "Tạm ngưng phục vụ"} />
        </KvCard>

        <KvCard title="Người đại diện pháp luật" icon="user">
          <KvRow label="Họ và tên" value={record.personalInfo.fullName} copyable />
          <KvRow label="Bí danh" value={record.personalInfo.alias} />
          <KvRow label="Ngày sinh" value={record.personalInfo.dob} mono />
          <KvRow label="Quốc tịch" value={record.personalInfo.nationality} />
          <KvRow label="Số CCCD" value={record.personalInfo.citizenIdNo} copyable mono />
          <KvRow label="Số hộ chiếu" value={record.personalInfo.passportNo} mono />
          <KvRow label="Chức danh" value={record.personalInfo.position} />
          <KvRow label="Số điện thoại" value={record.personalInfo.phoneNumber} copyable mono />
          <KvRow label="Địa chỉ thường trú" value={record.personalInfo.permanentAddress} copyable />
          <KvRow label="Địa chỉ hiện tại" value={record.personalInfo.currentAddress} />
        </KvCard>

        <KvCard title="Pháp nhân doanh nghiệp" icon="file">
          <KvRow label="Tên tiếng Việt" value={record.businessInfo.businessNameVN} copyable />
          <KvRow label="Tên tiếng Anh" value={record.businessInfo.businessNameEN} />
          <KvRow label="Mã số doanh nghiệp" value={record.businessInfo.taxCode} copyable mono />
          <KvRow label="Giấy phép ĐKKD" value={record.businessInfo.businessLicenceNo} copyable mono />
          <KvRow label="Trụ sở chính" value={record.businessInfo.headquarters} copyable />
          <KvRow label="Người đại diện" value={record.businessInfo.representative} />
        </KvCard>

        <KvCard title="Tài khoản ngân hàng thụ hưởng" icon="card">
          <KvRow label="Số tài khoản" value={record.bankInfo.accountNo} copyable mono />
          <KvRow label="Ngân hàng" value={record.bankInfo.bankName} />
          <KvRow label="Chủ tài khoản" value={record.bankInfo.accountHolder} copyable mono />
        </KvCard>
      </div>
    </div>);

}

// ──────────────────────────────────────────────────────────────────────────
// Onboard / Reevaluation — uses a unified RunCard
// ──────────────────────────────────────────────────────────────────────────
function RunCard({ run, defaultOpen, isPrimary, primary, attemptNumber, context = "onboard" }) {
  const [open, setOpen] = useStateD(!!defaultOpen);
  const [sub, setSub] = useStateD("matched");
  const hits = run.blacklistHits?.length || 0;
  return (
    <div className={`bg-white border rounded-lg overflow-hidden ${run.blacklistStatus === "HIT" ? "border-rose-200" : "border-slate-200"}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 cursor-pointer text-left">
        
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${run.blacklistStatus === "HIT" ? "bg-rose-500" : "bg-emerald-500"}`}></div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[13px] font-bold text-slate-900">Lần thứ {attemptNumber || 1}</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-[12px] text-slate-700">{run.timestamp}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mục đích:</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded" style={isPrimary ? { background: "var(--bk-primary-soft)", color: "var(--bk-primary)" } : { background: "rgb(254 243 199)", color: "rgb(146 64 14)" }}>
                {run.reason || (isPrimary ? "Onboard lần đầu" : "Rà soát định kỳ")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CCDVBadge status={run.ccdvStatus} size="sm" />
          <BlacklistBadge status={run.blacklistStatus} hits={hits} size="sm" />
          <RiskLevelChip level={run.rrLevel} size="sm" />
          <Icon name={open ? "chevronUp" : "chevronDown"} className="w-4 h-4 text-slate-400" />
        </div>
      </button>

      {open &&
      <div className="border-t border-slate-200 bg-slate-50/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 py-3 border-b border-slate-200 text-[11px] bg-white">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Thời điểm</div>
              <div className="font-mono font-semibold text-slate-900 mt-0.5">{run.timestamp}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Điểm AML</div>
              <div className="font-mono font-semibold text-slate-900 mt-0.5">{run.rrScore}/105 · {mapLevel(run.rrLevel)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hành động kế tiếp</div>
              <div className="font-semibold mt-0.5" style={{ color: "var(--bk-primary)" }}>{mapAction(run.systemAction)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Người xử lý</div>
              <div className="font-semibold text-slate-900 mt-0.5 truncate" title={run.actor}>{run.actor}</div>
            </div>
          </div>

          <div className="flex border-b border-slate-200 bg-white text-[11px] select-none">
            {[
          { k: "matched", label: `Rà soát theo Merchant (${run.blacklistResults?.length || 0})` },
          ...(context === "reeval" ? [{ k: "tx", label: "Rà soát theo Giao dịch" }] : []),
          { k: "scoring", label: "Chấm điểm rủi ro" }].
          map((t) =>
          <button
            key={t.k}
            onClick={() => setSub(t.k)}
            className={`px-3 py-2 font-bold border-b-2 cursor-pointer transition-colors ${sub === t.k ? "text-[var(--bk-primary)] border-[var(--bk-primary)] bg-[var(--bk-primary-tint)]" : "text-slate-500 border-transparent hover:text-slate-900"}`}>
            
                {t.label}
              </button>
          )}
          </div>

          <div className="p-4">
            {sub === "matched" && <MatchedTable results={run.blacklistResults || []} />}
            {sub === "tx" && <TxBlacklistPlaceholder />}
            {sub === "scoring" && <ScoringAnalysis run={run} />}
          </div>
        </div>
      }
    </div>);

}

function TxBlacklistPlaceholder() {
  return (
    <div className="border border-dashed border-slate-300 bg-slate-50/50 rounded-lg p-8 flex flex-col items-center justify-center gap-3 text-center">
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--bk-primary-soft)", color: "var(--bk-primary)" }}>
        <Icon name="shieldCheck" className="w-6 h-6" />
      </div>
      <div className="text-[13px] font-bold text-slate-700">Check blacklist theo thông tin giao dịch</div>
      <div className="text-[11px] text-slate-500 max-w-md leading-relaxed">
        Tính năng đang được phát triển. Khi triển khai, hệ thống sẽ đối soát các đối tác trong dòng giao dịch (người nhận, người gửi, tài khoản thụ hưởng) với các bộ cơ sở dữ liệu blacklist trong quá trình merchant sử dụng dịch vụ.
      </div>
      <span className="mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-50 text-amber-700 border border-amber-200">Sắp ra mắt</span>
    </div>);

}

function MatchedTable({ results }) {
  if (!results.length) return <div className="text-[12px] text-slate-400 italic py-4 text-center">Không có dữ liệu rà soát.</div>;
  return (
    <div className="border border-slate-200 rounded overflow-hidden bg-white">
      <table className="w-full text-left text-[11px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            <th className="py-2 px-3">Bộ cơ sở dữ liệu</th>
            <th className="py-2 px-3">Trùng khớp</th>
            <th className="py-2 px-3">Trường thông tin</th>
            <th className="py-2 px-3">Hành động đề xuất</th>
            <th className="py-2 px-3">Tên version</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {results.map((r, i) =>
          <tr key={i} className={r.match !== "KHONG_TRUNG_KHOP" ? "bg-rose-50/30" : ""}>
              <td className="py-2 px-3 font-semibold text-slate-900 align-top">{r.name}</td>
              <td className="py-2 px-3 align-top"><MatchLevelPill match={r.match} /></td>
              <td className="py-2 px-3 align-top">
                {r.fields.length ?
              <div className="flex flex-wrap gap-1">
                    {r.fields.map((f, fi) => <span key={fi} className="px-1.5 py-0.5 text-[9px] font-mono bg-slate-100 text-slate-600 rounded">{f}</span>)}
                  </div> :
              <span className="text-slate-300">—</span>}
              </td>
              <td className="py-2 px-3 font-semibold align-top" style={{ color: "var(--bk-primary)" }}>{r.action === "TIEP_TUC_CCDV" ? <span className="text-slate-300 font-normal">—</span> : mapAction(r.action)}</td>
              <td className="py-2 px-3 font-mono text-[10px] text-slate-500 align-top">{r.version}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}

function RulesList({ rules }) {
  if (!rules.length) return <div className="text-[12px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-3 flex items-center gap-2"><Icon name="check" className="w-3.5 h-3.5" />Không quy tắc nào bị kích hoạt. Hồ sơ sạch.</div>;
  return (
    <div className="space-y-2">
      {rules.map((r, i) => {
        const [code, ...rest] = r.split(":");
        return (
          <div key={i} className="bg-white border border-slate-200 rounded p-3 flex items-start gap-3">
            <span className="font-mono text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded shrink-0">{code.trim()}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-slate-900 leading-snug">{rest.join(":").trim()}</div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Quy tắc kích hoạt tự động khi dữ liệu KYC trùng khớp tham chiếu tệp danh sách rủi ro của bộ dữ liệu nội bộ và quốc gia.
              </div>
            </div>
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Vi phạm</span>
          </div>);

      })}
    </div>);

}

function ScoringAnalysis({ run }) {
  const breakdown = [
  { label: "Trọng số KYC cơ bản", value: 15, color: "bg-slate-400" },
  { label: "Lịch sử giao dịch", value: run.rrLevel === "CAO" ? 12 : 5, color: "bg-sky-400" },
  { label: "Phạt trùng Blacklist", value: run.blacklistStatus === "HIT" ? Math.min(60, run.rrScore - 20) : 0, color: "bg-rose-500" },
  { label: "Phạt quy tắc Rule", value: run.ruleHits?.length ? run.ruleHits.length * 5 : 0, color: "bg-amber-500" }];

  const total = breakdown.reduce((a, b) => a + b.value, 0);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white border border-slate-200 rounded p-4">
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-3">Phân rã điểm</div>
        <div className="space-y-2.5">
          {breakdown.map((b, i) =>
          <div key={i}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-700 font-medium">{b.label}</span>
                <span className="font-mono font-bold text-slate-900">{b.value > 0 ? "+" : ""}{b.value}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${b.color}`} style={{ width: `${Math.min(100, b.value / 60 * 100)}%` }}></div>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-slate-200 mt-3 pt-3 flex items-baseline justify-between">
          <span className="text-[11px] uppercase font-bold text-slate-700 tracking-wider">Tổng AML</span>
          <span className="font-mono font-bold text-lg text-slate-900">{run.rrScore}<span className="text-slate-400 text-[12px]"> / 105</span></span>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded p-4">
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-3">Nhận định Compliance</div>
        <ul className="space-y-2 text-[12px] text-slate-700 leading-relaxed">
          <li className="flex gap-2"><span className="text-slate-400 shrink-0">▸</span><span>Phân loại rủi ro <b>{mapLevel(run.rrLevel)}</b> dựa trên kết quả đối soát {(run.blacklistResults || []).length} bộ dữ liệu blacklist nội bộ &amp; quốc gia.</span></li>
          <li className="flex gap-2"><span className="text-slate-400 shrink-0">▸</span><span>Tần suất giám sát đề xuất: <b>{run.rrLevel === "CAO" ? "1 tháng/lần" : run.rrLevel === "TRUNG_BINH" ? "3 tháng/lần" : "6 tháng/lần"}</b>.</span></li>
          <li className="flex gap-2"><span className="text-slate-400 shrink-0">▸</span><span>Hành động hệ thống đã thực thi: <b style={{ color: "var(--bk-primary)" }}>{mapAction(run.systemAction)}</b>.</span></li>
          {run.ruleHits?.length > 0 &&
          <li className="flex gap-2"><span className="text-rose-500 shrink-0">▸</span><span>Cần chuyển ban thẩm định review <b>{run.ruleHits.length}</b> quy tắc vi phạm trước khi mở lại kết nối.</span></li>
          }
        </ul>
      </div>
    </div>);

}

function OnboardTab({ record }) {
  const initialRun = {
    id: `RUN-ONBOARD-${record.id}`,
    timestamp: record.timeOnboard,
    actor: "Hệ thống tự động & Ban thẩm định BaoKim",
    reason: "Onboard khởi tạo",
    requestId: `REQ-ONB-${record.id}`,
    rrScore: record.rrScore,
    rrLevel: record.rrLevel,
    blacklistStatus: record.blacklistStatus,
    ccdvStatus: record.ccdvStatus,
    blacklistHits: record.blacklistHits,
    ruleHits: record.ruleHits,
    blacklistResults: record.blacklistResults,
    services: record.services || [{ name: record.service, ccdvStatus: record.ccdvStatus }],
    systemAction: record.ccdvStatus === "DUOC_CCDV" ? "TIEP_TUC_CCDV" : "DUNG_CCDV"
  };
  return (
    <div className="space-y-3">
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 flex items-start gap-2">
        <Icon name="info" className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <p className="text-[12px] text-sky-900 leading-relaxed">
          Lịch sử rà soát đối soát danh sách đen <b>khi đối tác khởi tạo hồ sơ onboard</b> trên hệ thống BaoKim. Kết quả CCDV và Blacklist được tách riêng.
        </p>
      </div>
      <RunCard run={initialRun} defaultOpen isPrimary attemptNumber={1} />
    </div>);

}

function ReevalTab({ record }) {
  const runs = (record.screeningHistory || []).map((h, i) => ({
    id: h.runId,
    timestamp: h.timestamp,
    actor: h.actor,
    reason: h.reason,
    requestId: h.runId,
    rrScore: h.rrScore,
    rrLevel: h.rrLevel,
    blacklistStatus: h.blacklistStatus,
    ccdvStatus: h.ccdvStatus,
    blacklistHits: h.hits || [],
    ruleHits: [],
    blacklistResults: h.blacklistResultsSnapshot || record.blacklistResults,
    services: record.services || [{ name: record.service, ccdvStatus: record.ccdvStatus }],
    systemAction: h.ccdvStatus === "DUOC_CCDV" ? "TIEP_TUC_CCDV" : "DUNG_CCDV",
    pointDiff: h.rrScore - record.rrScore
  }));

  return (
    <div className="space-y-3">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
        <Icon name="history" className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-[12px] text-amber-900 leading-relaxed">
          Nhật ký rà soát định kỳ, cập nhật blacklist hoặc đánh giá thủ công <b>trong quá trình đối tác sử dụng dịch vụ</b>.
        </p>
      </div>
      {runs.length === 0 ?
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-[12px] text-slate-400 italic">
          Chưa có phiên đánh giá lại nào sau Onboard khởi tạo.
        </div> :
      runs.map((r, i) => <RunCard key={r.id} run={r} defaultOpen={i === 0} attemptNumber={runs.length - i + 1} context="reeval" />)}
    </div>);

}

// ──────────────────────────────────────────────────────────────────────────
// DETAIL VIEW SHELL
// ──────────────────────────────────────────────────────────────────────────
function MerchantDetail({ record, onClose, onRecheck, rechecking, primary }) {
  const [tab, setTab] = useStateD("kyc");
  return (
    <div className="flex-1 bg-slate-50 flex flex-col">
      <DetailHeader record={record} onClose={onClose} onRecheck={onRecheck} rechecking={rechecking} primary={primary} />
      <div className="bg-white border-b border-slate-200 px-5 py-4">
        <SummaryStrip record={record} />
      </div>
      <DetailTabs active={tab} setActive={setTab} />
      <main className="flex-1 overflow-y-auto p-5">
        {tab === "kyc" && <KycTab record={record} />}
        {tab === "onboard" && <OnboardTab record={record} />}
        {tab === "reeval" && <ReevalTab record={record} />}
      </main>
    </div>);

}

Object.assign(window, { MerchantDetail });