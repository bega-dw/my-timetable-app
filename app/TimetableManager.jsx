'use client';

import React, { useState, useEffect } from 'react';

export default function TimetableManager() {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState(null);
  const [selectedDay, setSelectedDay] = useState('월');
  const [selectedDays, setSelectedDays] = useState(['월']);
  
  const [schedule, setSchedule] = useState({
    '월': [], '화': [], '수': [], '목': [], '금': [], '토': [], '일': []
  });
  const [newSubject, setNewSubject] = useState('');
  
  const API_URL = 'https://script.google.com/macros/s/AKfycbwnZrpVrhyVOM5Vq2yktPZKa1m_z1WnSP_v_fGyQJWqhlMV8Vbxvg8sHSd7td5UZf1lcw/exec';

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
      });
  }, []);

  const days = ['월', '화', '수', '목', '금', '토', '일'];

  const toggleDaySelection = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const addSchedule = async (e) => {
    e.preventDefault();
    const timeDisplay = `${e.target.startTime.value} ~ ${e.target.endTime.value}`;
    for (const day of selectedDays) {
      const newEntry = { id: Date.now() + Math.random(), day: day, time: timeDisplay, subject: newSubject, completedBy: [] };
      await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'add', ...newEntry }) });
      setSchedule(prev => ({ ...prev, [day]: [...prev[day], newEntry] }));
    }
    setNewSubject('');
  };

  const deleteSchedule = async (id) => {
    await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'delete', id: id }) });
    setSchedule(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(day => { next[day] = next[day].filter(i => i.id !== id); });
      return next;
    });
  };

  const resetAttendance = async () => {
    if (!confirm("정말 초기화하시겠습니까?")) return;
    await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'reset' }) });
    setSchedule(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(day => { newState[day] = newState[day].map(i => ({ ...i, completedBy: [] })); });
      return newState;
    });
  };

  const toggleCheck = async (id) => {
    const item = Object.values(schedule).flat().find(i => i.id === id);
    const newCompletedBy = item.completedBy.includes(userId) 
      ? item.completedBy.filter(u => u !== userId) 
      : [...item.completedBy, userId];

    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'update', id: id, completedBy: newCompletedBy.join(',') })
    });
    setSchedule(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(day => { next[day] = next[day].map(i => i.id === id ? { ...i, completedBy: newCompletedBy } : i); });
        return next;
    });
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center border border-gray-200">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">로그인</h1>
          <button className="w-full py-4 mb-3 bg-red-500 text-white font-bold rounded-xl" onClick={() => { setRole('admin'); setUserId('admin'); }}>관리자 모드</button>
          <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl" onClick={() => { setRole('student'); setUserId('찬교'); }}>찬교 입장</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {days.map(day => (
            <button key={day} onClick={() => setSelectedDay(day)} className={`px-4 py-2 rounded-lg font-bold ${selectedDay === day ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
              {day}요일
            </button>
          ))}
        </div>

        {role === 'admin' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-gray-200">
            <h2 className="font-bold mb-3 text-gray-900">등록할 요일 선택</h2>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {days.map(day => (
                <button key={day} onClick={() => toggleDaySelection(day)} className={`px-3 py-1 rounded border ${selectedDays.includes(day) ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {day}
                </button>
              ))}
            </div>
            <form onSubmit={addSchedule} className="flex gap-2 mb-4">
              <input type="time" name="startTime" className="border border-gray-300 p-2 rounded text-gray-900" required />
              <span className="text-gray-500 pt-2">~</span>
              <input type="time" name="endTime" className="border border-gray-300 p-2 rounded text-gray-900" required />
              <input value={newSubject} onChange={e => setNewSubject(e.target.value)} className="flex-1 border border-gray-300 p-2 rounded text-gray-900" placeholder="내용" required />
              <button type="submit" className="bg-red-500 text-white px-4 rounded font-bold">등록</button>
            </form>
            <button onClick={resetAttendance} className="w-full py-2 bg-gray-800 text-white rounded-lg font-bold">📅 주간 체크 전체 초기화</button>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-900">{selectedDay}요일 시간표</h2>
          {schedule[selectedDay].map(item => (
            <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl mb-2 border border-gray-100">
              <div className="text-gray-800"><strong>{item.time}</strong> - {item.subject}</div>
              <div className="flex items-center gap-2">
                {role === 'admin' && (
                  <>
                    <div className="text-xs text-gray-500 mr-2">완료: {item.completedBy.join(', ')}</div>
                    <button onClick={() => deleteSchedule(item.id)} className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm font-bold">삭제</button>
                  </>
                )}
                {role === 'student' && (
                  <button onClick={() => toggleCheck(item.id)} className={`px-4 py-2 rounded-lg font-medium ${item.completedBy.includes(userId) ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}`}>
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