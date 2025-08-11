import { useCallback, useState } from 'react';
import { CBTAnalysisResult } from '../types';
import { CBTMockService } from '../services/CBTMockService';
import { track } from '@/modules/prediction/services/Telemetry';

export function useCBTAnalysis(initial?: CBTAnalysisResult | null){
  const [result, setResult] = useState<CBTAnalysisResult | null>(initial || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async (text: string) => {
    setLoading(true); setError(null);
    await new Promise(r=>setTimeout(r, 400)); // simulate delay
    try {
      track('cbt_analysis_run', { length: text.length });
      const r = CBTMockService.analyze(text);
      setResult(r);
      track('cbt_analysis_success', { distortions: r.distortions.length });
    } catch(e:any){
      setError('Falha ao gerar análise');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = () => setResult(null);

  const setExternal = (r: CBTAnalysisResult | null) => setResult(r);
  return { result, loading, error, runAnalysis, reset, setExternal };
}
