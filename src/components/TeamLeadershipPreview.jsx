export default function TeamLeadershipPreview({ team }) {
  const leaders = team.members.filter((person) => person.designation !== 'Deputy Director');
  const deputyCount = team.members.filter((person) => person.designation === 'Deputy Director').length;

  return (
    <div className="team-leadership-preview">
      {leaders.length ? (
        <>
          <dl>
            {leaders.map((person) => (
              <div key={`${person.designation}-${person.name}`}>
                <dt>{person.designation}</dt>
                <dd>{person.name}</dd>
              </div>
            ))}
          </dl>
          {deputyCount > 0 && <span className="team-roster-note">+ {deputyCount} deputy {deputyCount === 1 ? 'director' : 'directors'}</span>}
        </>
      ) : <span className="team-roster-note">Leadership to be announced</span>}
    </div>
  );
}
