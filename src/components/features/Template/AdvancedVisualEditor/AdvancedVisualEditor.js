"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text, Transformer, Group } from 'react-konva';
import useImage from 'use-image';
import { ZoomIn, ZoomOut, RotateCcw, Lock, Unlock, Eye, EyeOff, Layers, Move, ArrowUp, ArrowDown } from 'lucide-react';
import styles from './AdvancedVisualEditor.module.css';

const URLImage = ({ src, ...props }) => {
    const [image] = useImage(src, 'anonymous');
    return <KonvaImage image={image} {...props} />;
};

export default function AdvancedVisualEditor({ imageSrc, overlaySrc, initialConfig, onChange, textLayers = [], onTextLayerChange, canvasSize }) {
    const [selectedId, selectShape] = useState(null);
    const stageRef = useRef(null);
    const transformerRef = useRef(null);
    const containerRef = useRef(null);

    // Zoom
    const [scale, setScale] = useState(1);
    const [stageScale, setStageScale] = useState(1);

    // Layer visibility & lock
    const [layerState, setLayerState] = useState({
        photo_placeholder: { visible: true, locked: false },
        overlay_layer: { visible: true, locked: false },
    });

    // Z-Index Order Manager
    const [layersOrder, setLayersOrder] = useState([]);

    useEffect(() => {
        setLayersOrder(prev => {
            let newOrder = [...prev];
            
            if (!newOrder.includes('photo_placeholder')) newOrder.push('photo_placeholder');
            
            if (overlaySrc && !newOrder.includes('overlay_layer')) {
                newOrder.push('overlay_layer');
            } else if (!overlaySrc && newOrder.includes('overlay_layer')) {
                newOrder = newOrder.filter(id => id !== 'overlay_layer');
            }
            
            // Sync text layers
            textLayers.forEach((_, i) => {
                const id = `text_${i}`;
                if (!newOrder.includes(id)) newOrder.push(id);
            });
            
            // Remove deleted text layers
            newOrder = newOrder.filter(id => {
                if (id.startsWith('text_')) {
                    const index = parseInt(id.replace('text_', ''));
                    return index < textLayers.length;
                }
                return true;
            });
            
            return newOrder;
        });
    }, [overlaySrc, textLayers.length]);

    // Canvas dimensions
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

    const handleSelect = useCallback((id) => {
        if (layerState[id]?.locked) return;
        selectShape(id);
    }, [layerState]);

    const checkDeselect = (e) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            selectShape(null);
        }
    };

    // Attach transformer to selected shape
    useEffect(() => {
        if (selectedId && transformerRef.current && stageRef.current) {
            const node = stageRef.current.findOne('#' + selectedId);
            if (node) {
                transformerRef.current.nodes([node]);
                transformerRef.current.getLayer().batchDraw();
            }
        } else if (transformerRef.current) {
            transformerRef.current.nodes([]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [selectedId]);

    const handleTransformEnd = (e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        node.scaleX(1);
        node.scaleY(1);

        const newProps = {
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
        };

        const nodeId = node.id();

        if (nodeId === 'photo_placeholder') {
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
        } else if (nodeId === 'overlay_layer') {
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
        } else if (nodeId.startsWith('text_')) {
            const index = parseInt(nodeId.replace('text_', ''));
            const newLayers = [...textLayers];
            if (newLayers[index]) {
                newLayers[index] = {
                    ...newLayers[index],
                    x: (newProps.x / INTERNAL_WIDTH) * 100,
                    y: (newProps.y / INTERNAL_HEIGHT) * 100,
                    size: Math.round((newLayers[index].size || 14) * scaleX)
                };
                onTextLayerChange(newLayers);
            }
        }
    };

    const handleDragEnd = (e) => {
        handleTransformEnd(e);
    };

    // Toggle layer state
    const toggleLayerProp = (layerId, prop) => {
        setLayerState(prev => ({
            ...prev,
            [layerId]: {
                ...prev[layerId],
                [prop]: !(prev[layerId]?.[prop] ?? false)
            }
        }));
        if (prop === 'locked' && selectedId === layerId) {
            selectShape(null);
        }
    };

    const moveLayer = (layerId, direction) => {
        setLayersOrder(prev => {
            const idx = prev.indexOf(layerId);
            if (idx < 0) return prev;
            
            const newOrder = [...prev];
            if (direction === 'up' && idx < prev.length - 1) { // Visual 'up' is higher index in Konva
                [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
            } else if (direction === 'down' && idx > 0) { // Visual 'down' is lower index in Konva
                [newOrder[idx], newOrder[idx - 1]] = [newOrder[idx - 1], newOrder[idx]];
            }
            return newOrder;
        });
        
        // Re-trigger transformer redraw so the bounding box updates visually
        setTimeout(() => {
            if (transformerRef.current) {
                transformerRef.current.getLayer()?.batchDraw();
            }
        }, 50);
    };

    // Responsive Stage
    useEffect(() => {
        const resize = () => {
            if (containerRef.current) {
                // Find the real workspace container (the one with the gray background)
                let parent = containerRef.current.parentElement;
                while (parent && parent.offsetHeight < 100 && parent.parentElement) {
                    parent = parent.parentElement;
                }
                
                if (!parent) return;

                const padding = 40;
                const availableWidth = Math.max(200, parent.offsetWidth - padding);
                const availableHeight = Math.max(200, parent.offsetHeight - padding);

                const scaleW = availableWidth / INTERNAL_WIDTH;
                const scaleH = availableHeight / INTERNAL_HEIGHT;

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
        const timer = setTimeout(resize, 100);

        return () => {
            window.removeEventListener('resize', resize);
            observer.disconnect();
            clearTimeout(timer);
        };
    }, [INTERNAL_HEIGHT, INTERNAL_WIDTH]);

    // Zoom controls
    const zoomIn = () => setStageScale(s => Math.min(3, s + 0.15));
    const zoomOut = () => setStageScale(s => Math.max(0.3, s - 0.15));
    const resetZoom = () => setStageScale(1);

    const effectiveScale = scale * stageScale;

    // Wheel zoom
    const handleWheel = (e) => {
        e.evt.preventDefault();
        const delta = e.evt.deltaY > 0 ? -0.05 : 0.05;
        setStageScale(s => Math.min(3, Math.max(0.3, s + delta)));
    };

    if (!imageSrc) {
        return (
            <div className={styles.empty}>
                <Move size={48} strokeWidth={1} />
                <p>Faça upload de uma imagem de fundo para começar</p>
            </div>
        );
    }

    // Helper to render layer items in panel
    const renderLayerItem = (id) => {
        let label = '';
        let isText = false;
        let isBg = false;
        
        if (id === 'background_layer') {
            label = '🖼️ Imagem de Fundo (Fixa)';
            isBg = true;
        } else if (id === 'photo_placeholder') {
            label = '📸 Área da Foto';
        } else if (id === 'overlay_layer') {
            label = '✨ Moldura (PNG Transparente)';
        } else if (id.startsWith('text_')) {
            const index = parseInt(id.replace('text_', ''));
            label = `📝 ${textLayers[index]?.content?.slice(0, 12) || 'Texto'}`;
            isText = true;
        } else return null;

        if (isBg) {
            return (
                <div key={id} className={styles.layerItem} style={{ opacity: 0.6, cursor: 'not-allowed' }} title="A imagem de fundo é o tamanho base e não pode ser movida">
                    <span className={styles.layerItemLabel}>{label}</span>
                    <div className={styles.layerItemActions}>
                        <Lock size={11} />
                    </div>
                </div>
            );
        }

        return (
            <div
                key={id}
                className={`${styles.layerItem} ${selectedId === id ? styles.layerItemActive : ''}`}
                onClick={() => handleSelect(id)}
            >
                <span className={styles.layerItemLabel}>{label}</span>
                <div className={styles.layerItemActions}>
                    <button onClick={(e) => { e.stopPropagation(); moveLayer(id, 'up'); }} title="Trazer para frente">
                        <ArrowUp size={11} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); moveLayer(id, 'down'); }} title="Enviar para trás">
                        <ArrowDown size={11} />
                    </button>
                    {!isText && (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); toggleLayerProp(id, 'locked'); }} title={layerState[id]?.locked ? 'Desbloquear' : 'Bloquear'}>
                                {layerState[id]?.locked ? <Lock size={11} /> : <Unlock size={11} />}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); toggleLayerProp(id, 'visible'); }} title={layerState[id]?.visible !== false ? 'Ocultar' : 'Mostrar'}>
                                {layerState[id]?.visible !== false ? <Eye size={11} /> : <EyeOff size={11} />}
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container} ref={containerRef}>
            {/* Layer Panel */}
            <div className={styles.layerPanel}>
                <div className={styles.layerPanelTitle}>
                    <Layers size={12} />
                    Ordem das Camadas
                </div>
                {/* Reverse rendering so visual top layer is at the top of the list */}
                <div className={styles.layerList}>
                    {[...layersOrder].reverse().map(renderLayerItem)}
                    {renderLayerItem('background_layer')}
                </div>
            </div>

            {/* Zoom Controls */}
            <div className={styles.zoomControls}>
                <button onClick={zoomOut} title="Zoom Out"><ZoomOut size={14} /></button>
                <span className={styles.zoomLabel}>{Math.round(stageScale * 100)}%</span>
                <button onClick={zoomIn} title="Zoom In"><ZoomIn size={14} /></button>
                <button onClick={resetZoom} title="Resetar Zoom"><RotateCcw size={14} /></button>
            </div>

            {/* Canvas */}
            <div className={styles.stageArea}>
                <Stage
                    width={INTERNAL_WIDTH * effectiveScale}
                    height={INTERNAL_HEIGHT * effectiveScale}
                    onMouseDown={checkDeselect}
                    onTouchStart={checkDeselect}
                    onWheel={handleWheel}
                    ref={stageRef}
                >
                    <Layer scaleX={effectiveScale} scaleY={effectiveScale}>
                        {/* Background always at the very bottom */}
                        <URLImage
                            src={imageSrc}
                            width={INTERNAL_WIDTH}
                            height={INTERNAL_HEIGHT}
                            listening={false}
                        />

                        {/* Render shapes in order of z-index array */}
                        {layersOrder.map(layerId => {
                            if (layerId === 'photo_placeholder' && layerState.photo_placeholder?.visible !== false) {
                                return (
                                    <Group
                                        key={layerId}
                                        x={placeholder.x}
                                        y={placeholder.y}
                                        width={placeholder.width}
                                        height={placeholder.height}
                                        rotation={placeholder.rotation}
                                        draggable={!layerState.photo_placeholder?.locked}
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
                                            fill="rgba(59, 130, 246, 0.15)"
                                            stroke={selectedId === 'photo_placeholder' ? '#3b82f6' : 'rgba(255,255,255,0.8)'}
                                            strokeWidth={selectedId === 'photo_placeholder' ? 2.5 : 1.5}
                                            dash={selectedId === 'photo_placeholder' ? [] : [8, 4]}
                                            cornerRadius={2}
                                        />
                                        <Text
                                            text="📷 Área da Foto"
                                            width={placeholder.width}
                                            height={placeholder.height}
                                            align="center"
                                            verticalAlign="middle"
                                            fontFamily="sans-serif"
                                            fontSize={Math.min(18, placeholder.width / 10)}
                                            fill="rgba(255,255,255,0.9)"
                                        />
                                    </Group>
                                );
                            }

                            if (layerId === 'overlay_layer' && overlaySrc && layerState.overlay_layer?.visible !== false) {
                                return (
                                    <Group
                                        key={layerId}
                                        x={overlay.x}
                                        y={overlay.y}
                                        width={overlay.width}
                                        height={overlay.height}
                                        rotation={overlay.rotation}
                                        draggable={!layerState.overlay_layer?.locked}
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
                                        {selectedId === 'overlay_layer' && (
                                            <Rect
                                                width={overlay.width}
                                                height={overlay.height}
                                                stroke="#8b5cf6"
                                                strokeWidth={2}
                                                fill="transparent"
                                                listening={false}
                                            />
                                        )}
                                    </Group>
                                );
                            }

                            if (layerId.startsWith('text_')) {
                                const i = parseInt(layerId.replace('text_', ''));
                                const layer = textLayers[i];
                                if (!layer) return null;
                                return (
                                    <Text
                                        key={layerId}
                                        name={`text_${i}`}
                                        id={`text_${i}`}
                                        x={(layer.x / 100) * INTERNAL_WIDTH}
                                        y={(layer.y / 100) * INTERNAL_HEIGHT}
                                        text={layer.content || "Texto"}
                                        fontSize={layer.size * 2}
                                        fill={layer.color}
                                        draggable
                                        onClick={() => handleSelect(`text_${i}`)}
                                        onTap={() => handleSelect(`text_${i}`)}
                                        onDragEnd={handleDragEnd}
                                        onTransformEnd={handleTransformEnd}
                                    />
                                );
                            }

                            return null;
                        })}

                        <Transformer
                            ref={transformerRef}
                            rotateEnabled={true}
                            keepRatio={false}
                            anchorSize={10}
                            anchorCornerRadius={2}
                            anchorStroke="#3b82f6"
                            anchorFill="#fff"
                            borderStroke="#3b82f6"
                            borderStrokeWidth={1.5}
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
        </div>
    );
}
