export function calculateScalingProportion({
  timeTalkingInWindow,
  evaluationWindow,
}: {
  timeTalkingInWindow: number;
  evaluationWindow: number;
}): number {
  const totalProportion = timeTalkingInWindow / evaluationWindow;
  const inverseProportion = 1 - totalProportion;
  return Math.max(inverseProportion, 0); // We never want to go below 0
}
