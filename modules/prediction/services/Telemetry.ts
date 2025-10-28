// Simple telemetry stub - replaces with real analytics later
export type TelemetryEvent =
  | 'prediction_banner_view'
  | 'prediction_banner_modal_open'
  | 'prediction_dashboard_refresh'
  | 'prediction_factor_expand'
  | 'prediction_factor_collapse'
  | 'prediction_factor_tooltip_open'
  | 'prediction_factor_tooltip_close'
  | 'prediction_intervention_expand'
  | 'prediction_intervention_complete'
  | 'prediction_onboarding_dismiss'
  | 'prediction_risk_level_change'
  | 'cbt_analysis_run'
  | 'cbt_analysis_success';

export function track(event: TelemetryEvent, payload: Record<string, any> = {}) {
  // Telemetry disabled in production - replace with real analytics later
}
