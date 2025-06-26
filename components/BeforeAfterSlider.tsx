
import React, { useState, useRef, useCallback } from 'react';

const BeforeAfterSlider: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isDragging) {
      handleMove(event.clientX);
    }
  }, [isDragging, handleMove]);
  
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (isDragging) {
        handleMove(event.touches[0].clientX);
    }
  }, [isDragging, handleMove]);

  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div className="w-full max-w-4xl mx-auto my-12 px-4">
      <div 
        ref={imageContainerRef}
        className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl cursor-e-resize select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <img
          src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1280&h=720&fit=crop&crop=center"
          alt="Before landscaping"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1280&h=720&fit=crop&crop=center"
            alt="After AI landscaping"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        
        <div
          className="absolute top-0 bottom-0 bg-white/50"
          style={{ left: `${sliderPosition}%`, width: '4px', transform: 'translateX(-50%)' }}
        />
        
        <div
          className="absolute top-1/2 -translate-y-1/2 bg-white rounded-full h-12 w-12 border-2 border-white/50 shadow-lg flex items-center justify-center cursor-e-resize"
          style={{ left: `${sliderPosition}%`, transform: 'translate(-50%, -50%)' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <svg className="w-6 h-6 text-[#212529]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>

        <div className="absolute top-4 left-4 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded">BEFORE</div>
        <div 
            className="absolute top-4 right-4 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded"
            style={{ opacity: sliderPosition > 60 ? 1 : 0, transition: 'opacity 0.3s' }}
        >
            AFTER
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
