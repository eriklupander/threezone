import { useState, useEffect, useCallback } from 'react';
import { Team, TeamColor, GameState, Round } from './types';
import TeamSetup from './components/TeamSetup';
import TimeSelector from './components/TimeSelector';
import GameBoard from './components/GameBoard';
import './App.css';

const COLORS: TeamColor[] = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFFFFF', '#000000'
];

function App() {
    const [teams, setTeams] = useState<Team[]>([
        { id: 1, color: null, score: 0 },
        { id: 2, color: null, score: 0 },
        { id: 3, color: null, score: 0 }
    ]);

    const [roundDuration, setRoundDuration] = useState<number>(60); // seconds
    const [gameState, setGameState] = useState<GameState>('setup');
    const [timeRemaining, setTimeRemaining] = useState<number>(60);
    const [currentRound, setCurrentRound] = useState<number>(1);
    const [rounds, setRounds] = useState<Round[]>([]);
    const [hasPlayedBeep, setHasPlayedBeep] = useState<boolean>(false);

    const allTeamsHaveColors = teams.every(team => team.color !== null);
    const canStartRound = allTeamsHaveColors && gameState === 'setup';

    // Play beep sound at 10 seconds
    const playBeep = useCallback(() => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }, []);

    // Timer countdown
    useEffect(() => {
        if (gameState !== 'playing') return;
        console.log("in useEffect");
        const timer = setInterval(() => {
            console.log("in interval");
            setTimeRemaining(prev => {
                console.log("in setTimeRemaining prev is " + prev + " with timer " + timer);
                if (prev <= 1) {
                    console.log("in setTimeRemaining prev < 1 with " + prev);
                    clearInterval(timer);
                    setGameState('finished');
                    setHasPlayedBeep(false);

                    // Save round data
                    setRounds(prevRounds => [...prevRounds, {
                        roundNumber: currentRound,
                        duration: roundDuration,
                        teams: teams.map(t => ({ ...t }))
                    }]);

                    return 0;
                }

                // Play beep at 10 seconds
                if (prev === 10 && !hasPlayedBeep) {
                    playBeep();
                    setHasPlayedBeep(true);
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, currentRound, roundDuration, teams, hasPlayedBeep, playBeep]);

    const handleColorSelect = (teamId: number, color: TeamColor) => {
        setTeams(teams.map(team =>
            team.id === teamId ? { ...team, color } : team
        ));
    };

    const handleStartRound = () => {
        setGameState('playing');
        setTimeRemaining(roundDuration);
        setHasPlayedBeep(false);
    };

    const handleNextRound = () => {
        setCurrentRound(prev => prev + 1);
        setGameState('playing');
        setTimeRemaining(roundDuration);
        setHasPlayedBeep(false);
    };

    const handleAddPoints = (teamId: number, points: number) => {
        setTeams(teams.map(team =>
            team.id === teamId ? { ...team, score: team.score + points } : team
        ));
    };

    const handleEndRound = () => {
        setGameState('finished');
        setHasPlayedBeep(false);
        setRounds(prevRounds => [...prevRounds, {
            roundNumber: currentRound,
            duration: roundDuration,
            teams: teams.map(t => ({ ...t }))
        }]);
    };

    const handlePauseResume = () => {
        setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
    };

    const handleEndGame = () => {
        // Reset everything
        setTeams([
            { id: 1, color: null, score: 0 },
            { id: 2, color: null, score: 0 },
            { id: 3, color: null, score: 0 }
        ]);
        setCurrentRound(1);
        setRounds([]);
        setGameState('setup');
        setTimeRemaining(roundDuration);
        setHasPlayedBeep(false);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>🏆 Sports Scorer</h1>
                <div className="round-info">Round {currentRound}</div>
            </header>

            {gameState === 'setup' && (
                <div className="setup-container">
                    <h2>Setup Round {currentRound}</h2>

                    <TimeSelector
                        duration={roundDuration}
                        onDurationChange={setRoundDuration}
                    />

                    <div className="teams-setup">
                        {teams.map(team => (
                            <TeamSetup
                                key={team.id}
                                team={team}
                                availableColors={COLORS}
                                onColorSelect={handleColorSelect}
                            />
                        ))}
                    </div>

                    <button
                        className="start-button"
                        onClick={handleStartRound}
                        disabled={!canStartRound}
                    >
                        Start Round
                    </button>
                </div>
            )}

            {(gameState === 'playing' || gameState === 'paused' || gameState === 'finished') && (
                <>
                    <GameBoard
                        teams={teams}
                        timeRemaining={timeRemaining}
                        formatTime={formatTime}
                        gameState={gameState}
                        onAddPoints={handleAddPoints}
                        onNextRound={handleNextRound}
                        onEndGame={handleEndGame}
                        onPauseResume={handlePauseResume}
                        onEndRound={handleEndRound}
                    />

                    {rounds.length > 0 && gameState === 'finished' && (
                        <div className="rounds-history">
                            <h3>Previous Rounds</h3>
                            {rounds.map(round => (
                                <div key={round.roundNumber} className="round-summary">
                                    <strong>Round {round.roundNumber}:</strong>
                                    {round.teams.map(team => (
                                        <span key={team.id} style={{ color: team.color || '#fff' }}>
                      {' '}●{team.score}
                    </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default App;