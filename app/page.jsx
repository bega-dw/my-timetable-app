'use client';

import React, { useState } from 'react';

export default function TimetableTodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Vercel 배포 세팅하기', completed: false },
    { id: 2, text: 'UI/UX 컴포넌트 점검', completed: true },
  ]);
  const [newTodo, setNewTodo] = useState('');

  const schedule = [
    { id: 1, time: '09:00 - 10:00', subject: '아침 회의 및 일정 정리' },
    { id: 2, time: '10:00 - 12:00', subject: '프론트엔드 개발' },
    { id: 3, time: '13:00 - 15:00', subject: '기획 및 디자인 리뷰' },
  ];

  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
    setNewTodo('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-gray-800">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 시간표 섹션 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-blue-600">오늘의 시간표</h2>
          <div className="space-y-3">
            {schedule.map((item) => (
              <div key={item.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="w-32 font-semibold text-blue-800 text-sm">{item.time}</div>
                <div className="flex-1 font-medium text-gray-700">{item.subject}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 할 일(Todo) 섹션 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-emerald-600">할 일 체크</h2>
          <form onSubmit={addTodo} className="flex mb-4 gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="새로운 할 일을 입력하세요"
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button type="submit" className="px-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600">
              추가
            </button>
          </form>

          <ul className="space-y-2">
            {todos.map((todo) => (
              <li key={todo.id} className={`flex items-center justify-between p-3 rounded-lg border ${todo.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleTodo(todo.id)}>
                  <div className={`w-5 h-5 flex items-center justify-center rounded border ${todo.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-400'}`}>
                    {todo.completed && '✓'}
                  </div>
                  <span className={`${todo.completed ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}>
                    {todo.text}
                  </span>
                </div>
                <button onClick={() => deleteTodo(todo.id)} className="text-red-400 hover:text-red-600 text-sm font-semibold">삭제</button>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}