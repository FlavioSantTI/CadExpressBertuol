import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { ClienteTemp } from '../types';
import { AlertCircle, CheckCircle, TrendingUp, Info } from 'lucide-react';

interface Props {
  clientes: ClienteTemp[];
  theme: 'light' | 'dark' | 'comfort';
}

export const RelatorioWhatsApp: React.FC<Props> = ({ clientes, theme }) => {
  const isDark = theme === 'dark';
  const isComfort = theme === 'comfort';

  const total = clientes.length;
  const disparados = clientes.filter(c => c.status_envio === 'PACIENTE ODONTO MARQUES');
  const naoDisparados = clientes.filter(c => c.status_envio !== 'PACIENTE ODONTO MARQUES');

  const countSent = disparados.length;
  const countNotSent = naoDisparados.length;

  const dataPie = [
    { name: 'Disparados', value: countSent },
    { name: 'Não Disparados', value: countNotSent },
  ];
  const COLORS = ['#10b981', '#f43f5e'];

  // Daily evolution
  const dailyData = clientes.reduce((acc, c) => {
    if (!c.created_at) return acc;
    const date = new Date(c.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(dailyData).map(date => ({ date, count: dailyData[date] }));

  const inconsistencias = clientes.filter(c => 
    (c.status_envio === 'PACIENTE ODONTO MARQUES' && !c.id_clinicorp) || 
    !c.nome || !c.cpf || !c.telefone
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <h3 className="text-sm font-bold text-zinc-500">Total</h3>
          <p className="text-2xl font-black">{total}</p>
        </div>
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <h3 className="text-sm font-bold text-emerald-500">Disparados</h3>
          <p className="text-2xl font-black text-emerald-600">{countSent} <span className="text-sm font-normal">({((countSent / total) * 100 || 0).toFixed(1)}%)</span></p>
        </div>
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <h3 className="text-sm font-bold text-rose-500">Não Disparados</h3>
          <p className="text-2xl font-black text-rose-600">{countNotSent} <span className="text-sm font-normal">({((countNotSent / total) * 100 || 0).toFixed(1)}%)</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <h3 className="text-sm font-bold mb-4">Disparos vs. Pendentes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={dataPie} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {dataPie.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className={`p-4 rounded-lg border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <h3 className="text-sm font-bold mb-4">Evolução de Cadastros</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Avisos e Inconsistências ({inconsistencias.length})</h3>
        <ul className="text-xs space-y-2 text-zinc-600">
           {inconsistencias.length === 0 ? <li>Nenhuma inconsistência encontrada.</li> : inconsistencias.map((c, i) => (
             <li key={i}>{c.nome}: {c.status_envio === 'PACIENTE ODONTO MARQUES' && !c.id_clinicorp ? 'Disparado sem ID Clinicorp' : 'Dados campos vazios'}</li>
           ))}
        </ul>
      </div>

      <div className={`p-4 rounded-lg border ${isDark ? 'bg-zinc-900/50 border-teal-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
        <h3 className="text-sm font-bold flex items-center gap-2"><Info className="w-4 h-4" /> Resumo Executivo</h3>
        <p className="text-sm mt-2">
            Atualmente, {((countSent/total)*100 || 0).toFixed(1)}% dos clientes foram disparados. A tendência de cadastro diária {chartData.length > 5 ? "está estabilizada" : "está em fase de crescimento"}. 
            Recomendamos revisar {inconsistencias.length} registros com inconsistências identificadas.
        </p>
      </div>
    </div>
  );
};
