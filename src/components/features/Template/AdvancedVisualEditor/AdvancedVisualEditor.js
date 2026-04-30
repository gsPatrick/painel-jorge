"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text, Transformer, Group } from 'react-konva';
import useImage from 'use-image';
import { ImagePlus, Type, Square, X, MousePointer2 } from 'lucide-react';
import styles from './AdvancedVisualEditor.module.css';

const URLImage = ({ src, ...props }) => {
    const [image] = useImage(src);
    return <KonvaImage image={image} {...props} />;
};

export default function AdvancedVisualEditor({ imageSrc, overlaySrc, initialConfig, onChange, textLayers, onTextLayerChange, canvasSize }) {
    const [selectedId, selectShape] = useState(null);
    const stageRef = useRef(null);
    const transformerRef = useRef(null);

    // Initial scale to fit screen
    const [scale, setScale] = useState(1);
    const containerRef = useRef(null);

    // Canvas dimensions (mm to px conversion roughly or just ratio)
    // We will treat internal coordinates as relative % or simple px and normalize on save.
    // For simplicity, let's work with a fixed internal resolution (e.g. 1000px width) and scale status.
    const INTERNAL_WIDTH = 1000;
    const aspectRatio = canvasSize ? canvasSize.width / canvasSize.height : 210 / 297;
    const INTERNAL_HEIGHT = INTERNAL_WIDTH / aspectRatio;

    const isPercent = initialConfig?.unit === '%';

    // Overlay State
    const [overlay, setOverlay] = useState({
        x: isPercent ? (initialConfig.overlayX / 100) * INTERNAL_WIDTH : (initialConfig?.overlayX || 0),
        y: isPercent ? (initialConfig.overlayY / 100) * INTERNAL_HEIGHT : (initialConfig?.overlayY || 0),
        width: isPercent ? (initialConfig.overlayWidth / 100) * INTERNAL_WIDTH : (initialConfig?.overlayWidth || INTERNAL_WIDTH),
        height: isPercent ? (initialConfig.overlayHeight / 100) * INTERNAL_HEIGHT : (initialConfig?.overlayHeight || INTERNAL_HEIGHT),
        rotation: (initialConfig?.overlayRotation || 0),
        id: 'overlay_layer',
        type: 'overlay'
    });

    // Photo Placeholder State
    const [placeholder, setPlaceholder] = useState({
        x: isPercent ? (initialConfig.x / 100) * INTERNAL_WIDTH : (initialConfig?.x || 50),
        y: isPercent ? (initialConfig.y / 100) * INTERNAL_HEIGHT : (initialConfig?.y || 50),
        width: isPercent ? (initialConfig.width / 100) * INTERNAL_WIDTH : (initialConfig?.width || 200),
        height: isPercent ? (initialConfig.height / 100) * INTERNAL_HEIGHT : (initialConfig?.height || 200),
        rotation: initialConfig?.rotation || 0,
        id: 'photo_placeholder',
        type: 'placeholder'
    });

    // Text Layers State

    // Text Layers State
    // We need to map parent textLayers to Konva state
    // AND update parent when changed.

    const handleSelect = (id) => {
        selectShape(id);
    };

    const checkDeselect = (e) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            selectShape(null);
        }
    };

    useEffect(() => {
        if (selectedId && transformerRef.current) {
            const node = stageRef.current.findOne('.' + selectedId);
            if (node) {
                transformerRef.current.nodes([node]);
                transformerRef.current.getLayer().batchDraw();
            }
        }
    }, [selectedId]);

    // Update parent on transform end
    const handleTransformEnd = (e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Reset scale to 1 and adjust width/height
        node.scaleX(1);
        node.scaleY(1);

        const newProps = {
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
        };

        if (selectedId === 'photo_placeholder') {
            const updated = { ...placeholder, ...newProps };
            setPlaceholder(updated);

            if (onChange) {
                onChange({
                    ...initialConfig,
                    x: (updated.x / INTERNAL_WIDTH) * 100,
                    y: (updated.y / INTERNAL_HEIGHT) * 100,
                    width: (updated.width / INTERNAL_WIDTH) * 100,
                    height: (updated.height / INTERNAL_HEIGHT) * 100,
                    rotation: updated.rotation,
                    unit: '%'
                });
            }
        } else if (selectedId === 'overlay_layer') {
            const updated = { ...overlay, ...newProps };
            setOverlay(updated);

            if (onChange) {
                onChange({
                    ...initialConfig,
                    overlayX: (updated.x / INTERNAL_WIDTH) * 100,
                    overlayY: (updated.y / INTERNAL_HEIGHT) * 100,
                    overlayWidth: (updated.width / INTERNAL_WIDTH) * 100,
                    overlayHeight: (updated.height / INTERNAL_HEIGHT) * 100,
                    overlayRotation: updated.rotation,
                    unit: '%'
                });
            }
        } else if (selectedId.startsWith('text_')) {
            // Handle text update
            // Note: For text, we might just update font size or scale?
            // Simplified: Update parent textLayers
            const index = parseInt(selectedId.replace('text_', ''));
            const newLayers = [...textLayers];
            // Calculations for text are complex because parent expects size in px relative to something?
            // Let's assume parent textLayers are consistent.

            // For now, let's update position % and size
            newLayers[index] = {
                ...newLayers[index],
                x: (newProps.x / INTERNAL_WIDTH) * 100,
                y: (newProps.y / INTERNAL_HEIGHT) * 100,
                size: (newLayers[index].size || 14) * scaleX // Update font size based on scale
            };
            onTextLayerChange(newLayers);
        }
    };

    const handleDragEnd = (e) => {
        handleTransformEnd(e);
    };

    // Responsive Stage
    useEffect(() => {
        const resize = () => {
            if (containerRef.current) {
                // Find the main workspace container (the one with the gray background)
                let parent = containerRef.current.parentElement;
                while (parent && parent.tagName !== 'MAIN' && !parent.style.backgroundColor.includes('cbd5e1')) {
                    parent = parent.parentElement;
                }
                
                if (!parent) parent = containerRef.current.parentElement;
                
                const padding = 80; 
                const availableWidth = Math.max(300, parent.offsetWidth - padding);
                const availableHeight = Math.max(300, parent.offsetHeight - padding);
                
                const scaleW = availableWidth / INTERNAL_WIDTH;
                const scaleH = availableHeight / INTERNAL_HEIGHT;
                
                // Use the smaller scale to ensure it fits both directions
                const newScale = Math.min(scaleW, scaleH);
                setScale(newScale); 
            }
        };
        
        const observer = new ResizeObserver(resize);
        if (containerRef.current?.parentElement) {
            observer.observe(containerRef.current.parentElement);
        }
        
        resize();
        window.addEventListener('resize', resize);
        // Initial delay to allow flexbox to settle
        const timer = setTimeout(resize, 100);

        return () => {
            window.removeEventListener('resize', resize);
            observer.disconnect();
            clearTimeout(timer);
        };
    }, [INTERNAL_HEIGHT, INTERNAL_WIDTH]);

    return (
        <div className={styles.container} ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Layer Selector Overlay */}
            <div style={{ 
                position: 'absolute', 
                bottom: '1.5rem', 
                left: '1.5rem', 
                zIndex: 30,
                backgroundColor: 'rgba(255,255,255,0.95)',
                padding: '0.4rem',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                border: '1px solid #e2e8f0'
            }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', padding: '0.2rem 0.5rem', textTransform: 'uppercase' }}>Camadas</span>
                <button 
                    onClick={() => handleSelect('photo_placeholder')}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        backgroundColor: selectedId === 'photo_placeholder' ? '#3b82f6' : 'transparent',
                        color: selectedId === 'photo_placeholder' ? '#fff' : '#1e293b',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                    }}
                >
                    🖼️ Área da Foto
                </button>
                {overlaySrc && (
                    <button 
                        onClick={() => handleSelect('overlay_layer')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            backgroundColor: selectedId === 'overlay_layer' ? '#3b82f6' : 'transparent',
                            color: selectedId === 'overlay_layer' ? '#fff' : '#1e293b',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: 'left'
                        }}
                    >
                        🎭 Moldura (PNG)
                    </button>
                )}
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stage
                    width={INTERNAL_WIDTH * scale}
                    height={INTERNAL_HEIGHT * scale}
                    onMouseDown={checkDeselect}
                    onTouchStart={checkDeselect}
                    ref={stageRef}
                >
                <Layer scaleX={scale} scaleY={scale}>
                    {/* Background */}
                    <URLImage
                        src={imageSrc}
                        width={INTERNAL_WIDTH}
                        height={INTERNAL_HEIGHT}
                        listening={false} 
                    />

                    {/* Photo Placeholder */}
                    <Group
                        x={placeholder.x}
                        y={placeholder.y}
                        width={placeholder.width}
                        height={placeholder.height}
                        rotation={placeholder.rotation}
                        draggable
                        id="photo_placeholder"
                        name="photo_placeholder"
                        onDragEnd={handleDragEnd}
                        onTransformEnd={handleTransformEnd}
                        onClick={() => handleSelect('photo_placeholder')}
                        onTap={() => handleSelect('photo_placeholder')}
                    >
                        <Rect
                            width={placeholder.width}
                            height={placeholder.height}
                            fill="rgba(0,0,0,0.3)"
                            stroke={selectedId === 'photo_placeholder' ? '#00A3FF' : '#fff'}
                            strokeWidth={2}
                            dash={[5, 5]}
                        />
                        <Text
                            text="Área da Foto"
                            width={placeholder.width}
                            height={placeholder.height}
                            align="center"
                            verticalAlign="middle"
                            fontFamily="sans-serif"
                            fontSize={16}
                            fill="#fff"
                        />
                    </Group>

                    {/* Overlay / Frame Layer */}
                    {overlaySrc && (
                        <Group
                            x={overlay.x}
                            y={overlay.y}
                            width={overlay.width}
                            height={overlay.height}
                            rotation={overlay.rotation}
                            draggable
                            id="overlay_layer"
                            name="overlay_layer"
                            onDragEnd={handleDragEnd}
                            onTransformEnd={handleTransformEnd}
                            onClick={() => handleSelect('overlay_layer')}
                            onTap={() => handleSelect('overlay_layer')}
                        >
                            <URLImage
                                src={overlaySrc}
                                width={overlay.width}
                                height={overlay.height}
                            />
                        </Group>
                    )}

                    {/* Text Layers */}
                    {textLayers.map((layer, i) => (
                        <Text
                            key={i}
                            name={`text_${i}`}
                            id={`text_${i}`}
                            x={(layer.x / 100) * INTERNAL_WIDTH}
                            y={(layer.y / 100) * INTERNAL_HEIGHT}
                            text={layer.content || "Texto"}
                            fontSize={layer.size * 2} // visual scaling correction roughly
                            fill={layer.color}
                            draggable
                            onClick={() => handleSelect(`text_${i}`)}
                            onTap={() => handleSelect(`text_${i}`)}
                            onDblClick={() => handleSelect(`text_${i}`)}
                            onDragEnd={handleDragEnd}
                            onTransformEnd={handleTransformEnd}
                        />
                    ))}

                    <Transformer
                        ref={transformerRef}
                        enabledAnchors={
                            selectedId?.startsWith('text_') 
                            ? ['top-left', 'top-right', 'bottom-left', 'bottom-right'] 
                            : ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right']
                        }
                        boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    />
                </Layer>
            </Stage>
        </div>
    );
}
