# CadExpress 🚀 (v0.8.1-RC)

Sistema corporativo de controle de cadastros, integrado em tempo real com **Supabase** e integrado à tabela de municípios do **IBGE**. Escrito em **React + Vite**, com **TypeScript** e estilizado com **Tailwind CSS**.

---

## 📅 Histórico de Versão
* **Versão:** `v0.8.1-RC` (Release Candidate)
* **Objetivo:** Integração nativa e mapeamento resiliente de campos com as tabelas Supabase existentes (mantendo total integridade conceitual e de persistência sem necessidade de alterar colunas legadas no banco).

---

## 🛠️ Detalhes do Acoplamento & Banco de Dados (Supabase)

O cliente consome a tabela `clientes_temp` e a tabela `municipios`. Para garantir compatibilidade com bancos já existentes em produção sem impactar colunas já operantes, o mapeamento de campos foi estruturado diretamente na camada do cliente:

* **Mapeamento Transparente de Campos:**
  * `endereco_completo` (tipo: `character varying(255)`) do Supabase é dinamicamente mapeado para a propriedade `endereco` na interface React.
  * `telefone_celular` (tipo: `character varying(15)`) do Supabase é correspondido internamente para `telefone`.
* **Relação de Integridade:**
  * O campo `municipio_codigo_ibge` estabelece uma chave estrangeira de relacionamento (`FOREIGN KEY`) direcionada a `municipios.codigo_ibge` (com política `ON DELETE SET NULL`), permitindo vinculação estrita de dados geográficos oficiais do IBGE.
* **Fallback para Contingência:**
  * Caso as credenciais do Supabase não estejam parametrizadas nas variáveis de ambiente, o sistema ativa automaticamente um motor de armazenamento offline baseado em `localStorage` para viabilidade e testes de fluxos de jornada sem interrupções.

---

## 📋 Estrutura da Tabela do Banco de Dados

Caso precise recriar ou validar o ambiente no Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS public.municipios (
    codigo_ibge integer PRIMARY KEY,
    nome_ibge varchar(150) NOT NULL,
    uf varchar(2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.clientes_temp (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nome character varying(150) NOT NULL,
    cpf character varying(14) NOT NULL,
    telefone_celular character varying(15) NOT NULL,
    endereco_completo character varying(255) NOT NULL,
    data_nascimento date NULL,
    email character varying(100) NULL,
    identidade character varying(20) NULL,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    municipio_codigo_ibge integer NULL,
    
    CONSTRAINT clientes_temp_pkey PRIMARY KEY (id),
    CONSTRAINT clientes_temp_cpf_key UNIQUE (cpf),
    CONSTRAINT clientes_temp_email_key UNIQUE (email),
    CONSTRAINT fk_clientes_temp_municipio FOREIGN KEY (municipio_codigo_ibge) REFERENCES municipios (codigo_ibge) ON DELETE SET NULL,
    CONSTRAINT check_data_nascimento_passada CHECK ((data_nascimento <= CURRENT_DATE)),
    CONSTRAINT check_email_formato CHECK (
        (email IS NULL) OR ((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)
    )
);

-- Índices de Otimização de Busca
CREATE INDEX IF NOT EXISTS idx_clientes_temp_nome ON public.clientes_temp USING btree (nome);
CREATE INDEX IF NOT EXISTS idx_clientes_temp_created_at ON public.clientes_temp USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clientes_temp_municipio_ibge ON public.clientes_temp USING btree (municipio_codigo_ibge);
```

---

## ✨ Recursos do Sistema

* **Autocomplemento Inteligente de Municípios:** Busca de cidades e Estados integrada e indexada em tempo real com sugestões dinâmicas à medida que o usuário digita.
* **Suporte Total a Tema Escuro & Claro:** Interface polida construída meticulosamente com cores harmônicas e contraste de legibilidade otimizado.
* **Máscaras de Entrada Robustas:** Filtros para CPF (`000.000.000-00`), Telefones (`(00) 00000-0000` ou `(00) 0000-0000`) e datas para perfeita aderência de dados.
* **Validações Completas de Negócio:**
  * Algoritmo de verificação de dígitos de CPF reais.
  * Validação formal de e-mail e regras de data de nascimento futura.
* **Exportação facilitada:** Exportação nativa da listagem de clientes em formato **CSV**.

---

## 💎 Configuração e Execução

### 1. Requisitos
* Node.js >= 18
* npm >= 9

### 2. Configurações Globais (.env)
Crie o arquivo `.env` na raiz do seu projeto e adicione as chaves obtidas no console do seu projeto do Supabase:

```env
VITE_SUPABASE_URL=SUA_SUBA_URL_AQUI
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA_AQUI
```

### 3. Rodando o Projeto em Desenvolvimento
Instale as dependências e rode o servidor local:

```bash
# Instalar dependências
npm install

# Rodar servidor local auto-reload
npm run dev
```

### 4. Compilação para Produção
Gere os estáticos compilados e minificados para deploy:

```bash
npm run build
```

---

*Desenvolvido com foco em excelência técnica, resiliência de dados e ergonomia visual.* 💙
