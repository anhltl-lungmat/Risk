# BaoKim Risk — Thẩm định merchant (KSNB)

Màn ERP KYC đầy đủ + tính năng thẩm định merchant cho Phòng KSNB.
Static site (React 18 + Tailwind qua CDN, Babel in-browser) — không cần build step.

## Cấu trúc
- `index.html` — entry, nạp các script theo thứ tự
- `mock-data.js` — dữ liệu mẫu merchant, blacklist, lịch sử thẩm định, 5 case phân loại
- `components.jsx` — icon, badge, mapper dùng chung
- `table-view.jsx` — bảng Danh sách Merchant (có cột Trạng thái thẩm định)
- `detail-view.jsx` — màn chi tiết KYC + tab Hồ sơ thẩm định KSNB
- `ap-controls.jsx` — control gọn cho phiếu (Chip / Section / Radio)
- `appraisal-view.jsx` — drawer thẩm định (lần đầu / thẩm định lại)
- `app.jsx` — shell + state

## Chạy local
Mở `index.html` bằng web server tĩnh bất kỳ:
```bash
npx serve .
# hoặc
python3 -m http.server
```

## Deploy lên Vercel
Đây là static site, không cần cấu hình build.

**Cách 1 — Vercel CLI:**
```bash
npm i -g vercel
cd <thư-mục-này>
vercel
```
Khi hỏi build/output: để trống (None) — Vercel phục vụ file tĩnh, `index.html` làm trang gốc.

**Cách 2 — Dashboard:** kéo-thả cả thư mục vào https://vercel.com/new (Other / No framework).

> Lưu ý: bản này dùng Babel biên dịch JSX trên trình duyệt (tiện cho demo/preview).
> Khi lên production thật nên precompile JSX và self-host Tailwind để tối ưu tốc độ.
