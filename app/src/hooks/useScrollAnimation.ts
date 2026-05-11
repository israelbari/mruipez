import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimation<T extends HTMLElement>(
  animation: (el: T, gsapInstance: typeof gsap) => gsap.core.Timeline | gsap.core.Tween | void,
  deps: unknown[] = []
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set(el.children.length > 0 ? el.children : el, { opacity: 1, y: 0, x: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      animation(el, gsap);
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

export function useFadeInUp<T extends HTMLElement>(delay = 0, duration = 0.8, y = 30) {
  return useScrollAnimation<T>((el, gsap) => {
    gsap.from(el, {
      opacity: 0,
      y,
      duration,
      delay,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });
}

export function useStaggerChildren<T extends HTMLElement>(
  selector: string,
  stagger = 0.1,
  duration = 0.8,
  y = 30
) {
  return useScrollAnimation<T>((el, gsap) => {
    gsap.from(el.querySelectorAll(selector), {
      opacity: 0,
      y,
      duration,
      stagger,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  });
}
