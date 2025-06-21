
export type OnboardingData = {
  name: string;
  sex: string;
  age: string;
  goals: string[];
  experience: string;
};

/**
 * Simula uma requisição para armazenar os dados de onboarding do usuário.
 * Retorna uma Promise que resolve após um pequeno delay.
 */
export async function saveOnboardingData(data: OnboardingData): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Aqui você pode logar os dados para simular o envio
      console.log('Dados enviados para o backend (mock):', data);
      resolve({ success: true });
    }, 1200); // 1.2s de delay para simular requisição
  });
}
