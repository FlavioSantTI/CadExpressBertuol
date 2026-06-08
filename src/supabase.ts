/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';
import { ClienteTemp, MunicipioType } from './types';

// Read config safely from client env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Accept any set URL & Key to be resilient (e.g. custom domains, docker setups, correct variables)
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Initial sample data mock to populate LocalStorage if empty.
 * Ensures the preview looks outstanding right from the first mount.
 */
const INITIAL_DEMO_CLIENTS: ClienteTemp[] = [
  {
    id: 'demo-uuid-1',
    nome: 'Carlos Eduardo da Silva',
    cpf: '123.456.789-00',
    telefone: '(11) 98765-4321',
    endereco: 'Avenida Paulista, 1000 - Bela Vista, São Paulo/SP',
    email: 'carlos.eduardo@email.com',
    identidade: '12.345.678-9',
    data_nascimento: '1985-04-12',
    created_at: '2026-05-15T10:30:00.000Z',
    municipio_codigo_ibge: 1000000
  },
  {
    id: 'demo-uuid-2',
    nome: 'Mariana Santos Rodrigues',
    cpf: '987.654.321-11',
    telefone: '(21) 99888-7766',
    endereco: 'Avenida Atlântica, 450 - Copacabana, Rio de Janeiro/RJ',
    email: 'mariana.santos@santos.dev',
    identidade: '20.987.654-3',
    data_nascimento: '1992-08-23',
    created_at: '2026-05-20T14:45:00.000Z',
    municipio_codigo_ibge: 1000001
  },
  {
    id: 'demo-uuid-3',
    nome: 'Bernardo de Souza Prado',
    cpf: '456.789.123-22',
    telefone: '(31) 97777-6655',
    endereco: 'Rua da Bahia, 120 - Lourdes, Belo Horizonte/MG',
    email: 'bernardo.souza@gmail.com',
    identidade: 'MG-14.890.342',
    data_nascimento: '1978-11-05',
    created_at: '2026-05-28T09:15:00.000Z',
    municipio_codigo_ibge: 1000002
  },
  {
    id: 'demo-uuid-4',
    nome: 'Ana Paula Ribeiro Neto',
    cpf: '321.654.987-33',
    telefone: '(41) 96543-2109',
    endereco: 'Rua XV de Novembro, 789 - Centro, Curitiba/PR',
    email: 'anap.ribeiro@outlook.com',
    identidade: '9.876.543-2',
    data_nascimento: '1989-01-30',
    created_at: '2026-06-01T16:20:00.000Z',
    municipio_codigo_ibge: 1000003
  },
  {
    id: 'demo-uuid-5',
    nome: 'Felipe Costa Cavalcante',
    cpf: '789.123.456-44',
    telefone: '(81) 95555-4444',
    endereco: 'Avenida Boa Viagem, 2300 - Boa Viagem, Recife/PE',
    email: 'felipe.costa@terra.com.br',
    identidade: '4.321.098',
    data_nascimento: '1995-12-15',
    created_at: '2026-06-04T11:05:00.000Z',
    municipio_codigo_ibge: 1000004
  },
  {
    id: 'demo-uuid-6',
    nome: 'Juliana Mendes Nogueira',
    cpf: '246.810.121-55',
    telefone: '(61) 99111-2233',
    endereco: 'SCLN 205 Bloco C, Asa Norte - Brasília/DF',
    email: 'juliana.nogueira@uol.com.br',
    identidade: 'DF-3.456.789',
    data_nascimento: '2001-07-09',
    created_at: '2026-06-05T08:40:00.000Z',
    municipio_codigo_ibge: 1000005
  }
];

const MOCK_MUNICIPIOS_RAW = [
  { nome: 'São Paulo', uf: 'SP' },
  { nome: 'Rio de Janeiro', uf: 'RJ' },
  { nome: 'Belo Horizonte', uf: 'MG' },
  { nome: 'Curitiba', uf: 'PR' },
  { nome: 'Recife', uf: 'PE' },
  { nome: 'Brasília', uf: 'DF' },
  { nome: 'Porto Alegre', uf: 'RS' },
  { nome: 'Salvador', uf: 'BA' },
  { nome: 'Fortaleza', uf: 'CE' },
  { nome: 'Manaus', uf: 'AM' },
  { nome: 'Goiânia', uf: 'GO' },
  { nome: 'Belém', uf: 'PA' },
  { nome: 'Vitória', uf: 'ES' },
  { nome: 'Florianópolis', uf: 'SC' },
  { nome: 'Cuiabá', uf: 'MT' },
  { nome: 'Campo Grande', uf: 'MS' },
  { nome: 'Natal', uf: 'RN' },
  { nome: 'Maceió', uf: 'AL' },
  { nome: 'João Pessoa', uf: 'PB' },
  { nome: 'Teresina', uf: 'PI' },
  { nome: 'Aracaju', uf: 'SE' },
  { nome: 'São Luís', uf: 'MA' },
  { nome: 'Porto Velho', uf: 'RO' },
  { nome: 'Macapá', uf: 'AP' },
  { nome: 'Rio Branco', uf: 'AC' },
  { nome: 'Boa Vista', uf: 'RR' },
  { nome: 'Palmas', uf: 'TO' },
  { nome: 'Campinas', uf: 'SP' },
  { nome: 'Santos', uf: 'SP' },
  { nome: 'Niterói', uf: 'RJ' },
  { nome: 'Uberlândia', uf: 'MG' },
  { nome: 'Londrina', uf: 'PR' },
  { nome: 'Olinda', uf: 'PE' },
  { nome: 'Guarulhos', uf: 'SP' },
  { nome: 'São Bernardo do Campo', uf: 'SP' },
  { nome: 'Duque de Caxias', uf: 'RJ' },
  { nome: 'São Gonçalo', uf: 'RJ' },
  { nome: 'Vila Velha', uf: 'ES' },
  { nome: 'Serra', uf: 'ES' },
  { nome: 'Betim', uf: 'MG' },
  { nome: 'Contagem', uf: 'MG' },
  { nome: 'Juiz de Fora', uf: 'MG' },
  { nome: 'Joinville', uf: 'SC' },
  { nome: 'Caxias do Sul', uf: 'RS' },
  { nome: 'Pelotas', uf: 'RS' },
  { nome: 'Maringá', uf: 'PR' },
  { nome: 'Ribeirão Preto', uf: 'SP' },
  { nome: 'Sorocaba', uf: 'SP' },
  { nome: 'São José dos Campos', uf: 'SP' }
];

export const MOCK_MUNICIPIOS: MunicipioType[] = MOCK_MUNICIPIOS_RAW.map((item, idx) => ({
  codigo_ibge: 1000000 + idx,
  nome: item.nome,
  uf: item.uf
}));

// Localstorage local state DB initialization
const getLocalClients = (): ClienteTemp[] => {
  const data = localStorage.getItem('clientes_temp_local');
  if (!data) {
    localStorage.setItem('clientes_temp_local', JSON.stringify(INITIAL_DEMO_CLIENTS));
    return INITIAL_DEMO_CLIENTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_DEMO_CLIENTS;
  }
};

const setLocalClients = (clients: ClienteTemp[]) => {
  localStorage.setItem('clientes_temp_local', JSON.stringify(clients));
};

// Clean static mapping for Supabase columns:
// - telefone -> telefone_celular
// - endereco -> endereco_completo

/**
 * Universal Database Client Wrapper.
 * Dispatches to Supabase or handles clients via LocalStorage demo fallback gracefully.
 */
export const dbService = {
  /**
   * Fetch listing with optional search by name and sorting by created_at.
   */
  async getClientes(searchQuery = '', sortOrder: 'asc' | 'desc' = 'desc'): Promise<ClienteTemp[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let data: any[] | null = null;

        // Attempt relation join. If the SQL schema script has been run, this works instantly.
        // Otherwise, it catches and executes a pure table select without breaking the UI.
        try {
          let query = supabase
            .from('clientes_temp')
            .select(`
              *,
              municipios:municipio_codigo_ibge (
                codigo_ibge,
                nome_ibge,
                uf
              )
            `);

          if (searchQuery.trim() !== '') {
            query = query.ilike('nome', `%${searchQuery}%`);
          }

          query = query.order('created_at', { ascending: sortOrder === 'asc' });

          const { data: joinData, error: joinError } = await query;
          if (joinError) throw joinError;
          data = joinData;
        } catch (relationErr) {
          console.warn('[getClientes] Failed to select with "municipios" join, running simple fallback select:', relationErr);
          
          let fallbackQuery = supabase.from('clientes_temp').select('*');
          if (searchQuery.trim() !== '') {
            fallbackQuery = fallbackQuery.ilike('nome', `%${searchQuery}%`);
          }
          fallbackQuery = fallbackQuery.order('created_at', { ascending: sortOrder === 'asc' });

          const { data: fallbackData, error: fallbackError } = await fallbackQuery;
          if (fallbackError) throw fallbackError;
          data = fallbackData;
        }

        if (data) {
          return data.map((item: any) => {
            return {
              ...item,
              endereco: item.endereco_completo !== undefined ? item.endereco_completo : (item.endereco || ''),
              telefone: item.telefone_celular !== undefined ? item.telefone_celular : (item.telefone || '')
            } as ClienteTemp;
          });
        }

        return [];
      } catch (err) {
        // Fallback to local storage if supabase database fails
        console.error('Supabase getClientes error, falling back to local:', err);
        return this.getLocalFilteredClients(searchQuery, sortOrder);
      }
    } else {
      return this.getLocalFilteredClients(searchQuery, sortOrder);
    }
  },

  getLocalFilteredClients(searchQuery: string, sortOrder: 'asc' | 'desc'): ClienteTemp[] {
    let list = getLocalClients();
    
    // Filter search by "Nome"
    if (searchQuery.trim() !== '') {
      const lower = searchQuery.toLowerCase();
      list = list.filter(c => c.nome.toLowerCase().includes(lower));
    }
    
    // Sort by "Data de Inclusão" (created_at)
    list.sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    // Augment table with mock relationship structures
    return list.map(c => {
      if (c.municipio_codigo_ibge) {
        const matched = MOCK_MUNICIPIOS.find(m => m.codigo_ibge === c.municipio_codigo_ibge);
        if (matched) {
          return {
            ...c,
            municipios: {
              codigo_ibge: matched.codigo_ibge,
              nome_ibge: matched.nome,
              uf: matched.uf
            }
          };
        }
      }
      return c;
    });
  },

  /**
   * Create a new client record
   */
  async createCliente(cliente: ClienteTemp): Promise<ClienteTemp> {
    // Strip frontend nested relation fields to avoid bad DB operations on tables
    const { municipios, ...insertPayload } = cliente;

    const freshRecord: any = {
      nome: insertPayload.nome,
      cpf: insertPayload.cpf,
      telefone_celular: insertPayload.telefone,
      endereco_completo: insertPayload.endereco,
      email: insertPayload.email || null,
      identidade: insertPayload.identidade || null,
      data_nascimento: insertPayload.data_nascimento || null,
      municipio_codigo_ibge: insertPayload.municipio_codigo_ibge || null,
      created_at: new Date().toISOString()
    };

    if (insertPayload.id) {
      freshRecord.id = insertPayload.id;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('clientes_temp')
          .insert([freshRecord])
          .select();
        
        if (error) {
          // If insert without id failed with a null-value constraint error, let's try generating a UUID on the fly (failsafe).
          const isNullIdError = error.message?.toLowerCase().includes('column "id"') || 
                               error.details?.toLowerCase().includes('id');
          if (isNullIdError && !freshRecord.id) {
            console.warn('DB insert failed on id constraint, attempting with client-side UUID...');
            const uuidRecord = {
              ...freshRecord,
              id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' 
                ? crypto.randomUUID() 
                : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                    const r = (Math.random() * 16) | 0;
                    const v = c === 'x' ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                  })
            };
            const retryRes = await supabase
              .from('clientes_temp')
              .insert([uuidRecord])
              .select();
            
            if (retryRes.error) {
              throw retryRes.error;
            }
            if (retryRes.data && retryRes.data[0]) {
              const returned = { ...retryRes.data[0] };
              returned.endereco = returned.endereco_completo;
              returned.telefone = returned.telefone_celular;
              return returned;
            }
            return { ...cliente, id: uuidRecord.id };
          }
          throw error;
        }

        if (data && data[0]) {
          const returned = { ...data[0] };
          returned.endereco = returned.endereco_completo;
          returned.telefone = returned.telefone_celular;
          return returned;
        }
        return cliente;
      } catch (err: any) {
        console.error('Failed to create client in Supabase:', err);
        throw err;
      }
    } else {
      const fallbackRecord = { ...freshRecord, endereco: insertPayload.endereco, telefone: insertPayload.telefone };
      return this.createLocalCliente(fallbackRecord);
    }
  },

  createLocalCliente(cliente: ClienteTemp): ClienteTemp {
    const list = getLocalClients();
    const fresh = {
      ...cliente,
      id: 'demo-uuid-' + Math.random().toString(36).substring(2, 11)
    };
    list.push(fresh);
    setLocalClients(list);
    return fresh;
  },

  /**
   * Update an existing client record
   */
  async updateCliente(id: string, cliente: ClienteTemp): Promise<ClienteTemp> {
    const payload: any = {
      nome: cliente.nome,
      cpf: cliente.cpf,
      telefone_celular: cliente.telefone,
      endereco_completo: cliente.endereco,
      email: cliente.email || null,
      identidade: cliente.identidade || null,
      data_nascimento: cliente.data_nascimento || null,
      municipio_codigo_ibge: cliente.municipio_codigo_ibge || null
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('clientes_temp')
          .update(payload)
          .eq('id', id)
          .select();
          
        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
        
        if (data && data[0]) {
          const returned = { ...data[0] };
          returned.endereco = returned.endereco_completo;
          returned.telefone = returned.telefone_celular;
          return returned;
        }
        return { ...cliente, id };
      } catch (err: any) {
        console.error('Failed to update client in Supabase:', err);
        throw err;
      }
    } else {
      return this.updateLocalCliente(id, cliente);
    }
  },

  updateLocalCliente(id: string, cliente: ClienteTemp): ClienteTemp {
    const list = getLocalClients();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        ...cliente,
        id // guarantee id is correct
      };
      setLocalClients(list);
      return list[idx];
    }
    throw new Error('Cliente para alteração não encontrado locally.');
  },

  /**
   * Delete a client record
   */
  async deleteCliente(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('clientes_temp')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error('Supabase delete error:', error);
          throw error;
        }
        return;
      } catch (err: any) {
        console.error('Failed to delete client in Supabase:', err);
        throw err;
      }
    } else {
      this.deleteLocalCliente(id);
    }
  },

  deleteLocalCliente(id: string): void {
    let list = getLocalClients();
    list = list.filter(c => c.id !== id);
    setLocalClients(list);
  },

  /**
   * Fetch structured municipalities from the 'municipios' table inside Supabase.
   * Handles various schema configurations dynamically and falls back to a list of mock data if necessary.
   */
  async getMunicipios(searchQuery = ''): Promise<MunicipioType[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        // Clear any previous cached error
        if (typeof window !== 'undefined') {
          delete (window as any).__lastSupabaseMunicipiosError;
        }

        const tableName = 'municipios';
        const searchCol = 'nome_ibge';

        let dbQuery = supabase
          .from(tableName)
          .select('*')
          .limit(30);

        if (searchQuery.trim() !== '') {
          dbQuery = dbQuery.ilike(searchCol, `%${searchQuery}%`);
        }

        const { data, error } = await dbQuery;

        if (error) {
          console.error(`[getMunicipios] Erro ao buscar na tabela "${tableName}" pelo campo "${searchCol}":`, error);
          if (typeof window !== 'undefined') {
            (window as any).__lastSupabaseMunicipiosError = `Erro na busca: ${error.message}`;
          }
          throw error;
        }

        if (data && data.length > 0) {
          return data.map((m: any) => {
            // Safe mapping of the state abbreviation directly from whatever state column exists
            const ufVal = String(m.uf || m.uf_sigla || m.sigla_uf || m.estado || m.uf_ibge || m.codigo_uf || '').trim().toUpperCase();
            return {
              nome: String(m[searchCol] || m.nome || '').trim(),
              uf: ufVal,
              codigo_ibge: Number(m.codigo_ibge || m.codigo || m.id || 0)
            };
          }).filter(m => m.nome);
        }

        if (typeof window !== 'undefined' && (!data || data.length === 0)) {
          (window as any).__lastSupabaseMunicipiosError = `Nenhum registro encontrado na tabela "${tableName}".`;
        }

        return [];

      } catch (err: any) {
        console.error('[getMunicipios] Failover to local mockup list due to error:', err);
        if (typeof window !== 'undefined') {
          (window as any).__lastSupabaseMunicipiosError = err?.message || String(err);
        }
        return this.getLocalMockMunicipios(searchQuery);
      }
    } else {
      if (typeof window !== 'undefined') {
        (window as any).__lastSupabaseMunicipiosError = 'Chaves do Supabase ausentes no .env.';
      }
      return this.getLocalMockMunicipios(searchQuery);
    }
  },

  getLocalMockMunicipios(searchQuery: string): MunicipioType[] {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return MOCK_MUNICIPIOS.slice(0, 15);
    }
    return MOCK_MUNICIPIOS.filter(m => 
      m.nome.toLowerCase().includes(query) || 
      m.uf.toLowerCase().includes(query)
    ).slice(0, 15);
  }
};
