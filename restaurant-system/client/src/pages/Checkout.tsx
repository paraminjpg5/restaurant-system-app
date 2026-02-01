import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, MapPin, Loader2 } from "lucide-react";

export default function Checkout() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { cart, getTotalPrice, clearCart } = useCart();

  const [formData, setFormData] = useState({
    address: "",
    latitude: "",
    longitude: "",
    paymentMethod: "cash" as "cash" | "transfer",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const createOrderMutation = trpc.orders.create.useMutation();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <header className="bg-white border-b border-orange-100 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/cart")}
              className="p-0 h-auto"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">ชำระเงิน</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-600 mb-6">ตะกร้าว่างเปล่า โปรดเลือกเมนูก่อน</p>
            <Button
              onClick={() => navigate("/")}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              กลับไปเลือกเมนู
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("ไม่สามารถรับตำแหน่งปัจจุบันได้");
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.address.trim()) {
      alert("กรุณากรอกที่อยู่จัดส่ง");
      return;
    }

    setIsLoading(true);

    try {
      const orderItems = cart.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
        customizations: item.customizations,
      }));

      const result = await createOrderMutation.mutateAsync({
        items: orderItems,
        totalPrice: getTotalPrice().toFixed(2),
        paymentMethod: formData.paymentMethod,
        deliveryAddress: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        notes: formData.notes,
      });

      clearCart();
      if (result && (result as any).orderId) {
        navigate(`/order-tracking?id=${(result as any).orderId}`);
      } else {
        navigate("/order-tracking");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("เกิดข้อผิดพลาดในการสร้างออเดอร์");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <header className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/cart")}
            className="p-0 h-auto"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">ชำระเงิน</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card className="p-6 border-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900 mb-4">ที่อยู่จัดส่ง</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="address" className="font-semibold text-gray-900 mb-2 block">
                    ที่อยู่ *
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="เช่น 123 ซ.สุขุมวิท ถ.สุขุมวิท แขวงพระโขนง เขตคลองเตย กรุงเทพฯ 10110"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="min-h-24"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleGetLocation}
                  variant="outline"
                  className="w-full"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  ใช้ตำแหน่งปัจจุบัน (GPS)
                </Button>

                {formData.latitude && formData.longitude && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                    ✓ ตำแหน่ง: {formData.latitude}, {formData.longitude}
                  </div>
                )}
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6 border-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900 mb-4">วิธีชำระเงิน</h2>

              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentMethod: value as "cash" | "transfer",
                  }))
                }
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer font-semibold">
                      💵 เก็บเงินสด (COD)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer" className="flex-1 cursor-pointer font-semibold">
                      🏦 โอนเงินผ่านธนาคาร
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </Card>

            {/* Notes */}
            <Card className="p-6 border-0 bg-white">
              <h2 className="text-lg font-bold text-gray-900 mb-4">หมายเหตุ (ไม่บังคับ)</h2>

              <Textarea
                placeholder="เช่น ไม่ใส่ผักกาด, ไม่ใส่พริก, ฯลฯ"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                className="min-h-20"
              />
            </Card>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-0 bg-white shadow-lg sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">สรุปออเดอร์</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 max-h-64 overflow-y-auto">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-gray-600">x{item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ฿{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>รวมทั้งสิ้น:</span>
                  <span className="font-bold text-2xl text-orange-600">
                    ฿{getTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      กำลังสร้างออเดอร์...
                    </>
                  ) : (
                    "สั่งออเดอร์"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/cart")}
                  className="w-full"
                >
                  กลับไปตะกร้า
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
