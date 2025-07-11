# 📋 PulseZen API - Migration Templates

Templates de migrações baseados nos contratos do frontend para usar com AdonisJS + SQLite.

## Como usar:

1. Execute `./create-migrations.sh` para criar os arquivos
2. Copie o código correspondente para cada arquivo de migração
3. Execute `npm run migration:run`

## 1. Users Migration

```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Primary key
      table.string('id').primary().defaultTo(this.raw("lower(hex(randomblob(16)))"))
      
      // Authentication
      table.string('email').unique().notNullable()
      table.string('password').notNullable()
      
      // Profile basics
      table.string('first_name').nullable()
      table.string('last_name').nullable()
      table.date('date_of_birth').nullable()
      
      // Preferences
      table.string('timezone').defaultTo('UTC')
      table.string('language').defaultTo('pt-BR')
      table.string('avatar_url').nullable()
      
      // Status
      table.boolean('email_verified').defaultTo(false)
      table.boolean('onboarding_completed').defaultTo(false)
      table.boolean('is_active').defaultTo(true)
      
      // Security
      table.string('remember_me_token').nullable()
      table.integer('login_attempts').defaultTo(0)
      table.datetime('locked_until').nullable()
      table.datetime('last_login_at').nullable()
      
      // Mobile-specific
      table.text('device_info').nullable() // JSON string
      table.text('preferences').nullable() // JSON string
      
      // Timestamps
      table.timestamps(true, true)
      table.datetime('deleted_at').nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## 2. User Profiles Migration

```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserProfiles extends BaseSchema {
  protected tableName = 'user_profiles'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw("lower(hex(randomblob(16)))"))
      table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
      
      // Profile data
      table.text('bio').nullable()
      table.text('emergency_contacts').nullable() // JSON
      table.text('health_conditions').nullable() // JSON
      table.text('goals').nullable() // JSON
      table.text('interests').nullable() // JSON
      
      // App preferences
      table.text('notification_settings').nullable() // JSON
      table.text('privacy_settings').nullable() // JSON
      table.text('accessibility_settings').nullable() // JSON
      
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## 3. Emergency Resources (SOS Module)

```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class EmergencyResources extends BaseSchema {
  protected tableName = 'emergency_resources'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw("lower(hex(randomblob(16)))"))
      
      // Basic info
      table.string('title').notNullable()
      table.text('description').nullable()
      table.string('category').notNullable() // 'hotline', 'chat', 'text', 'local'
      
      // Contact info
      table.string('phone').nullable()
      table.string('website_url').nullable()
      table.string('email').nullable()
      
      // Metadata
      table.text('availability').nullable() // JSON
      table.text('regions').nullable() // JSON array
      table.text('languages').nullable() // JSON array
      
      // Status
      table.boolean('is_active').defaultTo(true)
      table.integer('sort_order').defaultTo(0)
      
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## 4. Crisis Contacts (SOS Module)

```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CrisisContacts extends BaseSchema {
  protected tableName = 'crisis_contacts'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw("lower(hex(randomblob(16)))"))
      table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
      
      table.string('name').notNullable()
      table.string('phone').notNullable()
      table.string('email').nullable()
      table.string('relationship').nullable()
      table.boolean('is_primary').defaultTo(false)
      table.boolean('is_active').defaultTo(true)
      
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## 5. Journal Prompts

```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class JournalPrompts extends BaseSchema {
  protected tableName = 'journal_prompts'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw("lower(hex(randomblob(16)))"))
      
      table.text('question').notNullable()
      table.string('category').notNullable()
      table.string('subcategory').nullable()
      table.string('difficulty').notNullable() // 'easy', 'medium', 'hard'
      table.string('type').notNullable() // 'standard', 'guided', 'creative', 'therapeutic'
      table.integer('estimated_time').nullable() // minutes
      
      table.text('benefits').nullable() // JSON array
      table.text('instructions').nullable() // JSON array
      table.text('tags').nullable() // JSON array
      table.string('icon').nullable()
      
      table.boolean('is_active').defaultTo(true)
      table.boolean('is_premium').defaultTo(false)
      table.string('language').defaultTo('pt-BR')
      table.integer('popularity_score').defaultTo(0)
      
      table.string('created_by').references('id').inTable('users').nullable()
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## 6. Mood Tags

```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class MoodTags extends BaseSchema {
  protected tableName = 'mood_tags'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw("lower(hex(randomblob(16)))"))
      
      table.string('emoji').notNullable()
      table.string('label').notNullable()
      table.string('value').notNullable()
      table.string('color').notNullable()
      table.string('category').notNullable() // 'positive', 'negative', 'neutral'
      table.integer('intensity').notNullable() // 1-5
      
      table.string('language').defaultTo('pt-BR')
      table.boolean('is_active').defaultTo(true)
      
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## 7. Journal Entries

```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class JournalEntries extends BaseSchema {
  protected tableName = 'journal_entries'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw("lower(hex(randomblob(16)))"))
      table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
      
      table.string('title', 500).nullable()
      table.text('content').notNullable()
      table.string('prompt_id').references('id').inTable('journal_prompts').nullable()
      table.text('custom_prompt').nullable()
      
      table.string('category').nullable()
      table.string('subcategory').nullable()
      table.integer('word_count').nullable()
      table.integer('character_count').nullable()
      table.integer('reading_time').nullable() // seconds
      
      // AI Analysis
      table.text('sentiment').nullable() // JSON
      table.text('emotions').nullable() // JSON
      table.text('keywords').nullable() // JSON array
      table.text('themes').nullable() // JSON array
      
      // Privacy and metadata
      table.text('privacy').nullable() // JSON
      table.text('metadata').nullable() // JSON
      
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## 8. Journal Entry Mood Tags (Pivot Table)

```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class JournalEntryMoodTags extends BaseSchema {
  protected tableName = 'journal_entry_mood_tags'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw("lower(hex(randomblob(16)))"))
      table.string('entry_id').references('id').inTable('journal_entries').onDelete('CASCADE')
      table.string('mood_tag_id').references('id').inTable('mood_tags')
      
      table.timestamps(true, true)
      
      // Unique constraint
      table.unique(['entry_id', 'mood_tag_id'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## 9. Breathing Techniques

```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class BreathingTechniques extends BaseSchema {
  protected tableName = 'breathing_techniques'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw("lower(hex(randomblob(16)))"))
      
      table.string('key').unique().notNullable()
      table.string('title').notNullable()
      table.text('description').nullable()
      table.string('category').notNullable() // 'relaxation', 'focus', 'energy', 'sleep', 'emergency'
      table.string('difficulty').notNullable() // 'beginner', 'intermediate', 'advanced'
      
      // Timing
      table.integer('inhale_time').notNullable()
      table.integer('hold_time').notNullable()
      table.integer('exhale_time').notNullable()
      table.integer('pause_time').defaultTo(0)
      table.integer('cycles').notNullable()
      table.integer('estimated_duration').nullable() // seconds
      
      // Content
      table.text('benefits').nullable() // JSON array
      table.text('instructions').nullable() // JSON array
      table.text('prerequisites').nullable() // JSON array
      table.text('contraindications').nullable() // JSON array
      table.text('media').nullable() // JSON (icon, animation, audio)
      table.text('tags').nullable() // JSON array
      
      table.boolean('is_active').defaultTo(true)
      table.boolean('is_premium').defaultTo(false)
      table.string('created_by').references('id').inTable('users').nullable()
      
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## 10. Breathing Sessions

```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class BreathingSessions extends BaseSchema {
  protected tableName = 'breathing_sessions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw("lower(hex(randomblob(16)))"))
      table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.string('technique_id').references('id').inTable('breathing_techniques')
      
      table.datetime('start_time').notNullable()
      table.datetime('end_time').nullable()
      table.string('status').defaultTo('started') // 'started', 'completed', 'interrupted', 'paused'
      
      // Progress
      table.integer('completed_cycles').defaultTo(0)
      table.integer('total_cycles').notNullable()
      table.string('current_phase').nullable() // 'inhale', 'hold', 'exhale', 'pause'
      table.integer('elapsed_time').defaultTo(0) // seconds
      table.integer('remaining_time').nullable() // seconds
      
      // Quality feedback
      table.integer('quality_rating').nullable() // 1-5
      table.text('quality_feedback').nullable()
      table.integer('difficulty_rating').nullable() // 1-5
      table.boolean('would_recommend').nullable()
      
      // Additional data
      table.text('vitals').nullable() // JSON
      table.text('settings').nullable() // JSON
      table.text('environment').nullable() // JSON
      table.text('notes').nullable()
      
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## 11. Music Categories

```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class MusicCategories extends BaseSchema {
  protected tableName = 'music_categories'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw("lower(hex(randomblob(16)))"))
      
      table.string('title').notNullable()
      table.text('description').nullable()
      table.string('icon_name').nullable()
      table.string('color_code').nullable()
      table.integer('sort_order').defaultTo(0)
      table.boolean('is_active').defaultTo(true)
      
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## 12. Music Tracks

```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class MusicTracks extends BaseSchema {
  protected tableName = 'music_tracks'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw("lower(hex(randomblob(16)))"))
      
      table.string('title').notNullable()
      table.string('artist').nullable()
      table.string('category_id').references('id').inTable('music_categories')
      table.integer('duration').notNullable() // seconds
      table.string('audio_url').notNullable()
      table.string('image_url').nullable()
      table.text('description').nullable()
      
      table.text('metadata').nullable() // JSON (genre, mood, tags, BPM)
      table.boolean('is_active').defaultTo(true)
      table.integer('sort_order').defaultTo(0)
      
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## 13. Playlists

```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Playlists extends BaseSchema {
  protected tableName = 'playlists'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw("lower(hex(randomblob(16)))"))
      table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
      
      table.string('name').notNullable()
      table.text('description').nullable()
      table.string('image_url').nullable()
      table.boolean('is_public').defaultTo(false)
      
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## 14. Playlist Tracks (Pivot Table)

```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PlaylistTracks extends BaseSchema {
  protected tableName = 'playlist_tracks'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw("lower(hex(randomblob(16)))"))
      table.string('playlist_id').references('id').inTable('playlists').onDelete('CASCADE')
      table.string('track_id').references('id').inTable('music_tracks')
      table.integer('sort_order').defaultTo(0)
      table.datetime('added_at').defaultTo(this.raw('CURRENT_TIMESTAMP'))
      
      // Unique constraint
      table.unique(['playlist_id', 'track_id'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## 15. User Sessions (Analytics)

```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserSessions extends BaseSchema {
  protected tableName = 'user_sessions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw("lower(hex(randomblob(16)))"))
      table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
      
      table.string('session_type').nullable() // 'breathing', 'journal', 'music', 'sos'
      table.datetime('start_time').notNullable()
      table.datetime('end_time').nullable()
      table.integer('duration').nullable() // seconds
      table.boolean('completed').defaultTo(false)
      table.text('metadata').nullable() // JSON
      
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## 16. User Analytics

```typescript
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserAnalytics extends BaseSchema {
  protected tableName = 'user_analytics'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().defaultTo(this.raw("lower(hex(randomblob(16)))"))
      table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
      
      table.string('metric_type').notNullable() // 'streak', 'mood_trend', 'usage_pattern'
      table.text('metric_value').notNullable() // JSON
      table.date('date_recorded').notNullable()
      
      table.timestamps(true, true)
      
      // Unique constraint
      table.unique(['user_id', 'metric_type', 'date_recorded'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

## Ordem de Execução

Execute as migrações nesta ordem para respeitar as foreign keys:

1. `users`
2. `user_profiles`
3. `emergency_resources`
4. `crisis_contacts`
5. `journal_prompts`
6. `mood_tags`
7. `journal_entries`
8. `journal_entry_mood_tags`
9. `breathing_techniques`
10. `breathing_sessions`
11. `music_categories`
12. `music_tracks`
13. `playlists`
14. `playlist_tracks`
15. `user_sessions`
16. `user_analytics`

## Comandos Úteis

```bash
# Executar migrações
npm run migration:run

# Reverter última migração
npm run migration:rollback

# Status das migrações
node ace migration:status

# Reset completo (cuidado!)
npm run migration:rollback --batch=0
npm run migration:run
```
