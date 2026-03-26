import { Team, TeamColor } from '../types';

interface TeamSetupProps {
    team: Team;
    availableColors: TeamColor[];
    takenColors: TeamColor[];
    onColorSelect: (teamId: number, color: TeamColor) => void;
}

function TeamSetup({ team, availableColors, takenColors, onColorSelect }: TeamSetupProps) {
    return (
        <div className="team-setup">
            <h3>Team {team.id}</h3>
            <div className="color-palette">
                {availableColors.map(color => {
                    const taken = takenColors.includes(color);
                    return (
                        <button
                            key={color}
                            className={`color-button ${team.color === color ? 'selected' : ''} ${taken ? 'taken' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => !taken && onColorSelect(team.id, color)}
                            aria-label={`Select ${color}`}
                            disabled={taken}
                        />
                    );
                })}
            </div>
            {team.color && (
                <div className="selected-color" style={{ backgroundColor: team.color }}>
                    Selected
                </div>
            )}
        </div>
    );
}

export default TeamSetup;