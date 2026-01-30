"use client";

import { useState, useRef, useEffect } from 'react';
import styles from './VisualEditor.module.css';
import { ImagePlus } from 'lucide-react';

export default function VisualEditor({ imageSrc, initialConfig, onChange }) {
    const containerRef = useRef(null);
    const [rect, setRect] = useState(initialConfig || { x: 50, y: 50, width: 200, height: 200 });
    const [isDraggingState, setIsDraggingState] = useState(false); // Only for UI feedback if needed

    // Refs for drag logic to avoid re-renders interrupting events
    const dragStartRef = useRef({ x: 0, y: 0 });
    const rectRef = useRef(rect);
    const isDraggingRef = useRef(false);
    const activeHandleRef = useRef(null);

    // Sync ref with prop/state updates
    useEffect(() => {
        rectRef.current = rect;
    }, [rect]);

    useEffect(() => {
        if (!imageSrc) return;

        const handleMouseMove = (e) => {
            if (!isDraggingRef.current && !activeHandleRef.current) return;
            e.preventDefault(); // Prevent scrolling/selection while dragging

            const clientX = e.clientX || e.touches?.[0]?.clientX;
            const clientY = e.clientY || e.touches?.[0]?.clientY;

            // Calculate delta
            const deltaX = clientX - dragStartRef.current.x;
            const deltaY = clientY - dragStartRef.current.y;

            // Update start point for next frame (relative movement)
            dragStartRef.current = { x: clientX, y: clientY };

            // Clone current rect from REF
            let newRect = { ...rectRef.current };

            if (isDraggingRef.current) {
                newRect.x += deltaX;
                newRect.y += deltaY;
            } else if (activeHandleRef.current === 'se') {
                newRect.width += deltaX;
                newRect.height += deltaY;
            }

            // Update state and ref
            rectRef.current = newRect;
            setRect(newRect);

            // Debounce or direct call onChange? Direct is fine for now but maybe expensive if heavy
            if (onChange) onChange(newRect);
        };

        const handleMouseUp = () => {
            if (isDraggingRef.current || activeHandleRef.current) {
                isDraggingRef.current = false;
                activeHandleRef.current = null;
                setIsDraggingState(false);
            }
        };

        // Attach to window so we don't lose drag if mouse leaves container
        window.addEventListener('mousemove', handleMouseMove, { passive: false });
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleMouseMove, { passive: false });
        window.addEventListener('touchend', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [imageSrc, onChange]);

    const handleMouseDown = (e, handle = null) => {
        // Prevent default to stop text selection or native image drag
        e.preventDefault();
        e.stopPropagation();

        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;

        // Set initial drag point
        dragStartRef.current = { x: clientX, y: clientY };

        // Update refs
        if (handle) {
            activeHandleRef.current = handle;
        } else {
            isDraggingRef.current = true;
            setIsDraggingState(true);
        }
    };

    if (!imageSrc) {
        return (
            <div className={styles.emptyState}>
                <ImagePlus size={48} />
                <p>Faça upload de uma imagem para configurar o template</p>
            </div>
        );
    }

    return (
        <div className={styles.container} ref={containerRef}>
            <img src={imageSrc} alt="Template Preview" className={styles.image} />

            <div
                className={styles.overlay}
                style={{
                    left: rect.x,
                    top: rect.y,
                    width: rect.width,
                    height: rect.height,
                    position: 'absolute',
                    cursor: isDraggingState ? 'grabbing' : 'grab'
                }}
                onMouseDown={(e) => handleMouseDown(e)}
                onTouchStart={(e) => handleMouseDown(e)}
            >
                <div
                    className={`${styles.handle} ${styles.handleSe}`}
                    onMouseDown={(e) => handleMouseDown(e, 'se')}
                    onTouchStart={(e) => handleMouseDown(e, 'se')}
                />
            </div>
        </div>
    );
}
