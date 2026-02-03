import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function Orders() {
  const [, setLocation] = useLocation();
  const { data: orders, isLoading } = trpc.orders.list.useQuery();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ประวัติการสั่งซื้อ</h1>
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
          >
            ← กลับไปหน้าแรก
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setLocation(`/order-tracking?id=${order.id}`)}
              >
                <CardHeader>
                  <CardTitle>ออเดอร์ #{order.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">สถานะ</p>
                    <p className="font-semibold text-orange-600">{order.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ราคารวม</p>
                    <p className="font-semibold">฿{order.totalPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ที่อยู่จัดส่ง</p>
                    <p className="text-sm">{order.deliveryAddress}</p>
                  </div>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/order-tracking?id=${order.id}`);
                    }}
                  >
                    ดูรายละเอียด
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">ยังไม่มีประวัติการสั่งซื้อ</p>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => setLocation("/menu")}
            >
              เริ่มสั่งอาหาร
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
