# 🚀 PulseZen API - Setup Guide com AdonisJS

## Overview

Este guia configura o projeto `pulsezen-api` com AdonisJS seguindo Clean Architecture, estrutura modular, SQLite para desenvolvimento, e foco na integração com app mobile.

## 📋 Requisitos do Projeto

1. ✅ **SQLite** para desenvolvimento (evitar complexidade de banco inicial)
2. ✅ **Estrutura Modular** (espelhando o frontend)
3. ✅ **Clean Architecture** (separação clara de responsabilidades)
4. ✅ **Migrations & Seeds** (persistência e massa de dados)
5. ✅ **Testes** (integração e unidade)
6. ✅ **Segurança** (prioridade máxima)
7. ✅ **Mobile-First** (APIs otimizadas para mobile)

## 🛠️ Configuração Inicial

### 1. Criar o projeto AdonisJS

```bash
# Navegar para o diretório pai
cd /Users/lucas/Documents/pulsezen

# Criar novo projeto AdonisJS
npm init adonisjs@latest pulsezen-api
cd pulsezen-api

# Selecionar as opções:
# - Project structure: API only
# - Authentication: Yes (com JWT)
# - Database: SQLite
# - Testing: Japa
# - CORS: Yes
```

### 2. Instalar dependências adicionais

```bash
# Dependências principais
npm install @adonisjs/lucid @adonisjs/auth @adonisjs/cors @adonisjs/validator
npm install @adonisjs/bouncer @adonisjs/limiter @adonisjs/redis
npm install @adonisjs/mail @adonisjs/drive

# Dependências de desenvolvimento
npm install @types/uuid uuid @faker-js/faker
npm install @adonisjs/assembler
```

### 3. Configurar banco SQLite

```bash
# Configurar Lucid ORM
node ace configure @adonisjs/lucid

# Selecionar SQLite como database
```

## 📁 Estrutura Clean Architecture + Modular

```
pulsezen-api/
├── app/
│   ├── modules/                    # Estrutura modular
│   │   ├── auth/                   # Módulo de autenticação
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── models/
│   │   │   ├── validators/
│   │   │   ├── tests/
│   │   │   └── routes.ts
│   │   ├── sos/                    # Módulo SOS
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── models/
│   │   │   ├── validators/
│   │   │   ├── tests/
│   │   │   └── routes.ts
│   │   ├── journal/                # Módulo Journal
│   │   ├── breathing/              # Módulo Breathing
│   │   └── music/                  # Módulo Music
│   ├── shared/                     # Código compartilhado
│   │   ├── contracts/              # Interfaces e contratos
│   │   ├── exceptions/             # Exceções customizadas
│   │   ├── middleware/             # Middleware globais
│   │   ├── services/               # Serviços compartilhados
│   │   ├── validators/             # Validadores base
│   │   └── utils/                  # Utilitários
│   └── core/                       # Core da aplicação
│       ├── repositories/           # Repository base
│       ├── services/               # Service base
│       └── entities/               # Entidades do domínio
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── functional/
├── config/
├── start/
└── providers/
```

## 🔧 Configurações Iniciais

### 1. Configurar ambiente (.env)

```env
# Application
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=generate_new_key_here
APP_NAME=PulseZen API

# Database
DB_CONNECTION=sqlite
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_DATABASE=pulsezen

# Authentication
JWT_SECRET=your_jwt_secret_here

# Security
CORS_ENABLED=true
CORS_ORIGIN=*
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE
CORS_HEADERS=Content-Type,Authorization

# File storage
DRIVE_DISK=local

# Rate limiting
REDIS_CONNECTION=local
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### 2. Configurar CORS para mobile

```typescript
// config/cors.ts
import { CorsConfig } from '@adonisjs/cors/types'

const corsConfig: CorsConfig = {
  enabled: true,
  origin: (origin, callback) => {
    // Permitir requests de apps mobile (sem origin)
    if (!origin) return callback(null, true)
    
    // Lista de origins permitidos
    const allowedOrigins = [
      'http://localhost:3000',
      'https://pulsezen.com',
      // Adicionar outros domínios conforme necessário
    ]
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    
    callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  headers: true,
  exposeHeaders: [
    'cache-control',
    'content-language',
    'content-type',
    'expires',
    'last-modified',
    'pragma',
  ],
  credentials: true,
  maxAge: 90,
}

export default corsConfig
```

### 3. Configurar Rate Limiting para mobile

```typescript
// config/limiter.ts
import { LimiterConfig } from '@adonisjs/limiter/types'

const limiterConfig: LimiterConfig = {
  default: 'redis',
  
  stores: {
    redis: {
      connectionName: 'local',
    },
  },
  
  // Rate limits específicos para mobile
  rateLimits: {
    auth: {
      requests: 5,
      duration: '15 mins',
    },
    api: {
      requests: 100,
      duration: '15 mins',
    },
    upload: {
      requests: 10,
      duration: '1 hour',
    },
  },
}

export default limiterConfig
```

## 🗄️ Schema Base do Banco

### Migration: Users

```typescript
// database/migrations/001_users.ts
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.string('email').unique().notNullable()
      table.string('password').notNullable()
      table.string('first_name').nullable()
      table.string('last_name').nullable()
      table.date('date_of_birth').nullable()
      table.string('timezone').defaultTo('UTC')
      table.string('language').defaultTo('pt-BR')
      table.string('avatar_url').nullable()
      table.boolean('email_verified').defaultTo(false)
      table.boolean('onboarding_completed').defaultTo(false)
      table.boolean('is_active').defaultTo(true)
      table.timestamp('last_login_at').nullable()
      table.json('device_info').nullable()
      table.json('preferences').nullable()
      
      // Security fields
      table.string('remember_me_token').nullable()
      table.integer('login_attempts').defaultTo(0)
      table.timestamp('locked_until').nullable()
      
      table.timestamps(true, true)
      table.timestamp('deleted_at').nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

### Migration: User Profiles

```typescript
// database/migrations/002_user_profiles.ts
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserProfiles extends BaseSchema {
  protected tableName = 'user_profiles'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      
      // Profile data
      table.text('bio').nullable()
      table.json('emergency_contacts').nullable()
      table.json('health_conditions').nullable()
      table.json('goals').nullable()
      table.json('interests').nullable()
      
      // App preferences
      table.json('notification_settings').nullable()
      table.json('privacy_settings').nullable()
      table.json('accessibility_settings').nullable()
      
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## 🏗️ Estrutura Base dos Módulos

### 1. Base Repository

```typescript
// app/core/repositories/BaseRepository.ts
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import { LucidModel, LucidRow } from '@ioc:Adonis/Lucid/types'

export interface IBaseRepository<T extends BaseModel> {
  create(data: Partial<T>): Promise<T>
  findById(id: string): Promise<T | null>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<boolean>
  findAll(filters?: any): Promise<T[]>
}

export abstract class BaseRepository<T extends BaseModel> implements IBaseRepository<T> {
  protected model: LucidModel

  constructor(model: LucidModel) {
    this.model = model
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data)
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.find(id)
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const record = await this.model.findOrFail(id)
    record.merge(data)
    await record.save()
    return record
  }

  async delete(id: string): Promise<boolean> {
    const record = await this.model.find(id)
    if (record) {
      await record.delete()
      return true
    }
    return false
  }

  async findAll(filters: any = {}): Promise<T[]> {
    let query = this.model.query()
    
    // Aplicar filtros básicos
    if (filters.limit) query.limit(filters.limit)
    if (filters.offset) query.offset(filters.offset)
    if (filters.orderBy) query.orderBy(filters.orderBy, filters.direction || 'asc')
    
    return await query.exec()
  }
}
```

### 2. Base Service

```typescript
// app/core/services/BaseService.ts
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import { IBaseRepository } from '../repositories/BaseRepository'

export abstract class BaseService<T extends BaseModel> {
  protected repository: IBaseRepository<T>

  constructor(repository: IBaseRepository<T>) {
    this.repository = repository
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.repository.create(data)
  }

  async findById(id: string): Promise<T | null> {
    return await this.repository.findById(id)
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return await this.repository.update(id, data)
  }

  async delete(id: string): Promise<boolean> {
    return await this.repository.delete(id)
  }

  async findAll(filters?: any): Promise<T[]> {
    return await this.repository.findAll(filters)
  }
}
```

### 3. Base Controller

```typescript
// app/shared/controllers/BaseController.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export abstract class BaseController {
  protected sendSuccess(ctx: HttpContextContract, data: any, message = 'Success', code = 200) {
    return ctx.response.status(code).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    })
  }

  protected sendError(ctx: HttpContextContract, message: string, code = 400, errors?: any) {
    return ctx.response.status(code).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    })
  }

  protected sendPaginated(
    ctx: HttpContextContract,
    data: any[],
    pagination: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    },
    message = 'Success'
  ) {
    return ctx.response.json({
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    })
  }
}
```

## 🔒 Middleware de Segurança

### 1. Auth Middleware Mobile-Friendly

```typescript
// app/middleware/AuthMobile.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AuthenticationException } from '@adonisjs/auth/build/standalone'

export default class AuthMobile {
  public async handle(
    { auth, response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    try {
      await auth.use('jwt').authenticate()
      
      // Verificar se usuário está ativo
      if (!auth.user?.isActive) {
        throw new AuthenticationException('Account deactivated', 'E_USER_DEACTIVATED')
      }
      
      await next()
    } catch (error) {
      // Resposta mobile-friendly
      return response.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'E_UNAUTHORIZED',
        timestamp: new Date().toISOString(),
      })
    }
  }
}
```

### 2. Rate Limiting para APIs

```typescript
// app/middleware/ApiRateLimit.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RateLimiter } from '@adonisjs/limiter/services'

export default class ApiRateLimit {
  public async handle(
    { request, response, auth }: HttpContextContract,
    next: () => Promise<void>,
    guards: string[]
  ) {
    const key = auth.user?.id || request.ip()
    const limiterName = guards[0] || 'api'
    
    const limiter = RateLimiter.use(limiterName)
    
    try {
      await limiter.check(key)
      await next()
    } catch (error) {
      return response.status(429).json({
        success: false,
        message: 'Too many requests',
        code: 'E_RATE_LIMIT_EXCEEDED',
        retryAfter: error.retryAfter,
        timestamp: new Date().toISOString(),
      })
    }
  }
}
```

## 🧪 Configuração de Testes

### 1. Setup de teste

```typescript
// tests/bootstrap.ts
import { configure } from 'japa'
import { runMigrations, rollbackMigrations } from '@adonisjs/lucid/build/src/test-utils'

configure({
  files: ['tests/**/*.spec.ts'],
  before: [
    async () => {
      await runMigrations()
    },
  ],
  after: [
    async () => {
      await rollbackMigrations()
    },
  ],
})
```

### 2. Test Helper

```typescript
// tests/helpers/TestHelper.ts
import User from 'App/modules/auth/models/User'
import { UserFactory } from 'Database/factories/UserFactory'

export class TestHelper {
  static async createUser(overrides = {}) {
    return await UserFactory.merge(overrides).create()
  }

  static async createAuthenticatedUser() {
    const user = await this.createUser()
    const token = await user.generateToken()
    return { user, token }
  }

  static getAuthHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }
}
```

## 📱 Otimizações para Mobile

### 1. Response Middleware

```typescript
// app/middleware/MobileResponse.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class MobileResponse {
  public async handle(
    { response }: HttpContextContract,
    next: () => Promise<void>
  ) {
    await next()
    
    // Headers otimizados para mobile
    response.header('X-Response-Time', Date.now())
    response.header('X-API-Version', '1.0.0')
    
    // Compression hints
    if (response.getBody() && typeof response.getBody() === 'object') {
      response.header('Content-Type', 'application/json; charset=utf-8')
    }
  }
}
```

### 2. Validation Messages Mobile-Friendly

```typescript
// app/shared/validators/BaseValidator.ts
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class BaseValidator {
  public static messages = {
    required: 'Este campo é obrigatório',
    email: 'Por favor, insira um email válido',
    min: 'Este campo deve ter pelo menos {{ options.minLength }} caracteres',
    max: 'Este campo deve ter no máximo {{ options.maxLength }} caracteres',
    unique: 'Este valor já está em uso',
  }

  public static async validateMobile(
    ctx: HttpContextContract,
    validationSchema: any,
    customMessages = {}
  ) {
    try {
      const data = await ctx.request.validate({
        schema: validationSchema,
        messages: { ...this.messages, ...customMessages },
      })
      return data
    } catch (error) {
      throw {
        code: 'E_VALIDATION_FAILURE',
        message: 'Dados inválidos',
        errors: error.messages,
      }
    }
  }
}
```

## 🚀 Próximos Passos

### 1. Executar configuração inicial

```bash
# 1. Criar o projeto
cd /Users/lucas/Documents/pulsezen
npm init adonisjs@latest pulsezen-api

# 2. Configurar dependências
cd pulsezen-api
npm install [dependências listadas acima]

# 3. Configurar banco
node ace configure @adonisjs/lucid

# 4. Rodar migrações
node ace migration:run

# 5. Criar seeds iniciais
node ace make:seeder User
```

### 2. Criar primeiro módulo (Auth)

```bash
# Criar estrutura do módulo auth
mkdir -p app/modules/auth/{controllers,services,repositories,models,validators,tests}

# Criar model User
node ace make:model User -m

# Criar controller de autenticação
node ace make:controller auth/AuthController
```

### 3. Implementar testes

```bash
# Instalar e configurar Japa
npm install @japa/runner @japa/assert @japa/api-client

# Criar primeiro teste
mkdir tests/integration/auth
touch tests/integration/auth/auth.spec.ts
```

Este setup fornece uma base sólida para o desenvolvimento da API seguindo todas as suas especificações!
