import React from 'react';

const AvailabilityPage: React.FC = () => {
  return (
    <div>
      <h1>Availability Page</h1>
      {/* Add Availability page content here */}
    </div>
  );
};

import React, { useMemo } from 'react';
import { useFPL } from '../context/FPLContext';

const AvailabilityPage: React.FC = () => {
  const { bootstrapData, currentPicks } = useFPL();

  // Get unavailable players in user's squad
  const unavailableSquadPlayers = useMemo(() => {
    if (!bootstrapData || !currentPicks) return [];
    const squadIds = currentPicks.picks.map(p => p.element);
    return bootstrapData.elements.filter(
      (player: any) => squadIds.includes(player.id) && player.status !== 'a'
    );
  }, [bootstrapData, currentPicks]);

  return (
    <div>
      <h1>Squad Availability</h1>
      <table className="min-w-full">
        <thead>
          <tr>
            <th>Player</th>
            <th>Status</th>
            <th>Flag</th>
          </tr>
        </thead>
        <tbody>
          {unavailableSquadPlayers.map(player => (
            <tr key={player.id}>
              <td>{player.web_name}</td>
              <td>{player.news || 'Unavailable'}</td>
              <td>{player.status !== 'a' ? <span>🚩</span> : null}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AvailabilityPage;
export default AvailabilityPage;
