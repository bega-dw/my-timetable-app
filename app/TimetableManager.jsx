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
  
  // [중요] 여기에 본인의 구글 웹 앱 URL을 넣으세요!
  const API_URL = 'https://gemini.google.com/app/0b59b9c1d57e3177https://script.google.com/macros/s/AKfycbwnZrpVrhyVOM5Vq2yktPZKa1m_z1WnSP_v_fGyQJWqhlMV8Vbxvg8sHSd7td5UZf1lcw/exec';

  // 1. 데이터 불러오기
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const newSchedule = { '월': [], '화': [], '수': [], '목': [], '금': [], '토': [], '일': [] };
        data.forEach(row => {
          const [id, day, time, subject, completedBy] = row;
          if (newSchedule[day]) {
            newSchedule[day].push({ id, time, subject, completedBy: completedBy ? String(completedBy).split(',') : [] });
          }
        });
        setSchedule(newSchedule);
      })
      .catch(err => console.error("데이터 로드 실패:", err));
  }, []);

  const days = ['월', '화', '수', '목', '금', '토', '일'];

  // 일정 추가
  const addSchedule = async (e) => {
    e.preventDefault();
    const timeDisplay = `${e.target.startTime.value} ~ ${e.target.endTime.value}`;
    const newEntry = { id: Date.now(), day: selectedDay, time: timeDisplay, subject: newSubject, completedBy: [] };

    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'add', ...newEntry })
    });

    setSchedule(prev => ({ ...prev, [selectedDay]: [...prev[selectedDay], newEntry] }));
    setNewSubject('');
  };

  // 삭제
  const deleteSchedule = async (id) => {
    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', id: id })
    });
    setSchedule(prev => ({ ...prev, [selectedDay]: prev[selectedDay].filter(i => i.id !== id) }));
  };

  // 초기화
  const resetAttendance = async () => {
    if (!confirm("모든 체크를 초기화할까요?")) return;
    await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'reset' }) });
    setSchedule(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(day => { newState[day] = newState[day].map(i => ({ ...i, completedBy: [] })); });
      return newState;
    });
  };

  // 체크/완료 처리
  const toggleCheck = async (id) => {
    const item = schedule[selectedDay].find(i => i.id === id);
    const isChecked = item.completedBy.includes(userId);
    const newCompletedBy = isChecked ? item.completedBy.filter(u => u !== userId) : [...item.completedBy, userId];

    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'update', id: id, completedBy: newCompletedBy.join(',') })
    });

    setSchedule(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map(i => i.id === id ? { ...i, completedBy: newCompletedBy } : i)
    }));
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm text-center">
          <h1 className="text-xl font-bold mb-4">로그인</h1>
          <input className="w-full p-3 border rounded-lg mb-4" placeholder="ID (admin 또는 찬교)" onChange={(e) => setUserId(e.target.value)} />
          <button className="w-full py-3 bg-blue-600 text-white rounded-lg" onClick={() => {
            if (userId === 'admin') setRole('admin');
            else if (userId === '찬교') { setRole('student'); setUserId('찬교'); }
            else alert('아이디 오류!');
          }}>로그인</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {days.map(day => (
            <button key={day} onClick={() => setSelectedDay(day)} className={`px-4 py-2 rounded-lg font-bold ${selectedDay === day ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
              {day}요일
            </button>
          ))}
        </div>

        {role === 'admin' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 border">
            <form onSubmit={addSchedule} className="flex gap-2 mb-4">
              <input type="time" name="startTime" className="border p-2 rounded" required />
              <span>~</span>
              <input type="time" name="endTime" className="border p-2 rounded" required />
              <input value={newSubject} onChange={e => setNewSubject(e.target.value)} className="flex-1 border p-2 rounded" placeholder="내용" required />
              <button type="submit" className="bg-red-500 text-white px-4 rounded">등록</button>
            </form>
            <button onClick={resetAttendance} className="w-full py-2 bg-gray-800 text-white rounded-lg font-bold">주간 전체 초기화</button>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold mb-4">{selectedDay}요일 시간표</h2>
          {schedule[selectedDay].map(item => (
            <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl mb-2">
              <div><strong>{item.time}</strong> - {item.subject}</div>
              <div className="flex items-center gap-2">
                {role === 'admin' && (
                  <>
                    <div className="text-xs text-gray-500 mr-2">완료: {item.completedBy.join(', ')}</div>
                    <button onClick={() => deleteSchedule(item.id)} className="bg-red-100 text-red-600 px-3 py-1 rounded">삭제</button>
                  </>
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