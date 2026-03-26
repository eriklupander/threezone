import { Team, GameState } from '../types';
import ScoreButton from './ScoreButton';

interface GameBoardProps {
    teams: Team[];
    timeRemaining: number;
    formatTime: (seconds: number) => string;
    gameState: GameState;
    onAddPoints: (teamId: number, points: number) => void;
    onNextRound: () => void;
    onEndGame: () => void;
    onPauseResume: () => void;
    onEndRound: () => void;
}

function GameBoard({
                       teams,
                       timeRemaining,
                       formatTime,
                       gameState,
                       onAddPoints,
                       onNextRound,
                       onEndGame,
                       onPauseResume,
                       onEndRound
                   }: GameBoardProps) {

    const handleEndRound = () => {
        if (window.confirm('End round prematurely?')) {
            onEndRound();
        }
    };
    return (
        <div className="game-board">
            <div className={`timer ${timeRemaining <= 10 ? 'warning' : ''}`}>
                {formatTime(timeRemaining)}
            </div>

            <div className="teams-grid">
                {teams.map(team => (
                    <div
                        key={team.id}
                        className="team-card"
                        style={{ borderColor: team.color || '#333' }}
                    >
                        <div
                            className="team-color-indicator"
                            style={{ backgroundColor: team.color || '#333' }}
                        />
                        <h3>Team {team.id}</h3>
                        <div className="team-score">{team.score}</div>

                        {gameState === 'playing' && (
                            <div className="score-buttons">
                                <ScoreButton
                                    points={1}
                                    color={team.color || '#333'}
                                    onClick={() => onAddPoints(team.id, 1)}
                                    onLongPress={() => onAddPoints(team.id, -1)}
                                />
                                <ScoreButton
                                    points={2}
                                    color={team.color || '#333'}
                                    onClick={() => onAddPoints(team.id, 2)}
                                    onLongPress={() => onAddPoints(team.id, -2)}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {(gameState === 'playing' || gameState === 'paused') && (
                <div className="round-actions">
                    <button className="pause-button" onClick={onPauseResume}>
                        {gameState === 'playing' ? 'Pause' : 'Resume'}
                    </button>
                    <button className="end-round-button" onClick={handleEndRound}>
                        End Round
                    </button>
                </div>
            )}

            {gameState === 'finished' && (
                <div className="round-actions">
                    <button className="next-round-button" onClick={onNextRound}>
                        Start Next Round
                    </button>
                    <button className="end-game-button" onClick={onEndGame}>
                        End Game
                    </button>
                </div>
            )}
        </div>
    );
}

export default GameBoard;