import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { X } from "lucide-react";

interface TeacherDashboardProps {
  examId: string;
  token: string;
  onLogout: () => void;
  onEdit: () => void;
}

export default function TeacherDashboard({ examId, token, onLogout, onEdit }: TeacherDashboardProps) {
  const [exam, setExam] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [examRes, subRes] = await Promise.all([
        fetch(`/api/exams/${examId}/admin?token=${token}`),
        fetch(`/api/exams/${examId}/submissions?token=${token}`)
      ]);
      
      if (examRes.ok) setExam(await examRes.json());
      if (subRes.ok) setSubmissions(await subRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [examId, token]);

  const handleExport = () => {
    if (submissions.length === 0) return;
    
    const headers = ["Học Sinh", "Điểm Tổng", "Phần I", "Phần II", "Phần III", "Thời Gian Nộp"];
    const csvContent = [
      headers.join(","),
      ...submissions.map(s => [
        `"${s.student_name}"`,
        s.score,
        s.score_details?.part1?.score || 0,
        s.score_details?.part2?.score || 0,
        s.score_details?.part3?.score || 0,
        `"${new Date(s.submit_time).toLocaleString()}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ket_qua_${exam.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  if (!exam) return <div className="p-8 text-center text-red-500">Không tìm thấy dữ liệu hoặc sai mã token.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bảng Điều Khiển Giáo Viên</h1>
        <Button variant="outline" onClick={onLogout}>Thoát</Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Mã Phòng Thi</p>
              <p className="text-4xl font-mono font-bold text-blue-700">{exam.code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tên Đề Thi</p>
              <p className="text-xl font-semibold">{exam.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Số Bài Nộp</p>
              <p className="text-4xl font-bold">{submissions.length}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-4">
             <Button variant="outline" onClick={onEdit}>Chỉnh Sửa Đáp Án / Cài Đặt</Button>
             <Button variant="default" onClick={handleExport} disabled={submissions.length === 0}>
               Tải Báo Cáo (CSV)
             </Button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Học sinh truy cập vào ứng dụng và nhập mã phòng: <span className="font-bold">{exam.code}</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Link quản trị (lưu lại để truy cập từ thiết bị khác): <br/>
              <span className="font-mono select-all bg-gray-100 p-1 rounded">
                {window.location.origin}?admin_token={token}&exam_id={examId}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Bài Thi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Học Sinh</th>
                  <th className="px-4 py-3">Điểm Tổng</th>
                  <th className="px-4 py-3">Phần I</th>
                  <th className="px-4 py-3">Phần II</th>
                  <th className="px-4 py-3">Phần III</th>
                  <th className="px-4 py-3">Thời Gian Nộp</th>
                  <th className="px-4 py-3">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{sub.student_name}</td>
                    <td className="px-4 py-3 font-bold text-blue-600">{sub.score}</td>
                    <td className="px-4 py-3">{sub.score_details?.part1?.score}</td>
                    <td className="px-4 py-3">{sub.score_details?.part2?.score}</td>
                    <td className="px-4 py-3">{sub.score_details?.part3?.score}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(sub.submit_time).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" onClick={() => setSelectedSub(sub)}>
                        Chi Tiết
                      </Button>
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Chưa có bài nộp nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Bài làm: {selectedSub.student_name}</h2>
                <p className="text-sm text-gray-500">Điểm: {selectedSub.score}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedSub(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              {/* Part 1 Detail */}
              <div>
                <h3 className="font-bold mb-2 text-blue-800">Phần I: Trắc Nghiệm</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {Array.from({ length: 18 }, (_, i) => i + 1).map((q) => {
                    const key = `p1_q${q}`;
                    const userAns = selectedSub.answers[key];
                    const correctAns = exam.answer_key[key];
                    const isCorrect = userAns === correctAns;
                    return (
                      <div key={q} className={`p-2 border rounded text-center ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="text-xs font-bold text-gray-500">Câu {q}</div>
                        <div className="font-bold">
                          {userAns || '-'} 
                          {!isCorrect && <span className="text-red-500 text-xs ml-1">({correctAns})</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Part 2 Detail */}
              <div>
                <h3 className="font-bold mb-2 text-blue-800">Phần II: Đúng/Sai</h3>
                <div className="space-y-4">
                  {Array.from({ length: 4 }, (_, i) => i + 19).map((q) => (
                    <div key={q} className="border p-3 rounded">
                      <div className="font-bold text-sm mb-2">Câu {q}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {['a', 'b', 'c', 'd'].map((sub) => {
                          const key = `p2_q${q}_${sub}`;
                          const userAns = selectedSub.answers[key];
                          const correctAns = exam.answer_key[key];
                          const isCorrect = userAns === correctAns;
                          return (
                            <div key={sub} className={`flex justify-between p-1 px-2 rounded text-sm ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                              <span>{sub})</span>
                              <span>
                                {userAns === true ? 'Đ' : userAns === false ? 'S' : '-'}
                                {!isCorrect && <span className="text-red-500 ml-2">({correctAns ? 'Đ' : 'S'})</span>}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Part 3 Detail */}
              <div>
                <h3 className="font-bold mb-2 text-blue-800">Phần III: Trả Lời Ngắn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }, (_, i) => i + 23).map((q) => {
                    const key = `p3_q${q}`;
                    const userAns = selectedSub.answers[key];
                    const correctAns = exam.answer_key[key];
                    const isCorrect = String(userAns || '').trim().toLowerCase() === String(correctAns || '').trim().toLowerCase();
                    return (
                      <div key={q} className={`p-3 border rounded ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="text-xs font-bold text-gray-500 mb-1">Câu {q}</div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{userAns || '(trống)'}</span>
                          {!isCorrect && <span className="text-red-600 text-sm font-bold">{correctAns}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <Button onClick={() => setSelectedSub(null)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
