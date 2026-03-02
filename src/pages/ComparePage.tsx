

import React, { useState } from 'react';
import PlayerComparison from '../components/PlayerComparison';

const ComparePage: React.FC = () => {
  const [playerIds, setPlayerIds] = useState<number[]>([]);
  const [startGW, setStartGW] = useState(1);
  const [endGW, setEndGW] = useState(38);

  return (
    <div>
      <h1>Compare Players</h1>
      <div className="flex gap-4 mb-4">
        <label>
          Start GW:
          <input type="number" min={1} max={endGW} value={startGW} onChange={e => setStartGW(Number(e.target.value))} />
        </label>
        <label>
          End GW:
          <input type="number" min={startGW} max={38} value={endGW} onChange={e => setEndGW(Number(e.target.value))} />
        </label>
      </div>
      <PlayerComparison playerIds={playerIds} setPlayerIds={setPlayerIds} startGW={startGW} endGW={endGW} />
    </div>
  );
};

export default ComparePage;
