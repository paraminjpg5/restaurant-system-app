import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Clock, Truck } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: categories, isLoading } = trpc.menu.categories.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-full mb-4">
                <ShoppingCart className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ระบบสั่งอาหารออนไลน์
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              สั่งอาหารอร่อยๆ ได้ที่บ้าน เร็ว สะดวก และสดใหม่
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <ShoppingCart className="w-8 h-8 text-orange-500 mb-2" />
                  <CardTitle>เลือกเมนูอร่อย</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    เมนูหลากหลายให้เลือก พร้อมปรับแต่งตามใจชอบ
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Clock className="w-8 h-8 text-blue-500 mb-2" />
                  <CardTitle>ติดตามออเดอร์</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    ติดตามสถานะการเตรียมอาหารแบบเรียลไทม์
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Truck className="w-8 h-8 text-green-500 mb-2" />
                  <CardTitle>จัดส่งรวดเร็ว</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    จัดส่งถึงบ้านของคุณอย่างรวดเร็ว
                  </p>
                </CardContent>
              </Card>
            </div>

            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => window.location.href = getLoginUrl()}
            >
              เข้าสู่ระบบและสั่งอาหาร
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ยินดีต้อนรับ, {user?.name || "เพื่อน"}!
          </h1>
          <p className="text-gray-600">
            เลือกหมวดหมู่อาหารที่คุณชอบและเริ่มสั่งอาหาร
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">กำลังโหลดเมนู...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories?.map((category) => (
              <Link key={category.id} href={`/menu?category=${category.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      ดูเมนู
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 flex gap-4 justify-center">
          <Link href="/orders">
            <Button variant="outline">ดูประวัติการสั่งซื้อ</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
