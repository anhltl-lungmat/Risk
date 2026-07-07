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
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button className="hidden flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer">
          <Icon name="download" className="w-3.5 h-3.5" />
          Xuất hồ sơ PDF
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
    label: "Mức rủi ro",
    content: riskVisible(record.reviewState)
      ? (
        <div className="flex items-center gap-1.5">
          <RiskLevelChip level={record.rrLevel} score={record.rrScore} />
        </div>
      )
      : <span className="text-[13px] font-semibold text-slate-400">Chưa thẩm định</span>,
    sub: riskVisible(record.reviewState) ? "Điểm AML / 105" : "Chấm điểm sau khi thẩm định"
  },
  {
    label: "Trạng thái thẩm định",
    content: <ReviewStateBadge state={record.reviewState} />,
    sub: record.reviewState === "KHONG" ? "Từ chối CCDV — không thẩm định"
      : record.reviewState === "CHO" ? "Chưa chấm điểm rủi ro"
      : record.reviewState === "CHO_LAI" ? "Đến kỳ thẩm định lại"
      : "Đã chấm điểm rủi ro"
  }];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 bg-white border border-slate-200 rounded-lg overflow-hidden">
      {cards.map((c, i) =>
      <div key={i} className={`p-4 ${i > 0 ? "border-l border-slate-150" : ""} flex flex-col gap-2 min-w-0`}>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{c.label}</span>
          <div>{c.content}</div>
        </div>
      )}
    </div>);

}

function DetailTabs({ active, setActive }) {
  const tabs = [
  { k: "kyc", label: "Thông tin KYC", icon: "user" },
  { k: "ksnb", label: "Hồ sơ thẩm định", icon: "fingerprint" },
  { k: "onboard", label: "Quá trình Onboard", icon: "history" },
  { k: "reeval", label: "Quá trình sử dụng dịch vụ", icon: "activity" }];

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex">
        {tabs.map((t, i) =>
        <button
          key={t.k}
          onClick={() => setActive(t.k)}
          className={`px-4 py-2.5 text-[12px] font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${active === t.k ? "text-[var(--bk-primary)] border-[var(--bk-primary)]" : "text-slate-500 border-transparent hover:text-slate-900"}`}>
          
            <span className="text-[10px] font-mono opacity-60">0{i + 1}</span>
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

function KvIconRow({ label, value, warn }) {
  return (
    <div className="flex items-start gap-3 py-2 px-3 border-b border-slate-100 text-[12px]">
      <div className="w-44 shrink-0 text-slate-500 font-medium leading-snug">{label}</div>
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <span className="text-slate-900 font-medium">{value}</span>
        {warn && <span title="Nhóm MCC cần lưu ý" className="text-emerald-500 shrink-0"><Icon name="info" className="w-3.5 h-3.5" /></span>}
      </div>
    </div>);

}

// ── Giấy tờ KYC do merchant cung cấp + khung xem nội dung ──
function KycDocViewer({ docs }) {
  const [sel, setSel] = useStateD(0);
  const doc = docs[sel];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <KvCard title="Giấy tờ KYC" icon="file">
        {docs.length === 0 ?
        <div className="px-4 py-10 text-center text-[12px] text-slate-400 italic">Chưa có giấy tờ</div> :
        <div className="p-2 space-y-1">
            {docs.map((d, i) =>
          <button key={i} onClick={() => setSel(i)}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left cursor-pointer ${i === sel ? "" : "hover:bg-slate-50"}`}
            style={i === sel ? { background: "var(--bk-primary-tint)" } : {}}>
                <span className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
              style={{ background: i === sel ? "var(--bk-primary-soft)" : "#f1f5f9", color: i === sel ? "var(--bk-primary)" : "#64748b" }}>
                  <Icon name="file" className="w-4 h-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-semibold text-slate-900 truncate">{d.name}</span>
                  <span className="block text-[10px] text-slate-400 font-mono truncate">{d.file} · {d.at}</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 rounded px-1.5 py-0.5 shrink-0">{d.type}</span>
              </button>
          )}
          </div>}
      </KvCard>
      <KvCard title="Nội dung giấy tờ" icon="eye">
        {!doc ?
        <div className="px-4 py-10 text-center text-[12px] text-slate-400 italic">Chọn giấy tờ để xem nội dung</div> :
        <div className="p-4">
            <div className="rounded-md bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 px-4" style={{ aspectRatio: "16 / 9" }}>
              <Icon name="file" className="w-10 h-10" />
              <span className="text-[12px] font-semibold text-slate-500 font-mono truncate max-w-full">{doc.file}</span>
              <span className="text-[11px]">Bản xem trước tài liệu</span>
            </div>
            <div className="mt-3 space-y-2 text-[12px]">
              {[["Tên giấy tờ", doc.name], ["Phân loại", doc.type], ["Người cung cấp", doc.by], ["Ngày tải lên", doc.at]].map((kv, i) =>
            <div key={i} className="flex justify-between gap-4 leading-snug">
                  <span className="text-slate-500 shrink-0">{kv[0]}</span>
                  <span className={`font-semibold text-slate-900 text-right ${i === 3 ? "font-mono" : ""}`}>{kv[1]}</span>
                </div>
            )}
            </div>
            <button className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-semibold text-white rounded-md cursor-pointer" style={{ background: "var(--bk-primary)" }}>
              <Icon name="download" className="w-3.5 h-3.5" /> Tải xuống
            </button>
          </div>}
      </KvCard>
    </div>);

}

function SalesChannelDocs({ docs }) {
  return (
    <KvCard title="Giấy tờ kênh bán hàng" icon="layers">
      {docs.length === 0 ?
      <div className="px-4 py-8 text-center text-[12px] text-slate-400 italic">Chưa có giấy tờ</div> :
      <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-1">
          {docs.map((d, i) =>
        <div key={i} className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-slate-50">
              <span className="w-8 h-8 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><Icon name="file" className="w-4 h-4" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-semibold text-slate-900 truncate">{d.name}</span>
                <span className="block text-[10px] text-slate-400 font-mono truncate">{d.file} · {d.at}</span>
              </span>
              <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded cursor-pointer shrink-0"><Icon name="download" className="w-3.5 h-3.5" /></button>
            </div>
        )}
        </div>}
    </KvCard>);

}

// ── Tài khoản ngân hàng hưởng thụ: STK chính + STK khác + đối soát DS TKNH lừa đảo ──
function AccountBlock({ acc }) {
  const fraud = acc.screen === "FRAUD_HIT";
  return (
    <div className={`rounded-md border px-3 py-2.5 ${fraud ? "border-rose-200 bg-rose-50/50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5"
          style={acc.role === "PRIMARY" ? { background: "var(--bk-primary-soft)", color: "var(--bk-primary)" } : { background: "#f1f5f9", color: "#64748b" }}>
          {acc.role === "PRIMARY" ? "Tài khoản chính" : "Tài khoản khác"}
        </span>
        {fraud && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>TKNH lừa đảo
          </span>
        )}
      </div>
      <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
        <span className="font-mono text-[13px] font-bold text-slate-900">{acc.accountNo}</span>
        <span className="text-[11px] text-slate-500">· {acc.bankName}</span>
      </div>
      <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{acc.accountHolder}</div>
      {fraud ? (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-rose-700 bg-white border border-rose-200 rounded px-2 py-1">
          <Icon name="alert" className="w-3.5 h-3.5 shrink-0" />
          CHẶN QUYẾT TOÁN
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
          <span>Quyết toán: <b className="text-emerald-600">Cho phép</b></span>
          <span>·</span>
          <span>{acc.version}</span>
        </div>
      )}
    </div>
  );
}

function BankAccountsCard({ accounts }) {
  const blocked = accounts.filter((a) => a.settlement === "BLOCKED").length;
  return (
    <KvCard title={`Tài khoản ngân hàng (${accounts.length})`} icon="card">
      <div className="px-3 pt-3 pb-1 flex items-center gap-1.5 text-[10px] text-slate-400">
        <Icon name="shield" className="w-3 h-3 shrink-0" />
        <span>Mỗi tài khoản được đối soát Danh sách TKNH lừa đảo khi onboard</span>
      </div>
      <div className="p-3 pt-1.5 space-y-2.5">
        {accounts.length === 0
          ? <div className="py-6 text-center text-[12px] text-slate-400 italic">Chưa có tài khoản</div>
          : accounts.map((a, i) => <AccountBlock key={i} acc={a} />)}
      </div>
    </KvCard>
  );
}

function KycTab({ record }) {
  const e = record.erp || {};
  const isOrg = record.entityType !== "CA_NHAN";
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <KvCard title="Thông tin Merchant" icon="building">
          <KvRow label="Mã MRC ID" value={record.id} copyable mono />
          <KvRow label="Tên Merchant" value={record.name} copyable />
          <KvRow label="Tên viết tắt" value={record.businessInfo.shortName} />
          <KvRow label="Sale phụ trách" value={e.salesRep} />
          <KvRow label="Hệ thống" value={mapSource(record.source)} />
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
          <KvRow label="Mô hình" value={record.mrcClass ? `${record.mrcClass} merchant` : "Direct"} />
          <KvRow label="Nhóm GC" value={e.gc} />
          <KvIconRow label="Nhóm MCC" value={e.mcc} warn={e.mccWarn} />
          <KvRow label="Sub-MCC" value={e.subMcc} />
          <KvRow label="Phân khúc" value={e.segment} />
        </KvCard>

        <KvCard title="Người đại diện pháp luật" icon="user">
          <KvRow label="Người đại diện" value={record.personalInfo.fullName} copyable />
          <KvRow label="Chức vụ" value={e.repPosition} />
          <KvRow label="Nghề nghiệp" value={e.repJob} />
          <KvRow label="Ngày sinh" value={record.personalInfo.dob} mono />
          <KvRow label="Quốc tịch" value={record.personalInfo.nationality} />
          <KvRow label="Loại giấy tờ" value={e.docType} />
          <KvRow label="Số giấy tờ tuỳ thân" value={record.personalInfo.citizenIdNo} copyable mono />
          <KvRow label="Ngày cấp" value={e.docIssueDate} mono />
          <KvRow label="Nơi cấp" value={e.docIssuePlace} />
          <KvRow label="Ngày hết hạn" value={e.docExpiry} mono />
          <KvRow label="Số điện thoại" value={record.personalInfo.phoneNumber} copyable mono />
          <KvRow label="Địa chỉ thường trú" value={record.personalInfo.permanentAddress} copyable />
          <KvRow label="Nơi ở hiện tại" value={record.personalInfo.currentAddress} />
        </KvCard>

        <KvCard title="Pháp nhân doanh nghiệp" icon="file">
          <KvRow label="Tên tiếng Việt" value={record.businessInfo.businessNameVN} copyable />
          <KvRow label="Tên tiếng Anh" value={record.businessInfo.businessNameEN} />
          <KvRow label="Mã số thuế" value={record.businessInfo.taxCode} copyable mono />
          <KvRow label="Ngày cấp mã số thuế" value={e.mstDate} mono />
          <KvRow label="Mã số ĐKKD" value={record.businessInfo.businessLicenceNo} copyable mono />
          <KvRow label="Ngày ĐKKD" value={e.dkkdDate} mono />
          <KvRow label="Trụ sở chính" value={record.businessInfo.headquarters} copyable />
          <KvRow label="Người đại diện" value={record.businessInfo.representative} />
        </KvCard>

        <BankAccountsCard accounts={record.bankAccounts || []} />
      </div>

      <KycDocViewer docs={record.kycDocs || []} />
      <SalesChannelDocs docs={record.salesChannelDocs || []} />
    </div>);

}

// ──────────────────────────────────────────────────────────────────────────
// Onboard / Reevaluation — uses a unified RunCard
// ──────────────────────────────────────────────────────────────────────────
// Header một lần rà soát: Lần thứ n · Thời điểm · Mục đích · Trạng thái CCDV
function FlowRow({ run, defaultOpen, children, flow }) {
  const [open, setOpen] = useStateD(!!defaultOpen);
  const isPrimary = run.isPrimary;
  return (
    <div className={`bg-white border rounded-lg overflow-hidden ${run.blacklistStatus === "HIT" ? "border-rose-200" : "border-slate-200"}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex items-center gap-2.5 hover:bg-slate-50/60 cursor-pointer text-left">
        <span className={`w-2 h-2 rounded-full shrink-0 ${run.blacklistStatus === "HIT" ? "bg-rose-500" : "bg-emerald-500"}`}></span>
        <span className="text-[13px] font-bold text-slate-900 shrink-0">Lần thứ {run.attemptNumber}</span>
        <span className="text-slate-300 shrink-0">·</span>
        <span className="font-mono text-[12px] text-slate-600 shrink-0 whitespace-nowrap">{run.timestamp}</span>
        <span className="text-slate-300 shrink-0 hidden md:inline">·</span>
        <span className="hidden md:inline px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded shrink-0"
          style={isPrimary ? { background: "var(--bk-primary-soft)", color: "var(--bk-primary)" } : { background: "rgb(254 243 199)", color: "rgb(146 64 14)" }}>
          {run.reason || (isPrimary ? "Onboarding" : "Rà soát định kỳ")}
        </span>
        <span className="ml-auto flex items-center gap-2 shrink-0">
          {flow === "scoring"
            ? <RiskLevelChip level={run.rrLevel} score={run.rrScore} size="sm" />
            : <CCDVBadge status={run.ccdvStatus} size="sm" />}
          <Icon name={open ? "chevronUp" : "chevronDown"} className="w-4 h-4 text-slate-400" />
        </span>
      </button>
      {open &&
      <div className="border-t border-slate-200 bg-slate-50/30 p-4">
          {children}
        </div>}
    </div>);

}

// Khối luồng rà soát: summary + segmented control + danh sách accordion
function ScreeningFlows({ runs, context }) {
  const [flow, setFlow] = useStateD("blacklist");
  const flows = [
  { k: "blacklist", label: "Rà soát blacklist" },
  ...context === "reeval" ? [{ k: "tx", label: "Rà soát theo giao dịch" }] : [],
  { k: "scoring", label: "Chấm điểm rủi ro" }];


  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Segmented control chọn luồng */}
      <div className="px-5 pt-4">
        <div className="inline-flex p-0.5 rounded-lg bg-slate-100 gap-0.5">
          {flows.map((f) =>
          <button
            key={f.k}
            onClick={() => setFlow(f.k)}
            className={`text-[12.5px] px-4 py-1.5 rounded-md cursor-pointer transition-colors ${flow === f.k ? "bg-white shadow-sm text-slate-900 font-bold" : "text-slate-500 font-semibold hover:text-slate-800"}`}>
            {f.label}
          </button>
          )}
        </div>
      </div>

      {/* Nội dung luồng */}
      <div className="p-5 pt-4 space-y-2.5">
        {flow === "tx" ?
        <TxBlacklistPlaceholder /> :
        runs.map((r, i) =>
        <FlowRow key={r.id} run={r} defaultOpen={i === 0} flow={flow}>
              {flow === "blacklist" ?
          <MatchedTable results={r.blacklistResults || []} /> :
          <ScoringAnalysis run={r} />}
            </FlowRow>
        )}
      </div>
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

// 7 danh sách chuẩn theo trình tự ưu tiên đối soát
const CANON_BLACKLISTS = [
  { name: "Danh sách PEP", match: /PEP/i, version: "PEP_V4.9.2026_LIVE" },
  { name: "Danh sách đen nội bộ", match: /đen nội bộ/i, version: "BK_INTERNAL_BLACK_V9.2" },
  { name: "Danh sách bị can, bị cáo, bị kết án", match: /bị can/i, version: "MPS_CONVICTED_DAILY_2026" },
  { name: "Danh sách cảnh báo CIC", match: /CIC/i, version: "CIC_CREDIT_ALERTS_V1.0" },
  { name: "Danh sách SIMO", match: /SIMO/i, version: "SIMO_VOIP_SHADOW_V3.8" },
  { name: "Danh sách trốn thuế", match: /trốn thuế/i, version: "TAX_EVADERS_2026_Q2" },
  { name: "Danh sách TKNH lừa đảo", match: /TKNH|lừa đảo/i, version: "FRAUD_ACCOUNTS_V2.0" }];

// Chuẩn hóa kết quả rà soát về đúng 7 danh sách, giữ dữ liệu trùng khớp sẵn có
function normalizeBlacklist(results) {
  const src = results || [];
  return CANON_BLACKLISTS.map((c) => {
    const found = src.find((r) => c.match.test(r.name));
    return found ?
    { ...found, name: c.name } :
    { name: c.name, match: "KHONG_TRUNG_KHOP", action: "TIEP_TUC_CCDV", confidence: 0, version: c.version, fields: [] };
  });
}

function MatchedTable({ results }) {
  const rows = normalizeBlacklist(results);
  return (
    <div>
      <div className="border border-slate-200 rounded overflow-hidden bg-white">
      <table className="w-full text-left text-[11px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            <th className="py-2 px-3 w-8 text-center">#</th>
            <th className="py-2 px-3">Bộ cơ sở dữ liệu</th>
            <th className="py-2 px-3">Trùng khớp</th>
            <th className="py-2 px-3">Trường thông tin</th>
            <th className="py-2 px-3">Hành động đề xuất</th>
            <th className="py-2 px-3">Tên version</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) =>
          <tr key={i} className={r.match !== "KHONG_TRUNG_KHOP" ? "bg-rose-50/30" : ""}>
              <td className="py-2 px-3 text-center font-mono text-slate-400 align-top">{i + 1}</td>
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
      </div>
    </div>);

}

function ScoringAnalysis({ run }) {
  const breakdown = [
  { label: "Trọng số KYC cơ bản", value: 15, color: "bg-slate-400" },
  { label: "Lịch sử giao dịch", value: run.rrLevel === "CAO" ? 12 : 5, color: "bg-sky-400" },
  { label: "Phạt trùng Blacklist", value: run.blacklistStatus === "HIT" ? Math.min(60, run.rrScore - 20) : 0, color: "bg-rose-500" }];

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
    systemAction: record.ccdvStatus === "DUOC_CCDV" ? "TIEP_TUC_CCDV" : "DUNG_CCDV",
    attemptNumber: 1,
    isPrimary: true
  };
  return (
    <div className="space-y-3">
      <ScreeningFlows runs={[initialRun]} context="onboard" />
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
    pointDiff: h.rrScore - record.rrScore,
    attemptNumber: (record.screeningHistory || []).length - i + 1,
    isPrimary: false
  }));

  return (
    <div className="space-y-3">
      {runs.length === 0 ?
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-[12px] text-slate-400 italic">
          Chưa có phiên đánh giá lại nào sau Onboard khởi tạo.
        </div> :
      <ScreeningFlows runs={runs} context="reeval" />}
    </div>);

}

// ──────────────────────────────────────────────────────────────────────────
// KSNB APPRAISAL HISTORY TAB
// ──────────────────────────────────────────────────────────────────────────
function caseName(code) {
  const c = (window.APPRAISAL_CASES || []).find((x) => x.code === code);
  return c ? c.name : code;
}

function AppraisalCard({ rec, latest, onFinishForm, onReviewAppraisal }) {
  const draft = rec.formCompleted === false;
  const [open, setOpen] = useStateD(!!latest);
  const details = [
  { k: "Loại thẩm định", v: (rec.apType === "PERIODIC" ? "Thẩm định lại (chu kỳ)" : "Thẩm định lần đầu") },
  { k: "Loại đối tượng", v: `${rec.caseCode} — ${caseName(rec.caseCode)}` },
  { k: "Người lập phiếu", v: `${rec.officer} · ${rec.unit}` },
  { k: "Mức độ rủi ro", v: rec.rrScore != null ? `${rec.rrScore}/100 · ${mapLevel(rec.riskLevel)}` : mapLevel(rec.riskLevel) },
  { k: "Trạng thái Blacklist", v: rec.blacklistMatched > 0 ? `${rec.blacklistMatched} danh sách trùng khớp` : "Không trùng khớp" },
  { k: "Biện pháp tăng cường (EDD)", v: rec.eddApplied ? "Đã áp dụng" : "Không yêu cầu" }];

  return (
    <div className={`bg-white border rounded-lg overflow-hidden ${draft ? "border-amber-300" : "border-slate-200"}`}>
      <button onClick={() => setOpen((o) => !o)} className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 cursor-pointer text-left">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: "var(--bk-primary-soft)", color: "var(--bk-primary)" }}>
            <Icon name="fingerprint" className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-mono text-[13px] font-bold text-slate-900">{rec.code}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider rounded px-1.5 py-0 border"
                style={rec.apType === "PERIODIC" ? { color: "var(--bk-secondary)", borderColor: "var(--bk-secondary)", background: "rgba(50,172,74,0.08)" } : { color: "var(--bk-primary)", borderColor: "var(--bk-primary)", background: "var(--bk-primary-tint)" }}>
                {rec.apType === "PERIODIC" ? "Định kỳ" : "Lần đầu"}
              </span>
              {latest && <span className="text-[9px] font-bold uppercase tracking-wider text-white rounded px-1.5 py-0" style={{ background: "var(--bk-secondary)" }}>Mới nhất</span>}
            </div>
            <div className="font-mono text-[11px] text-slate-500 mt-0.5">{rec.timestamp} · {rec.officer}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">{rec.caseCode}</span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Đã thẩm định</span>
          {draft
            ? <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5"><Icon name="file" className="w-3 h-3" />Phiếu chưa hoàn thiện</span>
            : <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded px-2 py-0.5"><Icon name="check" className="w-3 h-3" strokeWidth={3} />Đã lưu phiếu</span>}
          <Icon name={open ? "chevronUp" : "chevronDown"} className="w-4 h-4 text-slate-400" />
        </div>
      </button>
      {open &&
      <div className="border-t border-slate-200 bg-slate-50/30 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            {details.map((d, i) =>
            <div key={i} className="bg-white border border-slate-200 rounded p-2.5">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{d.k}</div>
                <div className="text-[12px] font-semibold text-slate-900 mt-0.5">{d.v}</div>
              </div>
            )}
          </div>

          {/* Phiếu lưu trữ nội bộ — độc lập với trạng thái thẩm định */}
          <div className={`rounded-md border px-3 py-2.5 ${draft ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"}`}>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Icon name="file" className={`w-4 h-4 shrink-0 ${draft ? "text-amber-600" : "text-slate-400"}`} />
              <span className="text-[12px] font-bold text-slate-800">Phiếu thẩm định {rec.caseCode}</span>
              <div className="flex items-center gap-2 ml-auto">
                <button onClick={() => onFinishForm(rec)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-md cursor-pointer ${draft ? "text-white" : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"}`} style={draft ? { background: "var(--bk-primary)" } : {}}>
                  <Icon name={draft ? "file" : "eye"} className="w-3.5 h-3.5" /> {draft ? "Hoàn thiện & tải chứng từ" : "Xem / sửa phiếu"}
                </button>
                {!draft &&
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer">
                  <Icon name="download" className="w-3.5 h-3.5" /> Tải phiếu PDF
                </button>}
              </div>
            </div>
          </div>

          {rec.note &&
          <div className="bg-white border border-slate-200 rounded p-3 mt-3">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Ý kiến KSNB</div>
            <p className="text-[12px] text-slate-700 leading-relaxed">{rec.note}</p>
          </div>}

          {/* Xem / sửa phần thẩm định (chấm điểm) — luôn sẵn sàng */}
          {rec.mrcAnswers &&
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
            <span className="text-[11px] text-slate-500">Phần chấm điểm rủi ro:</span>
            <button onClick={() => onReviewAppraisal(rec)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer">
              <Icon name="scale" className="w-3.5 h-3.5" /> Xem / sửa thẩm định
            </button>
          </div>}
        </div>
      }
    </div>);

}

function KsnbTab({ record, onAppraise, onFinishForm, onReviewAppraisal }) {
  const hist = record.appraisalHistory || [];
  const denied = false;
  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg px-4 py-3.5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--bk-primary-soft)", color: "var(--bk-primary)" }}>
          <Icon name="fingerprint" className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-slate-900">Thẩm định merchant</div>
          <div className="text-[11.5px] text-slate-500 mt-0.5">KSNB đánh giá rủi ro, chấm điểm và lưu phiếu chứng từ nội bộ.</div>
        </div>
        {denied
          ? <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1.5"><Icon name="info" className="w-3.5 h-3.5" /> Từ chối CCDV — không thẩm định</span>
          : <button onClick={() => onAppraise(record)} className="flex items-center gap-2 px-5 py-3 text-[13px] font-bold text-white rounded-lg cursor-pointer shrink-0 transition-opacity hover:opacity-90" style={{ background: "var(--bk-primary)" }}>
              <Icon name="fingerprint" className="w-4 h-4" /> Thẩm định merchant
            </button>}
      </div>
      {hist.length === 0 ?
      <div className="bg-white border border-dashed border-slate-300 rounded-lg p-10 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--bk-primary-soft)", color: "var(--bk-primary)" }}>
            <Icon name="fingerprint" className="w-6 h-6" />
          </div>
          <div className="text-[13px] font-bold text-slate-700">{denied ? "Không thẩm định" : "Chưa thẩm định"}</div>
          <div className="text-[11px] text-slate-500 max-w-sm leading-relaxed">{denied
            ? "Merchant bị từ chối cung cấp dịch vụ (CCDV) nên không thực hiện thẩm định."
            : "Bấm “Thẩm định merchant” để KSNB đánh giá các yếu tố rủi ro và chấm điểm. Sau đó có thể hoàn thiện phiếu để lưu trữ chứng từ nội bộ."}</div>
        </div> :
      <div className="space-y-2.5">
          <div className="flex items-center gap-2 px-0.5">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Lịch sử thẩm định</span>
            <span className="px-1.5 py-0 text-[10px] font-bold rounded-full bg-slate-100 text-slate-500">{hist.length}</span>
          </div>
          {hist.map((h, i) => <AppraisalCard key={h.code + i} rec={h} latest={i === 0} onFinishForm={(entry) => onFinishForm(record, entry)} onReviewAppraisal={(entry) => onReviewAppraisal(record, entry)} />)}
        </div>}
    </div>);

}

// ──────────────────────────────────────────────────────────────────────────
// DETAIL VIEW SHELL
// ──────────────────────────────────────────────────────────────────────────
function MerchantDetail({ record, onClose, onRecheck, rechecking, primary, onAppraise, onFinishForm, onReviewAppraisal, ksnbSignal }) {
  const [tab, setTab] = useStateD("kyc");
  // Sau khi hoàn tất chấm điểm, chuyển sang tab Hồ sơ thẩm định KSNB
  useEffectD(() => { if (ksnbSignal) setTab("ksnb"); }, [ksnbSignal]);
  return (
    <div className="flex-1 bg-slate-50 flex flex-col">
      <DetailHeader record={record} onClose={onClose} onRecheck={onRecheck} rechecking={rechecking} primary={primary} />
      <div className="bg-white border-b border-slate-200 px-5 py-4">
        <SummaryStrip record={record} />
      </div>
      <DetailTabs active={tab} setActive={setTab} />
      <main className="flex-1 overflow-y-auto p-5">
        {tab === "kyc" && <KycTab record={record} />}
        {tab === "ksnb" && <KsnbTab record={record} onAppraise={onAppraise} onFinishForm={onFinishForm} onReviewAppraisal={onReviewAppraisal} />}
        {tab === "onboard" && <OnboardTab record={record} />}
        {tab === "reeval" && <ReevalTab record={record} />}
      </main>
    </div>);

}

Object.assign(window, { MerchantDetail });