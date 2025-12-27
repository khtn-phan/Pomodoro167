import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Check, Coffee, Clock, Maximize, Minimize, Moon, Sun, BarChart3, Calendar, X, Edit2, Globe } from 'lucide-react';

const translations = {
  vi: {
    title: 'Pomodoro Timer',
    subtitle: 'Tập trung & Học tập Hiệu quả',
    studyTime: 'Thời gian học',
    breakTime: 'Thời gian nghỉ',
    completedToday: 'Hôm nay đã hoàn thành',
    pomodoros: 'pomodoros',
    minutes: 'phút',
    stats: 'Thống kê học tập',
    today: 'Hôm nay',
    history: 'Lịch sử học tập',
    days: 'ngày',
    noData: 'Chưa có dữ liệu học tập',
    clearHistory: 'Xóa toàn bộ lịch sử',
    confirmClear: 'Bạn có chắc muốn xóa toàn bộ lịch sử?',
    viewDetails: 'Xem chi tiết',
    namePlaceholder: 'Đặt tên cho phiên học này... (vd: Học Toán, Lập trình React)',
    tip: '💡 Tip: Hãy tập trung cao độ trong thời gian học và nghỉ ngơi đầy đủ!',
    totalPomodoros: 'Số Pomodoro',
    totalTime: 'Tổng thời gian',
    studyMinutes: 'Study (phút)',
    breakMinutes: 'Break (phút)'
  },
  en: {
    title: 'Pomodoro Timer',
    subtitle: 'Focus & Study Efficiently',
    studyTime: 'Study Time',
    breakTime: 'Break Time',
    completedToday: 'Completed Today',
    pomodoros: 'pomodoros',
    minutes: 'minutes',
    stats: 'Study Statistics',
    today: 'Today',
    history: 'Study History',
    days: 'days',
    noData: 'No study data yet',
    clearHistory: 'Clear All History',
    confirmClear: 'Are you sure you want to clear all history?',
    viewDetails: 'View Details',
    namePlaceholder: 'Name this study session... (e.g., Math Study, React Coding)',
    tip: '💡 Tip: Stay focused during study time and take proper breaks!',
    totalPomodoros: 'Pomodoros',
    totalTime: 'Total Time',
    studyMinutes: 'Study (minutes)',
    breakMinutes: 'Break (minutes)'
  }
};

const PomodoroTimer = () => {
  const [mode, setMode] = useState('25/5');
  const [customStudy, setCustomStudy] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);
  const [isStudying, setIsStudying] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [pomodoroName, setPomodoroName] = useState('');
  const [history, setHistory] = useState([]);
  const [language, setLanguage] = useState('vi');
  const audioRef = useRef(null);
  
  const t = translations[language];

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('pomodoroHistory') || '[]');
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedLanguage = localStorage.getItem('language') || 'vi';
    setHistory(savedHistory);
    setDarkMode(savedDarkMode);
    setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    localStorage.setItem('pomodoroHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const modes = {
    '25/5': { study: 25, break: 5 },
    '50/10': { study: 50, break: 10 },
    'custom': { study: customStudy, break: customBreak }
  };

  useEffect(() => {
    const currentMode = modes[mode];
    setTimeLeft(isStudying ? currentMode.study * 60 : currentMode.break * 60);
  }, [mode, customStudy, customBreak, isStudying]);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      playSound();
      if (isStudying) {
        const newPomodoro = {
          id: Date.now(),
          name: pomodoroName || 'Unnamed Session',
          date: new Date().toISOString(),
          duration: modes[mode].study,
          mode: mode
        };
        setHistory(prev => [...prev, newPomodoro]);
        setPomodoroName('');
      }
      setIsStudying(!isStudying);
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isStudying]);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    const currentMode = modes[mode];
    setTimeLeft(isStudying ? currentMode.study * 60 : currentMode.break * 60);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    setIsStudying(true);
  };

  const progress = () => {
    const currentMode = modes[mode];
    const total = isStudying ? currentMode.study * 60 : currentMode.break * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getTodayPomodoros = () => {
    const today = new Date().toDateString();
    return history.filter(p => new Date(p.date).toDateString() === today);
  };

  const getTodayMinutes = () => {
    return getTodayPomodoros().reduce((sum, p) => sum + p.duration, 0);
  };

  const getStudyDays = () => {
    const uniqueDays = new Set(history.map(p => new Date(p.date).toDateString()));
    return Array.from(uniqueDays).sort((a, b) => new Date(b) - new Date(a));
  };

  const getPomodorosByDate = (dateString) => {
    return history.filter(p => new Date(p.date).toDateString() === dateString);
  };

  const clearHistory = () => {
    if (confirm(t.confirmClear)) {
      setHistory([]);
    }
  };

  const deletePomodoro = (id) => {
    setHistory(prev => prev.filter(p => p.id !== id));
  };

  const bgClass = darkMode 
    ? 'bg-gray-900' 
    : (isStudying ? 'bg-gradient-to-br from-green-50 to-emerald-100' : 'bg-gradient-to-br from-blue-50 to-cyan-100');

  const cardClass = darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800';
  const textClass = darkMode ? 'text-gray-300' : 'text-gray-600';
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-300';

  return (
    <div className={`min-h-screen transition-colors duration-700 ${bgClass}`}>
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGi78OKmVBQLTKXh8bllHAU2kdXy0H4yBSh+zPLaizsKE2Gy6OyiUhIOSJzd8sFsIAUrlNDx3JU5CAdjuO7mnE8SDUuk4fG7aB4FN5HV8tB+MgUofszy2oo6ChJgsOjrrVkVCkup4PG6aR4FN5HV8tCBMQUrgsvy24g3BxZmuO7mnE8SDUuk4PG8aR4FN5HV8tB+MgUofszy2os6ChJgsOjrrlkVCkup4PG6aR4FN5HV8tB+MgUofszy2os6ChJgsOjrrlkVCkup4PG6aR4FN5HV8tB+MgUofszy" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>{t.title}</h1>
            <p className={textClass}>{t.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className={`p-3 rounded-lg transition-all ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} shadow-md`}
              title={language === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
            >
              <Globe className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className={`p-3 rounded-lg transition-all ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} shadow-md`}
              title={t.stats}
            >
              <BarChart3 className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-gray-700'}`} />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-lg transition-all ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} shadow-md`}
              title="Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className={`p-3 rounded-lg transition-all ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'} shadow-md`}
              title={language === 'vi' ? 'Toàn màn hình' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-gray-700'}`} /> : <Maximize className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-gray-700'}`} />}
            </button>
          </div>
        </div>

        {showStats ? (
          <div className="space-y-6">
            <div className={`${cardClass} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  {t.stats}
                </h2>
                <button
                  onClick={() => setShowStats(false)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-green-100 to-emerald-100'}`}>
                <h3 className="text-lg font-semibold mb-3">📅 {t.today} ({new Date().toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')})</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${textClass}`}>{t.totalPomodoros}</p>
                    <p className="text-3xl font-bold">{getTodayPomodoros().length}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${textClass}`}>{t.totalTime}</p>
                    <p className="text-3xl font-bold">{getTodayMinutes()} {t.minutes}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {t.history} ({getStudyDays().length} {t.days})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getStudyDays().length === 0 ? (
                    <p className={textClass}>{t.noData}</p>
                  ) : (
                    getStudyDays().map(day => {
                      const pomodoros = getPomodorosByDate(day);
                      const totalMinutes = pomodoros.reduce((sum, p) => sum + p.duration, 0);
                      return (
                        <div key={day} className={`p-4 rounded-lg border ${borderClass}`}>
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-semibold">{new Date(day).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <span className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                              {pomodoros.length} {t.pomodoros} • {totalMinutes} {t.minutes}
                            </span>
                          </div>
                          <div className="space-y-2 mt-3">
                            {pomodoros.map(p => (
                              <div key={p.id} className={`flex justify-between items-center p-2 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-2">
                                  <Check className="w-4 h-4 text-green-500" />
                                  <span>{p.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{p.duration} {t.minutes}</span>
                                  <button
                                    onClick={() => deletePomodoro(p.id)}
                                    className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className={`mt-4 w-full py-2 rounded-lg ${darkMode ? 'bg-red-900 hover:bg-red-800' : 'bg-red-100 hover:bg-red-200'} text-red-600 font-medium transition-colors`}
                >
                  {t.clearHistory}
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className={`${cardClass} rounded-xl shadow-lg p-6 mb-6`}>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => handleModeChange('25/5')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${mode === '25/5' ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white') : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')}`}
                >
                  25/5
                </button>
                <button
                  onClick={() => handleModeChange('50/10')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${mode === '50/10' ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white') : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')}`}
                >
                  50/10
                </button>
                <button
                  onClick={() => handleModeChange('custom')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${mode === 'custom' ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white') : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')}`}
                >
                  Custom
                </button>
              </div>

              {mode === 'custom' && (
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <label className={`block text-sm font-medium ${textClass} mb-2`}>{t.studyMinutes}</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={customStudy}
                      onChange={(e) => setCustomStudy(parseInt(e.target.value) || 1)}
                      className={`w-full px-3 py-2 border ${borderClass} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textClass} mb-2`}>{t.breakMinutes}</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={customBreak}
                      onChange={(e) => setCustomBreak(parseInt(e.target.value) || 1)}
                      className={`w-full px-3 py-2 border ${borderClass} rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    />
                  </div>
                </div>
              )}
            </div>

            {isStudying && (
              <div className={`${cardClass} rounded-xl shadow-lg p-4 mb-6`}>
                <div className="flex items-center gap-3">
                  <Edit2 className={`w-5 h-5 ${textClass}`} />
                  <input
                    type="text"
                    value={pomodoroName}
                    onChange={(e) => setPomodoroName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className={`flex-1 px-3 py-2 border ${borderClass} rounded-lg ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white placeholder-gray-400'} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                </div>
              </div>
            )}

            <div className={`${cardClass} rounded-xl shadow-lg p-8 mb-6`}>
              <div className="text-center mb-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 ${isStudying ? (darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700') : (darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700')}`}>
                  {isStudying ? <Clock className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                  {isStudying ? t.studyTime : t.breakTime}
                </div>
                {pomodoroName && isStudying && (
                  <p className={`text-lg font-medium ${textClass}`}>{pomodoroName}</p>
                )}
              </div>

              <div className="relative w-64 h-64 mx-auto mb-6">
                <svg className="transform -rotate-90 w-64 h-64">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className={darkMode ? 'text-gray-700' : 'text-gray-200'}
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 120}`}
                    strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress() / 100)}`}
                    className={`transition-all duration-1000 ${isStudying ? 'text-green-500' : 'text-blue-500'}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-6xl font-bold mb-2">{formatTime(timeLeft)}</div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`p-4 rounded-full shadow-lg transition-all hover:scale-110 ${isStudying ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button
                  onClick={handleReset}
                  className={`p-4 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} shadow-lg transition-all hover:scale-110`}
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className={`${cardClass} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${textClass} text-sm mb-1`}>{t.completedToday}</p>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-3xl font-bold">{getTodayPomodoros().length}</span>
                    <span className={textClass}>{t.pomodoros}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowStats(true)}
                  className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}
                >
                  <BarChart3 className="w-4 h-4" />
                  {t.viewDetails}
                </button>
              </div>
            </div>
          </>
        )}

        <div className={`mt-6 text-center ${textClass} text-sm`}>
          <p>{t.tip}</p>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
