/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import TeacherCreate from "@/components/TeacherCreate";
import TeacherDashboard from "@/components/TeacherDashboard";
import TeacherEdit from "@/components/TeacherEdit";
import TeacherLogin from "@/components/TeacherLogin";
import StudentLogin from "@/components/StudentLogin";
import StudentExam from "@/components/StudentExam";
import StudentResult from "@/components/StudentResult";

type ViewState = 'home' | 'teacher-create' | 'teacher-login' | 'teacher-dashboard' | 'teacher-edit' | 'student-login' | 'student-exam' | 'student-result';

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  
  // Teacher State
  const [teacherData, setTeacherData] = useState<{ id: string; token: string } | null>(null);

  // Student State
  const [studentData, setStudentData] = useState<any>(null);
  const [examResult, setExamResult] = useState<any>(null);

  // Restore teacher session
  useEffect(() => {
    // Check URL params for recovery
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('admin_token');
    const urlExamId = params.get('exam_id');

    if (urlToken && urlExamId) {
      const session = { id: urlExamId, token: urlToken };
      setTeacherData(session);
      localStorage.setItem('teacher_session', JSON.stringify(session));
      // Clear URL
      window.history.replaceState({}, '', '/');
      setView('teacher-dashboard');
      return;
    }

    const saved = localStorage.getItem('teacher_session');
    if (saved) {
      setTeacherData(JSON.parse(saved));
      // Optionally ask if they want to resume, but for now just let them navigate manually or stay home
    }
  }, []);

  const handleTeacherCreated = (data: { id: string; code: string; token: string }) => {
    const session = { id: data.id, token: data.token };
    setTeacherData(session);
    localStorage.setItem('teacher_session', JSON.stringify(session));
    setView('teacher-dashboard');
  };

  const handleTeacherLogin = (data: { id: string; token: string }) => {
    const session = { id: data.id, token: data.token };
    setTeacherData(session);
    localStorage.setItem('teacher_session', JSON.stringify(session));
    setView('teacher-dashboard');
  };

  const handleTeacherLogout = () => {
    localStorage.removeItem('teacher_session');
    setTeacherData(null);
    setView('home');
  };

  // Check backend health
  const [backendError, setBackendError] = useState(false);
  useEffect(() => {
    fetch('/api/health')
      .then(res => {
        if (!res.ok) throw new Error('Backend not reachable');
        return res.json();
      })
      .catch(() => setBackendError(true));
  }, []);

  if (backendError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="max-w-md bg-white p-6 rounded-lg shadow-lg border border-red-200 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Lỗi Kết Nối Máy Chủ</h2>
          <p className="text-gray-700 mb-4">
            Ứng dụng này yêu cầu <strong>Máy chủ (Backend)</strong> để hoạt động.
          </p>
          <div className="text-left text-sm bg-gray-100 p-3 rounded mb-4">
            <p className="font-semibold mb-1">Nguyên nhân phổ biến:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Bạn đang chạy trên <strong>GitHub Pages</strong> hoặc hosting tĩnh (chỉ có Frontend).</li>
              <li>Máy chủ Node.js chưa được khởi động.</li>
            </ul>
          </div>
          <p className="text-sm text-gray-500">
            Vui lòng triển khai ứng dụng trên các nền tảng hỗ trợ Node.js như <strong>Render, Railway, Fly.io</strong> hoặc chạy cục bộ trên máy tính.
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">ChemExam 2025</h1>
              <p className="text-slate-500 max-w-md mx-auto">
                Hệ thống thi trắc nghiệm Hóa học THPT Quốc gia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">👨‍🏫</div>
                <h2 className="text-xl font-bold">Giáo Viên</h2>
                <p className="text-sm text-slate-500">Tạo đề thi, nhập đáp án và quản lý phòng thi.</p>
                <div className="flex flex-col w-full gap-2">
                  <Button onClick={() => setView('teacher-create')}>Tạo Phòng Mới</Button>
                  <Button variant="outline" onClick={() => setView('teacher-login')}>
                    Đăng Nhập (Vào Phòng Cũ)
                  </Button>
                  {teacherData && (
                    <Button variant="ghost" size="sm" onClick={() => setView('teacher-dashboard')}>
                      Quay lại phiên làm việc gần nhất &rarr;
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">👨‍🎓</div>
                <h2 className="text-xl font-bold">Học Sinh</h2>
                <p className="text-sm text-slate-500">Nhập mã phòng để bắt đầu làm bài thi.</p>
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setView('student-login')}>
                  Vào Thi Ngay
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 'teacher-create':
        return <TeacherCreate onCreated={handleTeacherCreated} onBack={() => setView('home')} />;
      
      case 'teacher-login':
        return <TeacherLogin onLogin={handleTeacherLogin} onBack={() => setView('home')} />;
      
      case 'teacher-dashboard':
        if (!teacherData) return <div onClick={() => setView('home')}>Error. Click to go home.</div>;
        return <TeacherDashboard 
          examId={teacherData.id} 
          token={teacherData.token} 
          onLogout={handleTeacherLogout} 
          onEdit={() => setView('teacher-edit')}
        />;

      case 'teacher-edit':
        if (!teacherData) return <div onClick={() => setView('home')}>Error. Click to go home.</div>;
        return <TeacherEdit 
          examId={teacherData.id} 
          token={teacherData.token} 
          onUpdated={() => setView('teacher-dashboard')}
          onBack={() => setView('teacher-dashboard')}
        />;
      
      case 'student-login':
        return <StudentLogin onBack={() => setView('home')} onJoin={(data) => {
          setStudentData(data);
          setView('student-exam');
        }} />;
      
      case 'student-exam':
        return <StudentExam 
          {...studentData} 
          onFinished={(res) => {
            setExamResult(res);
            setView('student-result');
          }} 
        />;
      
      case 'student-result':
        return <StudentResult result={examResult} onHome={() => setView('home')} />;
        
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {renderContent()}
    </div>
  );
}

