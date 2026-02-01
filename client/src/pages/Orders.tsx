import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

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

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const { data: orders, isLoading } = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto">
          <p className="text-center text-gray-600">กรุณาเข้าสู่ระบบก่อน</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">ประวัติการสั่งซื้อ</h1>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">กำลังโหลด...</p>
          </div>
        ) : !orders || orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">ยังไม่มีประวัติการสั่งซื้อ</p>
              <Link href="/">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  ไปสั่งอาหาร
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/order-tracking?id=${order.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          ออเดอร์ #{order.id}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {new Date(order.createdAt).toLocaleString("th-TH")}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {order.deliveryAddress}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-500 mb-2">
                          ฿{order.totalPrice}
                        </p>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
