'use client';

import React, { useState, useEffect } from 'react';

export default function TimetableManager() {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState(null);
  const [selectedDay, setSelectedDay] = useState('월');
  const [schedule, setSchedule] = useState({
    '월': [], '화': [], '수': [], '목': [], '금': [], '토': [], '일': []
  });
  const [newSubject, setNewSubject] = useState('');

  // 1. 데이터 불러오기 (초기화)
  useEffect(() => {
    // 여기에 실제 구글 시트 URL을 넣으세요
    const fetchUrl = 'https://script.google.com/macros/s/AKfycbz-uNC7n4WriQL8uPWO0njxTo1ZntMfu2X7wsrgI-CIl8wiyKCWmenCgm0LZglhk_KWpA/exec';
    
    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => {
        // 여기에 데이터를 받아와서 setSchedule(data) 하는 로직을 구현하면 됩니다.
      })
      .catch(err => console.error("데이터 로드 실패:", err));
  }, []);

  const days = ['월', '화', '수', '목', '금', '토', '일'];

  // 일정 추가 함수
  const addSchedule = async (e) => {
    e.preventDefault();
    const startTime = e.target.startTime.value;
    const endTime = e.target.endTime.value;

    if (!startTime || !endTime || !newSubject) return;

    const timeDisplay = `${startTime} ~ ${endTime}`;
    const newEntry = { id: Date.now(), day: selectedDay, time: timeDisplay, subject: newSubject, completedBy: [] };

    // 서버에 저장 (실제 URL로 교체 필요)
    await fetch('https://script.google.com/macros/s/AKfycbz-uNC7n4WriQL8uPWO0njxTo1ZntMfu2X7wsrgI-CIl8wiyKCWmenCgm0LZglhk_KWpA/exec', {
      method: 'POST',
      body: JSON.stringify({ action: 'add', day: selectedDay, ...newEntry })
    });

    setSchedule(prev => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], newEntry]
    }));
    
    setNewSubject('');
  };

  // 삭제 함수
  const deleteSchedule = async (id) => {
    await fetch('https://script.google.com/macros/s/AKfycbz-uNC7n4WriQL8uPWO0njxTo1ZntMfu2X7wsrgI-CIl8wiyKCWmenCgm0LZglhk_KWpA/exec', {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', id: id })
    });

    setSchedule(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter(item => item.id !== id)
    }));
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
          <input className="w-full p-3 border rounded-lg mb-4" placeholder="ID 입력" onChange={(e) => setUserId(e.target.value)} />
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
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-gray-100">
            <h2 className="text-lg font-bold mb-4 text-red-500">{selectedDay}요일 일정 추가</h2>
            <form onSubmit={addSchedule} className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2">
                <input type="time" name="startTime" className="p-2 border border-gray-300 rounded-lg" required />
                <span className="text-gray-500">~</span>
                <input type="time" name="endTime" className="p-2 border border-gray-300 rounded-lg" required />
              </div>
              <input 
                value={newSubject} 
                onChange={e => setNewSubject(e.target.value)} 
                className="flex-1 min-w-[200px] p-2 border border-gray-300 rounded-lg" 
                placeholder="일정 내용" 
                required
              />
              <button type="submit" className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">등록</button>
            </form>
          </div>
        )}

        {/* 시간표 리스트 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold mb-4">{selectedDay}요일 시간표</h2>
          {schedule[selectedDay].map(item => (
            <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl mb-2">
              <div>
                <strong>{item.time}</strong> - {item.subject}
              </div>
              <div className="flex items-center gap-2">
                {role === 'admin' && (
                  <button onClick={() => deleteSchedule(item.id)} className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-bold">삭제</button>
                )}
                {role === 'student' && (
                  <button onClick={() => toggleCheck(item.id)} className={`px-4 py-2 rounded-lg ${item.completedBy.includes(userId) ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                    {item.completedBy.includes(userId) ? '✅ 완료' : '⬜ 체크'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}