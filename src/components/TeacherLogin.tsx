import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

interface TeacherLoginProps {
  onLogin: (data: { id: string; token: string }) => void;
  onBack: () => void;
}

export default function TeacherLogin({ onLogin, onBack }: TeacherLoginProps) {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!code || !password) return;
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        onLogin({ id: data.id, token: data.token });
      }
    } catch (e) {
      alert("Lỗi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 mt-10">
      <Button variant="ghost" onClick={onBack} className="mb-4">&larr; Quay lại</Button>
      <Card>
        <CardHeader>
          <CardTitle>Đăng Nhập Giáo Viên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mã Phòng Thi</label>
            <Input 
              className="text-base"
              value={code} 
              onChange={(e) => setCode(e.target.value.toUpperCase())} 
              placeholder="Nhập mã phòng (VD: A1B2C3)" 
              maxLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mật Khẩu Quản Trị</label>
            <Input 
              className="text-base"
              type="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Nhập mật khẩu đã tạo" 
            />
          </div>
          <Button className="w-full" onClick={handleLogin} disabled={loading || !code || !password}>
            {loading ? "Đang kiểm tra..." : "Đăng Nhập & Xem Báo Cáo"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
