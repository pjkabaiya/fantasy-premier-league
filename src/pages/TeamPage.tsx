
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFPL } from '../context/FPLContext';
import { formatPrice, getPositionName, getDifficultyColor } from '../utils/helpers';
import { getTeamShirtUrl } from '../utils/teamShirts';

type ViewMode = 'field' | 'list';

const TeamPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    managerData,
    currentPicks,
    bootstrapData,
    getPlayer,
    getPlayerWithLiveData,
    getTeam,
    loading,
    fixtures,
    selectedGameweek,
    getPicksForGameweek,
    setSelectedGameweek,
    getFinancialStatus,
  } = useFPL();

  const [viewMode, setViewMode] = useState<ViewMode>('field');

  // Get picks for current view
  const picksForView = selectedGameweek ? getPicksForGameweek(selectedGameweek) : currentPicks;

  // Fixtures for the selected gameweek grouped by team
  const fixturesForSelectedGWByTeam = useMemo(() => {
    if (!fixtures || !selectedGameweek) return {} as { [teamId: number]: { opponent: number; isHome: boolean; difficulty: number }[] };
    const map: { [teamId: number]: { opponent: number; isHome: boolean; difficulty: number }[] } = {};
    fixtures.filter(f => f.event === selectedGameweek).forEach(f => {
      map[f.team_h] = map[f.team_h] || [];
      map[f.team_h].push({ opponent: f.team_a, isHome: true, difficulty: f.team_h_difficulty });
      map[f.team_a] = map[f.team_a] || [];
      map[f.team_a].push({ opponent: f.team_h, isHome: false, difficulty: f.team_a_difficulty });
    });
    return map;
  }, [fixtures, selectedGameweek]);

  // Injury/suspension status helper
  const getPlayerStatusFlag = (status: string | null, chancePlaying: number | null) => {
    if (status === 'd') return { emoji: '🟠', label: 'Doubtful' };
    if (status === 's') return { emoji: '🔴', label: 'Suspended' };
    if (status === 'u') return { emoji: '❌', label: 'Unavailable' };
    if (chancePlaying !== null && chancePlaying < 100) {
      if (chancePlaying < 25) return { emoji: '🔴', label: `${chancePlaying}%` };
      if (chancePlaying < 50) return { emoji: '🟠', label: `${chancePlaying}%` };
      if (chancePlaying < 100) return { emoji: '🟡', label: `${chancePlaying}%` };
    }
    return null;
  };

  // Remove the injuryAlerts calculation - will show minimal flags instead
  const injuryAlerts = useMemo(() => {
    if (!picksForView) return [];
    return picksForView.picks
      .map(pick => {
        const player = getPlayer(pick.element);
        if (!player) return null;
        const flag = getPlayerStatusFlag(player.status, player.chance_of_playing_next_round);
        if (flag) return { player, flag };
        return null;
      })
      .filter((p): p is Exclude<typeof p, null> => p !== null);
  }, [picksForView, getPlayer]);

  const financialStatus = useMemo(() => {
    return getFinancialStatus(selectedGameweek || 1);
  }, [selectedGameweek, getFinancialStatus]);

  const getAvailabilityClass = (chance: number | null | undefined) => {
    if (chance === null || chance === undefined) return '';
    if (chance <= 25) return 'bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-100';
    if (chance <= 50) return 'bg-orange-200 text-orange-900 dark:bg-orange-900/60 dark:text-orange-100';
    if (chance <= 75) return 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900/60 dark:text-yellow-100';
    return '';
  };

  // ...existing Team UI rendering logic goes here...
  return (
    <div>
      <h1>Team</h1>
      {/* Add full Team UI here based on previous implementation */}
    </div>
  );
};

export default TeamPage;
