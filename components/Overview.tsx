'use client';

import { Activity } from '@/types';
import { TrendingUp, Users, DollarSign, Clock, Calendar, CheckCircle, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface OverviewProps {
  activities: Activity[];
}

export default function Overview({ activities }: OverviewProps) {
  const totalSpent = activities.reduce((sum, act) => sum + act.totalAmount, 0);
  const totalActivities = activities.length;

  const allParticipants = new Set<string>();
  activities.forEach(act => {
    act.participants.forEach(p => allParticipants.add(p.name));
  });

  const totalPaid = activities.reduce((sum, act) => {
    return sum + act.participants.filter(p => p.paid).length * act.amountPerPerson;
  }, 0);

  const totalUnpaid = totalSpent - totalPaid;
  const progressPct = totalSpent > 0 ? (totalPaid / totalSpent) * 100 : 0;
  const recentActivities = activities.slice(0, 5);

  const stats = [
    {
      label: 'Hoạt động',
      value: totalActivities,
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      label: 'Thành viên',
      value: allParticipants.size,
      icon: Users,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/50',
    },
    {
      label: 'Tổng chi',
      value: `${totalSpent.toLocaleString('vi-VN')}đ`,
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/50',
    },
    {
      label: 'Đã thu',
      value: `${totalPaid.toLocaleString('vi-VN')}đ`,
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
  ];

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-muted">
          <Calendar className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Chưa có hoạt động nào</p>
          <p className="text-sm text-muted-foreground mt-1">Thêm hoạt động đầu tiên để bắt đầu!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50" />
              </div>
              <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground leading-none break-all">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Tiến độ thu tiền</CardTitle>
            <Badge variant={progressPct >= 100 ? 'default' : progressPct > 50 ? 'secondary' : 'outline'}>
              {progressPct.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={progressPct} className="h-2.5" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              Đã thu: <span className="font-semibold text-foreground">{totalPaid.toLocaleString('vi-VN')}đ</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/30 inline-block" />
              Còn lại: <span className="font-semibold text-foreground">{totalUnpaid.toLocaleString('vi-VN')}đ</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Hoạt động gần đây</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {recentActivities.map((activity, idx) => {
                const paidCount = activity.participants.filter(p => p.paid).length;
                const totalCount = activity.participants.length;
                const allPaid = paidCount === totalCount;

                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-muted-foreground/60 font-mono w-5 shrink-0">{idx + 1}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-sm font-medium text-foreground truncate">{activity.title}</h4>
                          {allPaid && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 shrink-0 bg-emerald-600 hover:bg-emerald-600">
                              <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                              Xong
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString('vi-VN')} · {activity.participants.length} người
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-semibold text-foreground">
                        {activity.totalAmount.toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {paidCount}/{totalCount} đã trả
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
