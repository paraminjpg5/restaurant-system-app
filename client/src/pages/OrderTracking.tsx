import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Clock, CheckCircle, Truck, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

const statusSteps = [
  { key: "pending", label: "รอยืนยัน", icon: Clock },
  { key: "confirmed", label: "ยืนยันแล้ว", icon: CheckCircle },
  { key: "preparing", label: "กำลังเตรียม", icon: Clock },
  { key: "ready", label: "พร้อมส่ง", icon: CheckCircle },
  { key: "delivering", label: "กำลังจัดส่ง", icon: Truck },
  { key: "completed", label: "เสร็จสิ้น", icon: CheckCircle },
];

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "preparing":
      return "bg-purple-100 text-purple-800";
    case "ready":
      return "bg-green-100 text-green-800";
    case "delivering":
      return "bg-orange-100 text-orange-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function OrderTracking() {
  const { isAuthenticated } = useAuth();
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("id");
    if (id) {
      setOrderId(parseInt(id));
    }
  }, []);

  const { data: orderData, isLoading } = trpc.orders.details.useQuery(
    { orderId: orderId || 0 },
    { enabled: !!orderId && isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto">
          <p className="text-center text-gray-600">กรุณาเข้าสู่ระบบก่อน</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto">
          <p className="text-center text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!orderData?.order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto">
          <p className="text-center text-gray-600">ไม่พบออเดอร์</p>
        </div>
      </div>
    );
  }

  const order = orderData.order;
  const items = orderData.items || [];
  const currentStatusIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">ติดตามออเดอร์</h1>

        {/* Order Status */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>ออเดอร์ #{order.id}</CardTitle>
                <CardDescription>
                  สั่งเมื่อ {new Date(order.createdAt).toLocaleString("th-TH")}
                </CardDescription>
              </div>
              <Badge className={getStatusBadgeColor(order.status)}>
                {statusSteps.find((s) => s.key === order.status)?.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Status Timeline */}
            <div className="space-y-4">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const StepIcon = step.icon;

                return (
                  <div key={step.key} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`w-1 h-12 ${
                            isCompleted ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-semibold ${
                          isCurrent
                            ? "text-green-600"
                            : isCompleted
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>รายการอาหาร</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center pb-4 border-b">
                      <div>
                        <p className="font-semibold">รายการที่ {index + 1}</p>
                        <p className="text-sm text-gray-600">จำนวน: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">฿{item.price}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Details */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>ที่อยู่จัดส่ง</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <p className="text-gray-700">{order.deliveryAddress}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>สรุปการสั่งซื้อ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">รวมทั้งหมด</span>
                  <span className="font-semibold">฿{order.totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">วิธีชำระเงิน</span>
                  <span className="font-semibold">
                    {order.paymentMethod === "cash" ? "เงินสด" : "โอนเงิน"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">สถานะการชำระเงิน</span>
                  <Badge className={getStatusBadgeColor(order.paymentStatus)}>
                    {order.paymentStatus === "completed" ? "ชำระแล้ว" : "รอชำระ"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
