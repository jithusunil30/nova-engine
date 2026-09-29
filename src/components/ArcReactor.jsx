import React, { useEffect, useRef } from 'react';

export default function ArcReactor({ state = 'idle', isListening = false, isSpeaking = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let angle = 0;
    let pulse = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 90;

      angle += 0.02;
      pulse += 0.05;
      const scale = 1 + Math.sin(pulse) * (isSpeaking ? 0.09 : 0.04);

      // Color scheme based on state (Black & Fluorescent White)
      let primaryColor = '#ffffff';
      if (state === 'executing' || isListening) {
        primaryColor = '#ffffff'; // Radiant white when active/listening
      } else if (state === 'alert') {
        primaryColor = '#ff2a6d'; // Red alert
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);

      // Outer Rotating Ring 1
      ctx.rotate(angle * 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius + 30, 0, Math.PI * 2);
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([14, 20]);
      ctx.stroke();

      // Outer Rotating Ring 2 (Counter-rotate)
      ctx.rotate(-angle * 1.2);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius + 18, 0, Math.PI * 2);
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 14]);
      ctx.stroke();

      // Core Arc Segments (Stark Triangles/Arcs)
      const numSegments = 10;
      for (let i = 0; i < numSegments; i++) {
        const segAngle = (i * Math.PI * 2) / numSegments;
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius, segAngle, segAngle + 0.35);
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 7;
        ctx.setLineDash([]);
        ctx.stroke();
      }

      // Inner Core Glow
      const gradient = ctx.createRadialGradient(0, 0, 5, 0, 0, baseRadius - 10);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.4, primaryColor);
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(0, 0, baseRadius - 10, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 35;
      ctx.shadowColor = primaryColor;
      ctx.fill();

      // Central Stark Emblem Lines
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(18, 0);
      ctx.moveTo(0, -18);
      ctx.lineTo(0, 18);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, isListening, isSpeaking]);

  return (
    <div className="relative flex flex-col items-center justify-center p-2 w-full">
      {/* Outer SVG HUD Overlay */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="absolute inset-0 m-auto pointer-events-none"
        />

        {/* Status Text Overlay */}
        <div className="z-10 text-center flex flex-col items-center justify-center">
          <span className="font-hud text-xs tracking-widest text-zinc-300 opacity-90 uppercase font-semibold">
            MARK 85 CORE
          </span>
          <span className={`font-hud font-extrabold text-base md:text-lg tracking-wider ${
            state === 'executing' ? 'text-white text-glow-cyan' :
            state === 'alert' ? 'text-rose-500 text-glow-red' :
            'text-white text-glow-cyan'
          }`}>
            {isListening ? 'LISTENING...' : isSpeaking ? 'RESPONDING' : state.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
