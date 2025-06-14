'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollButtonsProps {
  className?: string;
  buttonClassName?: string;
  topOffset?: number;
  bottomOffset?: number;
}

export default function ScrollButtons({
  className = '',
  buttonClassName = '',
  topOffset = 100,
  bottomOffset = 100
}: ScrollButtonsProps) {
  const [showTopButton, setShowTopButton] = useState(false);
  const [showBottomButton, setShowBottomButton] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  
  // Check if page is scrollable and track scroll position
  useEffect(() => {
    const checkScrollability = () => {
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );
      const windowHeight = window.innerHeight;
      
      // Determine if the content is scrollable (document taller than viewport)
      const canScroll = documentHeight > windowHeight;
      
      // Only update if changed to prevent unnecessary re-renders
      if (isScrollable !== canScroll) {
        setIsScrollable(canScroll);
      }
      
      // If not scrollable, hide both buttons
      if (!canScroll) {
        setShowTopButton(false);
        setShowBottomButton(false);
        return;
      }
    };
    
    // Check initial scrollability
    checkScrollability();
    
    // Add resize event listener to check scrollability when window size changes
    window.addEventListener('resize', checkScrollability);
    
    return () => {
      window.removeEventListener('resize', checkScrollability);
    };
  }, [isScrollable]);
  
  // Track scroll position to show/hide buttons appropriately
  useEffect(() => {
    const checkScrollPosition = () => {
      if (!isScrollable) return;
      
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      
      // Show top button when scrolled down past topOffset
      setShowTopButton(scrollPosition > topOffset);
      
      // Show bottom button when not at bottom
      const isAtBottom = scrollPosition + windowHeight >= documentHeight - bottomOffset;
      setShowBottomButton(!isAtBottom);
    };
    
    // Initial check
    checkScrollPosition();
    
    // Add event listener
    window.addEventListener('scroll', checkScrollPosition);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
    };
  }, [isScrollable, topOffset, bottomOffset]);
  
  // Smooth scroll to top
  const handleScrollTop = () => {
    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } catch (e) {
      // Fallback for older browsers
      window.scrollTo(0, 0);
    }
  };
  
  // Smooth scroll to bottom
  const handleScrollBottom = () => {
    try {
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      
      window.scrollTo({
        top: documentHeight,
        behavior: 'smooth'
      });
    } catch (e) {
      // Fallback for older browsers
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      window.scrollTo(0, documentHeight);
    }
  };
  
  // Don't render anything if page is not scrollable
  if (!isScrollable) {
    return null;
  }
  
  return (
    <div className={cn("fixed right-6 bottom-6 flex flex-col gap-3 z-50", className)}>
      {/* Up button - only show when scrolled down */}
      <button
        onClick={handleScrollTop}
        className={cn(
          "flex items-center justify-center rounded-full w-10 h-10",
          "bg-white/10 backdrop-blur-sm hover:bg-white/20",
          "text-white/70 hover:text-white",
          "transition-all duration-300 ease-in-out",
          "border border-white/10 hover:border-white/20",
          !showTopButton && "opacity-0 pointer-events-none scale-90",
          buttonClassName
        )}
        aria-label="Scroll to top"
      >
        <ChevronUp size={20} />
      </button>
      
      {/* Down button - only show when not at bottom */}
      <button
        onClick={handleScrollBottom}
        className={cn(
          "flex items-center justify-center rounded-full w-10 h-10",
          "bg-white/10 backdrop-blur-sm hover:bg-white/20",
          "text-white/70 hover:text-white",
          "transition-all duration-300 ease-in-out",
          "border border-white/10 hover:border-white/20",
          !showBottomButton && "opacity-0 pointer-events-none scale-90",
          buttonClassName
        )}
        aria-label="Scroll to bottom"
      >
        <ChevronDown size={20} />
      </button>
    </div>
  );
} 