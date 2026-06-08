/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Search, 
  ArrowUpDown, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Mail, 
  FileText, 
  CheckCircle, 
  Database, 
  Cloud,
  X, 
  ChevronRight,
  RefreshCw,
  Phone,
  User,
  Heart,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClienteTemp, DbMode, MunicipioType } from './types';
import { isSupabaseConfigured, dbService } from './supabase';
import { 
  formatCPF, 
  formatTelefone, 
  validateEmail, 
  validateCPF, 
  getTodayString, 
  formatToBRLDate, 
  formatTimestampToBRL,
  parseEndereco
} from './utils';
import { DashboardChart } from './components/DashboardChart';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('crm-theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('crm-theme', theme);
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark');
      body.classList.remove('light');
    } else {
      body.classList.add('light');
      body.classList.remove('dark');
    }
  }, [theme]);

  // State elements
  const [clientes, setClientes] = useState<ClienteTemp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'form'>('form');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Success / Error feedback banners
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Form State
  const [formState, setFormState] = useState<{
    nome: string;
    cpf: string;
    telefone: string;
    endereco: string;
    endereco_rua: string;
    endereco_cidade: string;
    endereco_uf: string;
    email: string;
    identidade: string;
    data_nascimento: string;
    municipio_codigo_ibge: number | null;
  }>({
    nome: '',
    cpf: '',
    telefone: '',
    endereco: '',
    endereco_rua: '',
    endereco_cidade: '',
    endereco_uf: '',
    email: '',
    identidade: '',
    data_nascimento: '',
    municipio_codigo_ibge: null
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [currentEditingId, setCurrentEditingId] = useState<string | null>(null);

  // Municipios dynamic search states
  const [municipiosSuggestions, setMunicipiosSuggestions] = useState<MunicipioType[]>([]);
  const [isSearchingMunicipios, setIsSearchingMunicipios] = useState<boolean>(false);
  const [showMunicipiosDropdown, setShowMunicipiosDropdown] = useState<boolean>(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // Delete modal state
  const [deletingCliente, setDeletingCliente] = useState<ClienteTemp | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState<boolean>(false);

  const isDark = theme === 'dark';

  const styles = {
    bg: isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-zinc-900',
    headerBg: isDark ? 'border-zinc-900 bg-zinc-900/40' : 'border-zinc-200 bg-white/85 shadow-sm',
    headerText: isDark ? 'text-white' : 'text-zinc-900',
    subText: isDark ? 'text-zinc-500' : 'text-zinc-650',
    card: isDark ? 'border-zinc-900 bg-zinc-900/40 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-805 shadow-sm',
    cardTitle: isDark ? 'text-white' : 'text-zinc-900',
    cardMeta: isDark ? 'text-zinc-400' : 'text-zinc-550',
    chartCard: isDark ? 'border-zinc-950 bg-zinc-900/10' : 'border-zinc-200 bg-white shadow-sm',
    badge: isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600',
    dbCard: isDark ? 'border-zinc-900 bg-zinc-900/20' : 'border-zinc-200 bg-zinc-100/50 shadow-inner',
    code: isDark ? 'text-blue-400 bg-zinc-950 border-zinc-900' : 'text-blue-600 bg-zinc-100 border-zinc-200',
    input: isDark ? 'bg-zinc-950 border-zinc-850 text-zinc-200 placeholder-zinc-650 focus:ring-blue-500' : 'bg-white border-zinc-300 text-zinc-800 placeholder-zinc-400 focus:ring-blue-500 shadow-sm',
    tableBorder: isDark ? 'border-zinc-950' : 'border-zinc-200',
    tableHeaderBg: isDark ? 'bg-zinc-900/40 border-b border-zinc-900 text-zinc-400' : 'bg-zinc-100/80 border-b border-zinc-200 text-zinc-600',
    tableRowBg: isDark ? 'hover:bg-zinc-900/40 bg-zinc-950/20 text-zinc-300 border-zinc-900/40' : 'hover:bg-zinc-50 bg-white text-zinc-700 border-zinc-100',
    listCard: isDark ? 'border-zinc-900 bg-zinc-900/10 hover:border-zinc-800' : 'border-zinc-200 bg-white hover:border-zinc-300 shadow-sm',
    modalBg: isDark ? 'border-zinc-900 bg-zinc-950' : 'border-zinc-200 bg-white shadow-2xl',
  };

  const getTabClasses = (tab: 'dashboard' | 'list' | 'form') => {
    const isActive = activeTab === tab;
    if (isActive) {
      return isDark
        ? 'bg-zinc-900 border-zinc-800 text-blue-405 shadow-sm border-b-2 border-b-blue-500'
        : 'bg-white border-zinc-200 text-blue-600 shadow-sm border-b-2 border-b-blue-500';
    } else {
      return isDark
        ? 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/30'
        : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50';
    }
  };

  // Load clients lists on mount, filtering and sorting
  const loadData = async (query = searchQuery, order = sortOrder) => {
    setLoading(true);
    try {
      const data = await dbService.getClientes(query, order);
      setClientes(data);
    } catch (err: any) {
      console.error('Erro geral ao carregar dados:', err);
      showGlobalError('Falha ao se conectar. Exibindo dados locais seguros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Debounced municipality dynamic search effect
  useEffect(() => {
    const fetchMunicipios = async () => {
      const query = formState.endereco_cidade.trim();
      if (query.length < 2) {
        setMunicipiosSuggestions([]);
        setSupabaseError(null);
        return;
      }
      setIsSearchingMunicipios(true);
      try {
        const results = await dbService.getMunicipios(query);
        setMunicipiosSuggestions(results);
        setSupabaseError((window as any).__lastSupabaseMunicipiosError || null);
      } catch (err: any) {
        console.error('Erro ao buscar municipios:', err);
        setSupabaseError(err?.message || String(err));
      } finally {
        setIsSearchingMunicipios(false);
      }
    };

    const timer = setTimeout(() => {
      fetchMunicipios();
    }, 280); // Debounce typing duration to minimize requests

    return () => clearTimeout(timer);
  }, [formState.endereco_cidade]);

  // Set timeout to dismiss success message
  const showGlobalSuccess = (message: string) => {
    setGlobalSuccess(message);
    setTimeout(() => {
      setGlobalSuccess(null);
    }, 5000);
  };

  const showGlobalError = (message: string) => {
    setGlobalError(message);
    setTimeout(() => {
      setGlobalError(null);
    }, 6000);
  };

  // Live filter trigger when query changes with small delay or directly
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    loadData(val, sortOrder);
  };

  // Handle Sort changes
  const toggleSortOrder = () => {
    const nextOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(nextOrder);
    loadData(searchQuery, nextOrder);
  };

  // Masks and Form Inputs Sanitize onChange
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let sanitizedVal = value;

    // Check limits and apply specific masks
    if (name === 'nome') {
      sanitizedVal = value.slice(0, 150); // Hard Max 150
    } else if (name === 'cpf') {
      const formatted = formatCPF(value);
      sanitizedVal = formatted.slice(0, 14); // Max 14 (format: 000.000.000-00)
    } else if (name === 'telefone') {
      const formatted = formatTelefone(value);
      sanitizedVal = formatted.slice(0, 15); // Max 15 (format: (00) 00000-0000)
    } else if (name === 'endereco') {
      sanitizedVal = value.slice(0, 255); // Hard Max 255
    } else if (name === 'endereco_rua') {
      sanitizedVal = value.slice(0, 180); // Hard Max 180
    } else if (name === 'endereco_cidade') {
      sanitizedVal = value.slice(0, 100); // Hard Max 100
      setShowMunicipiosDropdown(true); // Open suggest dropdown when typing city
    } else if (name === 'endereco_uf') {
      sanitizedVal = value.slice(0, 2).toUpperCase(); // Hard Max 2 letters state
    } else if (name === 'email') {
      sanitizedVal = value.slice(0, 100); // Hard Max 100
    } else if (name === 'identidade') {
      sanitizedVal = value.slice(0, 20); // Hard Max 20 (RG)
    }

    setFormState(prev => {
      const updated = {
        ...prev,
        [name]: sanitizedVal
      };
      if (name === 'endereco_cidade') {
        updated.municipio_codigo_ibge = null; // Reset code on manual typing
      }
      return updated;
    });

    // Clear specific field and related address errors on change
    const fieldsToClear = [name];
    if (name === 'endereco_rua' || name === 'endereco_cidade' || name === 'endereco_uf') {
      fieldsToClear.push('endereco', 'endereco_rua', 'endereco_cidade', 'endereco_uf');
    }

    setFormErrors(prev => {
      const copy = { ...prev };
      fieldsToClear.forEach(f => {
        if (copy[f]) {
          delete copy[f];
        }
      });
      return copy;
    });
  };

  // Validate form parameters strictly
  const runFormValidation = () => {
    const errors: Record<string, string> = {};

    if (!formState.nome.trim()) {
      errors.nome = 'O Nome completo é obrigatório.';
    } else if (formState.nome.trim().length < 3) {
      errors.nome = 'O nome de usuário deve conter no mínimo 3 caracteres.';
    }

    if (!formState.cpf.trim()) {
      errors.cpf = 'O CPF é obrigatório.';
    } else {
      const digitsStr = formState.cpf.replace(/\D/g, '');
      if (digitsStr.length !== 11) {
        errors.cpf = 'O CPF deve conter exatamente 11 dígitos numéricos.';
      } else if (!validateCPF(formState.cpf)) {
        errors.cpf = 'O CPF informado é inválido. Por favor, confira os números.';
      }
    }

    if (!formState.telefone.trim()) {
      errors.telefone = 'O Telefone é obrigatório.';
    } else {
      const digitsStr = formState.telefone.replace(/\D/g, '');
      if (digitsStr.length < 10 || digitsStr.length > 11) {
        errors.telefone = 'Telefone inválido. Deve conter DDD + 8 ou 9 dígitos.';
      }
    }

    if (!formState.endereco_rua.trim()) {
      errors.endereco_rua = 'O Logradouro / Número / Bairro é obrigatório.';
      errors.endereco = 'Endereço incompleto.';
    }

    if (!formState.endereco_cidade.trim()) {
      errors.endereco_cidade = 'A Cidade é obrigatória.';
      errors.endereco = 'Endereço incompleto.';
    }

    if (!formState.endereco_uf.trim()) {
      errors.endereco_uf = 'O Estado (UF) é obrigatório.';
      errors.endereco = 'Endereço incompleto.';
    } else if (formState.endereco_uf.trim().length !== 2) {
      errors.endereco_uf = 'Insira uma UF de 2 letras (ex: SP).';
      errors.endereco = 'Endereço incompleto.';
    }

    if (formState.email.trim() && !validateEmail(formState.email)) {
      errors.email = 'Endereço de e-mail inválido. Utilize o formato: nome@provedor.com.';
    }

    if (!formState.identidade.trim()) {
      errors.identidade = 'O documento de Identidade (RG) é obrigatório.';
    }

    if (formState.data_nascimento) {
      const userDate = new Date(formState.data_nascimento);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Safe calendar end boundary
      
      if (userDate > today) {
        errors.data_nascimento = 'A data de nascimento não pode estar no futuro.';
      }
    }

    return errors;
  };

  // Submit trigger
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = runFormValidation();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showGlobalError('Por favor, corrija os erros de validação antes de prosseguir.');
      return;
    }

    try {
      setLoading(true);
      const dataPayload: ClienteTemp = {
        nome: formState.nome.trim(),
        cpf: formState.cpf.trim(),
        telefone: formState.telefone.trim(),
        endereco: `${formState.endereco_rua.trim()}, ${formState.endereco_cidade.trim()}/${formState.endereco_uf.trim().toUpperCase()}`,
        email: formState.email.trim().toLowerCase(),
        identidade: formState.identidade.trim(),
        data_nascimento: formState.data_nascimento || null,
        municipio_codigo_ibge: formState.municipio_codigo_ibge
      };

      if (currentEditingId) {
        // Edit mode save
        await dbService.updateCliente(currentEditingId, dataPayload);
        showGlobalSuccess(`Dados do cliente "${dataPayload.nome}" atualizados com sucesso!`);
      } else {
        // Create mode save
        await dbService.createCliente(dataPayload);
        showGlobalSuccess(`Cliente "${dataPayload.nome}" cadastrado com sucesso!`);
      }

      // Reset form states
      resetForm();
      // Reload listing
      await loadData();
      // Switch back to index list screen
      setActiveTab('list');
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      const detail = err && (err.message || err.details || String(err));
      showGlobalError(`Erro ao tentar salvar os dados no banco de dados: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormState({
      nome: '',
      cpf: '',
      telefone: '',
      endereco: '',
      endereco_rua: '',
      endereco_cidade: '',
      endereco_uf: '',
      email: '',
      identidade: '',
      data_nascimento: '',
      municipio_codigo_ibge: null
    });
    setFormErrors({});
    setCurrentEditingId(null);
    setMunicipiosSuggestions([]);
    setShowMunicipiosDropdown(false);
  };

  // Trigger editing values fill-in
  const initiateEdit = (cliente: ClienteTemp) => {
    if (!cliente.id) return;
    const parsed = parseEndereco(cliente.endereco);
    const cidadeName = cliente.municipios?.nome_ibge || parsed.cidade;
    const ufName = cliente.municipios?.uf || parsed.uf;

    setCurrentEditingId(cliente.id);
    setFormState({
      nome: cliente.nome,
      cpf: cliente.cpf,
      telefone: cliente.telefone,
      endereco: cliente.endereco,
      endereco_rua: parsed.rua,
      endereco_cidade: cidadeName,
      endereco_uf: ufName,
      email: cliente.email,
      identidade: cliente.identidade,
      data_nascimento: cliente.data_nascimento || '',
      municipio_codigo_ibge: cliente.municipio_codigo_ibge || null
    });
    setFormErrors({});
    setMunicipiosSuggestions([]);
    setShowMunicipiosDropdown(false);
    setActiveTab('form'); // Switch view tab to form page
  };

  // Perform delete client transaction
  const executeDelete = async () => {
    if (!deletingCliente || !deletingCliente.id) return;
    setIsDeletingLoading(true);
    try {
      await dbService.deleteCliente(deletingCliente.id);
      showGlobalSuccess(`Cadastro de "${deletingCliente.nome}" removido do banco.`);
      setDeletingCliente(null);
      await loadData();
    } catch (err: any) {
      console.error('Erro ao excluir:', err);
      const detail = err && (err.message || err.details || String(err));
      showGlobalError(`Falha ao excluir cliente: ${detail}`);
    } finally {
      setIsDeletingLoading(false);
    }
  };

  // Dashboard calculations helper
  const statistics = React.useMemo(() => {
    const total = clientes.length;

    // Calculate Average Age
    let recordsWithAge = 0;
    let sumAge = 0;
    const nowTime = new Date().getTime();

    // Past week registrations count
    let recentInclusions = 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    clientes.forEach(c => {
      // 1. Resolve age
      if (c.data_nascimento) {
        const birth = new Date(c.data_nascimento);
        const ageDifMs = nowTime - birth.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        if (!isNaN(age)) {
          sumAge += age;
          recordsWithAge++;
        }
      }

      // 2. Resolve recent inclusions
      if (c.created_at) {
        const created = new Date(c.created_at);
        if (created >= sevenDaysAgo) {
          recentInclusions++;
        }
      }
    });

    const averageAge = recordsWithAge > 0 ? Math.round(sumAge / recordsWithAge) : null;
    const lastRegistered = clientes.find(() => true)?.nome || 'Nenhum cadastrado';

    return {
      total,
      averageAge,
      recentInclusions,
      lastRegistered
    };
  }, [clientes]);

  return (
    <div className={`min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white font-sans transition-colors duration-200 ${styles.bg}`}>
      
      {/* Header Container */}
      <header className={`border-b backdrop-blur-sm sticky top-0 z-40 px-4 py-3 sm:py-3.5 transition-colors duration-200 ${styles.headerBg}`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-blue-500 shadow-md ${isDark ? 'bg-blue-600/10 border border-blue-500/25' : 'bg-blue-50 border border-blue-100'}`}>
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className={`text-base font-bold tracking-tight font-display transition-colors ${styles.headerText}`}>
                CadExpress
              </h1>
              <p className={`text-[10px] uppercase font-mono tracking-wider transition-colors ${styles.subText}`}>
                Painel de Controle Corporativo · Migração Odonto Marques
              </p>
            </div>
          </div>

          {/* Database state indicator badge / Version label */}
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border font-mono shadow-sm ${
              isSupabaseConfigured 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`} title={isSupabaseConfigured ? 'Conectado ao Supabase (Produção)' : 'Modo Demo (Local de Contingência) - Defina chaves do Supabase no .env'}>
              <span className={`h-1.5 w-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-450'}`} />
              <span>v1.0-RC</span>
            </div>
            
            {/* Theme Toggle Button */}
            <button 
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer shadow-sm flex items-center justify-center ${isDark ? 'bg-zinc-900 border-zinc-805 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-650 hover:text-zinc-900 hover:bg-zinc-50'}`}
              style={{ width: '30px', height: '30px' }}
              title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
            >
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-blue-600" />
              )}
            </button>

            <button 
              onClick={() => loadData()}
              className={`p-1 px-2 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm rounded-lg border transition-colors ${isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-650 hover:text-zinc-900'}`}
              title="Recarregar dados"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-blue-500' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Frame Status Banners */}
      <div className="max-w-6xl w-full mx-auto px-4 mt-4">
        <AnimatePresence>
          {globalSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center gap-2.5 p-3 text-xs sm:text-sm rounded-lg border border-blue-500/20 bg-blue-500/5 text-blue-400 shadow-md"
            >
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span className="font-semibold">{globalSuccess}</span>
              <button onClick={() => setGlobalSuccess(null)} className="ml-auto hover:text-blue-200 cursor-pointer p-0.5">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {globalError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center gap-2.5 p-3 text-xs sm:text-sm rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 shadow-md"
            >
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span className="font-semibold">{globalError}</span>
              <button onClick={() => setGlobalError(null)} className="ml-auto hover:text-red-200 cursor-pointer p-0.5">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 pt-1 pb-16">
        
        {/* Dynamic Single-Screen Navigation Tabs list */}
        <div className={`flex border-b mb-6 overflow-hidden ${styles.tableBorder}`}>
          <div className="flex gap-2 p-1 overflow-x-auto w-full no-scrollbar">
            <button
              onClick={() => { setActiveTab('form'); }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border shrink-0 cursor-pointer ${getTabClasses('form')}`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>
                {currentEditingId ? 'Editar Cliente' : 'Novo Cadastro'}
              </span>
              {currentEditingId && (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            <button
              id="list-clients-tab-btn"
              onClick={() => { setActiveTab('list'); resetForm(); }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border shrink-0 cursor-pointer ${getTabClasses('list')}`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Lista de Clientes</span>
              <span className={`ml-1 px-1.5 py-0.5 text-[9px] rounded-md font-mono ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>
                {clientes.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('dashboard'); resetForm(); }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border shrink-0 cursor-pointer ${getTabClasses('dashboard')}`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Painel de Indicadores</span>
            </button>
          </div>
        </div>

        {/* Selected Panels content */}
        <div className="relative">
          <AnimatePresence mode="wait">
            
            {/* 1. Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                
                {/* Bento Grid Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Card 1: Total count */}
                  <div className={`rounded-xl border p-5 relative overflow-hidden group transition-colors ${styles.card}`}>
                    <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                      <Users className="h-32 w-32 text-blue-500" />
                    </div>
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider mb-2 ${styles.subText}`}>
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Total de Cadastros</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-black tracking-tight font-display transition-colors ${styles.cardTitle}`}>
                        {loading ? '...' : statistics.total}
                      </span>
                      <span className={`text-xs transition-colors ${styles.cardMeta}`}>ativos</span>
                    </div>
                    <div className={`text-[10px] mt-2 font-mono transition-colors ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Meta Atual Amostral: 100
                    </div>
                  </div>

                  {/* Card 2: Average Age */}
                  <div className={`rounded-xl border p-5 relative overflow-hidden group transition-colors ${styles.card}`}>
                    <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                      <Calendar className="h-32 w-32 text-blue-500" />
                    </div>
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider mb-2 ${styles.subText}`}>
                      <Heart className="h-4 w-4 text-rose-500" />
                      <span>Média de Idade</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-black tracking-tight font-display transition-colors ${styles.cardTitle}`}>
                        {statistics.averageAge !== null ? `${statistics.averageAge}` : '—'}
                      </span>
                      {statistics.averageAge !== null && <span className={`text-xs transition-colors ${styles.cardMeta}`}>anos</span>}
                    </div>
                    <div className={`text-[10px] mt-2 transition-colors ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {statistics.averageAge !== null 
                        ? 'Baseado nas datas de nascimento' 
                        : 'Sem informações de idade'}
                    </div>
                  </div>

                  {/* Card 3: Recent addition */}
                  <div className={`rounded-xl border p-5 relative overflow-hidden group transition-colors ${styles.card}`}>
                    <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                      <UserPlus className="h-32 w-32 text-blue-500" />
                    </div>
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider mb-2 ${styles.subText}`}>
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      <span>Inclusões (7 dias)</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-black tracking-tight font-display transition-colors ${styles.cardTitle}`}>
                        +{statistics.recentInclusions}
                      </span>
                    </div>
                    <div className={`text-[10px] mt-2 truncate max-w-full transition-colors ${styles.subText}`}>
                      Último: <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{statistics.lastRegistered}</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Chart Wrapper */}
                <div className={`rounded-xl border p-5 transition-colors ${styles.chartCard}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                    <div>
                      <h3 className={`text-sm font-semibold font-display transition-colors ${styles.headerText}`}>
                        Evolução Temporal dos Clientes
                      </h3>
                      <p className={`text-xs transition-colors ${styles.subText}`}>
                        Curva acumulativa baseada na propriedade temporal de controle
                      </p>
                    </div>
                    <span className={`text-[9px] uppercase tracking-wider border px-2.5 py-1 rounded font-mono transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-zinc-200 text-zinc-600'}`}>
                      Frequência: Diária
                    </span>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="text-center">
                        <RefreshCw className="h-6 w-6 stroke-[2] text-blue-500 animate-spin mx-auto mb-2" />
                        <span className="text-xs text-zinc-500">Calculando métricas...</span>
                      </div>
                    </div>
                  ) : (
                    <DashboardChart clientes={clientes} theme={theme} />
                  )}
                </div>

                {/* Database Info guidelines & setup */}
                <div className={`rounded-xl border p-5 flex flex-col md:flex-row md:items-center gap-4 transition-colors ${styles.dbCard}`}>
                  <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center border transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800 text-blue-400' : 'bg-zinc-100 border-zinc-200 text-blue-600'}`}>
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider font-display transition-colors ${styles.headerText}`}>
                      Arquitetura do Banco de Dados
                    </h4>
                    <p className={`text-xs mt-0.5 max-w-2xl leading-relaxed transition-colors ${isDark ? 'text-zinc-400' : 'text-zinc-650'}`}>
                      Os clientes criados são sincronizados em tempo real diretamente com a tabela <code className={`font-mono px-1.5 py-0.5 rounded border transition-colors ${styles.code}`}>clientes_temp</code> do seu projeto Supabase. Na ausência de credenciais no seu arquivo <code className={`font-mono transition-colors ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>.env</code>, salvamos em cache local para que seu fluxo de testes funcione perfeitamente.
                    </p>
                  </div>
                  <div className="ml-auto flex items-center shrink-0">
                    <button 
                      onClick={() => setActiveTab('list')}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm ${isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-white' : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700'}`}
                    >
                      <span>Visualizar Lista</span>
                      <ChevronRight className="h-3.5 w-3.5 text-blue-500" />
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* 2. Client Listing Tab */}
            {activeTab === 'list' && (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                
                {/* Search, Sort and Filters header */}
                <div className={`flex flex-col md:flex-row gap-3 items-stretch justify-between p-3.5 rounded-xl border transition-colors ${styles.chartCard}`}>
                  
                  {/* Search by "Nome" */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      className={`block w-full pl-9 pr-8 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner transition-colors ${styles.input}`}
                      placeholder="Filtrar por nome do cliente..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => handleSearchChange('')}
                        className={`absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer ${isDark ? 'text-zinc-550 hover:text-white' : 'text-zinc-400 hover:text-zinc-700'}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Sorting dropdown button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSortOrder}
                      className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition-all select-none cursor-pointer duration-150 ${isDark ? 'bg-zinc-950 hover:bg-zinc-900 text-zinc-305 border-zinc-805 hover:text-white' : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-300 hover:text-zinc-950'}`}
                    >
                      <ArrowUpDown className="h-3.5 w-3.5 text-blue-500" />
                      <span>Data: {sortOrder === 'desc' ? 'Novos Primeiro' : 'Antigos Primeiro'}</span>
                    </button>

                    <button
                      onClick={() => { resetForm(); setActiveTab('form'); }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-505 text-white font-medium transition-all cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Cadastrar</span>
                    </button>
                  </div>

                </div>

                {/* Sub-counter indicators */}
                <div className={`flex justify-between items-center text-[10px] px-1 font-mono uppercase tracking-wider ${styles.subText}`}>
                  <span>
                    No de clientes: <strong className={`font-sans font-semibold transition-colors ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{clientes.length}</strong>
                  </span>
                  {searchQuery && (
                    <span className="text-blue-500 font-semibold lowercase">
                      Filtro ativo para "{searchQuery}"
                    </span>
                  )}
                </div>

                {/* List Body */}
                {loading ? (
                  <div className={`flex flex-col items-center justify-center p-16 rounded-xl border transition-colors ${styles.chartCard}`}>
                    <RefreshCw className="h-6 w-6 text-blue-500 animate-spin mb-3" />
                    <span className="text-xs text-zinc-500 font-mono">Consolidando registros do servidor...</span>
                  </div>
                ) : clientes.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center p-16 rounded-xl border text-center transition-colors ${styles.chartCard}`}>
                    <div className={`h-10 w-10 rounded-full border flex items-center justify-center mb-3 transition-colors ${isDark ? 'bg-zinc-950 border-zinc-900 text-zinc-600' : 'bg-slate-50 border-zinc-200 text-zinc-400'}`}>
                      <Search className="h-5 w-5" />
                    </div>
                    <span className={`text-sm font-semibold font-display font-medium transition-colors ${styles.headerText}`}>Nenhum cliente cadastrado</span>
                    <p className={`text-xs mt-1.5 max-w-md mx-auto leading-relaxed transition-colors ${styles.subText}`}>
                      {searchQuery 
                        ? 'Nenhum resultado corresponde à sua pesquisa de nome. Tente reescrever a busca.' 
                        : 'Comece preenchendo o formulário de cadastro para alimentar a base de clientes do sistema.'}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={() => setActiveTab('form')}
                        className={`mt-4 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer border ${isDark ? 'bg-zinc-900 hover:bg-zinc-805 border-zinc-800 text-white' : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-750'}`}
                      >
                        <UserPlus className="h-3.5 w-3.5 text-blue-500" />
                        <span>Cadastrar Primeiro Cliente</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Tablet/Desktop Table View: Hidden on small screens */}
                    <div className={`hidden md:block overflow-hidden rounded-xl border transition-colors ${styles.chartCard}`}>
                      <div className="overflow-x-auto">
                        <table className={`min-w-full divide-y text-left text-xs ${isDark ? 'divide-zinc-900/60 text-zinc-300' : 'divide-zinc-200 text-zinc-705'}`}>
                          <thead className={`font-mono uppercase tracking-wider text-[9px] transition-colors ${styles.tableHeaderBg}`}>
                            <tr>
                              <th scope="col" className="px-4 py-3.5 font-bold">Identificação</th>
                              <th scope="col" className="px-4 py-3.5 font-bold">Contatos rápidos</th>
                              <th scope="col" className="px-4 py-3.5 font-bold">Documentos & Idade</th>
                              <th scope="col" className="px-4 py-3.5 font-bold">Geolocalização / Endereço</th>
                              <th scope="col" className="px-4 py-3.5 font-bold">Data Inclusão</th>
                              <th scope="col" className="px-4 py-3.5 text-right font-bold">Ações</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDark ? 'divide-zinc-900/40 bg-zinc-950/20' : 'divide-zinc-200 bg-white'}`}>
                            {clientes.map((c) => (
                              <tr key={c.id} className={`transition-colors border-b ${isDark ? 'hover:bg-zinc-900/40 border-zinc-950/40' : 'hover:bg-zinc-50 border-zinc-250/20'}`}>
                                {/* Name, CPF */}
                                <td className="px-4 py-3">
                                  <div className={`font-semibold text-sm max-w-[170px] truncate ${isDark ? 'text-white' : 'text-zinc-900'}`} title={c.nome}>
                                    {c.nome}
                                  </div>
                                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5" title="CPF">
                                    {c.cpf}
                                  </div>
                                </td>

                                {/* Email, Phone */}
                                <td className="px-4 py-3 space-y-0.5">
                                  <div className={`flex items-center gap-1.5 ${isDark ? 'text-zinc-250' : 'text-zinc-800'}`}>
                                    <Phone className="h-3 w-3 text-blue-500 shrink-0" />
                                    <span className="font-mono">{c.telefone}</span>
                                  </div>
                                  <div className={`flex items-center gap-1.5 overflow-hidden max-w-[140px] ${isDark ? 'text-zinc-400' : 'text-zinc-550'}`} title={c.email}>
                                    <Mail className="h-3 w-3 text-zinc-500 shrink-0" />
                                    <span className="truncate text-[10px]">{c.email}</span>
                                  </div>
                                </td>

                                {/* RG, Nascimento */}
                                <td className="px-4 py-3 space-y-0.5">
                                  <div className={`flex items-center gap-1.5 ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                                    <FileText className="h-3 w-3 text-blue-500 shrink-0" />
                                    <span>RG: {c.identidade}</span>
                                  </div>
                                  <div className={`flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-550'}`}>
                                    <Calendar className="h-3 w-3 text-zinc-500 shrink-0" />
                                    <span>Nasc: {formatToBRLDate(c.data_nascimento)}</span>
                                  </div>
                                </td>

                                {/* Address */}
                                <td className="px-4 py-3">
                                  <div className={`max-w-[160px] line-clamp-2 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`} title={c.endereco}>
                                    {c.endereco}
                                  </div>
                                  {c.municipio_codigo_ibge ? (
                                    <span 
                                      className={`mt-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium tracking-wide ${
                                        isDark ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                      }`}
                                      title={`Código IBGE do Município: ${c.municipio_codigo_ibge}`}
                                    >
                                      <MapPin className="h-2.5 w-2.5 text-blue-500 shrink-0" />
                                      IBGE: {c.municipio_codigo_ibge}
                                    </span>
                                  ) : (
                                    <span className={`block mt-1 text-[8px] italic ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                      Sem município vinculado
                                    </span>
                                  )}
                                </td>

                                {/* Timestamp inclusao */}
                                <td className="px-4 py-3 text-zinc-500 font-mono text-[10px]">
                                  {formatTimestampToBRL(c.created_at)}
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => initiateEdit(c)}
                                      className={`p-1 px-2 rounded-lg border transition-colors cursor-pointer ${isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700 hover:text-zinc-950'}`}
                                      title="Editar Cadastro"
                                    >
                                      <Edit className="h-3.5 w-3.5 text-blue-500" />
                                    </button>
                                    <button
                                      onClick={() => setDeletingCliente(c)}
                                      className={`p-1 px-2 rounded-lg border transition-colors cursor-pointer ${isDark ? 'bg-red-950/25 hover:bg-red-950/45 border-red-950/20 text-rose-400 hover:text-rose-200' : 'bg-red-50 hover:bg-red-100 border-red-100 text-red-650'}`}
                                      title="Excluir Cadastro"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mobile Card View: Rendered only on small layouts (< 768px) */}
                    <div className="grid grid-cols-1 gap-3 md:hidden">
                      {clientes.map((c) => (
                        <div 
                          key={c.id} 
                          className={`rounded-xl border p-4 space-y-3 transition-colors ${styles.card}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className={`font-bold text-sm leading-snug ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                {c.nome}
                              </h4>
                              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                CPF: {c.cpf}
                              </p>
                            </div>
                            
                            {/* Action buttons on Card top-right */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => initiateEdit(c)}
                                className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-200 hover:text-white' : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700'}`}
                              >
                                <Edit className="h-3.5 w-3.5 text-blue-500" />
                              </button>
                              <button
                                onClick={() => setDeletingCliente(c)}
                                className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${isDark ? 'bg-red-950/15 hover:bg-red-950/30 border-red-950/20 text-rose-450 hover:text-rose-250' : 'bg-red-50 hover:bg-red-100 border-red-100 text-red-600'}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className={`grid grid-cols-2 gap-2 text-[11px] border-t pt-2 transition-colors ${isDark ? 'border-zinc-900/60 text-zinc-400' : 'border-zinc-150 text-zinc-650'}`}>
                            <div>
                              <span className={`block uppercase tracking-wider text-[8px] font-mono ${isDark ? 'text-zinc-600' : 'text-zinc-450'}`}>Telefone</span>
                              <span className={`font-mono font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{c.telefone}</span>
                            </div>
                            <div>
                              <span className={`block uppercase tracking-wider text-[8px] font-mono ${isDark ? 'text-zinc-600' : 'text-zinc-450'}`}>E-mail</span>
                              <span className={`truncate block max-w-full font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`} title={c.email}>{c.email}</span>
                            </div>
                            <div className="mt-1">
                              <span className={`block uppercase tracking-wider text-[8px] font-mono ${isDark ? 'text-zinc-600' : 'text-zinc-450'}`}>Identidade</span>
                              <span className={`font-medium ${isDark ? 'text-zinc-350' : 'text-zinc-700'}`}>{c.identidade}</span>
                            </div>
                            <div className="mt-1">
                              <span className={`block uppercase tracking-wider text-[8px] font-mono ${isDark ? 'text-zinc-600' : 'text-zinc-450'}`}>Nascimento</span>
                              <span className={`font-medium ${isDark ? 'text-zinc-350' : 'text-zinc-700'}`}>{formatToBRLDate(c.data_nascimento)}</span>
                            </div>
                          </div>

                          <div className={`text-[11px] p-2.5 rounded-lg border space-y-1 transition-colors ${isDark ? 'bg-zinc-950/60 border-zinc-900/85 text-zinc-400' : 'bg-zinc-50 border-zinc-150 text-zinc-650'}`}>
                            <div>
                              <span className={`uppercase tracking-wider text-[8px] font-mono block ${isDark ? 'text-zinc-600' : 'text-zinc-450'}`}>Endereço</span>
                              <p className={`leading-snug text-xs ${isDark ? 'text-zinc-300' : 'text-zinc-750'}`}>{c.endereco}</p>
                              {c.municipio_codigo_ibge ? (
                                <span 
                                  className={`mt-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium tracking-wide ${
                                    isDark ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                  }`}
                                >
                                  <MapPin className="h-2.5 w-2.5 text-blue-500 shrink-0" />
                                  IBGE: {c.municipio_codigo_ibge}
                                </span>
                              ) : (
                                <span className={`block mt-1 text-[8px] italic ${isDark ? 'text-zinc-650' : 'text-zinc-405'}`}>
                                  Sem município vinculado
                                </span>
                              )}
                            </div>
                            <div className={`text-[10px] font-mono pt-1 text-right border-t ${isDark ? 'border-zinc-900/40 text-zinc-500' : 'border-zinc-205 text-zinc-500'}`}>
                              Inclusão: {formatTimestampToBRL(c.created_at)}
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </>
                )}

              </motion.div>
            )}

            {/* 3. Form Creation / Edition Tab */}
            {activeTab === 'form' && (
              <motion.div
                key="form-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-2xl mx-auto"
              >
                <div className={`rounded-xl border p-5 sm:p-6 transition-colors ${styles.chartCard}`}>
                  
                  {/* Dynamic Form Header */}
                  <div className={`flex items-center gap-3 border-b pb-4 mb-6 transition-colors ${isDark ? 'border-zinc-900' : 'border-zinc-200'}`}>
                    <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                      {currentEditingId ? <Edit className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                    </div>
                    <div>
                      <h2 className={`text-sm font-semibold font-display transition-colors ${styles.headerText}`}>
                        {currentEditingId ? `Modificar Cadastro: ${formState.nome}` : 'Cadastrar Novo Cliente'}
                      </h2>
                      <p className={`text-xs transition-colors ${styles.subText}`}>
                        {currentEditingId 
                          ? 'Altere as informações abaixo e clique em Salvar para atualizar.' 
                          : 'Preencha as informações obrigatórias para catalogar.'}
                      </p>
                    </div>
                    {currentEditingId && (
                      <button
                        onClick={resetForm}
                        className={`ml-auto p-1.5 px-3 rounded-lg border text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all ${isDark ? 'text-zinc-400 hover:text-white bg-zinc-900 border-zinc-800' : 'text-zinc-650 hover:text-zinc-950 bg-white border-zinc-200'}`}
                      >
                        Limpar Edição
                      </button>
                    )}
                  </div>

                  {/* Form Wrapper */}
                  <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                    
                    {/* Linha 1: Nome Completo (max 150) */}
                    <div className="space-y-1.5">
                      <label htmlFor="nome" className={`block font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>
                        Nome Completo <span className="text-blue-500 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                          <User className="h-4 w-4" />
                        </div>
                        <input
                          id="nome"
                          name="nome"
                          type="text"
                          maxLength={150}
                          placeholder="Digite o nome completo (ex: João Silva)"
                          className={`block w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 ${styles.input} ${
                            formErrors.nome ? 'border-red-500/80 ring-1 ring-red-500/10' : ''
                          }`}
                          value={formState.nome}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className={`flex justify-between text-[10px] px-1 pt-0.5 ${styles.subText}`}>
                        <span>{formErrors.nome ? <span className="text-red-500 font-medium">{formErrors.nome}</span> : 'Utilizado em termos e relatórios oficiais'}</span>
                        <span className="font-mono">{formState.nome.length}/150</span>
                      </div>
                    </div>

                    {/* Grupo Duplo: CPF (max 14) + RG Identidade (max 20) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* CPF (max 14) */}
                      <div className="space-y-1.5">
                        <label htmlFor="cpf" className={`block font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>
                          CPF <span className="text-blue-500 font-bold">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                            <FileText className="h-4 w-4" />
                          </div>
                          <input
                            id="cpf"
                            name="cpf"
                            type="text"
                            maxLength={14}
                            placeholder="000.000.000-00"
                            className={`block w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 font-mono ${styles.input} ${
                              formErrors.cpf ? 'border-red-500/80 ring-1 ring-red-500/10' : ''
                            }`}
                            value={formState.cpf}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className={`flex justify-between text-[10px] px-1 pt-0.5 ${styles.subText}`}>
                          <span>{formErrors.cpf ? <span className="text-red-500 font-medium">{formErrors.cpf}</span> : 'Validação automática de dígitos'}</span>
                          <span className="font-mono">{formState.cpf.length}/14</span>
                        </div>
                      </div>

                      {/* Identidade / RG (max 20) */}
                      <div className="space-y-1.5">
                        <label htmlFor="identidade" className={`block font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>
                          Identidade (RG) <span className="text-blue-500 font-bold">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                            <FileText className="h-4 w-4" />
                          </div>
                          <input
                            id="identidade"
                            name="identidade"
                            type="text"
                            maxLength={20}
                            placeholder="Digite o RG (ex: 20.345.678-9)"
                            className={`block w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 ${styles.input} ${
                              formErrors.identidade ? 'border-red-500/80 ring-1 ring-red-500/10' : ''
                            }`}
                            value={formState.identidade}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className={`flex justify-between text-[10px] px-1 pt-0.5 ${styles.subText}`}>
                          <span>{formErrors.identidade ? <span className="text-red-500 font-medium">{formErrors.identidade}</span> : 'Órgão emissor oficial'}</span>
                          <span className="font-mono">{formState.identidade.length}/20</span>
                        </div>
                      </div>

                    </div>

                    {/* Grupo Duplo: Telefone (max 15) + Email (max 100) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Telefone (max 15) */}
                      <div className="space-y-1.5">
                        <label htmlFor="telefone" className={`block font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>
                          Telefone Celular <span className="text-blue-500 font-bold">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                            <Phone className="h-4 w-4" />
                          </div>
                          <input
                            id="telefone"
                            name="telefone"
                            type="text"
                            maxLength={15}
                            placeholder="(00) 00000-0000"
                            className={`block w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 font-mono ${styles.input} ${
                              formErrors.telefone ? 'border-red-500/80 ring-1 ring-red-500/10' : ''
                            }`}
                            value={formState.telefone}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className={`flex justify-between text-[10px] px-1 pt-0.5 ${styles.subText}`}>
                          <span>{formErrors.telefone ? <span className="text-red-500 font-medium">{formErrors.telefone}</span> : 'Incluso ddd (ex: 11)'}</span>
                          <span className="font-mono">{formState.telefone.length}/15</span>
                        </div>
                      </div>

                      {/* Email (max 100) */}
                      <div className="space-y-1.5">
                        <label htmlFor="email" className={`block font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>
                          E-mail
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                            <Mail className="h-4 w-4" />
                          </div>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            maxLength={100}
                            placeholder="usuario@dominio.com"
                            className={`block w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 ${styles.input} ${
                              formErrors.email ? 'border-red-500/80 ring-1 ring-red-500/10' : ''
                            }`}
                            value={formState.email}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className={`flex justify-between text-[10px] px-1 pt-0.5 ${styles.subText}`}>
                          <span>{formErrors.email ? <span className="text-red-500 font-medium">{formErrors.email}</span> : 'Opcional. Verificação padrão de domínio'}</span>
                          <span className="font-mono">{formState.email.length}/100</span>
                        </div>
                      </div>

                    </div>

                    {/* Linha 4: Data de Nascimento (opcional - blocking future dates) */}
                    <div className="space-y-1.5">
                      <label htmlFor="data_nascimento" className={`block font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>
                        Data de Nascimento <span className={`transition-colors ${isDark ? 'text-zinc-500' : 'text-zinc-450'}`}>(Opcional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <input
                          id="data_nascimento"
                          name="data_nascimento"
                          type="date"
                          max={getTodayString()} // Native block of future selections
                          className={`block w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 font-mono ${styles.input} ${
                            formErrors.data_nascimento ? 'border-red-500/80 ring-1 ring-red-500/10' : ''
                          }`}
                          value={formState.data_nascimento}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className={`text-[10px] px-1 pt-0.5 ${styles.subText}`}>
                        {formErrors.data_nascimento ? (
                          <span className="text-red-500 font-medium">{formErrors.data_nascimento}</span>
                        ) : (
                          'O calendário impede seleção de datas futuras'
                        )}
                      </div>
                    </div>

                    {/* Linha 5: Endereço Detalhado (Logradouro, Cidade, UF) */}
                    <div className="grid grid-cols-12 gap-4 pt-1">
                      
                      {/* Logradouro, Número, Bairro */}
                      <div className="col-span-12 md:col-span-6 space-y-1.5">
                        <label htmlFor="endereco_rua" className={`block font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>
                          Logradouro / Número / Bairro <span className="text-blue-500 font-bold">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <input
                            id="endereco_rua"
                            name="endereco_rua"
                            type="text"
                            maxLength={180}
                            placeholder="Ex: Av. Paulista, 1000 - Bela Vista"
                            className={`block w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 ${styles.input} ${
                              formErrors.endereco_rua ? 'border-red-500/80 ring-1 ring-red-500/10' : ''
                            }`}
                            value={formState.endereco_rua}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className={`text-[10px] px-1 pt-0.5 ${styles.subText}`}>
                          {formErrors.endereco_rua ? (
                            <span className="text-red-500 font-medium">{formErrors.endereco_rua}</span>
                          ) : (
                            <span>Nome da rua, número e nome do bairro</span>
                          )}
                        </div>
                      </div>

                      {/* Cidade */}
                      <div className="col-span-12 sm:col-span-8 md:col-span-4 space-y-1.5 relative">
                        <label htmlFor="endereco_cidade" className={`block font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>
                          Cidade / Município <span className="text-blue-500 font-bold">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                            <Search className="h-4 w-4" />
                          </div>
                          <input
                            id="endereco_cidade"
                            name="endereco_cidade"
                            type="text"
                            maxLength={100}
                            placeholder="Pesquise para autocompletar..."
                            autoComplete="off"
                            className={`block w-full pl-9 pr-8 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 ${styles.input} ${
                              formErrors.endereco_cidade ? 'border-red-500/80 ring-1 ring-red-500/10' : ''
                            }`}
                            value={formState.endereco_cidade}
                            onChange={(e) => {
                              handleInputChange(e);
                              setShowMunicipiosDropdown(true);
                            }}
                            onFocus={() => setShowMunicipiosDropdown(true)}
                          />
                          {isSearchingMunicipios && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-500">
                              <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" />
                            </div>
                          )}
                        </div>

                        {/* Dropdown de sugestões de Municípios */}
                        <AnimatePresence>
                          {showMunicipiosDropdown && (formState.endereco_cidade.trim().length >= 2 || municipiosSuggestions.length > 0) && (
                            <>
                              {/* Overlay de fechamento inteligente para cliques fora */}
                              <div 
                                className="fixed inset-0 z-40 bg-transparent" 
                                onClick={() => setShowMunicipiosDropdown(false)} 
                              />
                              
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className={`absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-lg border shadow-xl z-50 transition-colors ${
                                  isDark ? 'bg-zinc-950 border-zinc-900 divide-zinc-900/40 text-zinc-200' : 'bg-white border-zinc-200 divide-zinc-100 text-zinc-850'
                                }`}
                              >
                                {municipiosSuggestions.length === 0 ? (
                                  <div className="px-3 py-2.5 text-xs text-zinc-500 text-center">
                                    {isSearchingMunicipios ? 'Buscando municípios...' : 'Nenhum município localizado.'}
                                  </div>
                                ) : (
                                  <div className="py-1 divide-y divide-zinc-250 dark:divide-zinc-100/10">
                                    {municipiosSuggestions.map((m, idx) => (
                                      <button
                                        key={`${m.nome}-${m.uf}-${idx}`}
                                        type="button"
                                        onClick={() => {
                                          setFormState(prev => ({
                                            ...prev,
                                            endereco_cidade: m.nome,
                                            endereco_uf: m.uf,
                                            municipio_codigo_ibge: m.codigo_ibge
                                          }));
                                          setShowMunicipiosDropdown(false);
                                          setMunicipiosSuggestions([]);
                                          
                                          // Clear errors
                                          setFormErrors(prev => {
                                            const copy = { ...prev };
                                            delete copy.endereco_cidade;
                                            delete copy.endereco_uf;
                                            delete copy.endereco;
                                            return copy;
                                          });
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                                          isDark ? 'hover:bg-zinc-900 text-zinc-200' : 'hover:bg-slate-50 text-zinc-800'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0 mr-2">
                                          <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                                          <span className="truncate font-medium">{m.nome}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 transition-colors uppercase font-mono ${
                                          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-605'
                                        }`}>
                                          {m.uf}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>

                        <div className={`text-[10px] px-1 pt-0.5 ${styles.subText}`}>
                          {formErrors.endereco_cidade ? (
                            <span className="text-red-500 font-medium">{formErrors.endereco_cidade}</span>
                          ) : supabaseError ? (
                            <span className="text-yellow-500 dark:text-yellow-400/90 font-medium font-sans">
                              {supabaseError}
                            </span>
                          ) : (
                            formState.municipio_codigo_ibge ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 font-sans">
                                <MapPin className="h-3 w-3 text-emerald-550 dark:text-emerald-400 shrink-0" />
                                Município vinculado por IBGE: {formState.municipio_codigo_ibge}
                              </span>
                            ) : (
                              <span>Busca dinâmica na tabela municipios (singular / plural)</span>
                            )
                          )}
                        </div>
                      </div>

                      {/* UF/Estado */}
                      <div className="col-span-12 sm:col-span-4 md:col-span-2 space-y-1.5">
                        <label htmlFor="endereco_uf" className={`block font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>
                          Estado (UF) <span className="text-blue-500 font-bold">*</span>
                        </label>
                        <div>
                          <input
                            id="endereco_uf"
                            name="endereco_uf"
                            type="text"
                            maxLength={2}
                            placeholder="SP"
                            className={`block w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 uppercase font-mono font-semibold ${styles.input} ${
                              formErrors.endereco_uf ? 'border-red-500/80 ring-1 ring-red-500/10' : ''
                            }`}
                            value={formState.endereco_uf}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className={`text-[10px] px-1 pt-0.5 ${styles.subText}`}>
                          {formErrors.endereco_uf ? (
                            <span className="text-red-500 font-medium">{formErrors.endereco_uf}</span>
                          ) : (
                            <span>Sigla (ex: RJ)</span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Form action buttons */}
                    <div className={`flex items-center justify-end gap-3 border-t pt-5 mt-6 transition-colors ${isDark ? 'border-zinc-900' : 'border-zinc-200'}`}>
                      <button
                        type="button"
                        onClick={() => { resetForm(); setActiveTab('list'); }}
                        className={`px-4 py-2 border rounded-lg transition-colors cursor-pointer text-xs font-semibold ${isDark ? 'border-zinc-800 bg-transparent text-zinc-300 hover:text-white hover:bg-zinc-900' : 'border-zinc-350 bg-transparent text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50'}`}
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2 rounded-lg bg-blue-600 font-bold uppercase tracking-wider text-xs text-white hover:bg-blue-505 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-blue-900/20"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Gravando...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span>{currentEditingId ? 'Salvar Alterações' : 'Confirmar Cadastro'}</span>
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* Footer copyright */}
      <footer className={`border-t py-5 text-center text-[10px] px-4 mt-auto transition-colors ${isDark ? 'border-zinc-950 bg-zinc-950 text-zinc-500' : 'border-zinc-200 bg-zinc-100 text-zinc-600'}`}>
        <p className="font-mono uppercase tracking-wider">© 2026 CadExpress Ltda. Todos os direitos reservados.</p>
        <p className={`mt-1 transition-colors ${isDark ? 'text-zinc-600' : 'text-zinc-500'}`}>
          Feito com 💙. Conexão de dados encriptada via SSL diretamente com o Supabase.
        </p>
      </footer>

      {/* Built-in Delete Confirming Modal Dialogue */}
      {deletingCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-sm rounded-xl border p-5 space-y-4 shadow-2xl relative transition-colors ${isDark ? 'border-zinc-900 bg-zinc-950' : 'border-zinc-200 bg-white'}`}
          >
            <div className="flex items-start gap-3">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 border transition-colors ${isDark ? 'bg-red-950/40 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-650'}`}>
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className={`text-sm font-semibold font-display transition-colors ${styles.headerText}`}>Confirmar Exclusão?</h3>
                <p className={`text-xs leading-relaxed transition-colors ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Você está prestes a remover permanentemente o registro de:
                </p>
                <div className={`text-xs font-medium p-2.5 rounded-lg my-1.5 font-sans border transition-colors ${isDark ? 'text-zinc-200 bg-zinc-900 border-zinc-900' : 'text-zinc-805 bg-zinc-50 border-zinc-200'}`}>
                  <span className="block font-semibold">{deletingCliente.nome}</span>
                  <span className={`text-[10px] font-mono transition-colors ${isDark ? 'text-zinc-500' : 'text-zinc-450'}`}>CPF: {deletingCliente.cpf}</span>
                </div>
                <p className="text-[10px] text-red-500">
                  ⚠️ Esta ação não poderá ser desfeita e os dados serão excluídos permanentemente.
                </p>
              </div>
            </div>

            <div className={`flex items-center justify-end gap-2 pt-2 border-t text-xs transition-colors ${isDark ? 'border-zinc-900' : 'border-zinc-200'}`}>
              <button
                disabled={isDeletingLoading}
                onClick={() => setDeletingCliente(null)}
                className={`px-3.5 py-1.5 rounded-lg border cursor-pointer transition-all ${isDark ? 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900' : 'border-zinc-250 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 bg-white'}`}
              >
                Voltar
              </button>
              <button
                disabled={isDeletingLoading}
                onClick={executeDelete}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-550 text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-lg shadow-red-900/15"
              >
                {isDeletingLoading ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Sim, Excluir</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
