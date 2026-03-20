import { Handle, Position } from '@xyflow/react';

function InputNode({ data }) {
  return (
    <div className="node input-node">
      <div className="node-header"> Input</div>
      <textarea
        rows={4}
        placeholder="Enter your prompt..."
        value={data.prompt}
        onChange={(e) => data.onChange(e.target.value)}
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default InputNode;
