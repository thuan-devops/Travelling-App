import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';
import { BookingDetails } from '../types';

export const generateAndShareReceiptPdf = async (booking: BookingDetails): Promise<void> => {
  const feesHtml = booking.fees && booking.fees.length > 0
    ? booking.fees
        .map(
          (fee) => `
          <div class="row">
            <span>${fee.label}</span>
            <span>$${fee.amount}</span>
          </div>`
        )
        .join('')
    : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="utf-8" />
      <title>Biên Lai Đặt Phòng #${booking.bookingId}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #111827;
          margin: 0;
          padding: 40px;
          background-color: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #00BDD6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo-title {
          font-size: 26px;
          font-weight: 800;
          color: #00BDD6;
          margin: 0;
        }
        .receipt-tag {
          font-size: 14px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 4px;
        }
        .status-badge {
          background-color: #ECFDF5;
          color: #10B981;
          border: 1px solid #A7F3D0;
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 14px;
        }
        .info-card {
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 25px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .info-item {
          margin-bottom: 12px;
        }
        .info-label {
          font-size: 13px;
          color: #6B7280;
          margin-bottom: 4px;
        }
        .info-val {
          font-size: 16px;
          font-weight: 700;
          color: #1F2937;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin-top: 25px;
          margin-bottom: 15px;
          border-bottom: 1px solid #E5E7EB;
          padding-bottom: 8px;
        }
        .pricing-table {
          width: 100%;
          margin-top: 15px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 15px;
          color: #374151;
          border-bottom: 1px dashed #E5E7EB;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 16px 0;
          font-size: 19px;
          font-weight: 800;
          color: #111827;
          border-top: 2px solid #111827;
          margin-top: 10px;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 13px;
          color: #9CA3AF;
          border-top: 1px solid #F3F4F6;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="logo-title">Travelling App</h1>
          <div class="receipt-tag">BIÊN LAI ĐẶT PHÒNG CHÍNH THỨC</div>
        </div>
        <div class="status-badge">ĐÃ THANH TOÁN</div>
      </div>

      <div class="info-card">
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Mã tham chiếu (Ref ID)</div>
            <div class="info-val">#${booking.bookingId}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Ngày thanh toán</div>
            <div class="info-val">${booking.paymentDate} - ${booking.paymentTime}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Phương thức thanh toán</div>
            <div class="info-val">${booking.paymentMethod}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Số khách lưu trú</div>
            <div class="info-val">${booking.guests} khách</div>
          </div>
        </div>
      </div>

      <div class="section-title">Thông tin chỗ nghỉ</div>
      <div class="info-card">
        <div style="font-size: 20px; font-weight: 800; color: #111827; margin-bottom: 6px;">
          ${booking.accommodation.title}
        </div>
        <div style="font-size: 15px; color: #4B5563; margin-bottom: 12px;">
          📍 ${booking.accommodation.location}
        </div>
        <div style="display: flex; gap: 20px; font-size: 14px; color: #6B7280;">
          <div><strong>Nhận phòng:</strong> ${booking.checkIn}</div>
          <div><strong>Trả phòng:</strong> ${booking.checkOut}</div>
          <div><strong>Thời gian:</strong> ${booking.nights} đêm</div>
        </div>
      </div>

      <div class="section-title">Chi tiết thanh toán</div>
      <div class="pricing-table">
        <div class="row">
          <span>Tiền phòng ($${booking.accommodation.pricePerNight} x ${booking.nights} đêm)</span>
          <span>$${booking.roomTotal}</span>
        </div>
        ${feesHtml}
        <div class="total-row">
          <span>Tổng số tiền đã thanh toán</span>
          <span>$${booking.paidAmount} USD</span>
        </div>
      </div>

      <div class="footer">
        Cảm ơn bạn đã lựa chọn Travelling App! Chúc bạn có một chuyến nghỉ dưỡng tuyệt vời.<br />
        Mọi thắc mắc xin liên hệ bộ phận hỗ trợ trong ứng dụng.
      </div>
    </body>
    </html>
  `;

  try {
    if (Platform.OS === 'web') {
      // Trên web: mở hộp thoại in / lưu PDF trực tiếp của trình duyệt
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      } else {
        await Print.printAsync({ html: htmlContent });
      }
    } else {
      // Trên Mobile (Android / iOS): Sinh file PDF thật vào bộ nhớ máy và mở bảng chia sẻ/lưu file
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Biên lai đặt phòng #${booking.bookingId}`,
        });
      } else {
        Alert.alert(
          'Đã xuất PDF thành công',
          `File PDF đã được tạo tại:\n${uri}`
        );
      }
    }
  } catch (error) {
    console.error('Lỗi khi xuất PDF:', error);
    Alert.alert('Lỗi', 'Không thể tạo file PDF lúc này. Vui lòng thử lại!');
  }
};
