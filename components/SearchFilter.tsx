'use client';

import { useState } from 'react';
import { Search, X, Filter, Calendar, DollarSign } from 'lucide-react';
import { Activity } from '@/types';

interface SearchFilterProps {
  activities: Activity[];
  onFilteredResults: (filtered: Activity[]) => void;
}

export default function SearchFilter({ activities, onFilteredResults }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [filterDate, setFilterDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = (search: string, paid: typeof filterPaid, date: string) => {
    let filtered = [...activities];

    // Search filter
    if (search.trim()) {
      filtered = filtered.filter(act =>
        act.title.toLowerCase().includes(search.toLowerCase()) ||
        act.participants.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Paid filter
    if (paid === 'paid') {
      filtered = filtered.filter(act => 
        act.participants.every(p => p.paid)
      );
    } else if (paid === 'unpaid') {
      filtered = filtered.filter(act => 
        act.participants.some(p => !p.paid)
      );
    }

    // Date filter
    if (date) {
      filtered = filtered.filter(act => {
        const actDate = new Date(act.date).toISOString().split('T')[0];
        return actDate === date;
      });
    }

    onFilteredResults(filtered);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    applyFilters(value, filterPaid, filterDate);
  };

  const handlePaidFilterChange = (value: typeof filterPaid) => {
    setFilterPaid(value);
    applyFilters(searchTerm, value, filterDate);
  };

  const handleDateFilterChange = (value: string) => {
    setFilterDate(value);
    applyFilters(searchTerm, filterPaid, value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterPaid('all');
    setFilterDate('');
    onFilteredResults(activities);
  };

  const hasActiveFilters = searchTerm || filterPaid !== 'all' || filterDate;

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Tìm kiếm theo tên hoạt động hoặc người tham gia..."
          className="w-full pl-12 pr-24 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Xóa bộ lọc"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
            }`}
            title="Bộ lọc"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Trạng thái thanh toán
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handlePaidFilterChange('all')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterPaid === 'all'
                    ? 'bg-violet-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => handlePaidFilterChange('paid')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterPaid === 'paid'
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                Đã trả
              </button>
              <button
                onClick={() => handlePaidFilterChange('unpaid')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterPaid === 'unpaid'
                    ? 'bg-orange-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                Chưa trả
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4" />
              Lọc theo ngày
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => handleDateFilterChange(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 dark:bg-gray-900 dark:text-white transition-all"
            />
          </div>
        </div>
      )}

      {/* Results Count */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <DollarSign className="w-4 h-4" />
          <span>
            Tìm thấy <span className="font-bold text-violet-600 dark:text-violet-400">{activities.length}</span> hoạt động
          </span>
        </div>
      )}
    </div>
  );
}
