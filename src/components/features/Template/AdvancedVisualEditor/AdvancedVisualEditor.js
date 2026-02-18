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

export default function AdvancedVisualEditor({ imageSrc, initialConfig, onChange, textLayers, onTextLayerChange, canvasSize }) {
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

    // Photo Placeholder State
    const [placeholder, setPlaceholder] = useState({
        x: (initialConfig?.x || 0), // These come in % from parent usually? No, parent passes config object
        y: (initialConfig?.y || 0),
        width: (initialConfig?.width || 0),
        height: (initialConfig?.height || 0),
        rotation: 0,
        id: 'photo_placeholder',
        type: 'placeholder'
    });

    // Normalize initial config from % to Internal PX if needed
    useEffect(() => {
        if (initialConfig?.unit === '%') {
            setPlaceholder({
                x: (initialConfig.x / 100) * INTERNAL_WIDTH,
                y: (initialConfig.y / 100) * INTERNAL_HEIGHT,
                width: (initialConfig.width / 100) * INTERNAL_WIDTH,
                height: (initialConfig.height / 100) * INTERNAL_HEIGHT,
                rotation: 0,
                id: 'photo_placeholder',
                type: 'placeholder'
            });
        }
    }, [initialConfig, INTERNAL_HEIGHT]);

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

            // Convert back to % for parent
            if (onChange) {
                onChange({
                    x: (updated.x / INTERNAL_WIDTH) * 100,
                    y: (updated.y / INTERNAL_HEIGHT) * 100,
                    width: (updated.width / INTERNAL_WIDTH) * 100,
                    height: (updated.height / INTERNAL_HEIGHT) * 100,
                    rotation: updated.rotation,
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

            // For now, let's just update position %
            newLayers[index] = {
                ...newLayers[index],
                x: (newProps.x / INTERNAL_WIDTH) * 100,
                y: (newProps.y / INTERNAL_HEIGHT) * 100,
                // Updating size via transform is tricky for text without scale, let's ignore size changes via transform for text for now
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
                const { offsetWidth } = containerRef.current;
                setScale(offsetWidth / INTERNAL_WIDTH);
            }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    if (!imageSrc) return <div className={styles.empty}>Selecione uma imagem de fundo primeiro.</div>;

    return (
        <div className={styles.container} ref={containerRef}>
            <div className={styles.toolbar}>
                <div className={styles.toolItem} onClick={() => selectShape(null)}>
                    <MousePointer2 size={18} />
                    <span>Selecionar</span>
                </div>
                {/* Future tools: Add Text, Add Shape */}
            </div>

            <Stage
                width={INTERNAL_WIDTH * scale}
                height={INTERNAL_HEIGHT * scale}
                scaleX={scale}
                scaleY={scale}
                onMouseDown={checkDeselect}
                onTouchStart={checkDeselect}
                ref={stageRef}
            >
                <Layer>
                    {/* Background */}
                    <URLImage
                        src={imageSrc}
                        width={INTERNAL_WIDTH}
                        height={INTERNAL_HEIGHT}
                        listening={false} // Background not selectable
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
                            onDragEnd={handleDragEnd}
                            onTransformEnd={handleTransformEnd}
                        />
                    ))}

                    <Transformer
                        ref={transformerRef}
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
