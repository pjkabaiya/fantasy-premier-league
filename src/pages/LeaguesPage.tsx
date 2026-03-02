

import React, { useMemo } from 'react';
import { useFPL } from '../context/FPLContext';

const LeaguesPage: React.FC = () => {
  const { managerData } = useFPL();

  const classicLeagues = useMemo(() => managerData?.leagues?.classic || [], [managerData]);
  const h2hLeagues = useMemo(() => managerData?.leagues?.h2h || [], [managerData]);

  return (
    <div>
      <h1>Leagues</h1>
      <h2>Classic Leagues</h2>
      <table className="min-w-full mb-6">
        <thead>
          <tr>
            <th>Name</th>
            <th>Rank</th>
            <th>Last GW Rank</th>
            <th>Movement</th>
          </tr>
        </thead>
        <tbody>
          {classicLeagues.map(league => (
            <tr key={league.id}>
              <td>{league.name}</td>
              <td>{league.entry_rank}</td>
              <td>{league.entry_last_rank}</td>
              <td>{league.entry_rank < league.entry_last_rank ? '⬆️' : league.entry_rank > league.entry_last_rank ? '⬇️' : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Head-to-Head Leagues</h2>
      <table className="min-w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Rank</th>
            <th>Last GW Rank</th>
            <th>Movement</th>
          </tr>
        </thead>
        <tbody>
          {h2hLeagues.map(league => (
            <tr key={league.id}>
              <td>{league.name}</td>
              <td>{league.entry_rank}</td>
              <td>{league.entry_last_rank}</td>
              <td>{league.entry_rank < league.entry_last_rank ? '⬆️' : league.entry_rank > league.entry_last_rank ? '⬇️' : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaguesPage;
