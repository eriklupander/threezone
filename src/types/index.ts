export type TeamColor =
    | '#FF0000' // Red
    | '#00FF00' // Green
    | '#0000FF' // Blue
    | '#FFFF00' // Yellow
    | '#FF00FF' // Magenta
    | '#00FFFF' // Cyan
    | '#FFA500' // Orange
    | '#800080' // Purple
    | '#FFFFFF' // White
    | '#000000'; // Black

export interface Team {
    id: number;
    color: TeamColor | null;
    score: number;
}

export interface Round {
    roundNumber: number;
    duration: number;
    teams: Team[];
}

export type GameState = 'setup' | 'playing' | 'paused' | 'finished';