import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Copy, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/types/paymentTransaction";
import { useState, useEffect } from "react";
import { paymentTransactionService } from "@/services/paymentTransactionService";
import type { PaymentTransactionDto } from "@/types/paymentTransaction";

interface SepayQRDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentTransactionDto | null;
  onPaymentCompleted?: () => void;
}

export default function SepayQRDialog({
  isOpen,
  onClose,
  payment,
  onPaymentCompleted,
}: SepayQRDialogProps) {
  const [checking, setChecking] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(payment?.status || "PENDING");

  // Auto-check payment status every 5 seconds
  useEffect(() => {
    if (!payment || !isOpen || paymentStatus === "COMPLETED") return;

    const interval = setInterval(async () => {
      try {
        const result = await paymentTransactionService.getPaymentTransactionById(payment.paymentId);
        if (result.success && result.data) {
          setPaymentStatus(result.data.status);
          if (result.data.status === "COMPLETED") {
            toast.success("Thanh toán thành công! 🎉");
            onPaymentCompleted?.();
            setTimeout(() => onClose(), 2000);
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, paymentStatus, payment?.paymentId, onPaymentCompleted, onClose]);

  // Early return nếu payment null - SAU tất cả hooks
  if (!payment) {
    return null;
  }

  // Virtual Account config
  const accountNumber = "107881054116"; // VietinBank Virtual Account
  const bankName = "VietinBank";
  const accountHolder = "VU AN KHANG";
  const vaPrefix = "SEVQR TKP235"; // Virtual Account prefix bắt buộc

  // Generate transfer content: SEVQR TKP235 T{tenantId} P{patientId} A{appointmentId}
  const generateTransferContent = () => {
    const parts = [vaPrefix, `T${payment.tenantId}`, `P${payment.patientId}`];
    if (payment.appointmentId) {
      parts.push(`A${payment.appointmentId}`);
    }
    return parts.join(" ");
  };

  const transferContent = generateTransferContent();

  // Generate SePay QR code URL
  const generateSepayQR = () => {
    const amount = Math.round(payment.amount);
    const content = encodeURIComponent(transferContent);
    return `https://qr.sepay.vn/img?acc=${accountNumber}&bank=VietinBank&amount=${amount}&des=${content}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const result = await paymentTransactionService.getPaymentTransactionById(payment.paymentId);
      if (result.success && result.data) {
        setPaymentStatus(result.data.status);
        if (result.data.status === "COMPLETED") {
          toast.success("Thanh toán thành công! 🎉");
          onPaymentCompleted?.();
          setTimeout(() => onClose(), 2000);
        } else {
          toast.info("Chưa nhận được thanh toán");
        }
      }
    } catch (error) {
      toast.error("Không thể kiểm tra trạng thái");
    } finally {
      setChecking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thanh toán qua chuyển khoản ngân hàng</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {paymentStatus === "COMPLETED" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Thanh toán thành công!</p>
                <p className="text-sm text-green-700">Giao dịch đã được xác nhận</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Quét mã QR để thanh toán</p>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                  <img
                    src={generateSepayQR()}
                    alt="QR Code"
                    className="w-64 h-64 object-contain"
                  />
                  <p className="text-xs text-gray-500 mt-2">Sử dụng app ngân hàng để quét</p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleCheckStatus}
                disabled={checking || paymentStatus === "COMPLETED"}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${checking ? "animate-spin" : ""}`} />
                {checking ? "Đang kiểm tra..." : "Kiểm tra thanh toán"}
              </Button>
            </div>

            {/* Bank Information Section */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Thông tin chuyển khoản</h3>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600">Số tiền cần thanh toán</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>

                {/* Bank Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600">Ngân hàng</p>
                      <p className="font-semibold">{bankName}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankName, "tên ngân hàng")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600">Số tài khoản</p>
                      <p className="font-semibold font-mono">{accountNumber}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(accountNumber, "số tài khoản")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600">Chủ tài khoản</p>
                      <p className="font-semibold">{accountHolder}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(accountHolder, "tên chủ tài khoản")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1 font-semibold">Nội dung chuyển khoản</p>
                      <p className="font-bold font-mono break-all text-base">{transferContent}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transferContent, "nội dung chuyển khoản")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Info */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Mã giao dịch</p>
                <p className="font-semibold">#{payment.paymentId}</p>
              </div>
              {payment.appointmentId && (
                <div>
                  <p className="text-gray-600">Mã lịch hẹn</p>
                  <p className="font-semibold">#{payment.appointmentId}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Bệnh nhân</p>
                <p className="font-semibold">{payment.patientName}</p>
              </div>
              <div>
                <p className="text-gray-600">Số điện thoại</p>
                <p className="font-semibold">{payment.patientPhone}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
