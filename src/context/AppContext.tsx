import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ProcessedData, FilterState, SalesRow, ReturnRow } from '@/lib/types';
import { processFiles } from '@/lib/parser';
import { aplicarFiltros } from '@/lib/filters';

interface AppState {
  data: ProcessedData | null;
  filters: FilterState;
  filteredVendas: SalesRow[];
  filteredMatriz: ReturnRow[];
  filteredFull: ReturnRow[];
  isLoading: boolean;
  error: string | null;
}

interface AppContextType extends AppState {
  loadFiles: (vendasFile: ArrayBuffer, devolucoesFile: ArrayBuffer) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetData: () => void;
}

const defaultFilters: FilterState = {
  janela: 180,
  canal: 'Todos',
  somenteAds: false,
  top10Skus: false,
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    data: null,
    filters: defaultFilters,
    filteredVendas: [],
    filteredMatriz: [],
    filteredFull: [],
    isLoading: false,
    error: null,
  });

  const applyFilters = useCallback((data: ProcessedData, filters: FilterState) => {
    const { vendas, matriz, full } = aplicarFiltros(data, filters);
    return { filteredVendas: vendas, filteredMatriz: matriz, filteredFull: full };
  }, []);

  const loadFiles = useCallback((vendasFile: ArrayBuffer, devolucoesFile: ArrayBuffer) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = processFiles(vendasFile, devolucoesFile);
      const filtered = aplicarFiltros(data, defaultFilters);
      setState({
        data,
        filters: defaultFilters,
        filteredVendas: filtered.vendas,
        filteredMatriz: filtered.matriz,
        filteredFull: filtered.full,
        isLoading: false,
        error: null,
      });
    } catch (e) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: e instanceof Error ? e.message : 'Erro ao processar arquivos',
      }));
    }
  }, []);

  const setFilters = useCallback((partial: Partial<FilterState>) => {
    setState(prev => {
      if (!prev.data) return prev;
      const newFilters = { ...prev.filters, ...partial };
      const filtered = aplicarFiltros(prev.data, newFilters);
      return {
        ...prev,
        filters: newFilters,
        filteredVendas: filtered.vendas,
        filteredMatriz: filtered.matriz,
        filteredFull: filtered.full,
      };
    });
  }, []);

  const resetData = useCallback(() => {
    setState({
      data: null,
      filters: defaultFilters,
      filteredVendas: [],
      filteredMatriz: [],
      filteredFull: [],
      isLoading: false,
      error: null,
    });
  }, []);

  return (
    <AppContext.Provider value={{ ...state, loadFiles, setFilters, resetData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppData must be used within AppProvider');
  return ctx;
}
