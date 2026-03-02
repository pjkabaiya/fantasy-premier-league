
import React, { useMemo } from 'react';
import { useFPL } from '../context/FPLContext';
import { getDifficultyColor, getDifficultyText } from '../utils/helpers';
import { getTeamShirtUrl } from '../utils/teamShirts';

const PlannerPage: React.FC = () => {
  const { bootstrapData, fixtures, currentPicks, getPlayer, chipPlans, addChipPlan, removeChipPlan, selectedGameweek, setSelectedGameweek, getPicksForGameweek } = useFPL();

  const currentGW = selectedGameweek || (bootstrapData?.events.find(e => e.is_current)?.id || 1);
  const futureGameweeks = bootstrapData?.events.filter(e => e.id >= currentGW).slice(0, 8) || [];

  // Get squad for the selected gameweek (after planned transfers)
  const picksForView = useMemo(() => getPicksForGameweek(currentGW) || currentPicks, [getPicksForGameweek, currentGW, currentPicks]);
  const startingXI = picksForView?.picks.slice(0, 11) || [];
  const bench = picksForView?.picks.slice(11, 15) || [];

  // Fixtures for the selected gameweek grouped by team
  const fixturesForSelectedGWByTeam = useMemo(() => {
    if (!fixtures) return {} as { [teamId: number]: { opponent: number; isHome: boolean; difficulty: number }[] };
    const map: { [teamId: number]: { opponent: number; isHome: boolean; difficulty: number }[] } = {};
    fixtures.filter(f => f.event === currentGW).forEach(f => {
      map[f.team_h] = map[f.team_h] || [];
      map[f.team_h].push({ opponent: f.team_a, isHome: true, difficulty: f.team_h_difficulty });
      map[f.team_a] = map[f.team_a] || [];
      map[f.team_a].push({ opponent: f.team_h, isHome: false, difficulty: f.team_a_difficulty });
    });
    return map;
  }, [fixtures, currentGW]);

  const toggleChip = (gameweek: number, chipType: 'wildcard' | 'freehit' | 'benchboost' | 'triplecaptain') => {
    const existing = chipPlans.find(p => p.gameweek === gameweek);
    // Check if chip already used in another GW
    const chipUsedElsewhere = chipPlans.find(p => p.chip === chipType && p.gameweek !== gameweek);
    if (chipUsedElsewhere && (!existing || existing.chip !== chipType)) {
      alert(`${chipType} is already planned for GW${chipUsedElsewhere.gameweek}`);
      return;
    }
    if (existing && existing.chip === chipType) {
      removeChipPlan(gameweek);
    } else {
      addChipPlan({ gameweek, chip: chipType });
    }
  };

  const getChipForGW = (gameweek: number) => {
    return chipPlans.find(p => p.gameweek === gameweek)?.chip || null;
  };

  // Render team, fixtures, and allow mock transfers for selected gameweek
  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Gameweek Planner</h1>
      <label>
        Select Gameweek:
        <select value={currentGW} onChange={e => setSelectedGameweek(Number(e.target.value))}>
          {bootstrapData?.events.map(event => (
            <option key={event.id} value={event.id}>{event.name}</option>
          ))}
        </select>
      </label>
      <h2 className="mt-4 mb-2 text-xl font-semibold">Team for GW {currentGW}</h2>
      <table className="min-w-full mb-6">
        <thead>
          <tr>
            <th>Player</th>
            <th>Fixture</th>
            <th>Chip</th>
          </tr>
        </thead>
        <tbody>
          {startingXI.map((pick, idx) => {
            const player = getPlayer(pick.element);
            const teamFixtures = fixturesForSelectedGWByTeam[player.team] || [];
            return (
              <tr key={player.id}>
                <td className="flex items-center gap-2">
                  <img src={getTeamShirtUrl(player.team)} alt="shirt" className="w-6 h-6" />
                  {player.web_name}
                </td>
                <td>
                  {teamFixtures.map((fix, i) => (
                    <span key={i} className={`px-2 py-1 rounded ${getDifficultyColor(fix.difficulty)}`}>{fix.isHome ? 'H' : 'A'} vs {bootstrapData.teams.find(t => t.id === fix.opponent)?.short_name} ({getDifficultyText(fix.difficulty)})</span>
                  ))}
                </td>
                <td>{pick.is_captain ? 'C' : pick.is_vice_captain ? 'VC' : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <h2 className="mt-4 mb-2 text-xl font-semibold">Bench</h2>
      <table className="min-w-full mb-6">
        <thead>
          <tr>
            <th>Player</th>
            <th>Fixture</th>
          </tr>
        </thead>
        <tbody>
          {bench.map((pick, idx) => {
            const player = getPlayer(pick.element);
            const teamFixtures = fixturesForSelectedGWByTeam[player.team] || [];
            return (
              <tr key={player.id}>
                <td className="flex items-center gap-2">
                  <img src={getTeamShirtUrl(player.team)} alt="shirt" className="w-6 h-6" />
                  {player.web_name}
                </td>
                <td>
                  {teamFixtures.map((fix, i) => (
                    <span key={i} className={`px-2 py-1 rounded ${getDifficultyColor(fix.difficulty)}`}>{fix.isHome ? 'H' : 'A'} vs {bootstrapData.teams.find(t => t.id === fix.opponent)?.short_name} ({getDifficultyText(fix.difficulty)})</span>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <h2 className="mt-4 mb-2 text-xl font-semibold">Chip Planning</h2>
      <div className="flex gap-2 flex-wrap">
        {futureGameweeks.map(gw => (
          <div key={gw.id} className="border p-2 rounded">
            <div>GW {gw.id}</div>
            <div>Chip: {getChipForGW(gw.id) || 'None'}</div>
            <button className="mr-1" onClick={() => toggleChip(gw.id, 'wildcard')}>Wildcard</button>
            <button className="mr-1" onClick={() => toggleChip(gw.id, 'freehit')}>Free Hit</button>
            <button className="mr-1" onClick={() => toggleChip(gw.id, 'benchboost')}>Bench Boost</button>
            <button onClick={() => toggleChip(gw.id, 'triplecaptain')}>Triple Captain</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlannerPage;
