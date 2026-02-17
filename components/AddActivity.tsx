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
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Tên hoạt động
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="VD: Đi ăn tối, Đi chơi..."
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-colors placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Ngày diễn ra
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Tổng tiền (VNĐ)
        </label>
        <div className="relative">
          <input
            type="text"
            value={displayAmount}
            onChange={handleAmountChange}
            placeholder="500,000"
            className="w-full px-4 py-3 pr-16 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-colors placeholder:text-gray-400 text-lg font-bold"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 dark:text-gray-400">
            VNĐ
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Người tham gia
          <span className="px-2 py-0.5 bg-violet-600 text-white rounded text-xs font-semibold">
            {participants.length}
          </span>
        </label>
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={participantInput}
              onChange={handleParticipantInputChange}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
              placeholder="Nhập tên người tham gia"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-colors placeholder:text-gray-400"
            />
            {/* Autocomplete suggestions */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredSuggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => selectSuggestion(name)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{name}</span>
                    <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">Đã từng tham gia</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddParticipant}
            className="flex items-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-semibold"
          >
            <UserPlus className="w-4 h-4" />
            Thêm
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {participants.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-2 px-3 py-2 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg font-medium border border-violet-200 dark:border-violet-800"
            >
              {name}
              <button
                type="button"
                onClick={() => handleRemoveParticipant(name)}
                className="hover:bg-violet-200 dark:hover:bg-violet-800 rounded p-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {participants.length > 0 && totalAmount && (
        <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
            Mỗi người sẽ trả:
          </p>
          <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
            {(parseFloat(totalAmount) / participants.length).toLocaleString('vi-VN')} VNĐ
          </p>
        </div>
      )}

      <button
        type="submit"
        className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
      >
        <CheckCircle className="w-5 h-5" />
        <span>Tạo hoạt động</span>
      </button>
    </form>
  );
}
