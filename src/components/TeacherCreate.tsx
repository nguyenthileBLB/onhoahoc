import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

interface TeacherCreateProps {
  onCreated: (data: { id: string; code: string; token: string }) => void;
  onBack: () => void;
}

export default function TeacherCreate({ onCreated, onBack }: TeacherCreateProps) {
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [duration, setDuration] = useState(50);
  const [loading, setLoading] = useState(false);

  // Answer Key State
  const [part1, setPart1] = useState<Record<string, string>>({});
  const [part2, setPart2] = useState<Record<string, boolean>>({}); // key: p2_q19_a
  const [part3, setPart3] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    if (!title || !password) {
      alert("Vui lòng nhập tên đề thi và mật khẩu quản trị");
      return;
    }
    setLoading(true);
    try {
      const answer_key = { ...part1, ...part2, ...part3 };
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, password, duration_minutes: duration, answer_key }),
      });
      
      if (!res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          alert(data.error || "Lỗi tạo đề thi");
        } catch {
          alert("Lỗi máy chủ: " + text.substring(0, 100));
        }
        return;
      }

      const data = await res.json();
      onCreated({ id: data.id, code: data.code, token: data.admin_token });
    } catch (e: any) {
      console.error(e);
      alert("Lỗi kết nối: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Button variant="outline" onClick={onBack}>&larr; Back</Button>
      <Card>
        <CardHeader>
          <CardTitle>Tạo Đề Thi Mới</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên Đề Thi</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ví dụ: Thi Thử Hóa Học 2025" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mật Khẩu Quản Trị (để vào lại sau này)</label>
            <Input 
              type="text" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Nhập mật khẩu..." 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Thời Gian (phút)</label>
            <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </div>
        </CardContent>
      </Card>

      {/* Part 1 */}
      <Card>
        <CardHeader>
          <CardTitle>Phần I: Trắc Nghiệm (18 câu)</CardTitle>
          <p className="text-sm text-gray-500">Chọn đáp án đúng (A, B, C, D)</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 18 }, (_, i) => i + 1).map((q) => (
              <div key={q} className="flex flex-col items-center p-2 border rounded">
                <span className="font-bold mb-2">Câu {q}</span>
                <div className="flex gap-1">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPart1((prev) => ({ ...prev, [`p1_q${q}`]: opt }))}
                      className={`w-8 h-8 rounded-full text-xs font-bold ${
                        part1[`p1_q${q}`] === opt ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Part 2 */}
      <Card>
        <CardHeader>
          <CardTitle>Phần II: Đúng/Sai (4 câu)</CardTitle>
          <p className="text-sm text-gray-500">Mỗi câu có 4 ý a, b, c, d</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 4 }, (_, i) => i + 19).map((q) => (
            <div key={q} className="border p-4 rounded">
              <h4 className="font-bold mb-2">Câu {q}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['a', 'b', 'c', 'd'].map((sub) => (
                  <div key={sub} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="font-medium uppercase">{sub})</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPart2((prev) => ({ ...prev, [`p2_q${q}_${sub}`]: true }))}
                        className={`px-3 py-1 rounded text-sm ${
                          part2[`p2_q${q}_${sub}`] === true ? "bg-green-600 text-white" : "bg-gray-200"
                        }`}
                      >
                        Đúng
                      </button>
                      <button
                        onClick={() => setPart2((prev) => ({ ...prev, [`p2_q${q}_${sub}`]: false }))}
                        className={`px-3 py-1 rounded text-sm ${
                          part2[`p2_q${q}_${sub}`] === false ? "bg-red-600 text-white" : "bg-gray-200"
                        }`}
                      >
                        Sai
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Part 3 */}
      <Card>
        <CardHeader>
          <CardTitle>Phần III: Trả Lời Ngắn (6 câu)</CardTitle>
          <p className="text-sm text-gray-500">Nhập đáp án (số hoặc chữ)</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }, (_, i) => i + 23).map((q) => (
              <div key={q} className="flex items-center gap-4 border p-3 rounded">
                <span className="font-bold whitespace-nowrap">Câu {q}</span>
                <Input
                  placeholder="Nhập đáp án..."
                  value={part3[`p3_q${q}`] || ""}
                  onChange={(e) => setPart3((prev) => ({ ...prev, [`p3_q${q}`]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full py-6 text-lg" onClick={handleSubmit} disabled={loading}>
        {loading ? "Đang tạo..." : "Hoàn Tất & Tạo Phòng"}
      </Button>
    </div>
  );
}
