"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@heroui/react";
import type { SimulationResult, TrackSegment, LevelConfig } from "@/lib/types/racing";

interface TelemetryMapProps {
        segments: TrackSegment[];
        result: SimulationResult | null;
        isActive: boolean;
}

export function TelemetryMap({ segments, result, isActive }: TelemetryMapProps) {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const [progressIdx, setProgressIdx] = useState(0);

        // Precompute simplified x,y track map
        const trackNodes = useRef<{ x: number, y: number, type: string }[]>([]);

        useEffect(() => {
                if (!segments.length) return;
                
                // Very basic 2D representation of segments stringing together
                let currentAngle = 0;
                let cx = 400; // Center offset 
                let cy = 300; 

                const nodes: { x: number, y: number, type: string }[] = [{ x: cx, y: cy, type: "start" }];

                for (const seg of segments) {
                        if (seg.type === "straight") {
                                const len = Math.max(20, (seg as any).length_m / 10);
                                cx += Math.cos(currentAngle) * len;
                                cy += Math.sin(currentAngle) * len;
                        } else {
                                // Corner - turn slowly
                                currentAngle += Math.PI / 4; // 45 deg right turn representation
                                const r = Math.max(15, (seg as any).radius_m / 10);
                                cx += Math.cos(currentAngle) * r;
                                cy += Math.sin(currentAngle) * r;
                        }
                        nodes.push({ x: cx, y: cy, type: seg.type });
                }

                trackNodes.current = nodes;
        }, [segments]);

        useEffect(() => {
                if (!isActive || !result?.segments?.length) {
                        setProgressIdx(result?.segments?.length ?? 0);
                        return;
                }

                // Animate if active
                setProgressIdx(0);
                const interval = setInterval(() => {
                        setProgressIdx(prev => {
                                if (prev >= result.segments.length - 1) {
                                        clearInterval(interval);
                                        return prev;
                                }
                                return prev + 1;
                        });
                }, 50); // 50ms tick per segment
                return () => clearInterval(interval);
        }, [isActive, result]);

        useEffect(() => {
                const canvas = canvasRef.current;
                if (!canvas || !trackNodes.current.length) return;
                
                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                // Clear
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw track base layer
                ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
                ctx.lineWidth = 14;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.beginPath();
                ctx.moveTo(trackNodes.current[0].x, trackNodes.current[0].y);
                for (let i = 1; i < trackNodes.current.length; i++) {
                        ctx.lineTo(trackNodes.current[i].x, trackNodes.current[i].y);
                }
                ctx.stroke();

                // Draw active car position
                if (result?.segments?.length && progressIdx < result.segments.length) {
                        const currentGlobalSegIndex = progressIdx % segments.length; // Approximate loops
                        if (currentGlobalSegIndex < trackNodes.current.length) {
                                const pos = trackNodes.current[currentGlobalSegIndex];
                                const currentSegData = result.segments[progressIdx] as any;
                                
                                // Color halo based on tyre wear or crash
                                const isCrashed = currentSegData.crashed;
                                const isLimp = currentSegData.tyre_life <= 0 || currentSegData.fuel_after_l <= 0; // Pseudo
                                const degradation = currentSegData.tyre_degradation_after;

                                ctx.beginPath();
                                ctx.arc(pos.x, pos.y, 8, 0, 2 * Math.PI);
                                if (isCrashed) {
                                        ctx.fillStyle = "#ff4500"; // Red crash alert
                                } else if (isLimp) {
                                        ctx.fillStyle = "#fbbf24"; // Orange Limp Mode
                                } else {
                                        ctx.fillStyle = "#00ffcc"; // Speeding
                                }
                                ctx.fill();

                                // Halo
                                ctx.beginPath();
                                ctx.arc(pos.x, pos.y, 16 + (degradation * 10), 0, 2 * Math.PI);
                                ctx.fillStyle = "rgba(0, 255, 204, 0.2)";
                                if (isCrashed || isLimp) {
                                        ctx.fillStyle = "rgba(255, 69, 0, 0.3)";
                                }
                                ctx.fill();
                        }
                }
        }, [result, segments, progressIdx]);

        return (
                <Card className="bg-[#0f172a]/90 border-white/10 w-full overflow-hidden">
                        <Card.Header className="border-b border-white/5">
                                <Card.Title className="text-white text-sm uppercase font-bold tracking-wider pt-2 pl-2">Live Telemetry & Pitwall</Card.Title>
                        </Card.Header>
                        <div className="relative w-full h-[500px] flex items-center justify-center bg-black/50">
                                {/* Grid backdrop */}
                                <div className="absolute inset-0 bg-[#0f172a]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                <canvas 
                                        ref={canvasRef} 
                                        width={800} 
                                        height={600} 
                                        className="relative z-10 w-full h-full object-contain mix-blend-screen"
                                />
                        </div>
                </Card>
        );
}