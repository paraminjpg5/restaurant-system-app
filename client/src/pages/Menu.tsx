import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  customizations: Record<string, string>;
}

export default function Menu() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [customizations, setCustomizations] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  const searchParams = new URLSearchParams(window.location.search);
  const categoryId = parseInt(searchParams.get("category") || "1");

  const { data: menuItems, isLoading } = trpc.menu.itemsByCategory.useQuery(
    { categoryId },
    { enabled: isAuthenticated }
  );

  const { data: itemDetails } = trpc.menu.itemDetails.useQuery(
    { menuItemId: selectedItemId || 0 },
    { enabled: !!selectedItemId }
  );

  const selectedItem = itemDetails?.item;

  const handleSelectItem = (item: any) => {
    setSelectedItemId(item.id);
    setCustomizations({});
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;

    const newItem: CartItem = {
      menuItemId: selectedItem.id,
      name: selectedItem.name,
      price: parseFloat(selectedItem.price),
      quantity,
      customizations,
    };

    setCart([...cart, newItem]);
    setSelectedItemId(null);
    toast.success(`${selectedItem.name} เพิ่มลงตะกร้าแล้ว`);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("กรุณาเลือกอาหารก่อน");
      return;
    }
    navigate("/checkout", { state: { cart } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">เมนูอาหาร</h1>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">{cart.length} รายการ</span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">กำลังโหลดเมนู...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems?.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSelectItem(item)}
              >
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-orange-500">
                      ฿{item.price}
                    </span>
                    <Button size="sm">เลือก</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedItemId} onOpenChange={() => setSelectedItemId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedItem?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">{selectedItem?.description}</p>

              {itemDetails?.customizations && itemDetails.customizations.length > 0 && (
                <div className="space-y-4">
                  {itemDetails.customizations.map((custom: any) => (
                    <div key={custom.customizationOptionId}>
                      <Label className="font-semibold mb-2 block">
                        {custom.customizationOptionId === 1
                          ? "ระดับความหวาน"
                          : "ท็อปปิ้ง"}
                      </Label>
                      <RadioGroup
                        value={customizations[custom.customizationOptionId] || ""}
                        onValueChange={(value) =>
                          setCustomizations({
                            ...customizations,
                            [custom.customizationOptionId]: value,
                          })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="default" id="default" />
                          <Label htmlFor="default">ค่าเริ่มต้น</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label className="font-semibold mb-2 block">จำนวน</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="text-2xl font-bold text-orange-500">
                รวม: ฿{(parseFloat(selectedItem?.price || "0") * quantity).toFixed(2)}
              </div>

              <Button
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={handleAddToCart}
              >
                เพิ่มลงตะกร้า
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="container mx-auto flex justify-between items-center">
              <div>
                <p className="text-gray-600">รวมทั้งหมด</p>
                <p className="text-3xl font-bold text-orange-500">
                  ฿{cart
                    .reduce((sum, item) => sum + item.price * item.quantity, 0)
                    .toFixed(2)}
                </p>
              </div>
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600"
                onClick={handleCheckout}
              >
                ดำเนินการชำระเงิน
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
