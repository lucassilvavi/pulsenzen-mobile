import { CBTAnalysisResult, CognitiveDistortion, SocraticQuestion } from '../types';

const DISTORTION_LIBRARY: CognitiveDistortion[] = [
  { id:'catastrofizacao', label:'Catastrofização', description:'Antecipar o pior cenário sem evidências proporcionais.', evidencePrompt:'Quais evidências concretas sustentam esse pior cenário?', alternativePrompt:'Qual resultado mais realista poderia ocorrer?' },
  { id:'rotulo_global', label:'Rótulo Global', description:'Definir a si mesmo com um rótulo fixo a partir de um evento isolado.', evidencePrompt:'Esse evento sozinho define quem você é?', alternativePrompt:'Como você descreveria isso de modo específico e não global?' },
  { id:'pensamento_tudo_nada', label:'Tudo ou Nada', description:'Ver situações em extremos sem tons intermediários.', evidencePrompt:'Existe algo entre 0 e 100% nisso?', alternativePrompt:'Qual nuance intermediária você está ignorando?' },
];

const SOCRATIC_POOL: SocraticQuestion[] = [
  { id:'sq1', question:'Que evidências sustentam esse pensamento? E quais contradizem?', purpose:'challenge' },
  { id:'sq2', question:'Se um amigo pensasse isso de si, o que você diria a ele?', purpose:'reframe' },
  { id:'sq3', question:'Como você verá essa situação em 6 meses?', purpose:'explore' },
  { id:'sq4', question:'Há explicações alternativas plausíveis?', purpose:'challenge' },
];

function pickRandom<T>(arr: T[], n: number): T[] { return [...arr].sort(()=>Math.random()-0.5).slice(0,n); }

export const CBTMockService = {
  analyze(text: string): CBTAnalysisResult {
    const lower = text.toLowerCase();
    // Heurísticas simples
    const distortions: CognitiveDistortion[] = [];
    if (/sempre|nunca/.test(lower)) distortions.push(DISTORTION_LIBRARY.find(d=>d.id==='pensamento_tudo_nada')!);
    if (/desastre|horrivel|terrivel/.test(lower)) distortions.push(DISTORTION_LIBRARY.find(d=>d.id==='catastrofizacao')!);
    if (/sou um|eu sou um|fracasso/.test(lower)) distortions.push(DISTORTION_LIBRARY.find(d=>d.id==='rotulo_global')!);
    // fallback aleatório mínimo
    if (!distortions.length) distortions.push(pickRandom(DISTORTION_LIBRARY,1)[0]);

    const questions = pickRandom(SOCRATIC_POOL, 3);

    const summary = distortions.length > 1 ? 'Foram detectados padrões de pensamento que podem aumentar sofrimento.' : 'Foi detectado um padrão cognitivo relevante.';
    const suggestion = 'Escolha uma distorção para desafiar listando evidências a favor e contra, depois formule um pensamento alternativo equilibrado.';

    return { distortions, questions, summary, suggestion, generatedAt: Date.now() };
  }
};
