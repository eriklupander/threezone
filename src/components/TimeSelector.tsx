interface TimeSelectorProps {
    duration: number;
    onDurationChange: (duration: number) => void;
}

function TimeSelector({ duration, onDurationChange }: TimeSelectorProps) {
    const timeOptions = [60, 90, 120, 150, 180, 210, 240, 270, 300]; // 1-5 minutes in 30s increments

    return (
        <div className="time-selector">
            <h3>Round Duration</h3>
            <div className="time-options">
                {timeOptions.map(time => (
                    <button
                        key={time}
                        className={`time-button ${duration === time ? 'selected' : ''}`}
                        onClick={() => onDurationChange(time)}
                    >
                        {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default TimeSelector;