# PulseZen App - Documentação

## Visão Geral

O PulseZen é um aplicativo de bem-estar mental desenvolvido com React Native e Expo, focado em ajudar os usuários a gerenciar estresse, ansiedade e melhorar sua saúde mental através de várias técnicas e ferramentas.

## Tecnologias Utilizadas

- **React Native**: Framework para desenvolvimento mobile
- **Expo**: Plataforma para desenvolvimento React Native simplificado
- **Expo Router**: Sistema de navegação baseado em arquivos
- **AsyncStorage**: Armazenamento local persistente
- **React Native Reanimated**: Animações fluidas e de alta performance
- **Expo Linear Gradient**: Gradientes visuais
- **Expo Haptics**: Feedback tátil
- **React Native Safe Area Context**: Gerenciamento de áreas seguras em diferentes dispositivos

## Estrutura do Projeto

```
pulsezen-app/
├── app/                    # Rotas e telas do aplicativo (Expo Router)
│   ├── (tabs)/             # Rotas de navegação por abas
│   │   ├── index.tsx       # Tela inicial (Home)
│   │   ├── breathing.tsx   # Tela de exercícios de respiração
│   │   ├── sos.tsx         # Tela de SOS para momentos de ansiedade
│   │   ├── journal.tsx     # Tela de diário
│   │   ├── profile.tsx     # Tela de perfil do usuário
│   │   └── _layout.tsx     # Layout das abas de navegação
│   ├── onboarding/         # Fluxo de onboarding
│   └── _layout.tsx         # Layout principal do aplicativo
├── assets/                 # Recursos estáticos (imagens, fontes, etc.)
├── components/             # Componentes reutilizáveis
│   ├── accessibility/      # Componentes de acessibilidade
│   ├── base/               # Componentes base (Button, Card, etc.)
│   └── ui/                 # Componentes de interface específicos
├── constants/              # Constantes do aplicativo
│   └── theme.ts            # Definições de tema (cores, espaçamentos, etc.)
├── context/                # Contextos React
│   └── AppContext.tsx      # Contexto global do aplicativo
├── hooks/                  # Hooks personalizados
├── utils/                  # Funções utilitárias
│   ├── accessibility.ts    # Utilitários de acessibilidade
│   ├── performance.ts      # Utilitários de performance
│   ├── responsive.ts       # Utilitários de responsividade
│   └── storage.ts          # Utilitários de armazenamento
└── package.json            # Dependências do projeto
```

## Funcionalidades Principais

### 1. Tela Inicial (Home)
- Visão geral das principais funcionalidades
- Acesso rápido a exercícios recomendados
- Estatísticas de uso e progresso

### 2. Exercícios de Respiração
- Diferentes técnicas de respiração guiada
- Animações visuais para acompanhamento
- Temporizadores personalizáveis

### 3. SOS (Alívio de Ansiedade)
- Técnicas rápidas para momentos de crise
- Exercícios de grounding
- Mensagens de suporte e orientação

### 4. Diário
- Registro de pensamentos e sentimentos
- Histórico de entradas anteriores
- Análise de padrões emocionais

### 5. Rastreador de Humor
- Registro diário de humor
- Visualização de tendências ao longo do tempo
- Identificação de gatilhos emocionais

### 6. Histórias para Dormir
- Conteúdo relaxante para auxiliar no sono
- Sons ambientes e meditações guiadas
- Temporizador para desligamento automático

### 7. Perfil e Estatísticas
- Visualização de progresso
- Conquistas e metas
- Personalização de preferências

## Componentes Reutilizáveis

O projeto utiliza uma abordagem modular com diversos componentes reutilizáveis:

- **Button**: Botões personalizáveis com diferentes estilos e estados
- **Card**: Containers para conteúdo com estilos consistentes
- **FeatureCard**: Cards específicos para funcionalidades
- **Header**: Cabeçalhos de tela padronizados
- **ScreenContainer**: Container base para telas com gradiente
- **TabBar**: Navegação por abas personalizada
- **TextInput**: Campos de entrada de texto estilizados
- **ThemedComponents**: Componentes com suporte a tema claro/escuro

## Acessibilidade

O aplicativo foi desenvolvido com foco em acessibilidade:

- Suporte completo a leitores de tela
- Labels e hints de acessibilidade em todos os elementos interativos
- Contraste adequado para leitura
- Opções para redução de movimento
- Feedback tátil adaptativo

## Performance

Foram implementadas diversas otimizações de performance:

- Memoização de componentes e callbacks
- Lazy loading de recursos pesados
- Debounce e throttle para eventos frequentes
- Otimização de renderização
- Dimensionamento responsivo de imagens

## Responsividade

O aplicativo se adapta a diferentes tamanhos de tela:

- Layout fluido com unidades relativas
- Adaptação para tablets e telefones
- Suporte a orientação retrato e paisagem
- Ajuste automático para áreas seguras (notch, barra de navegação, etc.)

## Armazenamento de Dados

Os dados do usuário são armazenados localmente:

- Perfil e preferências
- Histórico de sessões
- Entradas de diário e humor
- Estatísticas e conquistas

## Instruções de Build e Publicação

### Requisitos

- Node.js 16 ou superior
- Expo CLI (`npm install -g expo-cli`)
- Conta Expo (para publicação)

### Desenvolvimento Local

1. Clone o repositório:
   ```
   git clone https://github.com/lucassilvavi/pulsezen-app.git
   cd pulsezen-app
   ```

2. Instale as dependências:
   ```
   npm install
   ```
   ou
   ```
   yarn install
   ```

3. Inicie o servidor de desenvolvimento:
   ```
   npx expo start
   ```

4. Escaneie o QR code com o aplicativo Expo Go (Android) ou Câmera (iOS)

### Build para Produção

#### Android (APK/AAB)

1. Configure o arquivo `app.json` com as informações do seu aplicativo
2. Execute o build:
   ```
   eas build -p android
   ```
   ou para build local:
   ```
   npx expo build:android
   ```

#### iOS (IPA)

1. Configure o arquivo `app.json` com as informações do seu aplicativo
2. Execute o build:
   ```
   eas build -p ios
   ```
   ou para build local:
   ```
   npx expo build:ios
   ```

### Publicação na Expo

1. Configure o arquivo `app.json` com as informações do seu aplicativo
2. Execute:
   ```
   npx expo publish
   ```

## Próximos Passos e Melhorias Futuras

- Implementação de backend para sincronização de dados
- Notificações personalizadas
- Conteúdo adicional para meditação e sono
- Integração com wearables para monitoramento de saúde
- Comunidade e recursos sociais
- Análises avançadas de dados e insights personalizados

## Contato e Suporte

Para questões relacionadas ao desenvolvimento ou suporte técnico, entre em contato através do GitHub ou pelo email fornecido no repositório do projeto.

---

Desenvolvido com ❤️ usando React Native e Expo
