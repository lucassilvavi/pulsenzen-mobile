import { track } from './Telemetry';

export function handleLevelChange(previousLevel: string | undefined, newLevel: string, notify: (msg:string)=>void) {
  if (previousLevel && previousLevel !== newLevel) {
    track('prediction_risk_level_change', { from: previousLevel, to: newLevel });
    notify(`Nível mudou: ${previousLevel} → ${newLevel}`);
  }
}
