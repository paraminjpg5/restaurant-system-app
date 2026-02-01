import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "รอยืนยัน";
    case "confirmed":
      return "ยืนยันแล้ว";
    case "preparing":
      return "กำลังเตรียม";
    case "ready":
      return "พร้อมส่ง";
    case "delivering":
      return "กำลังจัดส่ง";
    case "completed":
      return "เสร็จสิ้น";
    default:
      return status;
  }
};

export default function KitchenDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data: orders, isLoading, refetch } = trpc.admin.allOrders.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "kitchen",
  });

  const { data: orderDetails } = trpc.admin.orderDetails.useQuery(
    { orderId: selectedOrderId || 0 },
    { enabled: !!selectedOrderId && isAuthenticated && user?.role === "kitchen" }
  );

  const updateStatusMutation = trpc.admin.updateOrderStatus.useMutation();

  if (!isAuthenticated || user?.role !== "kitchen") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto">
          <p className="text-center text-gray-600">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </div>
    );
  }

  const pendingOrders = orders?.filter(
    (o) => o.status === "confirmed" || o.status === "preparing"
  ) || [];

  const handleMarkAsPreparing = async (orderId: number) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status: "preparing",
      });
      toast.success("อัปเดตสถานะเป็น 'กำลังเตรียม'");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleMarkAsReady = async (orderId: number) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status: "ready",
      });
      toast.success("อัปเดตสถานะเป็น 'พร้อมส่ง'");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Kitchen Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>ออเดอร์ที่รอเตรียม</CardTitle>
                <CardDescription>
                  {pendingOrders.length} ออเดอร์
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-gray-600">กำลังโหลด...</p>
                ) : pendingOrders.length === 0 ? (
                  <p className="text-gray-600">ไม่มีออเดอร์ที่รอเตรียม</p>
                ) : (
                  <div className="space-y-4">
                    {pendingOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">ออเดอร์ #{order.id}</h3>
                          <Badge className="bg-purple-100 text-purple-800">
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(order.createdAt).toLocaleString("th-TH")}
                        </p>
                        <p className="text-sm text-gray-600">
                          ที่อยู่: {order.deliveryAddress}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Details & Actions */}
          <div>
            {selectedOrderId && orderDetails ? (
              <Card>
                <CardHeader>
                  <CardTitle>รายละเอียดออเดอร์</CardTitle>
                  <CardDescription>ออเดอร์ #{selectedOrderId}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">สถานะ</p>
                    <Badge className="bg-purple-100 text-purple-800">
                      {getStatusLabel(orderDetails.order.status)}
                    </Badge>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-semibold mb-2">รายการอาหาร</p>
                    <div className="space-y-2">
                      {orderDetails.items.map((item, index) => (
                        <div key={index} className="text-sm">
                          <p className="text-gray-600">รายการที่ {index + 1}</p>
                          <p className="font-semibold">จำนวน: {item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    {orderDetails.order.status === "confirmed" && (
                      <Button
                        className="w-full bg-purple-500 hover:bg-purple-600"
                        onClick={() => handleMarkAsPreparing(selectedOrderId)}
                        disabled={updateStatusMutation.isPending}
                      >
                        {updateStatusMutation.isPending ? "กำลังอัปเดต..." : "เริ่มเตรียม"}
                      </Button>
                    )}
                    {orderDetails.order.status === "preparing" && (
                      <Button
                        className="w-full bg-green-500 hover:bg-green-600"
                        onClick={() => handleMarkAsReady(selectedOrderId)}
                        disabled={updateStatusMutation.isPending}
                      >
                        {updateStatusMutation.isPending ? "กำลังอัปเดต..." : "พร้อมส่ง"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-600">เลือกออเดอร์เพื่อดูรายละเอียด</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
