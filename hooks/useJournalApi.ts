import { useCallback, useEffect, useState } from 'react'
import journalApiService, {
    CreateJournalEntryData,
    JournalEntry,
    JournalPrompt,
    JournalStats,
    UpdateJournalEntryData
} from '../services/journalApiService'

// Hook para gerenciar entradas do journal
export function useJournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const loadEntries = useCallback(async (reset = false, filters?: any) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const currentPage = reset ? 1 : page
      const response = await journalApiService.getEntries(currentPage, 10, filters)
      
      if (response.success) {
        const newEntries = response.data.entries || []
        
        if (reset) {
          setEntries(newEntries)
          setPage(2)
        } else {
          setEntries(prev => [...prev, ...newEntries])
          setPage(prev => prev + 1)
        }
        
        setHasMore(response.data.hasMore || false)
      } else {
        throw new Error(response.message || 'Erro ao carregar entradas')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [loading, page])

  const createEntry = useCallback(async (entryData: CreateJournalEntryData) => {
    setLoading(true)
    setError(null)

    try {
      const newEntry = await journalApiService.createEntry(entryData)
      setEntries(prev => [newEntry, ...prev])
      return newEntry
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar entrada'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateEntry = useCallback(async (id: string, entryData: UpdateJournalEntryData) => {
    setLoading(true)
    setError(null)

    try {
      const updatedEntry = await journalApiService.updateEntry(id, entryData)
      setEntries(prev => prev.map(entry => 
        entry.id === id ? updatedEntry : entry
      ))
      return updatedEntry
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar entrada'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteEntry = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      await journalApiService.deleteEntry(id)
      setEntries(prev => prev.filter(entry => entry.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar entrada'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => {
    setPage(1)
    loadEntries(true)
  }, [loadEntries])

  return {
    entries,
    loading,
    error,
    hasMore,
    loadEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    refresh
  }
}

// Hook para gerenciar prompts
export function useJournalPrompts() {
  const [prompts, setPrompts] = useState<JournalPrompt[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPrompts = useCallback(async (category?: string) => {
    setLoading(true)
    setError(null)

    try {
      const promptsData = await journalApiService.getPrompts(category)
      setPrompts(promptsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar prompts')
    } finally {
      setLoading(false)
    }
  }, [])

  const getRandomPrompt = useCallback((category?: string) => {
    const filteredPrompts = category 
      ? prompts.filter(p => p.category === category)
      : prompts
    
    if (filteredPrompts.length === 0) return null
    
    const randomIndex = Math.floor(Math.random() * filteredPrompts.length)
    return filteredPrompts[randomIndex]
  }, [prompts])

  useEffect(() => {
    loadPrompts()
  }, [loadPrompts])

  return {
    prompts,
    loading,
    error,
    loadPrompts,
    getRandomPrompt
  }
}

// Hook para estatísticas do journal
export function useJournalStats() {
  const [stats, setStats] = useState<JournalStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async (filters?: any) => {
    setLoading(true)
    setError(null)

    try {
      const statsData = await journalApiService.getStats(filters)
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return {
    stats,
    loading,
    error,
    loadStats,
    refresh: loadStats
  }
}

// Hook para busca de entradas
export function useJournalSearch() {
  const [results, setResults] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const search = useCallback(async (query: string, filters?: any) => {
    if (!query.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const response = await journalApiService.searchEntries(query, filters)
      
      if (response.success) {
        setResults(response.data || [])
      } else {
        throw new Error(response.message || 'Erro na busca')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na busca')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setResults([])
    setError(null)
    setHasSearched(false)
  }, [])

  return {
    results,
    loading,
    error,
    hasSearched,
    search,
    clearSearch
  }
}

// Hook para autenticação
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsAuthenticated(journalApiService.isAuthenticated())
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await journalApiService.login(email, password)
      
      if (response.success) {
        setIsAuthenticated(true)
        return response.data
      } else {
        throw new Error(response.message || 'Erro no login')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no login'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (userData: any) => {
    setLoading(true)
    setError(null)

    try {
      const response = await journalApiService.register(userData)
      
      if (response.success) {
        setIsAuthenticated(true)
        return response.data
      } else {
        throw new Error(response.message || 'Erro no registro')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no registro'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await journalApiService.logout()
    setIsAuthenticated(false)
  }, [])

  return {
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout
  }
}
