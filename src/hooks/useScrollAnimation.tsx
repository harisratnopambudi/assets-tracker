import { useEffect, useRef, useState } from 'react';

// Hook for scroll animations
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>() {
    const ref = useRef<T>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Only animate once
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px',
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return { ref, isVisible };
}

// Animated container component
interface AnimatedSectionProps {
    children: React.ReactNode;
    className?: string;
    animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale';
    delay?: number;
}

export function AnimatedSection({
    children,
    className = '',
    animation = 'fade-up',
    delay = 0
}: AnimatedSectionProps) {
    const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();

    const animationClass = {
        'fade-up': 'scroll-animate',
        'fade-left': 'scroll-animate-left',
        'fade-right': 'scroll-animate-right',
        'scale': 'scroll-animate-scale',
    }[animation];

    return (
        <div
            ref={ref}
            className={`${animationClass} ${isVisible ? 'visible' : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}
