import React, { useState } from 'react';
import { authService } from '../auth';
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onLoginSuccess: (user: any) => void;
}

export const AuthView: React.FC<Props> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'login' | 'cadastro' | 'recuperar' | 'confirmar'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // State for forms
  const [formData, setFormData] = useState({
    nome: '', cpf: '', email: '', password: '', confirmPassword: ''
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (view === 'login') {
        const { data, error } = await authService.signIn(formData.email, formData.password);
        if (error) throw error;
        onLoginSuccess(data.user);
      } else if (view === 'cadastro') {
        if(formData.password !== formData.confirmPassword) throw new Error('Senhas não coincidem');
        await authService.signUp(formData.nome, formData.cpf, formData.email, formData.password);
        setSuccess('Cadastro realizado com sucesso! Faça login.');
        setView('login');
      } else if (view === 'recuperar') {
        // Implement logic
        setSuccess('Instruções de recuperação enviadas.');
        setView('confirmar');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[480px] p-8 bg-white rounded-[16px] shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">CadExpress</h2>
        
        {/* Alerts */}
        {error && <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
        {success && <div className="p-3 mb-4 rounded-lg bg-green-50 text-green-600 text-sm flex items-center gap-2"><CheckCircle size={16}/>{success}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          {view === 'cadastro' && (
            <input className="w-full p-3 border rounded-lg" placeholder="Nome completo" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
          )}
          {(view === 'cadastro' || view === 'recuperar') && (
            <input className="w-full p-3 border rounded-lg" placeholder="CPF" required value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
          )}
          {(view === 'login' || view === 'cadastro' || view === 'recuperar') && (
            <input className="w-full p-3 border rounded-lg" type="text" placeholder="Email ou CPF" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          )}
          {(view === 'login' || view === 'cadastro') && (
            <input className="w-full p-3 border rounded-lg" type="password" placeholder="Senha" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          )}
          {view === 'cadastro' && (
            <input className="w-full p-3 border rounded-lg" type="password" placeholder="Confirmar Senha" required value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
          )}

          <button type="submit" className="w-full p-3 bg-[#FFB347] text-white rounded-lg font-bold hover:bg-orange-400 flex items-center justify-center" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : (view === 'login' ? 'Entrar' : view === 'cadastro' ? 'Cadastrar' : 'Enviar')}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center text-sm space-y-2">
            {view === 'login' && (
                <>
                    <button onClick={() => setView('recuperar')} className="block w-full text-zinc-600 hover:text-black">Esqueci minha senha</button>
                    <button onClick={() => setView('cadastro')} className="block w-full text-zinc-600 hover:text-black">Criar conta</button>
                </>
            )}
            {view !== 'login' && <button onClick={() => setView('login')} className="text-zinc-600 hover:text-black">Voltar ao login</button>}
        </div>
      </motion.div>
    </div>
  );
};
