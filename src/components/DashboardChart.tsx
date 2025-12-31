import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Calendar, Clock, Flame } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { calculateWorkTimeForDate } from '../lib/workTimeCalculator';

const DashboardChart: React.FC = () => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const { tasks, events, habits, okrs } = useTasks();

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      days.push({
        date: date.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase().replace('.', ''),
        time: calculateWorkTimeForDate(date, { tasks, events, habits, okrs }),
        fullDate: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      });
    }
    return days;
  }, [tasks, events, habits, okrs]);

  const maxTime = Math.max(...chartData.map(d => d.time), 1);
  const avgTime = chartData.reduce((sum, d) => sum + d.time, 0) / chartData.length;
  const totalTime = chartData.reduce((sum, d) => sum + d.time, 0);
  const todayTime = chartData[chartData.length - 1].time;

  const formatTimeShort = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const formatTimeFull = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const yScaleMax = Math.max(Math.ceil(maxTime / 30) * 30, 90);
  const yTicks = [];
  for (let i = 0; i <= yScaleMax; i += 30) {
    yTicks.push(i);
  }

  return (
    <motion.div 
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 lg:p-8 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <motion.div 
            className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <TrendingUp size={24} className="text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
              Temps de travail
            </h2>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <Calendar size={14} />
              7 derniers jours
            </p>
          </div>
        </div>
        
        <motion.div 
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <Flame size={16} className="text-blue-400" />
          <span className="text-blue-400 text-sm font-medium">+12% cette semaine</span>
        </motion.div>
      </div>

      <div className="relative z-10 mb-6">
        <div className="flex">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between pr-3 py-2" style={{ height: '200px' }}>
            {[...yTicks].reverse().map((tick) => (
              <span key={tick} className="text-[11px] font-medium text-slate-500 text-right leading-none">
                {formatTimeShort(tick)}
              </span>
            ))}
          </div>

          {/* Chart Area */}
          <div className="flex-1 relative" style={{ height: '200px' }}>
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {yTicks.map((tick) => (
                <div key={tick} className="border-b border-slate-700/30 w-full" />
              ))}
            </div>

              {/* Bars Container */}
              <div className="absolute inset-0 flex items-end justify-around px-2">
                {chartData.map((day, index) => {
                  const chartHeight = 200;
                  const barHeight = (day.time / yScaleMax) * chartHeight;
                  const isToday = index === chartData.length - 1;
                  const isHovered = hoveredBar === index;

                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center justify-end relative h-full"
                      style={{ width: `${100 / chartData.length}%` }}
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Tooltip */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="absolute z-20 flex flex-col items-center"
                            style={{ bottom: barHeight + 10 }}
                          >
                            <div className="bg-white px-3 py-1.5 rounded-xl shadow-xl text-center">
                              <div className="text-slate-900 font-bold text-xs whitespace-nowrap">
                                {formatTimeFull(day.time)}
                              </div>
                              <div className="text-slate-500 text-[10px] whitespace-nowrap">
                                {day.fullDate}
                              </div>
                            </div>
                            <div className="w-2 h-2 bg-white rotate-45 -mt-1 shadow-xl" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Bar */}
                      <motion.div
                        className={`w-8 rounded-t-lg cursor-pointer ${
                          isToday 
                            ? 'bg-gradient-to-t from-indigo-600 to-violet-400' 
                            : 'bg-gradient-to-t from-blue-600 to-blue-400'
                        }`}
                        style={{
                          opacity: hoveredBar === null || isHovered ? 1 : 0.4,
                          minHeight: 4
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: barHeight }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 100, 
                          damping: 15, 
                          delay: index * 0.05 
                        }}
                      />
                    </div>
                  );
                })}
              </div>
          </div>
        </div>

        {/* X-Axis Labels */}
        <div className="flex mt-3">
          <div className="pr-3" style={{ width: '40px' }} />
          <div className="flex-1 flex justify-around px-2">
            {chartData.map((day, index) => {
              const isToday = index === chartData.length - 1;
              const isHovered = hoveredBar === index;
              return (
                <div 
                  key={index} 
                  className="text-center"
                  style={{ width: `${100 / chartData.length}%` }}
                >
                  <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                    isToday ? 'text-blue-400' : isHovered ? 'text-white' : 'text-slate-500'
                  }`}>
                    {day.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="relative z-10 grid grid-cols-3 gap-4">
        {[
          { 
            label: "Aujourd'hui", 
            value: formatTimeFull(todayTime),
            icon: Clock,
            gradient: 'from-blue-500 to-indigo-500'
          },
          { 
            label: 'Moyenne', 
            value: formatTimeFull(Math.round(avgTime)),
            icon: TrendingUp,
            gradient: 'from-violet-500 to-purple-500'
          },
          { 
            label: 'Total', 
            value: `${Math.floor(totalTime / 60)}h`,
            icon: Flame,
            gradient: 'from-amber-500 to-orange-500'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon size={14} className="text-white" />
                </div>
                <span className="text-slate-400 text-xs font-medium">{stat.label}</span>
              </div>
              <div className={`text-lg lg:text-xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default DashboardChart;
