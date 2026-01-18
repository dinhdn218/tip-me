'use client';

import { useState, useRef, useEffect } from 'react';
import { Activity } from '@/types';
import { UserPlus, X, DollarSign, Calendar, CheckCircle } from 'lucide-react';

interface AddActivityProps {
  onAdd: (activity: Activity) => void;
  existingParticipants: string[];
}

export default function AddActivity({ onAdd, existingParticipants }: AddActivityProps) {
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [participantInput, setParticipantInput] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Format number to Vietnamese currency format
  const formatCurrency = (value: string): string => {
    const number = value.replace(/\D/g, '');
    if (!number) return '';
    return new Intl.NumberFormat('vi-VN').format(parseInt(number));
  };

  // Handle amount input with formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, '');
    setTotalAmount(numericValue);
    setDisplayAmount(formatCurrency(numericValue));
  };

  // Handle participant input and show suggestions
  const handleParticipantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setParticipantInput(value);

    if (value.trim()) {
      const filtered = existingParticipants.filter(
        name => 
          name.toLowerCase().includes(value.toLowerCase()) &&
          !participants.includes(name)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Select suggestion
  const selectSuggestion = (name: string) => {
    setParticipantInput(name);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddParticipant = () => {
    if (participantInput.trim() && !participants.includes(participantInput.trim())) {
      setParticipants([...participants, participantInput.trim()]);
      setParticipantInput('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveParticipant = (name: string) => {
    setParticipants(participants.filter(p => p !== name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !totalAmount || participants.length === 0) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const amount = parseFloat(totalAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Số tiền không hợp lệ!');
      return;
    }

    const activity: Activity = {
      id: Date.now().toString(),
      title: title.trim(),
      totalAmount: amount,
      participants: participants.map(name => ({ name, paid: false })),
      date: new Date(selectedDate).toISOString(),
      amountPerPerson: amount / participants.length,
    };

    onAdd(activity);
    
    // Reset form
    setTitle('');
    setTotalAmount('');
    setDisplayAmount('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setParticipants([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="group">
        <label className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 tracking-tight">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          Tên hoạt động
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="VD: Đi ăn tối, Đi chơi..."
          className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 dark:bg-gray-900/50 dark:text-white transition-all duration-300 placeholder:text-gray-400 font-semibold tracking-tight hover:border-violet-300 dark:hover:border-violet-700"
        />
      </div>

      <div className="group">
        <label className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 tracking-tight">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          Ngày diễn ra
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 dark:bg-gray-900/50 dark:text-white transition-all duration-300 font-semibold tracking-tight hover:border-violet-300 dark:hover:border-violet-700"
        />
      </div>

      <div className="group">
        <label className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 tracking-tight">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          Tổng tiền (VNĐ)
        </label>
        <div className="relative">
          <input
            type="text"
            value={displayAmount}
            onChange={handleAmountChange}
            placeholder="500,000"
            className="w-full px-6 py-5 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 dark:bg-gray-900/50 dark:text-white transition-all duration-300 placeholder:text-gray-400 text-2xl font-black tracking-tight hover:border-violet-300 dark:hover:border-violet-700"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-bold rounded-full">
            VNĐ
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 tracking-tight">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg">
            <UserPlus className="w-4 h-4 text-white" />
          </div>
          Người tham gia
          <span className="px-3 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full text-xs font-black shadow-lg">
            {participants.length}
          </span>
        </label>
        <div className="flex gap-3 mb-5 relative">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={participantInput}
              onChange={handleParticipantInputChange}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
              placeholder="Nhập tên người tham gia"
              className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 dark:bg-gray-900/50 dark:text-white transition-all duration-300 placeholder:text-gray-400 font-semibold tracking-tight hover:border-violet-300 dark:hover:border-violet-700"
            />
            {/* Autocomplete suggestions */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-2 border-violet-300 dark:border-violet-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                {filteredSuggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => selectSuggestion(name)}
                    className="w-full px-5 py-4 text-left hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all duration-300 flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 last:border-0 group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-gray-800 dark:text-white tracking-tight">{name}</span>
                    <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 font-semibold">Đã từng tham gia</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddParticipant}
            className="flex items-center gap-3 px-7 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 font-black shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-105 tracking-tight"
          >
            <UserPlus className="w-5 h-5" />
            Thêm
          </button>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {participants.map((name) => (
            <span
              key={name}
              className="group inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/50 dark:to-fuchsia-900/50 text-violet-800 dark:text-violet-200 rounded-2xl font-bold border-2 border-violet-200 dark:border-violet-700 hover:border-violet-400 dark:hover:border-violet-500 transition-all duration-300 hover:scale-105 shadow-md tracking-tight"
            >
              {name}
              <button
                type="button"
                onClick={() => handleRemoveParticipant(name)}
                className="hover:bg-violet-200 dark:hover:bg-violet-800 rounded-full p-1.5 transition-all duration-300 hover:scale-110"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {participants.length > 0 && totalAmount && (
        <div className="relative overflow-hidden p-8 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-violet-50 dark:from-violet-900/30 dark:via-fuchsia-900/30 dark:to-violet-900/30 rounded-3xl border-2 border-violet-300 dark:border-violet-700 shadow-2xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-300/30 dark:bg-violet-700/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-300/30 dark:bg-fuchsia-700/30 rounded-full blur-3xl"></div>
          <div className="relative">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-bold tracking-tight">
              Mỗi người sẽ trả:
            </p>
            <p className="text-4xl font-black bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
              {(parseFloat(totalAmount) / participants.length).toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="group relative overflow-hidden w-full px-8 py-5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 text-white rounded-2xl transition-all duration-500 font-black text-lg shadow-2xl shadow-violet-500/50 hover:shadow-violet-500/70 hover:scale-[1.02] flex items-center justify-center gap-3 tracking-tight"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CheckCircle className="relative w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
        <span className="relative">Tạo hoạt động</span>
      </button>
    </form>
  );
}
