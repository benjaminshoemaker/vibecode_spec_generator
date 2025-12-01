import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook that synchronizes scrolling of an element with the window.
 * When the user scrolls inside the element, the page scrolls proportionally.
 * Disabled on mobile devices (< 768px width).
 */
export function useSyncScroll<T extends HTMLElement>() {
  const elementRef = useRef<T>(null);
  const lastScrollTime = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);

  const handleScroll = useCallback((event: Event) => {
    // Skip on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;

    // Prevent feedback loops
    if (isScrollingRef.current) return;

    // Throttle to ~60fps
    const now = Date.now();
    if (now - lastScrollTime.current < 16) return;
    lastScrollTime.current = now;

    const element = event.target as T;
    if (!element) return;

    // Calculate scroll percentage within the element
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    const maxScrollTop = scrollHeight - clientHeight;

    // Skip if element has no scrollable content
    if (maxScrollTop <= 0) return;

    const scrollPercentage = scrollTop / maxScrollTop;

    // Calculate corresponding window scroll position
    const windowMaxScroll = document.documentElement.scrollHeight - window.innerHeight;

    // Skip if page has no scrollable content
    if (windowMaxScroll <= 0) return;

    const targetWindowScroll = scrollPercentage * windowMaxScroll;

    // Apply scroll to window
    isScrollingRef.current = true;
    window.scrollTo({
      top: targetWindowScroll,
      behavior: 'auto',
    });

    // Reset flag after frame to prevent feedback loops
    requestAnimationFrame(() => {
      isScrollingRef.current = false;
    });
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return elementRef;
}
