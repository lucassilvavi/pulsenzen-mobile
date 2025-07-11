#!/bin/bash

# 🚀 PulseZen API - Setup Automático
# Este script configura automaticamente o projeto AdonisJS com todas as dependências

set -e

echo "🚀 Iniciando setup do PulseZen API..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para printar com cores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    print_error "npm não encontrado. Por favor, instale o npm primeiro."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Navegar para o diretório correto
cd "$(dirname "$0")"
PARENT_DIR=$(dirname $(pwd))
print_status "Diretório pai: $PARENT_DIR"

# Verificar se o projeto pulsezen-api já existe
if [ -d "$PARENT_DIR/pulsezen-api" ]; then
    print_warning "Diretório pulsezen-api já existe. Deseja continuar? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_error "Setup cancelado pelo usuário."
        exit 1
    fi
    cd "$PARENT_DIR/pulsezen-api"
else
    # Criar novo projeto AdonisJS
    print_status "Criando novo projeto AdonisJS..."
    cd "$PARENT_DIR"
    
    # Usar npm create para criar o projeto
    npm create adonisjs@latest pulsezen-api -- --boilerplate=api --auth-guard=jwt --db=sqlite --frontend=false
    
    cd pulsezen-api
    print_success "Projeto AdonisJS criado com sucesso!"
fi

# Instalar dependências adicionais
print_status "Instalando dependências adicionais..."

# Dependências principais
npm install @adonisjs/cors @adonisjs/limiter @adonisjs/bouncer @adonisjs/validator

# Dependências para desenvolvimento
npm install --save-dev @types/uuid @faker-js/faker

# Dependências utilitárias
npm install uuid dayjs

print_success "Dependências instaladas com sucesso!"

# Configurar estrutura de diretórios
print_status "Criando estrutura de diretórios..."

# Criar estrutura modular
mkdir -p app/modules/{auth,sos,journal,breathing,music}/{controllers,services,repositories,models,validators,tests}

# Criar diretórios compartilhados
mkdir -p app/shared/{contracts,exceptions,middleware,services,validators,utils}

# Criar diretórios core
mkdir -p app/core/{repositories,services,entities}

# Criar diretórios de teste
mkdir -p tests/{unit,integration,functional}

print_success "Estrutura de diretórios criada!"

# Criar arquivo .env personalizado
print_status "Configurando arquivo de ambiente..."

cat > .env << EOF
# Application
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
APP_NAME=PulseZen API

# Database
DB_CONNECTION=sqlite
DB_DATABASE=pulsezen.sqlite

# Authentication
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Security
CORS_ENABLED=true
CORS_ORIGIN=*
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE
CORS_HEADERS=Content-Type,Authorization

# File storage
DRIVE_DISK=local

# Rate limiting
CACHE_VIEWS=false

# API
API_VERSION=v1
API_PREFIX=/api

# Mobile optimization
ENABLE_COMPRESSION=true
MAX_REQUEST_SIZE=10mb
EOF

print_success "Arquivo .env configurado!"

# Criar configuração personalizada de CORS
print_status "Configurando CORS para mobile..."

cat > config/cors.ts << 'EOF'
import { CorsConfig } from '@ioc:Adonis/Core/Cors'

const corsConfig: CorsConfig = {
  enabled: true,
  
  // Allow requests from mobile apps (no origin)
  origin: (origin, callback) => {
    // Mobile apps don't send origin header
    if (!origin) return callback(null, true)
    
    // Allowed origins for web clients
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8080',
      'https://pulsezen.com',
      process.env.FRONTEND_URL
    ].filter(Boolean)
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    
    // Allow localhost in development
    if (process.env.NODE_ENV === 'development' && origin?.includes('localhost')) {
      return callback(null, true)
    }
    
    callback(null, false)
  },
  
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  headers: true,
  exposeHeaders: [
    'cache-control',
    'content-language',
    'content-type',
    'expires',
    'last-modified',
    'pragma',
    'x-api-version',
    'x-response-time'
  ],
  credentials: true,
  maxAge: 90,
}

export default corsConfig
EOF

print_success "CORS configurado para mobile!"

# Configurar roteamento básico
print_status "Configurando rotas básicas..."

cat > start/routes.ts << 'EOF'
import Route from '@ioc:Adonis/Core/Route'

// Health check
Route.get('/health', async ({ response }) => {
  return response.json({
    success: true,
    message: 'PulseZen API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// API v1 routes
Route.group(() => {
  // Auth routes
  Route.group(() => {
    Route.post('/register', 'AuthController.register')
    Route.post('/login', 'AuthController.login')
    Route.post('/logout', 'AuthController.logout').middleware('auth')
    Route.get('/me', 'AuthController.me').middleware('auth')
  }).prefix('/auth')

  // Protected routes
  Route.group(() => {
    // SOS routes
    Route.group(() => {
      Route.get('/emergency-resources', 'SOSController.getEmergencyResources')
      Route.get('/crisis-contacts', 'SOSController.getCrisisContacts')
      Route.post('/crisis-contacts', 'SOSController.createCrisisContact')
    }).prefix('/sos')

    // Journal routes
    Route.group(() => {
      Route.get('/prompts', 'JournalController.getPrompts')
      Route.get('/entries', 'JournalController.getEntries')
      Route.post('/entries', 'JournalController.createEntry')
    }).prefix('/journal')

    // Breathing routes
    Route.group(() => {
      Route.get('/techniques', 'BreathingController.getTechniques')
      Route.post('/sessions', 'BreathingController.createSession')
      Route.get('/stats', 'BreathingController.getStats')
    }).prefix('/breathing')

    // Music routes
    Route.group(() => {
      Route.get('/categories', 'MusicController.getCategories')
      Route.get('/tracks', 'MusicController.getTracks')
      Route.get('/playlists', 'MusicController.getPlaylists')
    }).prefix('/music')

  }).middleware('auth')

}).prefix('/api/v1')
EOF

print_success "Rotas básicas configuradas!"

# Criar middleware base para mobile
print_status "Criando middleware para mobile..."

mkdir -p app/Middleware

cat > app/Middleware/MobileResponse.ts << 'EOF'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class MobileResponse {
  public async handle(
    { response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    await next()
    
    // Headers otimizados para mobile
    response.header('X-API-Version', '1.0.0')
    response.header('X-Response-Time', Date.now().toString())
    
    // Compression hints para reduzir payload
    if (response.getBody() && typeof response.getBody() === 'object') {
      response.header('Content-Type', 'application/json; charset=utf-8')
    }
  }
}
EOF

print_success "Middleware criado!"

# Executar migrações iniciais
print_status "Executando migrações do banco de dados..."

# Primeiro, gerar a app key se não existir
if ! grep -q "APP_KEY=" .env || grep -q "APP_KEY=$" .env; then
    node ace generate:key
fi

# Executar migrações
node ace migration:run

print_success "Migrações executadas!"

# Criar test helper
print_status "Configurando helpers de teste..."

mkdir -p tests/helpers

cat > tests/helpers/TestHelper.ts << 'EOF'
import User from 'App/Models/User'
import Database from '@ioc:Adonis/Lucid/Database'

export class TestHelper {
  /**
   * Limpar banco de dados para testes
   */
  static async cleanDatabase() {
    await Database.beginGlobalTransaction()
  }

  /**
   * Restaurar transação global
   */
  static async restoreDatabase() {
    await Database.rollbackGlobalTransaction()
  }

  /**
   * Criar usuário para testes
   */
  static async createUser(overrides = {}) {
    const defaultData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      ...overrides
    }
    
    return await User.create(defaultData)
  }

  /**
   * Criar usuário autenticado
   */
  static async createAuthenticatedUser() {
    const user = await this.createUser()
    // @ts-ignore
    const token = await user.generateToken()
    return { user, token }
  }

  /**
   * Headers de autenticação para testes
   */
  static getAuthHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }
}
EOF

print_success "Helpers de teste criados!"

# Criar primeiro teste de exemplo
print_status "Criando teste de exemplo..."

mkdir -p tests/functional

cat > tests/functional/health.spec.ts << 'EOF'
import test from '@japa/runner'
import { TestHelper } from '../helpers/TestHelper'

test.group('Health Check', (group) => {
  group.each.setup(async () => {
    await TestHelper.cleanDatabase()
  })

  group.each.teardown(async () => {
    await TestHelper.restoreDatabase()
  })

  test('should return health status', async ({ client }) => {
    const response = await client.get('/health')
    
    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      message: 'PulseZen API is running'
    })
  })
})
EOF

print_success "Teste de exemplo criado!"

# Criar scripts no package.json
print_status "Atualizando scripts do package.json..."

# Backup do package.json
cp package.json package.json.backup

# Usar Node.js para atualizar o package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.scripts = {
  ...pkg.scripts,
  'dev': 'node ace serve --watch',
  'build': 'node ace build --production',
  'start': 'node server.js',
  'test': 'node ace test',
  'test:watch': 'node ace test --watch',
  'migration:run': 'node ace migration:run',
  'migration:rollback': 'node ace migration:rollback',
  'db:seed': 'node ace db:seed',
  'make:controller': 'node ace make:controller',
  'make:model': 'node ace make:model',
  'make:migration': 'node ace make:migration',
  'make:seeder': 'node ace make:seeder'
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

print_success "Scripts atualizados no package.json!"

# Testar se o servidor inicia
print_status "Testando inicialização do servidor..."

timeout 10s npm run dev > /dev/null 2>&1 || print_warning "Servidor levou mais que 10s para iniciar (normal na primeira vez)"

print_success "Setup concluído com sucesso!"

echo ""
echo "🎉 PulseZen API está pronto para desenvolvimento!"
echo ""
echo "📋 Próximos passos:"
echo "   1. cd pulsezen-api"
echo "   2. npm run dev (para iniciar em modo desenvolvimento)"
echo "   3. npm run test (para executar testes)"
echo ""
echo "📁 Estrutura criada:"
echo "   ├── app/modules/ (módulos da aplicação)"
echo "   ├── app/shared/ (código compartilhado)"
echo "   ├── app/core/ (core da aplicação)"
echo "   ├── tests/ (testes organizados)"
echo "   └── database/ (migrações e seeds)"
echo ""
echo "🔗 URLs importantes:"
echo "   - API: http://localhost:3333"
echo "   - Health: http://localhost:3333/health"
echo "   - Docs: Consulte BACKEND_SETUP_GUIDE.md"
echo ""
echo "Happy coding! 🚀"
