import { Team, TeamColor } from '../types';

interface TeamSetupProps {
    team: Team;
    availableColors: TeamColor[];
    onColorSelect: (teamId: number, color: TeamColor) => void;
}

function TeamSetup({ team, availableColors, onColorSelect }: TeamSetupProps) {
    return (
        <div className="team-setup">
            <h3>Team {team.id}</h3>
            <div className="color-palette">
                {availableColors.map(color => (
                    <button
                        key={color}
                        className={`color-button ${team.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => onColorSelect(team.id, color)}
                        aria-label={`Select ${color}`}
                    />
                ))}
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