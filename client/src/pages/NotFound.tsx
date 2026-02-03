import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">ไม่พบหน้าที่คุณค้นหา</p>
        <Button
          className="bg-orange-500 hover:bg-orange-600"
          onClick={() => setLocation("/")}
        >
          กลับไปหน้าแรก
        </Button>
      </div>
    </div>
  );
}
