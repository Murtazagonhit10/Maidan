'use client';
import { useEffect, useRef } from 'react';
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';

export default function ScrollProvider({ children }) {
    const scrollRef = useRef(null);

    useEffect(() => {
        let scroll = null;

        if (scrollRef.current) {
            scroll = new LocomotiveScroll({
                el: scrollRef.current,
                smooth: true,
                multiplier: 1,
                class: 'is-revealed',
                smartphone: { smooth: true },
                tablet: { smooth: true }
            });
        }

        return () => {
            if (scroll) scroll.destroy();
        };
    }, []);

    return (
        <div ref={scrollRef} data-scroll-container>
            {children}
        </div>
    );
}