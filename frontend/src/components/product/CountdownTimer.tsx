import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: string;
  variant?: 'default' | 'large';
}

export function CountdownTimer({ endTime, variant = 'default' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setIsExpired(true);
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (isExpired) {
    return <span className="text-red-500 text-xs font-medium">Đã kết thúc</span>;
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (variant === 'large') {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-red-600 text-white rounded-md px-3 py-2 text-center min-w-[60px]">
          <div className="text-2xl font-bold">{pad(timeLeft.hours)}</div>
          <div className="text-xs">Giờ</div>
        </div>
        <span className="text-2xl font-bold text-red-600">:</span>
        <div className="bg-red-600 text-white rounded-md px-3 py-2 text-center min-w-[60px]">
          <div className="text-2xl font-bold">{pad(timeLeft.minutes)}</div>
          <div className="text-xs">Phút</div>
        </div>
        <span className="text-2xl font-bold text-red-600">:</span>
        <div className="bg-red-600 text-white rounded-md px-3 py-2 text-center min-w-[60px]">
          <div className="text-2xl font-bold">{pad(timeLeft.seconds)}</div>
          <div className="text-xs">Giây</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-white text-xs">
      <span className="bg-red-600 rounded px-1.5 py-0.5 font-mono font-bold">{pad(timeLeft.hours)}</span>
      <span>:</span>
      <span className="bg-red-600 rounded px-1.5 py-0.5 font-mono font-bold">{pad(timeLeft.minutes)}</span>
      <span>:</span>
      <span className="bg-red-600 rounded px-1.5 py-0.5 font-mono font-bold">{pad(timeLeft.seconds)}</span>
    </div>
  );
}
