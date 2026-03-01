import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

interface TeacherEditProps {
  examId: string;
  token: string;
  onUpdated: () => void;
  onBack: () => void;
}

export default function TeacherEdit({ examId, token, onUpdated, onBack }: TeacherEditProps) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(50);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Answer Key State
  const [part1, setPart1] = useState<Record<string, string>>({});
  const [part2, setPart2] = useState<Record<string, boolean>>({});
  const [part3, setPart3] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`/api/exams/${examId}/admin?token=${token}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title);
          setDuration(data.duration_minutes);
          
          // Parse key back to parts
          const key = data.answer_key;
          const p1: any = {};
          const p2: any = {};
          const p3: any = {};
          
          Object.keys(key).forEach(k => {
            if (k.startsWith('p1_')) p1[k] = key[k];
            else if (k.startsWith('p2_')) p2[k] = key[k];
            else if (k.startsWith('p3_')) p3[k] = key[k];
          });
          
          setPart1(p1);
          setPart2(p2);
          setPart3(p3);
        }
      } catch (e) {
        alert("Failed to load exam");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const answer_key = { ...part1, ...part2, ...part3 };
      const res = await fetch(`/api/exams/${examId}?token=${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, duration_minutes: duration, answer_key }),
      });
      if (res.ok) {
        alert("Cập nhật thành công!");
        onUpdated();
      } else {
        alert("Lỗi cập nhật");
      }
    } catch (e) {
      alert("Error updating exam");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>&larr; Hủy Bỏ</Button>
        <h1 className="text-2xl font-bold">Chỉnh Sửa Đề Thi</h1>
        <div className="w-20"></div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <label className="block text-sm font-medium mb-1">Tên Đề Thi</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
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
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }, (_, i) => i + 23).map((q) => (
              <div key={q} className="flex items-center gap-4 border p-3 rounded">
                <span className="font-bold whitespace-nowrap">Câu {q}</span>
                <Input
                  value={part3[`p3_q${q}`] || ""}
                  onChange={(e) => setPart3((prev) => ({ ...prev, [`p3_q${q}`]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center">
        <Button className="w-full max-w-md py-6 text-lg" onClick={handleSave} disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
        </Button>
      </div>
    </div>
  );
}
