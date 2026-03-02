

import React, { useMemo } from 'react';
import { useFPL } from '../context/FPLContext';

const LivePage: React.FC = () => {
  const { currentPicks, bootstrapData, getPlayerWithLiveData } = useFPL();

  const currentGW = useMemo(() => bootstrapData?.events.find(e => e.is_current)?.id || 1, [bootstrapData]);
  const startingXI = useMemo(() => {
    if (!currentPicks || !currentGW) return [];
    return currentPicks.picks.slice(0, 11).map(pick => ({
      pick,
      player: getPlayerWithLiveData(pick.element, currentGW),
    })).filter(p => p.player);
  }, [currentPicks, currentGW, getPlayerWithLiveData]);

  const totalPoints = useMemo(() => {
    return startingXI.reduce((sum, p) => sum + (p.player.stats?.total_points || 0), 0);
  }, [startingXI]);

  return (
    <div>
      <h1>Live Standings</h1>
      <h2>Current GW: {currentGW}</h2>
      <h3>Total Points: {totalPoints}</h3>
      <table className="min-w-full">
        <thead>
          <tr>
            <th>Player</th>
            <th>Points</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {startingXI.map(({ pick, player }) => (
            <tr key={player.id}>
              <td>{player.web_name}</td>
              <td>{player.stats?.total_points || 0}</td>
              <td>{player.status !== 'a' ? '🚩' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LivePage;
