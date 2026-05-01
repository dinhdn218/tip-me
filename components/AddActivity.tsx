'use client';

import { useState, useRef, useEffect } from 'react';
import { Activity } from '@/types';
import { UserPlus, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Tên hoạt động</Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="VD: Đi ăn tối, Đi chơi..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Ngày diễn ra</Label>
        <Input
          id="date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Tổng tiền (VNĐ)</Label>
        <div className="relative">
          <Input
            id="amount"
            type="text"
            value={displayAmount}
            onChange={handleAmountChange}
            placeholder="500,000"
            className="pr-14 text-base font-semibold"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">VNĐ</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Người tham gia
          {participants.length > 0 && (
            <Badge variant="secondary" className="text-xs">{participants.length}</Badge>
          )}
        </Label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              value={participantInput}
              onChange={handleParticipantInputChange}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
              placeholder="Nhập tên người tham gia"
            />
            {/* Autocomplete suggestions */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredSuggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => selectSuggestion(name)}
                    className="w-full px-4 py-2.5 text-left hover:bg-accent transition-colors flex items-center gap-3 border-b border-border last:border-0"
                  >
                    <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-semibold text-xs shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground">{name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">Đã từng tham gia</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button type="button" onClick={handleAddParticipant} variant="secondary">
            <UserPlus className="w-4 h-4" />
            Thêm
          </Button>
        </div>

        {participants.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {participants.map((name) => (
              <Badge key={name} variant="secondary" className="pl-3 pr-1.5 py-1 gap-1.5 text-sm">
                {name}
                <button
                  type="button"
                  onClick={() => handleRemoveParticipant(name)}
                  className="hover:bg-muted rounded p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {participants.length > 0 && totalAmount && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1 font-medium">Mỗi người sẽ trả:</p>
            <p className="text-2xl font-bold text-primary break-words">
              {(parseFloat(totalAmount) / participants.length).toLocaleString('vi-VN')} VNĐ
            </p>
          </CardContent>
        </Card>
      )}

      <Button type="submit" className="w-full">
        <CheckCircle className="w-4 h-4" />
        Tạo hoạt động
      </Button>
    </form>
  );
}
