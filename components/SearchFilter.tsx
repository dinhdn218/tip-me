'use client';

import { useState } from 'react';
import { Search, X, Filter, Calendar } from 'lucide-react';
import { Activity } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <div className="space-y-3 mb-6">
      {/* Search Bar */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm kiếm hoạt động hoặc người tham gia..."
            className="pl-9 pr-4"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters} title="Xóa bộ lọc" className="shrink-0 h-9 w-9">
            <X className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant={showFilters || hasActiveFilters ? 'secondary' : 'outline'}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          title="Bộ lọc"
          className="shrink-0 h-9 w-9 relative"
        >
          <Filter className="w-4 h-4" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg border border-border">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Trạng thái</p>
            <div className="flex gap-1.5">
              {(['all', 'paid', 'unpaid'] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => handlePaidFilterChange(val)}
                  className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    filterPaid === val
                      ? val === 'paid'
                        ? 'bg-emerald-600 text-white'
                        : val === 'unpaid'
                        ? 'bg-orange-600 text-white'
                        : 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:text-foreground hover:bg-accent border border-border'
                  }`}
                >
                  {val === 'all' ? 'Tất cả' : val === 'paid' ? 'Đã trả' : 'Chưa trả'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Theo ngày
            </p>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => handleDateFilterChange(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Bộ lọc:</span>
          {searchTerm && (
            <Badge variant="secondary" className="text-xs gap-1">
              "{searchTerm}"
              <button onClick={() => handleSearchChange('')}><X className="w-2.5 h-2.5" /></button>
            </Badge>
          )}
          {filterPaid !== 'all' && (
            <Badge variant="secondary" className="text-xs gap-1">
              {filterPaid === 'paid' ? 'Đã trả' : 'Chưa trả'}
              <button onClick={() => handlePaidFilterChange('all')}><X className="w-2.5 h-2.5" /></button>
            </Badge>
          )}
          {filterDate && (
            <Badge variant="secondary" className="text-xs gap-1">
              {filterDate}
              <button onClick={() => handleDateFilterChange('')}><X className="w-2.5 h-2.5" /></button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
