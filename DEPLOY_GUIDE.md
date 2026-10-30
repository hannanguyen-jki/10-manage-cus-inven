# Hướng Dẫn Triển Khai Hệ Thống JKIOCEAN CRM & Kho Lên Máy Chủ VPS

* **Hệ thống**: JKIOCEAN B2B Management Hub (Khách Hàng, Bán Hàng, Tồn Kho, Báo Giá PDF, Công Nợ AR)
* **Máy chủ VPS**: Contabo VPS 6 (`37.60.226.206`), Ubuntu 24.04 LTS
* **Subdomain đích**: `https://manage.jkioceanhub.com`
* **Cơ chế xác thực (SSO)**: Dùng chung bộ tài khoản với Nextcloud (`cloud.jkioceanhub.com`) và App Điểm Danh (`attendance.jkioceanhub.com`).

---

## 1. Kiến Trúc Hoạt Động Trên VPS

```
Internet (HTTPS)
   │
   ▼
Traefik Reverse Proxy (Mạng Docker 'coolify')
   ├── cloud.jkioceanhub.com      ──> nextcloud-app-1:80
   ├── attendance.jkioceanhub.com ──> attendance-web:3000
   └── manage.jkioceanhub.com     ──> jki-erp-web:3000 (App này)
                                            │
                                            ▼
                                  PostgreSQL (jki-erp-db:5432)
                                  + SSO Verify (http://attendance-web:3000/api/auth/verify)
```

---

## 2. Các Bước Triển Khai Nhanh (1-Click Trên VPS)

### Bước 1: Trỏ DNS Subdomain
Truy cập trang quản trị DNS tên miền `jkioceanhub.com` (ví dụ trên Cloudflare hoặc Namecheap):
* Thêm bản ghi **A record**:
  * Name: `manage` (hoặc `manage.jkioceanhub.com`)
  * IPv4: `37.60.226.206`
  * Proxy status: DNS Only (đám mây xám) nếu dùng Coolify Traefik tự cấp SSL Let's Encrypt.

### Bước 2: Đẩy Code Lên VPS
Từ máy tính cá nhân hoặc kết nối SSH vào VPS (`ssh root@37.60.226.206`):
```bash
# 1. Di chuyển vào thư mục dự án trên VPS
mkdir -p /opt/jki-erp
cd /opt/jki-erp

# 2. Clone hoặc copy mã nguồn manage-cus-inven vào đây
# git clone <repo_url> .

# 3. Tạo file cấu hình môi trường .env
cp .env.example .env
nano .env
```

Điền các biến môi trường trong `.env`:
```env
DATABASE_URL="postgresql://erp_user:JkiErp2026PasswordSecure@erp-db:5432/jki_erp?schema=public"
ATTENDANCE_SSO_URL="http://attendance-web:3000/api/auth/verify"
JWT_SECRET="jkiocean-erp-jwt-secret-key-2026-very-secure"
QUO_API_KEY="your_actual_quo_api_key_from_quo_settings"
QUO_PHONE_NUMBER="+17133306165"
NODE_ENV="production"
PORT=3000
```

### Bước 3: Khởi Chạy Bằng Docker Compose
```bash
# 1. Đảm bảo mạng coolify đang chạy
docker network inspect coolify >/dev/null 2>&1 || docker network create coolify

# 2. Khởi chạy cụm container
docker compose up -d --build

# 3. Chạy cập nhật database và nạp dữ liệu mẫu
docker exec -it jki-erp-web npx prisma db push
docker exec -it jki-erp-web npx prisma db seed
```

### Bước 4: Kiểm Tra Truy Cập
1. Mở trình duyệt: [https://manage.jkioceanhub.com](https://manage.jkioceanhub.com)
2. Traefik sẽ tự động xin chứng chỉ SSL Let's Encrypt trong 30 giây.
3. Đăng nhập bằng tài khoản nội bộ JKI:
   * **Johnny Tran (Sếp)**: Username: `johnny` | Pass: `Admin@123456`
   * **Hanna Nguyen (Sales)**: Username: `hanna` | Pass: `Nv@123456`
   * **Alice Nguyen (Kế toán)**: Username: `alice` | Pass: `Hr@123456`
   * **Root Administrator**: Username: `admin` | Pass: `3846ffbeb28841019aed`

---

## 3. Khắc Phục Sự Cố Thường Gặp (Troubleshooting)

1. **Lỗi không đăng nhập được qua SSO**:
   * Kiểm tra container `attendance-web` có đang chạy trên mạng `coolify` không bằng lệnh:
     `docker inspect attendance-web | grep -i network`
   * Nếu khác mạng, thêm container vào mạng: `docker network connect coolify attendance-web`
2. **Lỗi khi gửi SMS Quo**:
   * Kiểm tra `QUO_API_KEY` trong file `.env`. Đảm bảo đầu số `+17133306165` đã hoàn tất đăng ký US A2P 10DLC trong bảng điều khiển Quo (OpenPhone).
