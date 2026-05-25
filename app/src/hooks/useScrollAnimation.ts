import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationOptions {
  animation?: 'fade-up' | 'fade-in' | 'reveal' | 'zoom' | 'none';
  delay?: number;
  duration?: number;
  y?: number;
  stagger?: number;
  children?: string;
}

export function useScrollAnimation<T extends HTMLElement>(
  options: ScrollAnimationOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    animation = 'fade-up',
    delay = 0,
    duration = 0.8,
    y = 40,
    stagger = 0.1,
    children = '.animate-item',
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || animation === 'none') return;

    const targets = children ? el.querySelectorAll(children) : el;
    if (!targets || (targets instanceof NodeList && targets.length === 0)) return;

    const ctx = gsap.context(() => {
      const fromVars: gsap.TweenVars = { opacity: 0 };
      const toVars: gsap.TweenVars = {
        opacity: 1,
        duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      };

      if (animation === 'fade-up') {
        fromVars.y = y;
        toVars.y = 0;
      } else if (animation === 'zoom') {
        fromVars.scale = 0.95;
        toVars.scale = 1;
      } else if (animation === 'reveal') {
        fromVars.clipPath = 'inset(0 0 100% 0)';
        toVars.clipPath = 'inset(0 0 0% 0)';
      }

      if (targets instanceof NodeList && targets.length > 1) {
        gsap.fromTo(targets, fromVars, { ...toVars, stagger });
      } else {
        gsap.fromTo(el, fromVars, toVars);
      }
    }, el);

    return () => ctx.revert();
  }, [animation, delay, duration, y, stagger, children]);

  return ref;
}
