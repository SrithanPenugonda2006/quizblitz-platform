import { useEffect, useRef, useState } from 'react';

export default function Timer({ total, current, onEnd }) {
    const r = 50;
    const circumference = 2 * Math.PI * r;
    const fraction = current / total;
    const offset = circumference * (1 - fraction);
    const isWarning = fraction <= 0.4 && fraction > 0.2;
    const isDanger = fraction <= 0.2;

    const strokeClass = isDanger ? 'danger' : isWarning ? 'warning' : '';

    return (
        <div style={{ position: 'relative', width: 120, height: 120 }}>
            <svg width="120" height="120" className="timer-ring">
                <circle className="timer-ring-bg" cx="60" cy="60" r={r} strokeWidth="8" />
                <circle
                    className={`timer-ring-fill ${strokeClass}`}
                    cx="60" cy="60" r={r} strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexDirection: 'column'
            }}>
                <span style={{
                    fontSize: '2rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
                    color: isDanger ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--lime)'
                }}>{current}</span>
            </div>
        </div>
    );
}
