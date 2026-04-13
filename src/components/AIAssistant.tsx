import React, { useState } from 'react';
import { useFPL } from '../context/FPLContext';

const AIAssistant: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    bootstrapData,
    fixtures,
    currentPicks,
    getPlayer,
    getTeam,
    getCurrentGameweek,
    getPicksForGameweek,
    getFinancialStatus,
    managerData,
    selectedGameweek,
  } = useFPL();


  // Simple rule-based FPL Q&A engine

  function answerQuestion(question: string): string {
    if (!bootstrapData || !fixtures) return 'FPL data not loaded.';
    const q = question.toLowerCase();
    const players = bootstrapData.elements;
    const teams = bootstrapData.teams;
    const currentGW = getCurrentGameweek();

    // Suggest best team for upcoming gameweek
    if (q.includes('best team') || q.includes('pick team') || q.includes('suggest team')) {
      // Simple logic: pick top 11 players by total_points, 1 GK, 3 DEF, 4 MID, 3 FWD
      const byType = (type: number, count: number) =>
        players.filter(p => p.element_type === type && p.status === 'a')
          .sort((a, b) => b.total_points - a.total_points)
          .slice(0, count);
      const squad = [
        ...byType(1, 1), // GK
        ...byType(2, 3), // DEF
        ...byType(3, 4), // MID
        ...byType(4, 3), // FWD
      ];
      return `Suggested best XI for GW${currentGW}:\n` +
        squad.map(p => `${p.web_name} (${teams.find(t => t.id === p.team)?.short_name})`).join(', ');
    }

    // Suggest transfers or replacements
    if (q.includes('suggest transfer') || q.includes('who to transfer') || q.includes('replacement')) {
      if (!currentPicks) return 'No team data available.';
      // Find injured/suspended players in current picks
      const picks = currentPicks.picks.map(pick => getPlayer(pick.element)).filter(Boolean);
      const out = picks.filter(p => p!.status !== 'a');
      if (out.length === 0) return 'No urgent transfers needed. All your players are available.';
      // Suggest best available replacement for each
      const suggestions = out.map(player => {
        const sameType = players.filter(p => p.element_type === player!.element_type && p.status === 'a');
        const best = sameType.sort((a, b) => b.total_points - a.total_points)[0];
        return `${player!.web_name}: Suggest replacing with ${best.web_name} (${teams.find(t => t.id === best.team)?.short_name})`;
      });
      return suggestions.join('\n');
    }

    // Top scorer
    if (q.includes('top scorer') || q.includes('most points')) {
      const top = [...players].sort((a, b) => b.total_points - a.total_points)[0];
      return `The top scorer is ${top.web_name} (${top.total_points} points).`;
    }

    // Cheapest player
    if (q.includes('cheapest')) {
      const cheapest = [...players].sort((a, b) => a.now_cost - b.now_cost)[0];
      return `The cheapest player is ${cheapest.web_name} (£${(cheapest.now_cost/10).toFixed(1)}m).`;
    }

    // Most selected
    if (q.includes('most selected') || q.includes('most popular')) {
      const most = [...players].sort((a, b) => parseFloat(b.selected_by_percent) - parseFloat(a.selected_by_percent))[0];
      return `${most.web_name} is the most selected player (${most.selected_by_percent}% teams).`;
    }

    // Next fixture for a team
    for (const team of teams) {
      if (q.includes(team.name.toLowerCase()) || q.includes(team.short_name.toLowerCase())) {
        const teamFixtures = fixtures?.filter((f: any) => (f.team_h === team.id || f.team_a === team.id) && !f.finished);
        if (teamFixtures && teamFixtures.length > 0) {
          const next = teamFixtures[0];
          const oppId = next.team_h === team.id ? next.team_a : next.team_h;
          const opp = teams.find((t: any) => t.id === oppId);
          return `The next fixture for ${team.name} is vs ${opp?.name || 'Unknown'} on ${next.kickoff_time?.split('T')[0]}`;
        }
      }
    }

    // Help
    if (q.includes('help') || q.includes('what can you do')) {
      return 'Try questions like: Who is the top scorer? Who is the cheapest player? Who is the most selected player? What is the next fixture for Arsenal? Suggest best team. Suggest transfers.';
    }

    return "Sorry, I couldn't understand your question. Try asking about top scorers, cheapest players, most selected, next fixtures, best team, or transfer suggestions.";
  }

  const handleAsk = async () => {
    setLoading(true);
    setAnswer('');
    try {
      setAnswer(answerQuestion(question));
    } catch (error) {
      setAnswer('Error processing question.');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Fantasy Premier League AI Assistant</h2>
      <textarea
        className="w-full p-2 border rounded mb-2"
        rows={3}
        placeholder="Ask a question about FPL..."
        value={question}
        onChange={e => setQuestion(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleAsk}
        disabled={loading || !question.trim()}
      >
        {loading ? 'Thinking...' : 'Ask'}
      </button>
      {answer && (
        <div className="mt-4 p-3 bg-gray-100 rounded border">
          <strong>AI:</strong> {answer}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
