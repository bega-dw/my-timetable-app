'use client';
import React, { useState, useEffect } from 'react';

export default function TimetableManager() {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState(null);
  const [selectedDay, setSelectedDay] = useState('월');
  const [selectedDays, setSelectedDays] = useState(['월']);
  const [schedule, setSchedule] = useState({ '월': [], '화': [], '수': [], '목': [], '금': [], '토': [], '일': [] });
  const [newSubject, setNewSubject] = useState('');
  const [editingId, setEditingId] = useState(null);

  const API_URL = 'https://script.google.com/macros/s/AKfycbzpU9MVc6s3qQ04WWcslbkCtlu9qAXdcgUv_OfaIFHkErp5EQ4AxhMDcQnKyNEE1mbnoQ/exec';

  useEffect(() => {
    fetch(API_URL).then(res => res.json()).then(data => {
      const newSchedule = { '월': [], '화': [], '수': [], '목': [], '금': [], '토': [], '일': [] };
      data.forEach(row => {
        const [id, day, time, subject, completedBy] = row;
        if (newSchedule[day]) newSchedule[day].push({ id, time, subject, completedBy: completedBy ? String(completedBy).split(',') : [] });
      });
      setSchedule(newSchedule);
    });
  }, []);

  const days = ['월', '화', '수', '목', '금', '토', '일'];

  const addSchedule = async (e) => {
    e.preventDefault();
    const timeDisplay = `${e.target.startTime.value} ~ ${e.target.endTime.value}`;
    for (const day of selectedDays) {
      const newEntry = { id: Date.now() + Math.random(), day, time: timeDisplay, subject: newSubject, completedBy: [] };
      await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'add', ...newEntry }) });
      setSchedule(prev => ({ ...prev, [day]: [...prev[day], newEntry] }));
    }
    setNewSubject('');
  };

  const deleteSchedule = async (id) => {
    await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'delete', id }) });
    setSchedule(prev => { const next = { ...prev }; Object.keys(next).forEach(day => next[day] = next[day].filter(i => i.id !== id)); return next; });
  };

  const editSchedule = async (id, time, subject) => {
    await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'edit', id, time, subject }) });
    setSchedule(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(day => next[day] = next[day].map(i => i.id === id ? {...i, time, subject} : i));
      return next;
    });
    setEditingId(null);
  };

  const toggleCheck = async (id) => {
    const item = Object.values(schedule).flat().find(i => i.id === id);
    const newCompletedBy = item.completedBy.includes(userId) ? item.completedBy.filter(u => u !== userId) : [...item.completedBy, userId];
    await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'update', id, completedBy: newCompletedBy.join(',') }) });
    setSchedule(prev => { const next = { ...prev }; Object.keys(next).forEach(day => next[day] = next[day].map(i => i.id === id ? {...i, completedBy: newCompletedBy} : i)); return next; });
  };

  if (!role) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-200 text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">로그인</h1>
        <button className="w-full py-4 mb-3 bg-red-500 text-white font-bold rounded-xl" onClick={() => { setRole('admin'); setUserId('admin'); }}>관리자 모드</button>
        <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl" onClick={() => { setRole('student'); setUserId('찬교'); }}>찬교 입장</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {days.map(day => <button key={day} onClick={() => setSelectedDay(day)} className={`px-4 py-2 rounded-lg font-bold ${selectedDay === day ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'}`}>{day}요일</button>)}
        </div>

        {role === 'admin' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-gray-200">
            <h2 className="font-bold mb-3 text-gray-900">요일 선택 및 등록</h2>
            <div className="flex gap-2 mb-4 overflow-x-auto">{days.map(day => <button key={day} onClick={() => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])} className={`px-3 py-1 rounded border ${selectedDays.includes(day) ? 'bg-red-500 text-white' : 'bg-gray-100'}`}>{day}</button>)}</div>
            <form onSubmit={addSchedule} className="flex gap-2 mb-4">
              <input type="time" name="startTime" className="border border-gray-300 p-2 rounded" required />
              <input type="time" name="endTime" className="border border-gray-300 p-2 rounded" required />
              <input value={newSubject} onChange={e => setNewSubject(e.target.value)} className="flex-1 border border-gray-300 p-2 rounded" placeholder="내용" required />
              <button type="submit" className="bg-red-500 text-white px-4 rounded font-bold">등록</button>
            </form>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">{selectedDay}요일 시간표</h2>
          {schedule[selectedDay].sort((a,b) => a.time.localeCompare(b.time)).map(item => (
            // [수정된 부분] 완료 여부에 따라 배경색이 emerald-50으로 바뀝니다.
            <div key={item.id} className={`flex justify-between items-center p-4 rounded-xl mb-2 border ${item.completedBy.length > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
              {editingId === item.id ? (
                <div className="flex gap-2 flex-1 mr-2">
                  <input className="border p-1 w-20" defaultValue={item.time.split(' ~ ')[0]} id={`timeStart-${item.id}`} />
                  <input className="border p-1 w-20" defaultValue={item.time.split(' ~ ')[1]} id={`timeEnd-${item.id}`} />
                  <input className="border p-1 flex-1" defaultValue={item.subject} id={`sub-${item.id}`} />
                  <button onClick={() => editSchedule(item.id, `${document.getElementById(`timeStart-${item.id}`).value} ~ ${document.getElementById(`timeEnd-${item.id}`).value}`, document.getElementById(`sub-${item.id}`).value)} className="bg-green-500 text-white px-2 rounded">저장</button>
                </div>
              ) : (
                <div className="font-semibold text-gray-800"><strong>{item.time}</strong> - {item.subject}</div>
              )}
              <div className="flex items-center gap-2">
                {role === 'admin' && editingId !== item.id && (
                  <>
                    <button onClick={() => setEditingId(item.id)} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-bold">수정</button>
                    <button onClick={() => deleteSchedule(item.id)} className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-bold">삭제</button>
                  </>
                )}
                {role === 'student' && (
                  <button onClick={() => toggleCheck(item.id)} className={`px-4 py-2 rounded-lg font-bold transition-colors ${item.completedBy.includes(userId) ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {item.completedBy.includes(userId) ? '✅ 완료됨' : '⬜ 체크하기'}
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