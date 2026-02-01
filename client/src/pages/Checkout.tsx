import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
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

export default function Checkout() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrderMutation = trpc.orders.create.useMutation();

  const searchParams = new URLSearchParams(window.location.search);
  const cartData = searchParams.get("cart");
  const cart: CartItem[] = cartData ? JSON.parse(cartData) : [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto">
          <p className="text-center text-gray-600">กรุณาเข้าสู่ระบบก่อน</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto">
          <p className="text-center text-gray-600">ไม่มีรายการในตะกร้า</p>
        </div>
      </div>
    );
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deliveryAddress.trim()) {
      toast.error("กรุณากรอกที่อยู่จัดส่ง");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createOrderMutation.mutateAsync({
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price.toString(),
          customizations: item.customizations,
        })),
        totalPrice: totalPrice.toString(),
        deliveryAddress,
        paymentMethod: paymentMethod as "cash" | "transfer",
      });

      toast.success("สั่งอาหารสำเร็จ!");
      navigate(`/order-tracking?id=${result.orderId}`);
    } catch (error) {
      console.error(error);
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
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>รายการอาหาร</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center pb-4 border-b">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-600">จำนวน: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">฿{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>ที่อยู่จัดส่ง</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">ที่อยู่</Label>
                    <Textarea
                      id="address"
                      placeholder="กรุณากรอกที่อยู่จัดส่ง"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">หมายเหตุ (ไม่บังคับ)</Label>
                    <Textarea
                      id="notes"
                      placeholder="เช่น ห้ามใส่น้ำปลา"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>วิธีชำระเงิน</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="cursor-pointer">
                      เงินสด (จ่ายเมื่อรับสินค้า)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer" className="cursor-pointer">
                      โอนเงิน
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Total */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>สรุปการสั่งซื้อ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">ราคาสินค้า</span>
                  <span className="font-semibold">฿{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ค่าจัดส่ง</span>
                  <span className="font-semibold">฿0.00</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="font-semibold">รวมทั้งหมด</span>
                  <span className="text-2xl font-bold text-orange-500">
                    ฿{totalPrice.toFixed(2)}
                  </span>
                </div>

                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "กำลังประมวลผล..." : "สั่งออเดอร์"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
