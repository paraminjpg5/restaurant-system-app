import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  menuItemId: number;
  name: string;
  price: string;
  quantity: number;
  customizations: Record<number, number>;
}

export default function Checkout() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState("0");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrderMutation = trpc.orders.create.useMutation();

  useEffect(() => {
    const savedCart = sessionStorage.getItem("cart");
    const savedTotal = sessionStorage.getItem("cartTotal");

    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedTotal) setCartTotal(savedTotal);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error("กรุณากรอกที่อยู่จัดส่ง");
      return;
    }

    if (cart.length === 0) {
      toast.error("ตะกร้าว่างเปล่า");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createOrderMutation.mutateAsync({
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          customizations: JSON.stringify(item.customizations),
        })),
        totalPrice: cartTotal,
        deliveryAddress,
        paymentMethod,
      });

      toast.success("สั่งอาหารสำเร็จ!");
      sessionStorage.removeItem("cart");
      sessionStorage.removeItem("cartTotal");
      setLocation(`/order-tracking?id=${result.orderId}`);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("เกิดข้อผิดพลาดในการสั่งอาหาร");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">ชำระเงิน</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลการจัดส่ง</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address">ที่อยู่จัดส่ง</Label>
                    <Input
                      id="address"
                      placeholder="กรอกที่อยู่จัดส่ง"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>วิธีชำระเงิน</Label>
                    <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "cash" | "transfer")}>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="cursor-pointer flex-1">
                          เงินสด (COD)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="transfer" id="transfer" />
                        <Label htmlFor="transfer" className="cursor-pointer flex-1">
                          โอนเงิน
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg"
                    disabled={isSubmitting || createOrderMutation.isPending}
                  >
                    {isSubmitting || createOrderMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        กำลังสั่งอาหาร...
                      </>
                    ) : (
                      "สั่งออเดอร์"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>สรุปออเดอร์</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-semibold">฿{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>รวมทั้งสิ้น:</span>
                    <span className="text-orange-600">฿{cartTotal}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation("/menu")}
                >
                  ← กลับไปเลือกเมนู
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
