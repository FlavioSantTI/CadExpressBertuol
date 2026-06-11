import { supabase } from './supabase';
import { ClienteTemp } from './types';

export const authService = {
  async signUp(nome: string, cpf: string, email: string, password: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
          cpf: cpf.replace(/\D/g, '')
        }
      }
    });

    if (authError) throw authError;
    return authData;
  },

  async signIn(emailOrCpf: string, password: string) {
    let email = emailOrCpf;
    
    // Simplistic check if it's a CPF (11 digits, no @)
    const onlyDigits = emailOrCpf.replace(/\D/g, '');
    if (onlyDigits.length === 11 && !emailOrCpf.includes('@')) {
      const { data, error } = await supabase.rpc('get_email_by_cpf', { p_cpf: onlyDigits });
      if (error) throw error;
      if (!data) throw new Error('CPF não encontrado');
      email = data;
    }

    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async getCurrentUser() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    return { ...user, profile };
  }
};
