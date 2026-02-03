import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Loader2, Check, Clock } from "lucide-react";
import { toast } from "sonner";

const statusSteps = [
  { key: "pending", label: "รอยืนยัน", icon: Clock },
  { key: "confirmed", label: "ยืนยันแล้ว", icon: Check },
  { key: "preparing", label: "กำลังเตรียม", icon: Clock },
  { key: "ready", label: "พร้อมส่ง", icon: Check },
  { key: "delivering", label: "กำลังจัดส่ง", icon: Clock },
  { key: "completed", label: "เสร็จสิ้น", icon: Check },
];

export default function OrderTracking() {
  const [, setLocation] = useLocation();
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      setOrderId(parseInt(id));
    }
  }, []);

  const { data: orderDetails, isLoading } = trpc.orders.details.useQuery(
    { orderId: orderId || 0 },
    { enabled: !!orderId }
  );

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>ไม่พบออเดอร์</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">กรุณากรอกหมายเลขออเดอร์</p>
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => setLocation("/")}
            >
              กลับไปหน้าแรก
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">ติดตามออเดอร์</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : orderDetails ? (
          <div className="space-y-8">
            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>สถานะออเดอร์</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusSteps.map((step, index) => {
                    const isActive = orderDetails.order.status === step.key;
                    const isCompleted = statusSteps.findIndex(s => s.key === orderDetails.order.status) >= index;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex items-center gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted ? "bg-green-500" : "bg-gray-300"
                        }`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${isActive ? "text-orange-600" : "text-gray-600"}`}>
                            {step.label}
                          </p>
                        </div>
                        {isActive && <span className="text-orange-600 font-semibold">ปัจจุบัน</span>}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>รายละเอียดออเดอร์</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">หมายเลขออเดอร์</p>
                    <p className="font-semibold">#{orderDetails.order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">วิธีชำระเงิน</p>
                    <p className="font-semibold">
                      {orderDetails.order.paymentMethod === "cash" ? "เงินสด (COD)" : "โอนเงิน"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">ที่อยู่จัดส่ง</p>
                  <p className="font-semibold">{orderDetails.order.deliveryAddress}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">รายการอาหาร</p>
                  <div className="space-y-2">
                    {orderDetails.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.menuItemId} x{item.quantity}</span>
                        <span className="font-semibold">฿{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>รวมทั้งสิ้น:</span>
                    <span className="text-orange-600">฿{orderDetails.order.totalPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => setLocation("/")}
            >
              กลับไปหน้าแรก
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">ไม่พบออเดอร์</p>
            <Button
              className="mt-4 bg-orange-500 hover:bg-orange-600"
              onClick={() => setLocation("/")}
            >
              กลับไปหน้าแรก
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
