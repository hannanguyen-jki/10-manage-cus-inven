# Project Rule: Mandatory Auto Git Commit, Push & VPS Deploy on Every Task Completion

> **Phạm vi áp dụng**: Áp dụng cho TOÀN BỘ các tác vụ chỉnh sửa trong project `manage-cus-inven`.

---

## NGUYÊN TẮC CỐT LÕI: TỰ ĐỘNG COMMIT, PUSH & DEPLOY VPS NGAY SAU KHI HOÀN THÀNH CHỈNH SỬA

Bất kỳ khi nào hoàn tất một yêu cầu chỉnh sửa, tính năng mới, vá lỗi (bug fix), tái cấu trúc (refactoring) hoặc cập nhật nội dung:

1. **BẮT BUỘC TỰ ĐỘNG CHẠY COMMIT VÀ PUSH**:
   - Ngay sau khi kiểm tra mã nguồn (build / lint / test / typecheck thành công), Agent **BẮT BUỘC** tự động thực thi chuỗi lệnh:
     ```bash
     git add -A
     git commit -m "<mô tả thay đổi rõ ràng>"
     git push origin <branch_hiện_tại>
     ```
   - **TUYỆT ĐỐI KHÔNG** dừng lại ở bước chỉnh sửa file mà quên commit và push lên remote repo.

2. **BẮT BUỘC TỰ ĐỘNG DEPLOY TRỰC TIẾP LÊN VPS**:
   - Ngay sau khi `git push` thành công, Agent **BẮT BUỘC** chạy lệnh SSH cập nhật VPS:
     ```bash
     ssh -i "$env:USERPROFILE\.ssh\id_ed25519" root@37.60.226.206 "cd /opt/manage-cus-inven && git pull origin main && docker compose up -d --build"
     ```
   - Xác nhận container đã khởi chạy lại thành công để đảm bảo website cập nhật tức thì 100% cho người dùng.

3. **MỤC TIÊU BẮT BUỘC**:
   - Đảm bảo mã nguồn trên GitHub luôn đồng bộ mới nhất 100%.
   - Website trên VPS (`https://manage.jkioceanhub.com`) cập nhật tức thì theo thời gian thực mà người dùng không cần can thiệp bất kỳ thao tác nào.
