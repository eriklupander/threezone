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

const makeTeams = (n: number): Team[] =>
    Array.from({ length: n }, (_, i) => ({ id: i + 1, color: null, score: 0 }));

function App() {
    const [numTeams, setNumTeams] = useState<number>(3);
    const [teams, setTeams] = useState<Team[]>(makeTeams(3));

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

    // Play countdown tick at 3, 2, 1 (short high pitch) or final sound at 0 (longer, lower)
    const playCountdownTick = useCallback((isFinal: boolean) => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = isFinal ? 520 : 1050;
        oscillator.type = 'sine';

        const duration = isFinal ? 0.6 : 0.12;
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
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
                    playCountdownTick(true);

                    // Save round data (guard against React calling updater twice)
                    setRounds(prevRounds => {
                        if (prevRounds.some(r => r.roundNumber === currentRound)) return prevRounds;
                        return [...prevRounds, {
                            roundNumber: currentRound,
                            duration: roundDuration,
                            teams: teams.map(t => ({ ...t }))
                        }];
                    });

                    return 0;
                }

                // Play beep at 10 seconds
                if (prev === 10 && !hasPlayedBeep) {
                    playBeep();
                    setHasPlayedBeep(true);
                }

                // Countdown ticks at 3, 2, 1 (prev 4, 3, 2 → display 3, 2, 1)
                if (prev >= 2 && prev <= 4) {
                    playCountdownTick(false);
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, currentRound, roundDuration, teams, hasPlayedBeep, playBeep, playCountdownTick]);

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
            team.id === teamId ? { ...team, score: Math.max(0, team.score + points) } : team
        ));
    };

    const handleEndRound = () => {
        setGameState('finished');
        setHasPlayedBeep(false);
        setRounds(prevRounds => {
            if (prevRounds.some(r => r.roundNumber === currentRound)) return prevRounds;
            return [...prevRounds, {
                roundNumber: currentRound,
                duration: roundDuration,
                teams: teams.map(t => ({ ...t }))
            }];
        });
    };

    const handlePauseResume = () => {
        setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
    };

    const handleNumTeamsChange = (n: number) => {
        setNumTeams(n);
        setTeams(makeTeams(n));
    };

    const handleEndGame = () => {
        // Reset everything
        setTeams(makeTeams(numTeams));
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

                    <div className="team-count-selector">
                        <h3>Teams</h3>
                        <div className="team-count-options">
                            {[2, 3].map(n => (
                                <button
                                    key={n}
                                    className={`time-button${numTeams === n ? ' selected' : ''}`}
                                    onClick={() => handleNumTeamsChange(n)}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

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
                                takenColors={teams.filter(t => t.id !== team.id && t.color !== null).map(t => t.color as TeamColor)}
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