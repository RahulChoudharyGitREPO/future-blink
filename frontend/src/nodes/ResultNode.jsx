import { Handle, Position } from '@xyflow/react';

function ResultNode({ data }) {
  return (
    <div className="node result-node">
      <div className="node-header">Result</div>
      <div className="result-content">
        {data.loading ? (
          <p className="loading-text">Generating...</p>
        ) : data.response ? (
          <p>{data.response}</p>
        ) : (
          <p className="placeholder-text">AI response will appear here</p>
        )}
      </div>
      <Handle type="target" position={Position.Left} />
    </div>
  );
}

export default ResultNode;
