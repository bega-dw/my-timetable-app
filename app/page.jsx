'use client';

import React, { useState } from 'react';

useEffect(() => {
    fetch('아까_복사한_웹앱_URL')
      .then(res => res.json())
      .then(data => {
        // 구글 시트 데이터를 앱 상태로 변환
        const formattedData = data.slice(1).map((row, index) => ({
          id: index,
          time: row[1],
          subject: row[2],
          completedBy: row[3] ? row[3].split(',') : []
        }));
        setSchedule(formattedData);
      });
  }, []);

  const addSchedule = async (e) => {
    e.preventDefault();
    const newEntry = { time: newTime, subject: newSubject, completedBy: '' };
    
    // 시트에 먼저 쏘고!
    await addScheduleToSheet(newEntry);
    
    // 화면에 바로 반영!
    setSchedule([...schedule, { ...newEntry, id: Date.now(), completedBy: [] }]);
    setNewTime('');
    setNewSubject('');
  };

export default function TimetableTodoApp() {
  // 1. 로그인 및 권한 상태 관리
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState(null); // 'admin' 또는 'student'

  // 2. 시간표 데이터 상태 관리 (completedBy 배열로 누가 체크했는지 기록)
  const [schedule, setSchedule] = useState([
    { id: 1, time: '09:00 - 10:00', subject: '아침 조회', completedBy: [] },
    { id: 2, time: '10:00 - 12:00', subject: '프론트엔드 실습', completedBy: [] },
  ]);

  // 3. 관리자용 입력 폼 상태
  const [newTime, setNewTime] = useState('');
  const [newSubject, setNewSubject] = useState('');

  // --- 함수 모음 ---

  const handleLogin = (e) => {
    e.preventDefault();
    if (!userId.trim()) return;
    // 아이디가 'admin'이면 관리자, 그 외에는 모두 학생으로 처리
    if (userId === 'admin') {
      setRole('admin');
    } else {
      setRole('student');
    }
  };

  const handleLogout = () => {
    setRole(null);
    setUserId('');
  };

  const addSchedule = (e) => {
    e.preventDefault();
    if (!newTime.trim() || !newSubject.trim()) return;
    setSchedule([
      ...schedule, 
      { id: Date.now(), time: newTime, subject: newSubject, completedBy: [] }
    ]);
    setNewTime('');
    setNewSubject('');
  };

  const toggleCheck = (id) => {
    setSchedule(schedule.map(item => {
      if (item.id === id) {
        // 현재 로그인한 학생이 이미 체크했는지 확인
        const isChecked = item.completedBy.includes(userId);
        const updatedCompletedBy = isChecked
          ? item.completedBy.filter(user => user !== userId) // 체크 해제
          : [...item.completedBy, userId]; // 체크 완료
        return { ...item, completedBy: updatedCompletedBy };
      }
      return item;
    }));
  };

  const deleteSchedule = (id) => {
    setSchedule(schedule.filter(item => item.id !== id));
  };

  // --- 화면 렌더링 ---

  // [화면 1] 로그인 페이지
  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">출석/시간표 시스템</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">아이디를 입력하세요</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="입력"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  // [화면 2] 메인 서비스 페이지 (관리자 & 학생 공통 뼈대)
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-gray-800">
      <div className="max-w-3xl mx-auto">
        
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
          <div>
            <span className="font-bold text-lg">{userId}</span> 님 접속중
            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              {role === 'admin' ? '관리자' : '학생'}
            </span>
          </div>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800 font-medium">로그아웃</button>
        </div>

        {/* 관리자 전용: 일정 추가 화면 */}
        {role === 'admin' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-xl font-bold mb-4 text-red-500">🛠️ 시간표 등록 (관리자용)</h2>
            <form onSubmit={addSchedule} className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="시간 (예: 13:00 - 14:00)"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="일정 내용을 입력하세요"
                className="flex-[2] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button type="submit" className="py-3 px-6 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">
                추가
              </button>
            </form>
          </div>
        )}

        {/* 공통: 시간표 및 체크 화면 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-blue-600">📅 오늘의 시간표</h2>
          <div className="space-y-3">
            {schedule.map((item) => {
              const isCheckedByMe = item.completedBy.includes(userId);
              
              return (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 flex-1">
                    <div className="w-32 font-bold text-blue-800">{item.time}</div>
                    <div className="font-medium text-gray-800 text-lg">{item.subject}</div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* 학생일 때만 체크 버튼 노출 */}
                    {role === 'student' && (
                      <button 
                        onClick={() => toggleCheck(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${isCheckedByMe ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}`}
                      >
                        {isCheckedByMe ? '✅ 완료됨' : '⬜ 체크하기'}
                      </button>
                    )}

                    {/* 관리자일 때는 삭제 버튼과 체크한 학생 수 노출 */}
                    {role === 'admin' && (
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-500">
                          체크 인원: {item.completedBy.length}명
                        </span>
                        <button onClick={() => deleteSchedule(item.id)} className="text-red-400 hover:text-red-600 font-bold text-sm">
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}