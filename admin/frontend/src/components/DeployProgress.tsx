export type DeployState = {
  open: boolean;
  title: string;
  step: string;
  pct: number;
};

export const initialDeploy: DeployState = {
  open: false,
  title: "발행 중…",
  step: "",
  pct: 10,
};

export function DeployProgress({ state }: { state: DeployState }) {
  if (!state.open) return null;
  return (
    <div className="progress">
      <div className="title">{state.title}</div>
      <div className="step">{state.step}</div>
      <div className="bar">
        <div style={{ width: `${state.pct}%` }} />
      </div>
    </div>
  );
}
