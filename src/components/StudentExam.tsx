import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

interface StudentExamProps {
  submissionId: string;
  startTime: string;
  duration: number; // minutes
  title: string;
  studentName: string;
  onFinished: (result: any) => void;
}

export default function StudentExam({ submissionId, startTime, duration, title, studentName, onFinished }: StudentExamProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const end = start + duration * 60 * 1000;
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.ceil((end - now) / 1000);
      if (diff <= 0) {
        setTimeLeft(0);
        handleSubmit(); // Auto submit
        clearInterval(timer);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, duration]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        setSubmitting(false);
      } else {
        onFinished(data);
      }
    } catch (e) {
      alert("Lỗi nộp bài. Vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20 space-y-6">
      <div className="sticky top-0 z-10 bg-white shadow p-4 rounded-b-lg flex justify-between items-center border-b">
        <div>
          <h2 className="font-bold text-lg truncate max-w-[200px] md:max-w-md">{title}</h2>
          <p className="text-sm text-gray-500">{studentName}</p>
        </div>
        <div className={`text-2xl font-mono font-bold ${timeLeft < 300 ? "text-red-600" : "text-blue-600"}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Part 1 */}
      <Card>
        <CardHeader>
          <CardTitle>Phần I: Trắc Nghiệm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 18 }, (_, i) => i + 1).map((q) => (
              <div key={q} className="flex flex-col items-center p-2 border rounded bg-gray-50">
                <span className="font-bold mb-2 text-sm">Câu {q}</span>
                <div className="grid grid-cols-2 gap-1 w-full">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers((prev) => ({ ...prev, [`p1_q${q}`]: opt }))}
                      className={`h-8 rounded text-xs font-bold transition-colors ${
                        answers[`p1_q${q}`] === opt 
                          ? "bg-blue-600 text-white" 
                          : "bg-white border hover:bg-gray-100"
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
          <CardTitle>Phần II: Đúng/Sai</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 4 }, (_, i) => i + 19).map((q) => (
            <div key={q} className="border p-4 rounded bg-gray-50">
              <h4 className="font-bold mb-2">Câu {q}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['a', 'b', 'c', 'd'].map((sub) => (
                  <div key={sub} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="font-medium uppercase mr-2">{sub})</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAnswers((prev) => ({ ...prev, [`p2_q${q}_${sub}`]: true }))}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          answers[`p2_q${q}_${sub}`] === true ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        Đúng
                      </button>
                      <button
                        onClick={() => setAnswers((prev) => ({ ...prev, [`p2_q${q}_${sub}`]: false }))}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          answers[`p2_q${q}_${sub}`] === false ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
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
          <CardTitle>Phần III: Trả Lời Ngắn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }, (_, i) => i + 23).map((q) => (
              <div key={q} className="flex items-center gap-4 border p-3 rounded bg-gray-50">
                <span className="font-bold whitespace-nowrap">Câu {q}</span>
                <Input
                  className="bg-white text-base"
                  placeholder="Nhập đáp án..."
                  value={answers[`p3_q${q}`] || ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [`p3_q${q}`]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg flex justify-center pb-8 md:pb-4 safe-area-bottom z-50">
        <Button 
          className={`w-full max-w-md py-6 text-lg transition-all ${confirming ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-green-600 hover:bg-green-700"}`}
          onClick={() => {
            if (confirming) {
              handleSubmit();
            } else {
              setConfirming(true);
              // Reset confirmation after 3 seconds
              setTimeout(() => setConfirming(false), 3000);
            }
          }}
          disabled={submitting}
        >
          {submitting ? "Đang nộp..." : (confirming ? "Bấm Lần Nữa Để Xác Nhận" : "Nộp Bài")}
        </Button>
      </div>
    </div>
  );
}
