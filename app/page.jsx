'use client';
import TimetableManager from './TimetableManager'; // 같은 폴더에 있다고 가정

export default function Page() {
  return <TimetableManager />;
}

import React, { useState, useEffect } from 'react';

export default function TimetableTodoApp() {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [newTime, setNewTime] = useState('');
  const [newSubject, setNewSubject] = useState('');

  // 1. 데이터 불러오기
  useEffect(() => {
    // 실제 사용하실 때는 '아까_복사한_웹앱_URL'을 실제 구글 Apps Script URL로 바꿔주세요!
    const fetchData = async () => {
      try {
        const response = await fetch('YOUR_APPS_SCRIPT_URL');
        const data = await response.json();
        // 데이터 구조에 맞춰 포맷팅
        const formattedData = data.slice(1).map((row, index) => ({
          id: index,
          time: row[1],
          subject: row[2],
          completedBy: row[3] ? row[3].split(',') : []
        }));
        setSchedule(formattedData);
      } catch (err) {
        console.log("데이터를 불러오지 못했습니다. URL을 확인해주세요.");
      }
    };
    fetchData();
  }, []);

  // 2. 함수들 (컴포넌트 내부로 이동 완료)
  const handleLogin = (e) => {
    e.preventDefault();
    if (!userId.trim()) return;
    setRole(userId === 'admin' ? 'admin' : 'student');
  };

  const handleLogout = () => {
    setRole(null);
    setUserId('');
  };

  const addSchedule = async (e) => {
    e.preventDefault();
    if (!newTime.trim() || !newSubject.trim()) return;
    
    // 시트에 추가하는 로직(아까 만든 addScheduleToSheet 함수 필요)
    const newEntry = { time: newTime, subject: newSubject, completedBy: '' };
    setSchedule([...schedule, { ...newEntry, id: Date.now(), completedBy: [] }]);
    setNewTime('');
    setNewSubject('');
  };

  const toggleCheck = (id) => {
    setSchedule(schedule.map(item => {
      if (item.id === id) {
        const isChecked = item.completedBy.includes(userId);
        return { 
          ...item, 
          completedBy: isChecked ? item.completedBy.filter(u => u !== userId) : [...item.completedBy, userId] 
        };
      }
      return item;
    }));
  };

  const deleteSchedule = (id) => {
    setSchedule(schedule.filter(item => item.id !== id));
  };

  // [화면 1] 로그인
  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">출석/시간표 시스템</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="아이디 입력"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg">로그인</button>
          </form>
        </div>
      </div>
    );
  }

  // [화면 2] 메인
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-gray-800">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6">
          <span>{userId} 님 접속중 ({role})</span>
          <button onClick={handleLogout} className="text-gray-500">로그아웃</button>
        </div>
        
        {role === 'admin' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
            <h2 className="text-xl font-bold mb-4">🛠️ 시간표 등록</h2>
            <form onSubmit={addSchedule} className="flex gap-3">
              <input value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="시간" className="p-3 border rounded-lg" />
              <input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="일정" className="p-3 border rounded-lg" />
              <button type="submit" className="bg-red-500 text-white px-6 rounded-lg">추가</button>
            </form>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          {schedule.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 mb-3 rounded-xl">
              <div>{item.time} - {item.subject}</div>
              {role === 'student' && (
                <button onClick={() => toggleCheck(item.id)} className={`px-4 py-2 rounded-lg ${item.completedBy.includes(userId) ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                  {item.completedBy.includes(userId) ? '✅ 완료' : '⬜ 체크'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}