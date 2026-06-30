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

  const API_URL = 'https://script.google.com/macros/s/AKfycbzYtubdzOTwImjvdZbr_ZlbIJBjhmU91JnZr9QM0XuVn-5yWmzgeq-nyun-rPumKcuiHQ/exec';

  // 5초마다 구글 시트에서 최신 데이터를 자동으로 가져오는 로직
  useEffect(() => {
    const fetchData = () => {
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
    };

    // 처음 켰을 때 한 번 가져옴
    fetchData();

    // 5초(5000ms)마다 fetchData 함수를 계속 실행 (자동 새로고침 핵심)
    const interval = setInterval(fetchData, 5000);

    // 화면 나갈 때 반복 종료
    return () => clearInterval(interval);
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

  const resetAttendance = async () => {
    if (!confirm("정말 모든 체크를 초기화하시겠습니까?")) return;
    await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'reset' }) });
    setSchedule(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(day => { newState[day] = newState[day].map(i => ({ ...i, completedBy: [] })); });
      return newState;
    });
  };

  const toggleCheck = async (id) => {
    const item = Object.values(schedule).flat().find(i => i.id === id);
    const isChecked = item.completedBy.length > 0;
    
    let newCompletedBy;
    if (isChecked) {
      newCompletedBy = []; 
    } else {
      const now = new Date();
      const timeStr = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      newCompletedBy = [`${userId}|${timeStr}`]; 
    }

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
            <button onClick={resetAttendance} className="w-full py-2 bg-gray-800 text-white rounded-lg font-bold">📅 주간 체크 전체 초기화</button>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">{selectedDay}요일 시간표</h2>
          {schedule[selectedDay].sort((a,b) => a.time.localeCompare(b.time)).map(item => {
            const isChecked = item.completedBy.length > 0;
            const checkRecord = item.completedBy[0];
            const checkedTime = checkRecord && checkRecord.includes('|') ? checkRecord.split('|')[1] : null;

            return (
              <div key={item.id} className={`flex justify-between items-center p-4 rounded-xl mb-2 border ${isChecked ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
                {editingId === item.id ? (
                  <div className="flex gap-2 flex-1 mr-2">
                    <input className="border p-1 w-20" defaultValue={item.time.split(' ~ ')[0]} id={`timeStart-${item.id}`} />
                    <input className="border p-1 w-20" defaultValue={item.time.split(' ~ ')[1]} id={`timeEnd-${item.id}`} />
                    <input className="border p-1 flex-1" defaultValue={item.subject} id={`sub-${item.id}`} />
                    <button onClick={() => editSchedule(item.id, `${document.getElementById(`timeStart-${item.id}`).value} ~ ${document.getElementById(`timeEnd-${item.id}`).value}`, document.getElementById(`sub-${item.id}`).value)} className="bg-green-500 text-white px-2 rounded">저장</button>
                  </div>
                ) : (
                  <div className="font-semibold text-gray-800">
                    <strong>{item.time}</strong> - {item.subject}
                    {role === 'admin' && checkedTime && (
                      <span className="ml-2 text-sm text-emerald-600 font-bold">({checkedTime} 체크됨)</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {role === 'admin' && editingId !== item.id && (
                    <>
                      <button onClick={() => setEditingId(item.id)} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-bold">수정</button>
                      <button onClick={() => deleteSchedule(item.id)} className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-bold">삭제</button>
                    </>
                  )}
                  {role === 'student' && (
                    <button onClick={() => toggleCheck(item.id)} className={`px-4 py-2 rounded-lg font-bold transition-colors ${isChecked ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                      {isChecked ? (checkedTime ? `✅ 완료 (${checkedTime})` : '✅ 완료') : '⬜ 체크하기'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}