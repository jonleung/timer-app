import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

const TimerApp = () => {
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  // Simple time parsing without LLM
  const parseTime = (input) => {
    setError('');
    const trimmed = input.trim().toLowerCase();
    
    // Parse various time formats
    let totalSeconds = 0;
    
    // Match patterns like "5 minutes", "2 hours", "30 seconds"
    const patterns = [
      { regex: /(\d+\.?\d*)\s*h(?:ours?)?/gi, multiplier: 3600 },
      { regex: /(\d+\.?\d*)\s*m(?:ins?|inutes?)?/gi, multiplier: 60 },
      { regex: /(\d+\.?\d*)\s*s(?:ecs?|econds?)?/gi, multiplier: 1 },
    ];
    
    // Special cases
    if (trimmed.includes('half an hour') || trimmed.includes('half hour')) {
      totalSeconds += 1800;
    }
    if (trimmed.includes('quarter hour') || trimmed.includes('quarter of an hour')) {
      totalSeconds += 900;
    }
    
    // Apply regex patterns
    patterns.forEach(({ regex, multiplier }) => {
      let match;
      while ((match = regex.exec(trimmed)) !== null) {
        totalSeconds += parseFloat(match[1]) * multiplier;
      }
    });
    
    // If no patterns matched, try to parse as a simple number (assume minutes)
    if (totalSeconds === 0 && /^\d+$/.test(trimmed)) {
      totalSeconds = parseInt(trimmed) * 60;
    }
    
    if (totalSeconds <= 0) {
      setError('Could not understand the time. Try "5 minutes" or "2h 30m"');
      return;
    }
    
    setTotalTime(totalSeconds);
    setTimeLeft(totalSeconds);
    setIsRunning(true);
    setIsComplete(false);
    setInput('');
  };

  // Create audio chime
  const playChime = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.frequency.value = 800;
    oscillator2.frequency.value = 1200;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 2);
    oscillator2.stop(audioContext.currentTime + 2);
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (isComplete) {
      // Play chime sound repeatedly
      playChime();
      const chimeInterval = setInterval(() => {
        playChime();
      }, 2500);

      return () => clearInterval(chimeInterval);
    }
  }, [isComplete]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (isComplete) {
      setIsComplete(false);
      setTimeLeft(0);
      setTotalTime(0);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsComplete(false);
    setTimeLeft(0);
    setTotalTime(0);
    setError('');
  };

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF9F6' }}>
      <div className="w-full max-w-md p-8">
        {/* Main Timer Display */}
        {(timeLeft > 0 || isComplete) ? (
          <div className="text-center space-y-8">
            <div className="relative">
              {/* Circular Progress */}
              <div className="relative inline-flex items-center justify-center">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#E8E3DB"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#DC6B3E"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-5xl font-light transition-all duration-300 ${isComplete ? 'animate-pulse' : ''}`} 
                       style={{ color: isComplete ? '#DC6B3E' : '#2D2D2D' }}>
                    {formatTime(timeLeft)}
                  </div>
                  {isComplete && (
                    <div className="mt-2 text-sm" style={{ color: '#DC6B3E' }}>
                      <Volume2 className="inline w-4 h-4 animate-pulse" />
                      <span className="ml-1">Complete</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleTimer}
                className="p-3 rounded-full transition-all duration-200 hover:scale-110"
                style={{ 
                  backgroundColor: isComplete ? '#DC6B3E' : '#E8E3DB',
                  color: isComplete ? '#FAF9F6' : '#2D2D2D'
                }}
              >
                {isComplete ? (
                  <RotateCcw className="w-6 h-6" />
                ) : isRunning ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>
              {!isComplete && (
                <button
                  onClick={resetTimer}
                  className="p-3 rounded-full transition-all duration-200 hover:scale-110"
                  style={{ backgroundColor: '#E8E3DB', color: '#2D2D2D' }}
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Input Form */
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-light mb-2" style={{ color: '#2D2D2D' }}>
                Set a Timer
              </h1>
              <p className="text-sm" style={{ color: '#6B6B6B' }}>
                Just type how long you want to wait
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && input.trim()) {
                      parseTime(input.trim());
                    }
                  }}
                  placeholder="Try '5 minutes' or '2 hours 30 mins'"
                  className="w-full px-4 py-4 text-lg border-2 rounded-xl transition-all duration-200 focus:outline-none"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: error ? '#DC6B3E' : '#E8E3DB',
                    color: '#2D2D2D'
                  }}
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-sm" style={{ color: '#DC6B3E' }}>
                  {error}
                </p>
              )}

              <button
                onClick={() => {
                  if (input.trim()) {
                    parseTime(input.trim());
                  }
                }}
                disabled={!input.trim()}
                className="w-full py-4 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  backgroundColor: '#DC6B3E',
                  color: '#FAF9F6'
                }}
              >
                Start Timer
              </button>
            </div>

            <div className="pt-4 space-y-2">
              <p className="text-xs text-center" style={{ color: '#9B9B9B' }}>
                Examples you can try:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['5 minutes', '1h 30m', 'half an hour', '90 seconds'].map((example) => (
                  <button
                    key={example}
                    onClick={() => setInput(example)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: '#F3F0EB',
                      color: '#6B6B6B'
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimerApp;