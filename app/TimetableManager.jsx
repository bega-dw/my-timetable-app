'use client';

import React, { useState } from 'react';

export default function TimetableManager() {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState(null);
  const [selectedDay, setSelectedDay] = useState('월');
  
  // 요일 및 시간 옵션
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const timeOptions = Array.from({ length: 13 }, (_, i) => `${i + 9}:00`);

  // 요일별 데이터를 관리하기 위한 상태 (초기값)
  const [schedule, setSchedule] = useState({
    '월': [], '화': [], '수': [], '목': [], '금': [], '토': [], '일': []
  });

  const [newTime, setNewTime] = useState('');
  const [newSubject, setNewSubject] = useState('');

  // 일정 추가 함수
  const addSchedule = (e) => {
    e.preventDefault();
    if (!newTime || !newSubject) return;
    
    setSchedule(prev => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], { id: Date.now(), time: newTime, subject: newSubject, completedBy: [] }]
    }));
    setNewTime('');
    setNewSubject('');
  };

  // 체크 토글
  const toggleCheck = (id) => {
    setSchedule(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map(item => 
        item.id === id 
          ? { ...item, completedBy: item.completedBy.includes(userId) 
              ? item.completedBy.filter(u => u !== userId) 
              : [...item.completedBy, userId] }
          : item
      )
    }));
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4 text-center">로그인</h1>
          <input className="w-full p-3 border rounded-lg mb-4" placeholder="ID 입력 (admin/학생)" onChange={(e) => setUserId(e.target.value)} />
          <button className="w-full py-3 bg-blue-600 text-white rounded-lg" onClick={() => setRole(userId === 'admin' ? 'admin' : 'student')}>로그인</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* 요일 탭 */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {days.map(day => (
            <button 
              key={day} 
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap ${selectedDay === day ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}
            >
              {day}요일
            </button>
          ))}
        </div>

        {/* 관리자 등록 폼 */}
{role === 'admin' && (
  <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
    <h2 className="text-lg font-bold mb-4">{selectedDay}요일 일정 추가</h2>
    <form onSubmit={addSchedule} className="flex gap-2">
      {/* 1. 시작 시간 */}
      <input 
        type="time" 
        value={newTime} 
        onChange={e => setNewTime(e.target.value)} 
        className="p-3 border rounded-lg" 
      />
      {/* 2. 내용 입력 */}
      <input 
        value={newSubject} 
        onChange={e => setNewSubject(e.target.value)} 
        className="flex-1 p-3 border rounded-lg" 
        placeholder="일정 내용" 
      />
      <button type="submit" className="px-6 bg-red-500 text-white rounded-lg">등록</button>
    </form>
  </div>
)}

        {/* 시간표 리스트 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold mb-4">{selectedDay}요일 시간표</h2>
          {schedule[selectedDay].map(item => (
            <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl mb-2">
              <div><strong>{item.time}</strong> - {item.subject}</div>
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