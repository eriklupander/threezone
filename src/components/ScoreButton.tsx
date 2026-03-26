import { useRef } from 'react';

interface ScoreButtonProps {
    points: number;
    color: string;
    onClick: () => void;
    onLongPress: () => void;
}

function ScoreButton({ points, color, onClick, onLongPress }: ScoreButtonProps) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressedRef = useRef(false);

    const handlePressStart = () => {
        longPressedRef.current = false;
        timerRef.current = setTimeout(() => {
            longPressedRef.current = true;
            onLongPress();
        }, 500);
    };

    const handlePressEnd = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleClick = () => {
        if (!longPressedRef.current) {
            onClick();
        }
    };

    return (
        <button
            className="score-button"
            style={{
                backgroundColor: color,
                boxShadow: `0 4px 12px ${color}40`
            }}
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            onClick={handleClick}
        >
            +{points}
        </button>
    );
}

export default ScoreButton;
