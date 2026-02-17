"use client";

import { useState, useRef, useEffect } from 'react';
import styles from './VisualEditor.module.css';
import { ImagePlus } from 'lucide-react';

export default function VisualEditor({ imageSrc, initialConfig, onChange, canvasSize }) {
    const aspectRatio = canvasSize ? `${canvasSize.width}/${canvasSize.height}` : '210/297';

    const containerRef = useRef(null);
    const [rect, setRect] = useState(initialConfig || { x: 50, y: 50, width: 200, height: 200 });
    const [isDraggingState, setIsDraggingState] = useState(false);

    const dragStartRef = useRef({ x: 0, y: 0 });
    const rectRef = useRef(rect);
    const isDraggingRef = useRef(false);
    const activeHandleRef = useRef(null);

    useEffect(() => {
        rectRef.current = rect;
    }, [rect]);

    useEffect(() => {
        if (!imageSrc) return;

        const handleMouseMove = (e) => {
            if (!isDraggingRef.current && !activeHandleRef.current) return;
            e.preventDefault();

            const container = containerRef.current;
            if (!container) return;
            const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();

            const clientX = e.clientX || e.touches?.[0]?.clientX;
            const clientY = e.clientY || e.touches?.[0]?.clientY;

            const deltaX = clientX - dragStartRef.current.x;
            const deltaY = clientY - dragStartRef.current.y;

            dragStartRef.current = { x: clientX, y: clientY };

            let newRect = { ...rectRef.current };

            if (isDraggingRef.current) {
                newRect.x += deltaX;
                newRect.y += deltaY;
            } else if (activeHandleRef.current === 'se') {
                newRect.width += deltaX;
                newRect.height += deltaY;
            }

            rectRef.current = newRect;
            setRect(newRect);

            if (onChange) {
                // Return percentages
                onChange({
                    x: (newRect.x / containerWidth) * 100,
                    y: (newRect.y / containerHeight) * 100,
                    width: (newRect.width / containerWidth) * 100,
                    height: (newRect.height / containerHeight) * 100,
                    unit: '%'
                });
            }
        };

        const handleMouseUp = () => {
            if (isDraggingRef.current || activeHandleRef.current) {
                isDraggingRef.current = false;
                activeHandleRef.current = null;
                setIsDraggingState(false);
            }
        };

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
        e.preventDefault();
        e.stopPropagation();

        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;

        dragStartRef.current = { x: clientX, y: clientY };

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
            <img
                src={imageSrc}
                alt="Template Preview"
                className={styles.image}
                onLoad={(e) => {
                    const { width, height } = e.currentTarget.getBoundingClientRect();

                    let startRect = { ...initialConfig };

                    // Convert % to px for editing
                    if (initialConfig?.unit === '%') {
                        startRect = {
                            x: (initialConfig.x / 100) * width,
                            y: (initialConfig.y / 100) * height,
                            width: (initialConfig.width / 100) * width,
                            height: (initialConfig.height / 100) * height
                        };
                    }

                    setRect(startRect);
                    rectRef.current = startRect;
                }}
            />

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
