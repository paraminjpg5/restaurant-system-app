import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

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

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  const { data: orders, isLoading, refetch } = trpc.admin.allOrders.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: orderDetails } = trpc.admin.orderDetails.useQuery(
    { orderId: selectedOrderId || 0 },
    { enabled: !!selectedOrderId && isAuthenticated && user?.role === "admin" }
  );

  const updateStatusMutation = trpc.admin.updateOrderStatus.useMutation();

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto">
          <p className="text-center text-gray-600">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </div>
    );
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrderId || !newStatus) {
      toast.error("กรุณาเลือกสถานะใหม่");
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        orderId: selectedOrderId,
        status: newStatus as any,
      });
      toast.success("อัปเดตสถานะสำเร็จ");
      setNewStatus("");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>รายการออเดอร์ทั้งหมด</CardTitle>
                <CardDescription>
                  {orders?.length || 0} ออเดอร์
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-gray-600">กำลังโหลด...</p>
                ) : !orders || orders.length === 0 ? (
                  <p className="text-gray-600">ไม่มีออเดอร์</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">ออเดอร์ #{order.id}</h3>
                          <Badge className={getStatusBadgeColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(order.createdAt).toLocaleString("th-TH")}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {order.deliveryAddress}
                        </p>
                        <p className="font-semibold text-orange-500">
                          ฿{order.totalPrice}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div>
            {selectedOrderId && orderDetails ? (
              <Card>
                <CardHeader>
                  <CardTitle>รายละเอียดออเดอร์</CardTitle>
                  <CardDescription>ออเดอร์ #{selectedOrderId}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">สถานะปัจจุบัน</p>
                    <Badge className={getStatusBadgeColor(orderDetails.order.status)}>
                      {getStatusLabel(orderDetails.order.status)}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">เปลี่ยนสถานะเป็น</p>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสถานะใหม่" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">รอยืนยัน</SelectItem>
                        <SelectItem value="confirmed">ยืนยันแล้ว</SelectItem>
                        <SelectItem value="preparing">กำลังเตรียม</SelectItem>
                        <SelectItem value="ready">พร้อมส่ง</SelectItem>
                        <SelectItem value="delivering">กำลังจัดส่ง</SelectItem>
                        <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                        <SelectItem value="cancelled">ยกเลิก</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    onClick={handleUpdateStatus}
                    disabled={updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending ? "กำลังอัปเดต..." : "อัปเดตสถานะ"}
                  </Button>

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

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-1">ที่อยู่จัดส่ง</p>
                    <p className="text-sm">{orderDetails.order.deliveryAddress}</p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-1">ราคารวม</p>
                    <p className="text-lg font-bold text-orange-500">
                      ฿{orderDetails.order.totalPrice}
                    </p>
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
