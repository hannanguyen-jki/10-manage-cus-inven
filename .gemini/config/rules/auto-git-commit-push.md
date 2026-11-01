# Project Rule: Mandatory Auto Git Commit & Push on Every Task Completion

> **Phạm vi áp dụng**: Áp dụng cho TOÀN BỘ các tác vụ chỉnh sửa trong project `manage-cus-inven`.

---

## NGUYÊN TẮC CỐT LÕI: TỰ ĐỘNG COMMIT & PUSH NGAY SAU KHI HOÀN THÀNH CHỈNH SỬA

Bất kỳ khi nào hoàn tất một yêu cầu chỉnh sửa, tính năng mới, vá lỗi (bug fix), tái cấu trúc (refactoring) hoặc cập nhật nội dung:

1. **BẮT BUỘC TỰ ĐỘNG CHẠY COMMIT VÀ PUSH**:
   - Ngay sau khi kiểm tra mã nguồn (build / lint / test / typecheck thành công), Agent **BẮT BUỘC** tự động thực thi chuỗi lệnh:
     ```bash
     git add -A
     git commit -m "<mô tả thay đổi rõ ràng>"
     git push origin <branch_hiện_tại>
     ```
   - **TUYỆT ĐỐI KHÔNG** dừng lại ở bước chỉnh sửa file mà quên commit và push lên remote repo.

2. **MỤC TIÊU BẮT BUỘC**:
   - Đảm bảo mã nguồn trên GitHub luôn đồng bộ mới nhất 100%.
   - Kích hoạt ngay lập tức luồng CI/CD, webhook hoặc auto-deploy để website cập nhật tức thì cho người dùng.

3. **QUY CHUẨN COMMIT MESSAGE**:
   - Thông điệp commit phải ngắn gọn, súc tích và mô tả đúng bản chất thay đổi (e.g. `feat: ...`, `fix: ...`, `chore: ...`).
