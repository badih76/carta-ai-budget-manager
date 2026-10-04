'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSettings } from '@/src/context/settingsContext';

type Gender = 'male' | 'female';

export function FloatingAIAvatar() {
  const { settings } = useSettings();

  const selectedStyle: number = settings?.cartaAiAvatarStyle ?? 1;
  const visible = settings?.displayCartaAiAvatar ?? 1;
  const gender = settings?.cartaAiAvatarGender ?? 'female';
  const nameFemale = settings?.cartaAiAvatarNameFemale ?? 'Sandra';
  const nameMale = settings?.cartaAiAvatarNameMale ?? 'Alex';
  return (
    <>
      {
       visible == 1 ?
          selectedStyle == 1 ?
            <FloatingAIAvatarStyle1 gender={gender} avatarName={gender == 'female' ? nameFemale : nameMale} />
            : <FloatingAIAvatarStyle2 gender={gender} avatarName={gender == 'female' ? nameFemale : nameMale} />
          : null
      }      
    </>
  )
}

export function FloatingAIAvatarStyle1({ gender, avatarName }: { gender: string, avatarName: string }) {
  const avatarRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragDistance = useRef(0);

  const [isBubbleOpen, setIsBubbleOpen] = useState(false);
  const [inquiry, setInquiry] = useState('');

  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  const PROXIMITY_RADIUS = 350;

  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     setPosition({
  //       x: window.innerWidth - 120,
  //       y: 80,
  //     });
  //     setIsInitialized(true);
  //   }
  // }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const calculateSafePosition = () => {
      // Avatar + side wings/glow spans ~128px total. 
      // Placing it 140px from the right keeps it fully inside small viewports.
      const safeX = Math.max(20, window.innerWidth - 140);
      const safeY = 80;

      setPosition({ x: safeX, y: safeY });
      setIsInitialized(true);
    };

    calculateSafePosition();

    // Recalculate on window resize so it stays visible on small screens
    window.addEventListener('resize', calculateSafePosition);
    return () => window.removeEventListener('resize', calculateSafePosition);
  }, []);

  // Idle Scanning & Blinking
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const scheduleNextIdleLook = () => {
      const delay = Math.floor(Math.random() * 1500) + 1000;

      idleTimer = setTimeout(() => {
        if (!isDragging) {
          const directions = [-40, -20, 0, 20, 40];
          const randomX = directions[Math.floor(Math.random() * directions.length)];
          const randomY = (Math.random() - 0.5) * 15;
          setPupilOffset({ x: randomX, y: randomY });
        }
        scheduleNextIdleLook();
      }, delay);
    };

    scheduleNextIdleLook();

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000);

    return () => {
      clearTimeout(idleTimer);
      clearInterval(blinkInterval);
    };
  }, [isDragging]);

  // Mouse Tracking & Dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        dragDistance.current += Math.hypot(e.movementX, e.movementY);
        const newX = Math.max(20, Math.min(window.innerWidth - 90, e.clientX - dragOffset.current.x));
        const newY = Math.max(70, Math.min(window.innerHeight - 90, e.clientY - dragOffset.current.y));
        setPosition({ x: newX, y: newY });
        return;
      }

      if (!avatarRef.current) return;

      const rect = avatarRef.current.getBoundingClientRect();
      const avatarCenterX = rect.left + rect.width / 2;
      const avatarCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - avatarCenterX;
      const deltaY = e.clientY - avatarCenterY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance < PROXIMITY_RADIUS) {
        const angle = Math.atan2(deltaY, deltaX);
        const maxOffset = 45;
        const offsetMagnitude = Math.min(distance / PROXIMITY_RADIUS, 1) * maxOffset;

        setPupilOffset({
          x: Math.cos(angle) * offsetMagnitude,
          y: Math.sin(angle) * offsetMagnitude,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragDistance.current = 0;
    if (avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleAvatarClick = () => {
    if (dragDistance.current < 5) {
      setIsBubbleOpen((prev) => !prev);
    }
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry.trim()) return;

    console.log(`Inquiry sent to ${avatarName}:`, inquiry);
    setInquiry('');
    setIsBubbleOpen(false);
  };

  if (!isInitialized) return null;

  const isRightSide = typeof window !== 'undefined' ? position.x > window.innerWidth / 2 : true;
  const isFemale = gender === 'female';

  // Eyebrow and expressiveness metrics
  const browX = pupilOffset.x * 0.04;
  const browY = isBlinking ? 4 : isDragging ? -4 : pupilOffset.y * 0.04;

  // Indigo Color Scheme Variations
  const primaryGlow = isFemale
    ? 'from-indigo-500 via-purple-500 to-pink-500'
    : 'from-indigo-600 via-indigo-500 to-cyan-500';

  const chassisBorder = isFemale
    ? 'from-indigo-300 via-pink-400 to-purple-600'
    : 'from-indigo-400 via-indigo-600 to-slate-800';

  const eyeGlowColor = isFemale
    ? 'border-pink-400 shadow-[0_0_12px_#ec4899]'
    : 'border-indigo-400 shadow-[0_0_12px_#6366f1]';

  const pupilGradient = isFemale
    ? 'from-pink-400 to-indigo-500'
    : 'from-indigo-400 to-cyan-400';

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-50 flex items-center justify-center select-none touch-none"
    >
      <div className="relative">
        {/* Speech Bubble / Finance Prompt */}
        {isBubbleOpen && (
          <div
            className={`absolute top-0 w-72 p-4 bg-slate-900/95 backdrop-blur-xl text-slate-100 rounded-2xl shadow-[0_10px_35px_rgba(79,70,229,0.3)] border border-indigo-500/40 z-30 animate-in fade-in duration-200 ${
              isRightSide
                ? 'right-full mr-5 slide-in-from-right-3'
                : 'left-full ml-5 slide-in-from-left-3'
            }`}
          >
            <div
              className={`absolute top-6 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ${
                isRightSide
                  ? '-right-2 border-l-[10px] border-l-slate-900/95'
                  : '-left-2 border-r-[10px] border-r-slate-900/95'
              }`}
            />

            <button
              onClick={() => setIsBubbleOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white text-xs p-1 rounded transition-colors z-10"
              aria-label="Close"
            >
              ✕
            </button>

            {/* <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md">
                Budget AI
              </span>
              <span className="text-xs text-indigo-300 font-mono">
                {isFemale ? 'Smart Assistant' : 'Finance Bot'}
              </span>
            </div> */}

            <p className="text-sm font-medium mb-3 text-slate-200 leading-snug pr-4">
              Hi! I'm{' '}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-400 to-pink-300">
                {avatarName}
              </span>
              . Need help managing your budget or expenses today?
            </p>

            <form onSubmit={handleSubmitInquiry} className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Ask about spending, budgets, savings..."
                value={inquiry}
                onChange={(e) => setInquiry(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 text-sm bg-slate-950/90 border border-indigo-500/40 rounded-xl text-indigo-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all"
              />
              <button
                type="submit"
                className="w-full py-2 px-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/30 active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <span>Calculate & Analyze</span>
                <span className="text-xs">📈</span>
              </button>
            </form>
          </div>
        )}

        {/* Floating Robot Avatar Head */}
        <div
          ref={avatarRef}
          onMouseDown={handleMouseDown}
          onClick={handleAvatarClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative group cursor-grab active:cursor-grabbing transition-transform duration-300 ${
            isDragging ? 'scale-110' : 'hover:scale-105'
          }`}
        >
          {/* Ambient Carta AI Indigo Glow */}
          <div className={`absolute -inset-3 rounded-full bg-gradient-to-r ${primaryGlow} opacity-50 blur-lg group-hover:opacity-80 transition duration-500 animate-pulse`} />

          {/* Feminine Wing / Antenna Accents */}
          {isFemale ? (
            <>
              <div className="absolute -left-3 top-2 w-4 h-9 bg-gradient-to-b from-pink-400 via-indigo-500 to-purple-600 rounded-l-full rotate-[15deg] border-l border-t border-pink-300/60 shadow-md flex items-center justify-center">
                <div className="w-1 h-5 bg-pink-200 rounded-full animate-pulse" />
              </div>
              <div className="absolute -right-3 top-2 w-4 h-9 bg-gradient-to-b from-pink-400 via-indigo-500 to-purple-600 rounded-r-full -rotate-[15deg] border-r border-t border-pink-300/60 shadow-md flex items-center justify-center">
                <div className="w-1 h-5 bg-pink-200 rounded-full animate-pulse" />
              </div>
            </>
          ) : (
            <>
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-8 bg-gradient-to-b from-indigo-500 to-slate-700 rounded-l-md border border-indigo-400/60 flex items-center justify-center shadow-md">
                <div className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse" />
              </div>
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-8 bg-gradient-to-b from-indigo-500 to-slate-700 rounded-r-md border border-indigo-400/60 flex items-center justify-center shadow-md">
                <div className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse" />
              </div>
            </>
          )}

          {/* Main Cyber Chassis */}
          <div className={`relative w-24 h-24 ${isFemale ? 'rounded-[36px] rounded-b-[28px]' : 'rounded-[32px]'} bg-gradient-to-br ${chassisBorder} p-[2px] shadow-[0_12px_30px_rgba(79,70,229,0.4)] overflow-hidden`}>
            
            {/* Inner Metallic Frame */}
            <div className="relative w-full h-full rounded-[30px] bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-2 border border-indigo-500/30">
              
              {/* Glass Specular Highlight */}
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/15 rounded-full blur-md pointer-events-none z-20" />

              {/* Visor Screen with Finance HUD Elements */}
              <div className="relative w-full h-14 bg-black/90 rounded-2xl border border-indigo-500/50 shadow-[inset_0_0_14px_rgba(79,70,229,0.5)] flex flex-col items-center justify-center overflow-hidden">
                
                {/* Finance HUD Overlay: Mini Currency/Chart Watermark & Balance Glow */}
                {/* <div className="absolute top-1 left-2 text-[9px] font-mono text-emerald-400 font-bold opacity-80 pointer-events-none z-10 flex items-center gap-0.5">
                  <span>{isFemale ? '$' : '📈'}</span>
                  <span className="text-[7px] text-emerald-300/80">+$</span>
                </div>

                <div className="absolute top-1 right-2 text-[8px] font-mono text-indigo-400/60 pointer-events-none z-10">
                  HUD
                </div> */}

                {/* Grid Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.1)_1px,transparent_1px)] [background-size:100%_3px] pointer-events-none z-10" />

                {/* Digital Brows */}
                <div className="flex justify-between w-12 px-1 mb-0.5 z-20">
                  <div
                    className={`h-[2px] rounded-full transition-transform duration-150 ${isFemale ? 'w-4 bg-pink-300 shadow-[0_0_6px_#f472b6]' : 'w-4 bg-indigo-400 shadow-[0_0_6px_#818cf8]'}`}
                    style={{
                      transform: `translate(${browX}px, ${browY}px) rotate(${isHovered ? (isFemale ? -12 : -8) : 0}deg)`,
                    }}
                  />
                  <div
                    className={`h-[2px] rounded-full transition-transform duration-150 ${isFemale ? 'w-4 bg-pink-300 shadow-[0_0_6px_#f472b6]' : 'w-4 bg-indigo-400 shadow-[0_0_6px_#818cf8]'}`}
                    style={{
                      transform: `translate(${browX}px, ${browY}px) rotate(${isHovered ? (isFemale ? 12 : 8) : 0}deg)`,
                    }}
                  />
                </div>

                {/* Dynamic LED Robot Eyes */}
                <div className="flex items-center gap-3.5 z-20">
                  {/* Left Eye */}
                  <div
                    className={`relative w-4 h-4 rounded-full bg-slate-950 border flex items-center justify-center transition-all duration-150 ${eyeGlowColor} ${
                      isBlinking ? 'h-[2px] overflow-hidden' : ''
                    }`}
                  >
                    {/* Feminine Lashes Accent */}
                    {isFemale && !isBlinking && (
                      <svg className="absolute -top-1.5 left-0 w-4 h-2 pointer-events-none z-30" viewBox="0 0 16 8">
                        <path d="M 1 6 Q 8 1 15 6" fill="none" stroke="#f472b6" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    )}
                    <div
                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${pupilGradient}`}
                      style={{
                        transform: `translate(${pupilOffset.x * 0.08}px, ${pupilOffset.y * 0.08}px)`,
                      }}
                    />
                  </div>

                  {/* Right Eye */}
                  <div
                    className={`relative w-4 h-4 rounded-full bg-slate-950 border flex items-center justify-center transition-all duration-150 ${eyeGlowColor} ${
                      isBlinking ? 'h-[2px] overflow-hidden' : ''
                    }`}
                  >
                    {/* Feminine Lashes Accent */}
                    {isFemale && !isBlinking && (
                      <svg className="absolute -top-1.5 left-0 w-4 h-2 pointer-events-none z-30" viewBox="0 0 16 8">
                        <path d="M 1 6 Q 8 1 15 6" fill="none" stroke="#f472b6" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    )}
                    <div
                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${pupilGradient}`}
                      style={{
                        transform: `translate(${pupilOffset.x * 0.08}px, ${pupilOffset.y * 0.08}px)`,
                      }}
                    />
                  </div>
                </div>

                {/* Animated Voice/Finance Pulse Bar */}
                <div className="mt-1 flex items-center gap-1 z-20">
                  <div className={`h-1 rounded-full transition-all duration-200 ${isFemale ? 'bg-indigo-400 shadow-[0_0_6px_#f472b6]' : 'bg-indigo-400 shadow-[0_0_6px_#818cf8]'} ${isDragging ? 'w-4 h-2' : isHovered ? 'w-5 h-1.5 animate-pulse' : 'w-3'}`} />
                </div>
              </div>

              {/* Lower Plate & Budget Indicator */}
              <div className="mt-1.5 flex items-center justify-center gap-2 w-full px-1.5 text-[12px] font-mono">
                <span className={`w-1.5 h-1.5 rounded-full ${isFemale ? 'bg-pink-400' : 'bg-indigo-400'} animate-ping`} />
                <span className="flex items-center justify-center gap-1 text-indigo-300 font-semibold">
                   {avatarName}
                </span>
                {/* <span className="text-indigo-300/80 font-bold tracking-tight">
                  {avatarName}
                </span> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FloatingAIAvatarStyle2({ gender, avatarName }: { gender: string, avatarName: string }) {
  const avatarRef = useRef<HTMLDivElement>(null);

  // Position state (top-right, below header)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragDistance = useRef(0);

  // Interaction & Speech Bubble States
  const [isBubbleOpen, setIsBubbleOpen] = useState(false);
  const [inquiry, setInquiry] = useState('');

  // Pupil & state offsets
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isNearPointer, setIsNearPointer] = useState(false);

  const PROXIMITY_RADIUS = 350;

  // Set initial position: 80px from top, 120px from right
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - 120,
        y: 80,
      });
      setIsInitialized(true);
    }
  }, []);

  // Idle Scanning & Blinking
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const scheduleNextIdleLook = () => {
      const delay = Math.floor(Math.random() * 1500) + 1000;

      idleTimer = setTimeout(() => {
        if (!isDragging) {
          const directions = [-55, -30, 0, 30, 55];
          const randomX = directions[Math.floor(Math.random() * directions.length)];
          const randomY = (Math.random() - 0.5) * 25;
          setPupilOffset({ x: randomX, y: randomY });
        }
        scheduleNextIdleLook();
      }, delay);
    };

    scheduleNextIdleLook();

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 4000);

    return () => {
      clearTimeout(idleTimer);
      clearInterval(blinkInterval);
    };
  }, [isDragging]);

  // Mouse Tracking & Dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        dragDistance.current += Math.hypot(e.movementX, e.movementY);
        const newX = Math.max(20, Math.min(window.innerWidth - 90, e.clientX - dragOffset.current.x));
        const newY = Math.max(70, Math.min(window.innerHeight - 90, e.clientY - dragOffset.current.y));
        setPosition({ x: newX, y: newY });
        return;
      }

      if (!avatarRef.current) return;

      const rect = avatarRef.current.getBoundingClientRect();
      const avatarCenterX = rect.left + rect.width / 2;
      const avatarCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - avatarCenterX;
      const deltaY = e.clientY - avatarCenterY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance < PROXIMITY_RADIUS) {
        setIsNearPointer(true);
        const angle = Math.atan2(deltaY, deltaX);
        const maxOffset = 65;
        const offsetMagnitude = Math.min(distance / PROXIMITY_RADIUS, 1) * maxOffset;

        setPupilOffset({
          x: Math.cos(angle) * offsetMagnitude,
          y: Math.sin(angle) * offsetMagnitude,
        });
      } else {
        setIsNearPointer(false);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragDistance.current = 0;
    if (avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleAvatarClick = () => {
    if (dragDistance.current < 5) {
      setIsBubbleOpen((prev) => !prev);
    }
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry.trim()) return;

    console.log(`Inquiry sent to ${avatarName}:`, inquiry);

    setInquiry('');
    setIsBubbleOpen(false);
  };

  if (!isInitialized) return null;

  // Check if face is on the right side of the screen
  const isRightSide = typeof window !== 'undefined' ? position.x > window.innerWidth / 2 : true;

  // Eyebrow tracking and pitch calculations
  const browX = pupilOffset.x * 0.05;
  const browY = isBlinking
    ? 5
    : isDragging
    ? -5
    : isHovered
    ? -3
    : pupilOffset.y * 0.05 - 2;

  const leftBrowRotate = isDragging
    ? -14
    : isHovered
    ? -7
    : (pupilOffset.x * 0.08) - (pupilOffset.y * 0.04);

  const rightBrowRotate = isDragging
    ? 14
    : isHovered
    ? 7
    : (pupilOffset.x * 0.08) + (pupilOffset.y * 0.04);

  // Gender-specific styling parameters
  const isFemale = gender === 'female';

  const faceGradient = isFemale
    ? 'bg-radial from-rose-50 via-pink-100/80 to-slate-300'
    : 'bg-radial from-slate-800 via-slate-900 to-black';

  const browStroke = isFemale ? '#475569' : 'rgba(241, 245, 249, 0.95)';
  const pupilGlowColor = isFemale ? 'bg-indigo-500 shadow-[0_0_6px_#a05cff]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]';
  const mouthGlowColor = isFemale ? 'bg-rose-400 shadow-[0_0_8px_#fb7185]' : 'bg-emerald-400 shadow-[0_0_10px_#34d399]';
  const mouthHoverColor = isFemale ? 'bg-rose-300' : 'bg-emerald-300';
  
  const ambientGlow = isFemale
    ? 'from-pink-200 via-rose-100 to-slate-200 opacity-80'
    : 'from-slate-100 via-white to-slate-300 opacity-65';

  // Condition to trigger 1/3 eye lid overlay on idle male avatar
  const showMaleEyelids = !isFemale && !isBlinking && !isHovered && !isDragging && !isNearPointer;

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-50 flex items-center justify-center select-none touch-none"
    >
      <div className="relative">
        {/* Dynamic Speech Bubble Popover */}
        {isBubbleOpen && (
          <div
            className={`absolute top-0 w-72 p-4 bg-slate-900/95 backdrop-blur-md text-slate-100 rounded-2xl shadow-2xl border border-slate-700/80 z-30 animate-in fade-in duration-200 ${
              isRightSide
                ? 'right-full mr-4 slide-in-from-right-3'
                : 'left-full ml-4 slide-in-from-left-3'
            }`}
          >
            {/* Dynamic Arrow */}
            <div
              className={`absolute top-6 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ${
                isRightSide
                  ? '-right-2 border-l-[10px] border-l-slate-900/95'
                  : '-left-2 border-r-[10px] border-r-slate-900/95'
              }`}
            />

            {/* Close Button (Fixed Top-Right) */}
            <button
              onClick={() => setIsBubbleOpen(false)}
              className="absolute top-4 right-3 text-slate-400 hover:text-white text-xs p-1 rounded transition-colors leading-none z-10"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Message with right padding so text doesn't hit the '✕' */}
            <p className="text-sm font-medium mb-3 text-slate-200 leading-snug pr-6">
              Hi, I'm{' '}
              <span
                className={`font-semibold ${
                  gender === 'female' ? 'text-rose-300' : 'text-indigo-300'
                }`}
              >
                {avatarName}
              </span>
              . How may I assist you?
            </p>

            <form onSubmit={handleSubmitInquiry} className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={inquiry}
                onChange={(e) => setInquiry(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                className="w-full py-1.5 px-3 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm active:scale-[0.98]"
              >
                Send Message
              </button>
            </form>
          </div>
        )}

        {/* Avatar Body */}
        <div
          ref={avatarRef}
          onMouseDown={handleMouseDown}
          onClick={handleAvatarClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative group cursor-grab active:cursor-grabbing transition-transform duration-300 ${
            isDragging ? 'scale-110' : 'hover:scale-105 animate-bounce-slow'
          }`}
        >
          {/* Ambient Back Glow */}
          <div className={`absolute -inset-2 rounded-full bg-gradient-to-r ${ambientGlow} blur-lg group-hover:opacity-100 transition duration-500 animate-pulse`} />

          {/* Polished Metallic Chrome Enclosure Body */}
          <div className="relative w-22 h-22 rounded-full bg-gradient-to-br from-slate-100 via-slate-400 via-slate-600 to-slate-900 p-[2px] shadow-[0_10px_25px_rgba(0,0,0,0.5),0_0_20px_rgba(255,255,255,0.4)] overflow-hidden">
            
            {/* Inner Spherical Body */}
            <div className={`relative w-full h-full rounded-full ${faceGradient} flex flex-col items-center justify-center overflow-hidden transition-colors duration-500`}>
              
              {/* Top Gloss Specular Highlight */}
              <div className="absolute top-0 left-2 right-2 h-2/5 bg-gradient-to-b from-white/70 via-white/20 to-transparent rounded-t-full pointer-events-none z-20" />
              
              {/* Secondary Bottom Curved Reflection Line */}
              <div className="absolute bottom-1 left-4 right-4 h-1/5 bg-gradient-to-t from-slate-500/20 to-transparent rounded-b-full pointer-events-none z-20" />

              {/* Positioned Cheeks (Female Only) */}
              {isFemale && (
                <div className="absolute inset-x-2 top-[56px] flex justify-between px-1 pointer-events-none z-0">
                  <div className="w-5 h-2.5 rounded-full bg-rose-400/50 blur-[3px]" />
                  <div className="w-5 h-2.5 rounded-full bg-rose-400/50 blur-[3px]" />
                </div>
              )}

              {/* Face Container */}
              <div className="flex flex-col items-center pt-1 z-10">
                
                {/* Dynamic Curved SVG Eyebrows Container */}
                <div className="flex items-center justify-between w-14 px-0.5 mb-1 pointer-events-none">
                  {/* Left Eyebrow */}
                  <svg
                    className="w-5 h-2 transition-transform duration-150 ease-out"
                    viewBox="0 0 24 10"
                    style={{
                      transform: `translate(${browX}px, ${browY}px) rotate(${leftBrowRotate}deg)`,
                    }}
                  >
                    <path
                      d="M 2 8 Q 12 1 22 7"
                      fill="none"
                      stroke={browStroke}
                      strokeWidth={isFemale ? "2" : "2.5"}
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Right Eyebrow */}
                  <svg
                    className="w-5 h-2 transition-transform duration-150 ease-out"
                    viewBox="0 0 24 10"
                    style={{
                      transform: `translate(${browX}px, ${browY}px) rotate(${rightBrowRotate}deg)`,
                    }}
                  >
                    <path
                      d="M 2 7 Q 12 1 22 8"
                      fill="none"
                      stroke={browStroke}
                      strokeWidth={isFemale ? "2" : "2.5"}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Eyes Section */}
                <div className="flex items-center gap-3.5 px-3">
                  {/* Left Eyeball */}
                  <div
                    className={`relative w-5 h-6 bg-gradient-to-b from-white via-slate-100 to-slate-200 border border-slate-300/80 rounded-full flex items-center justify-center transition-all duration-150 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] overflow-hidden ${
                      isBlinking ? 'h-[2px] bg-slate-500 overflow-hidden' : ''
                    }`}
                  >
                    {/* Male Idle Eyelid (Top 1/3) */}
                    {showMaleEyelids && (
                      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-slate-900 to-slate-800 border-b border-slate-700 z-15 transition-all duration-300 rounded-t-full" />
                    )}

                    {isFemale && !isBlinking && (
                      <svg className="absolute -top-1 left-0 w-5 h-3 pointer-events-none z-20 overflow-visible" viewBox="0 0 20 12">
                        <path d="M 0 10 Q 10 2 20 10" fill="none" stroke="#334155" strokeWidth="1" strokeLinecap="round" />
                        <path d="M 2 9 L 0 6" fill="none" stroke="#334155" strokeWidth="0.8" strokeLinecap="round" />
                        <path d="M 6 5 L 5 2" fill="none" stroke="#334155" strokeWidth="0.8" strokeLinecap="round" />
                        <path d="M 10 4 L 10 0" fill="none" stroke="#334155" strokeWidth="0.8" strokeLinecap="round" />
                        <path d="M 14 5 L 15 2" fill="none" stroke="#334155" strokeWidth="0.8" strokeLinecap="round" />
                        <path d="M 18 9 L 20 6" fill="none" stroke="#334155" strokeWidth="0.8" strokeLinecap="round" />
                      </svg>
                    )}

                    {/* Pupil */}
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${pupilGlowColor} transition-transform duration-200 ease-out`}
                      style={{
                        transform: `translate(${pupilOffset.x * 0.09}px, ${pupilOffset.y * 0.09}px)`,
                      }}
                    />
                  </div>

                  {/* Right Eyeball */}
                  <div
                    className={`relative w-5 h-6 bg-gradient-to-b from-white via-slate-100 to-slate-200 border border-slate-300/80 rounded-full flex items-center justify-center transition-all duration-150 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] overflow-hidden ${
                      isBlinking ? 'h-[2px] bg-slate-500 overflow-hidden' : ''
                    }`}
                  >
                    {/* Male Idle Eyelid (Top 1/3) */}
                    {showMaleEyelids && (
                      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-slate-900 to-slate-800 border-b border-slate-700 z-15 transition-all duration-300 rounded-t-full" />
                    )}
                    
                    {isFemale && !isBlinking && (
                      <svg className="absolute -top-1 left-0 w-5 h-3 pointer-events-none z-20 overflow-visible" viewBox="0 0 20 12">
                        <path d="M 0 10 Q 10 2 20 10" fill="none" stroke="#334155" strokeWidth="1" strokeLinecap="round" />
                        <path d="M 2 9 L 0 6" fill="none" stroke="#334155" strokeWidth="0.8" strokeLinecap="round" />
                        <path d="M 6 5 L 5 2" fill="none" stroke="#334155" strokeWidth="0.8" strokeLinecap="round" />
                        <path d="M 10 4 L 10 0" fill="none" stroke="#334155" strokeWidth="0.8" strokeLinecap="round" />
                        <path d="M 14 5 L 15 2" fill="none" stroke="#334155" strokeWidth="0.8" strokeLinecap="round" />
                        <path d="M 18 9 L 20 6" fill="none" stroke="#334155" strokeWidth="0.8" strokeLinecap="round" />
                      </svg>
                    )}

                    {/* Pupil */}
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${pupilGlowColor} transition-transform duration-200 ease-out`}
                      style={{
                        transform: `translate(${pupilOffset.x * 0.09}px, ${pupilOffset.y * 0.09}px)`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Glowing Mouth */}
              <div className="mt-2.5 flex items-center justify-center z-20">
                <div
                  className={`h-1 ${mouthGlowColor} transition-all duration-300 ${
                    isDragging
                      ? `w-3.5 h-3.5 rounded-full ${mouthHoverColor}`
                      : isHovered
                      ? `w-6 rounded-b-full h-2 ${mouthHoverColor}`
                      : 'w-4 rounded-full opacity-80'
                  }`}
                />
              </div>

              {/* Subtle Metallic Micro-Texture Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:6px_6px] opacity-15 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}