import { useState, useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';

import InputNode from './nodes/InputNode';
import ResultNode from './nodes/ResultNode';
import './App.css';

const nodeTypes = { inputNode: InputNode, resultNode: ResultNode };

const initialEdges = [{ id: 'e1-2', source: '1', target: '2', animated: true }];

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nodes = useMemo(
    () => [
      {
        id: '1',
        type: 'inputNode',
        position: { x: 50, y: 150 },
        data: { prompt, onChange: setPrompt },
      },
      {
        id: '2',
        type: 'resultNode',
        position: { x: 500, y: 150 },
        data: { response, loading },
      },
    ],
    [prompt, response, loading]
  );

  const handleRun = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setError('');
    setLoading(true);
    setResponse('');

    try {
      // Step 1: Get AI response
      const { data } = await axios.post('/api/ask-ai', { prompt });
      setResponse(data.response);

      // Step 2: Save to MongoDB
      await axios.post('/api/save', { prompt, response: data.response });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  return (
    <div className="app">
      <header className="toolbar">
        <h1>AI Flow</h1>
        <div className="toolbar-actions">
          {error && <span className="error-msg">{error}</span>}
          <button onClick={handleRun} disabled={loading}>
            {loading ? 'Generating...' : '▶ Run Flow'}
          </button>
        </div>
      </header>
      <div className="flow-container">
        <ReactFlow
          nodes={nodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable
          nodesConnectable={false}
        >
          <Background variant="dots" gap={16} size={1} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;
