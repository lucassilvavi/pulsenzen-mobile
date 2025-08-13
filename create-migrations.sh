#!/bin/bash

# 🗄️ PulseZen API - Database Migrations
# Este script cria todas as migrações baseadas nos contratos do frontend

set -e

echo "🗄️ Criando migrações do banco de dados..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "ace" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto AdonisJS"
    exit 1
fi

print_status "Criando migrações..."

# 1. Users (base)
print_status "Criando migração: users"
node ace make:migration users

# 2. User Profiles
print_status "Criando migração: user_profiles"
node ace make:migration user_profiles

# 3. SOS Module
print_status "Criando migrações do módulo SOS..."
node ace make:migration emergency_resources
node ace make:migration crisis_contacts
node ace make:migration quick_relief_exercises
node ace make:migration coping_strategies

# 4. Journal Module
print_status "Criando migrações do módulo Journal..."
node ace make:migration journal_prompts
node ace make:migration mood_tags
node ace make:migration journal_entries
node ace make:migration journal_entry_mood_tags

# 5. Breathing Module
print_status "Criando migrações do módulo Breathing..."
node ace make:migration breathing_techniques
node ace make:migration breathing_sessions

# 6. Analytics e Tracking
print_status "Criando migrações de analytics..."
node ace make:migration user_sessions
node ace make:migration user_analytics

print_success "Todas as migrações criadas!"

print_status "Agora você deve editar os arquivos de migração em database/migrations/"
print_status "Use o BACKEND_SETUP_GUIDE.md como referência para os schemas"

echo ""
echo "📋 Migrações criadas:"
echo "   ├── users"
echo "   ├── user_profiles"
echo "   ├── emergency_resources"
echo "   ├── crisis_contacts"
echo "   ├── quick_relief_exercises"
echo "   ├── coping_strategies"
echo "   ├── journal_prompts"
echo "   ├── mood_tags"
echo "   ├── journal_entries"
echo "   ├── journal_entry_mood_tags"
echo "   ├── breathing_techniques"
echo "   ├── breathing_sessions"
echo "   ├── user_sessions"
echo "   └── user_analytics"
echo ""
echo "🚀 Próximo passo: npm run migration:run"
