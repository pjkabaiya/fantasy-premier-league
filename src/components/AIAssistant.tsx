import React, { useState } from 'react';
import { fplApi } from '../services/fplApi';

const AIAssistant: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);


  // Simple rule-based FPL Q&A engine
  function answerQuestion(question: string, data: any): string {
    const q = question.toLowerCase();
    const players = data.elements;
    const teams = data.teams;

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
        const fixtures = data.fixtures?.filter((f: any) => (f.team_h === team.id || f.team_a === team.id) && !f.finished);
        if (fixtures && fixtures.length > 0) {
          const next = fixtures[0];
          const oppId = next.team_h === team.id ? next.team_a : next.team_h;
          const opp = teams.find((t: any) => t.id === oppId);
          return `The next fixture for ${team.name} is vs ${opp?.name || 'Unknown'} on ${next.kickoff_time?.split('T')[0]}`;
        }
      }
    }

    // Help
    if (q.includes('help') || q.includes('what can you do')) {
      return 'Try questions like: Who is the top scorer? Who is the cheapest player? Who is the most selected player? What is the next fixture for Arsenal?';
    }

    return "Sorry, I couldn't understand your question. Try asking about top scorers, cheapest players, most selected, or next fixtures.";
  }

  const handleAsk = async () => {
    setLoading(true);
    setAnswer('');
    try {
      // Fetch FPL data
      const data = await fplApi.getBootstrapData();
      // Optionally fetch fixtures for next fixture questions
      data.fixtures = await fplApi.getFixtures();
      setAnswer(answerQuestion(question, data));
    } catch (error) {
      setAnswer('Error fetching data or processing question.');
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
