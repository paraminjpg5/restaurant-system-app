import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, ShoppingCart } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: categories, isLoading } = trpc.menu.categories.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-orange-600">🍜</div>
            <h1 className="text-2xl font-bold text-gray-900">Restaurant</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{user?.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/orders")}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Orders
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => setLocation("/menu")}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ยินดีต้อนรับสู่ร้านอาหาร
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            สั่งอาหารอร่อยๆ ส่งตรงถึงบ้านของคุณ
          </p>
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => setLocation("/menu")}
          >
            เริ่มสั่งอาหาร
          </Button>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">หมวดหมู่อาหาร</h3>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setLocation(`/menu?category=${category.id}`)}
                >
                  <CardHeader>
                    {category.image && (
                      <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/menu?category=${category.id}`);
                      }}
                    >
                      ดูเมนู
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">ไม่พบหมวดหมู่อาหาร</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
