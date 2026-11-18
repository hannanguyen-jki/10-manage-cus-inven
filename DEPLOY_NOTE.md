# JKI ERP — cập nhật khách & sản phẩm từ sheet (chạy một lần)

Chỉ thực hiện trên VPS JKI `37.60.226.206` (manage.jkioceanhub.com), thư mục `/opt/jki-erp`.
Không thao tác trên VPS SYN GROUP `169.58.226.90`. Không ghi mật khẩu vào ghi chú này; thông tin đăng nhập DB lấy từ biến môi trường trong container.

## Bản này thay đổi gì

- **Khách:** 320 khách từ sheet, mã gốc `SUP01` … `SUP0320` (không đánh số lại). Cột: tên tiệm, người liên hệ, điện thoại, địa chỉ, thành phố, bang, zip, lần bán cuối (`lastSale`). Khách mới tạo trên web nhận mã kế tiếp (`SUP0321`, …).
- **Schema:** thêm cột tùy chọn `customers.lastSale` (text). Entrypoint tự chạy `prisma db push` khi container khởi động; đây là thêm cột nullable, không mất dữ liệu.
- **Sản phẩm:** `data/catalog.json` có 927 sản phẩm = 461 sản phẩm cũ (giữ nguyên SKU, giá, ảnh) + 466 sản phẩm mới mã `SHEET-…`. Mã `SHEET-…` là mã nội bộ tạm cho sản phẩm chưa có trong catalog, không phải mã nhà cung cấp. Seed khi khởi động chỉ **thêm** SKU còn thiếu, không sửa/xóa sản phẩm đang có.

## Các bước

1. Sao lưu PostgreSQL và kiểm tra tệp có dữ liệu, cất bản sao ra ngoài VPS:

   ```sh
   cd /opt/jki-erp
   docker exec jki-erp-db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' > jki-erp-before-customers.dump
   test -s jki-erp-before-customers.dump && ls -lh jki-erp-before-customers.dump
   ```

2. Đưa mã đã kiểm thử vào `/opt/jki-erp`, dựng lại web (entrypoint chạy `prisma db push` rồi seed thêm sản phẩm thiếu):

   ```sh
   docker compose up -d --build erp-web
   docker logs --tail 50 jki-erp-web
   ```

3. Nạp khách **một lần**:

   ```sh
   docker exec -w /app jki-erp-web npx tsx prisma/import-customers.ts
   ```

   Trong một giao dịch, script xóa theo thứ tự: dòng đơn → đơn → dòng báo giá → báo giá → khảo sát rời bỏ → SMS log → khách; rồi tạo 320 khách từ `data/customers_extracted.json`. **Không đụng bảng sản phẩm và tồn kho.** Có khóa và dấu `sheet-customers-2026-11-17` trong bảng `jki_data_migrations`: chạy lần hai chỉ in "already applied", không xóa gì.

4. Kiểm tra sau khi chạy:

   ```sh
   docker exec jki-erp-db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT count(*) FROM customers;" -c "SELECT count(*) FROM products;" -c "SELECT count(*) FROM products WHERE sku LIKE '"'"'SHEET-%'"'"';"'
   ```

   Kỳ vọng: 320 khách; sản phẩm ≥ 927 (thêm nếu DB đã có sản phẩm tạo tay); 466 mã `SHEET-…`. Nếu số `SHEET-…` lớn hơn 466, DB đã có sản phẩm `SHEET-…` từ một lần seed trước — báo lại, không tự xóa.

## Khôi phục nếu cần

```sh
docker exec -i jki-erp-db sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists' < jki-erp-before-customers.dump
```

---

# Cập nhật lịch sử order từ Google Sheet "Data Sale" (chạy một lần)

Dữ liệu order thật lấy từ tab `History sale` (1.711 hoá đơn của 181 khách, 21.664 dòng hàng), thay cho order sinh ngẫu nhiên trước đây. Nguồn: `data/Data Sale - fixed.xlsx`; tạo lại dữ liệu bằng `python scripts/build_data_from_sheet.py` (không ngẫu nhiên, chạy lại cho kết quả giống hệt).

- Sheet không có số hoá đơn: 1 hoá đơn = 1 khách + 1 ngày. Mã `INV-<năm>-<số thứ tự>` do script gán.
- 139 khách không có dòng nào trong `History sale`: không có order, `lastSale` trống, trạng thái `INACTIVE`.
- Catalog thêm 308 sản phẩm `SHEET-…` (hàng có trong lịch sử bán nhưng chưa có trong catalog).

Các bước (sau khi sao lưu DB như ở trên):

1. Dựng lại web để entrypoint seed thêm sản phẩm `SHEET-…` còn thiếu: `docker compose up -d --build erp-web`
2. Nạp order **một lần** (xóa toàn bộ order cũ rồi nạp lại; cập nhật `lastSale` và trạng thái của khách; dừng và báo lỗi nếu còn SKU chưa có trong DB):

   ```sh
   docker exec -w /app jki-erp-web npx tsx prisma/seed-orders.ts
   ```
