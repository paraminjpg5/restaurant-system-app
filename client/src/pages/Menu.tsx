import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";
import { Loader2, ShoppingCart, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  menuItemId: number;
  name: string;
  price: string;
  quantity: number;
  customizations: Record<number, number>;
}

export default function Menu() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<number, number>>({});

  const { data: categories, isLoading: categoriesLoading } = trpc.menu.categories.useQuery();
  const { data: menuItems, isLoading: itemsLoading } = trpc.menu.itemsByCategory.useQuery(
    { categoryId: selectedCategory || 0 },
    { enabled: !!selectedCategory }
  );
  const { data: itemDetails } = trpc.menu.itemDetails.useQuery(
    { itemId: selectedItem || 0 },
    { enabled: !!selectedItem }
  );

  const activeCategory = selectedCategory || categories?.[0]?.id;
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0).toFixed(2);
  }, [cart]);

  const handleAddToCart = () => {
    if (!itemDetails) return;

    const item = itemDetails.item;
    const existingItem = cart.find((ci) => ci.menuItemId === item.id);

    if (existingItem) {
      setCart(
        cart.map((ci) =>
          ci.menuItemId === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        )
      );
    } else {
      setCart([
        ...cart,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          customizations: selectedCustomizations,
        },
      ]);
    }

    toast.success(`${item.name} เพิ่มลงตะกร้าแล้ว`);
    setSelectedItem(null);
    setSelectedCustomizations({});
  };

  const handleRemoveFromCart = (menuItemId: number) => {
    setCart(cart.filter((item) => item.menuItemId !== menuItemId));
    toast.success("ลบออกจากตะกร้าแล้ว");
  };

  const handleUpdateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(menuItemId);
    } else {
      setCart(
        cart.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      return;
    }

    if (cart.length === 0) {
      toast.error("กรุณาเลือกอาหารก่อน");
      return;
    }

    sessionStorage.setItem("cart", JSON.stringify(cart));
    sessionStorage.setItem("cartTotal", cartTotal);
    setLocation("/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setLocation("/")}>
              ← กลับ
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">เมนูอาหาร</h1>
          </div>
          {cart.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-500">{cart.length}</Badge>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={handleCheckout}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                ชำระเงิน (฿{cartTotal})
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <h3 className="font-bold text-lg mb-4">หมวดหมู่</h3>
              <div className="space-y-2">
                {categoriesLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  categories?.map((category) => (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {itemsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : menuItems && menuItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuItems.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedItem(item.id)}
                  >
                    <CardHeader>
                      {item.image && (
                        <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardTitle>{item.name}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-orange-600">
                          ฿{item.price}
                        </span>
                        <Button
                          className="bg-orange-500 hover:bg-orange-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item.id);
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">ไม่พบเมนูอาหาร</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          {itemDetails && (
            <>
              <DialogHeader>
                <DialogTitle>{itemDetails.item.name}</DialogTitle>
                <DialogDescription>{itemDetails.item.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {itemDetails.item.image && (
                  <img
                    src={itemDetails.item.image}
                    alt={itemDetails.item.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}

                <div className="text-2xl font-bold text-orange-600">
                  ฿{itemDetails.item.price}
                </div>

                {itemDetails.customizationOptions.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">ปรับแต่ง</h4>
                    {itemDetails.customizationOptions.map((option) => (
                      <div key={option.id} className="space-y-2">
                        <p className="font-medium">{option.name}</p>
                        <div className="space-y-1">
                          {option.values.map((value) => (
                            <Button
                              key={value.id}
                              variant={
                                selectedCustomizations[option.id] === value.id
                                  ? "default"
                                  : "outline"
                              }
                              className="w-full justify-start"
                              onClick={() =>
                                setSelectedCustomizations({
                                  ...selectedCustomizations,
                                  [option.id]: value.id,
                                })
                              }
                            >
                              {value.value}
                              {value.priceModifier !== "0" && (
                                <span className="ml-auto text-sm">
                                  +฿{value.priceModifier}
                                </span>
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg"
                  onClick={handleAddToCart}
                >
                  เพิ่มลงตะกร้า
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {cart.length > 0 && (
        <div className="fixed right-0 top-0 w-80 h-screen bg-white shadow-lg overflow-y-auto">
          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
            <h3 className="font-bold text-lg">ตะกร้าสินค้า</h3>
          </div>

          <div className="p-4 space-y-4">
            {cart.map((item) => (
              <div key={item.menuItemId} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold">{item.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFromCart(item.menuItemId)}
                  >
                    ✕
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">฿{item.price}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateQuantity(item.menuItemId, item.quantity - 1)
                      }
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateQuantity(item.menuItemId, item.quantity + 1)
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white">
            <div className="flex justify-between items-center mb-4 text-lg font-bold">
              <span>รวม:</span>
              <span className="text-orange-600">฿{cartTotal}</span>
            </div>
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 h-12"
              onClick={handleCheckout}
            >
              ชำระเงิน
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
