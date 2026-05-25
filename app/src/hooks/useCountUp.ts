import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useCountUp(
  end: number,
  options: { duration?: number; suffix?: string; start?: number } = {}
) {
  const { duration = 2, suffix = '', start = 0 } = options;
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(`${start}${suffix}`);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obj = { value: start };

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        value: end,
        duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          setDisplayValue(`${Math.round(obj.value)}${suffix}`);
        },
      });
    }, el);

    return () => ctx.revert();
  }, [end, duration, start, suffix]);

  return { ref, displayValue };
}
