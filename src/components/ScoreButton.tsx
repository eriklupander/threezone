interface ScoreButtonProps {
    points: number;
    color: string;
    onClick: () => void;
}

function ScoreButton({ points, color, onClick }: ScoreButtonProps) {
    return (
        <button
            className="score-button"
            style={{
                backgroundColor: color,
                boxShadow: `0 4px 12px ${color}40`
            }}
            onClick={onClick}
        >
            +{points}
        </button>
    );
}

export default ScoreButton;