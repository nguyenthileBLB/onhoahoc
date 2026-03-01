import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

interface StudentLoginProps {
  onJoin: (data: { examId: string; studentName: string; submissionId: string; startTime: string; duration: number; title: string }) => void;
  onBack: () => void;
}

export default function StudentLogin({ onJoin, onBack }: StudentLoginProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [examInfo, setExamInfo] = useState<any>(null);

  const checkCode = async () => {
    if (!code) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/exams/code/${code.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        setExamInfo(data);
      } else {
        alert("Mã phòng không tồn tại");
        setExamInfo(null);
      }
    } catch (e) {
      alert("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!name || !examInfo) return;
    setLoading(true);
    try {
      const res = await fetch("/api/submissions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam_id: examInfo.id, student_name: name }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        onJoin({
          examId: examInfo.id,
          studentName: name,
          submissionId: data.id,
          startTime: data.start_time,
          duration: examInfo.duration_minutes,
          title: examInfo.title
        });
      }
    } catch (e) {
      alert("Không thể bắt đầu thi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 mt-10">
      <Button variant="ghost" onClick={onBack} className="mb-4">&larr; Quay lại</Button>
      <Card>
        <CardHeader>
          <CardTitle>Vào Phòng Thi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!examInfo ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Mã Phòng</label>
                <Input 
                  className="text-base"
                  value={code} 
                  onChange={(e) => setCode(e.target.value.toUpperCase())} 
                  placeholder="Nhập mã 6 ký tự" 
                  maxLength={6}
                />
              </div>
              <Button className="w-full" onClick={checkCode} disabled={loading || !code}>
                Kiểm Tra Mã
              </Button>
            </>
          ) : (
            <>
              <div className="bg-green-50 p-4 rounded border border-green-200 text-center">
                <p className="text-green-800 font-bold">{examInfo.title}</p>
                <p className="text-sm text-green-600">Thời gian: {examInfo.duration_minutes} phút</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Họ và Tên</label>
                <Input 
                  className="text-base"
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Nhập họ tên đầy đủ" 
                />
              </div>
              <Button className="w-full" onClick={handleStart} disabled={loading || !name}>
                Bắt Đầu Làm Bài
              </Button>
              <Button variant="outline" className="w-full mt-2" onClick={() => setExamInfo(null)}>
                Chọn Phòng Khác
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
