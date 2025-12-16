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
    if (!participants.includes(name)) {
      setParticipants([...participants, name]);
    }
    setParticipantInput('');
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
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          <Calendar className="w-4 h-4 text-violet-600" />
          Tên hoạt động
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="VD: Đi ăn tối, Đi chơi..."
          className="w-full px-5 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-all duration-300 placeholder:text-gray-400"
        />
      </div>

      <div className="group">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          <Calendar className="w-4 h-4 text-violet-600" />
          Ngày diễn ra
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-5 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-all duration-300"
        />
      </div>

      <div className="group">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          <DollarSign className="w-4 h-4 text-violet-600" />
          Tổng tiền (VNĐ)
        </label>
        <input
          type="text"
          value={displayAmount}
          onChange={handleAmountChange}
          placeholder="500,000"
          className="w-full px-5 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-all duration-300 placeholder:text-gray-400 text-xl font-semibold"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          <UserPlus className="w-4 h-4 text-violet-600" />
          Người tham gia
          <span className="px-2.5 py-0.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full text-xs font-bold">
            {participants.length}
          </span>
        </label>
        <div className="flex gap-2 mb-4 relative">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={participantInput}
              onChange={handleParticipantInputChange}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
              placeholder="Nhập tên người tham gia"
              className="w-full px-5 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-all duration-300 placeholder:text-gray-400"
            />
            {/* Autocomplete suggestions */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-violet-300 dark:border-violet-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                {filteredSuggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => selectSuggestion(name)}
                    className="w-full px-5 py-3 text-left hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800 dark:text-white">{name}</span>
                    <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">Đã từng tham gia</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddParticipant}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-105"
          >
            <UserPlus className="w-5 h-5" />
            Thêm
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          {participants.map((name) => (
            <span
              key={name}
              className="group inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/50 dark:to-fuchsia-900/50 text-violet-800 dark:text-violet-200 rounded-full font-medium border-2 border-violet-200 dark:border-violet-700 hover:border-violet-400 dark:hover:border-violet-500 transition-all duration-300 hover:scale-105 shadow-sm"
            >
              {name}
              <button
                type="button"
                onClick={() => handleRemoveParticipant(name)}
                className="hover:bg-violet-200 dark:hover:bg-violet-800 rounded-full p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {participants.length > 0 && totalAmount && (
        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-2xl border-2 border-violet-200 dark:border-violet-800">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-300/20 dark:bg-violet-700/20 rounded-full blur-3xl"></div>
          <div className="relative">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
              Mỗi người sẽ trả:
            </p>
            <p className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              {(parseFloat(totalAmount) / participants.length).toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="group w-full px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-300 font-bold text-lg shadow-xl shadow-violet-500/50 hover:shadow-2xl hover:scale-[1.02] flex items-center justify-center gap-3"
      >
        <CheckCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        Tạo hoạt động
      </button>
    </form>
  );
}
