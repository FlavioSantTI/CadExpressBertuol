-- SCRIPT COMPLETO DE AJUSTE DO BANCO DE DADOS (SUPABASE)
-- Execute este script no SQL Editor do seu painel do Supabase.
-- Ele resolve o erro PGRST204 de coluna ausente recriando/corrigindo os campos e atualizando o cache do PostgREST.

-- 1. Garante a existência da tabela 'municipios'
CREATE TABLE IF NOT EXISTS municipios (
    codigo_ibge integer PRIMARY KEY,
    nome_ibge varchar(150) NOT NULL,
    uf varchar(2) NOT NULL
);

-- 2. Garante a existência da tabela 'clientes_temp'
CREATE TABLE IF NOT EXISTS clientes_temp (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome varchar(150) NOT NULL,
    cpf varchar(14) NOT NULL,
    telefone varchar(15),
    endereco varchar(255),
    email varchar(100),
    identidade varchar(20),
    data_nascimento date,
    municipio_codigo_ibge integer,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. Tratamento dinâmico: Se houver coluna 'endereço' (com ç) e não houver 'endereco' (sem ç), renomeia-a
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'clientes_temp' AND column_name = 'endereço'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'clientes_temp' AND column_name = 'endereco'
    ) THEN
        ALTER TABLE clientes_temp RENAME COLUMN "endereço" TO "endereco";
    END IF;
END $$;

-- 4. Garante a adição de qualquer coluna ausente individualmente na tabela clientes_temp (caso já existisse com menos campos)
ALTER TABLE clientes_temp ADD COLUMN IF NOT EXISTS endereco varchar(255);
ALTER TABLE clientes_temp ADD COLUMN IF NOT EXISTS nome varchar(150);
ALTER TABLE clientes_temp ADD COLUMN IF NOT EXISTS cpf varchar(14);
ALTER TABLE clientes_temp ADD COLUMN IF NOT EXISTS telefone varchar(15);
ALTER TABLE clientes_temp ADD COLUMN IF NOT EXISTS email varchar(100);
ALTER TABLE clientes_temp ADD COLUMN IF NOT EXISTS identidade varchar(20);
ALTER TABLE clientes_temp ADD COLUMN IF NOT EXISTS data_nascimento date;
ALTER TABLE clientes_temp ADD COLUMN IF NOT EXISTS municipio_codigo_ibge integer;
ALTER TABLE clientes_temp ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- 5. Garante constraint UNIQUE em municipios.codigo_ibge para viabilizar Chave Estrangeira
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'unique_municipios_codigo_ibge'
    ) THEN
        BEGIN
            ALTER TABLE municipios ADD CONSTRAINT unique_municipios_codigo_ibge UNIQUE (codigo_ibge);
        EXCEPTION WHEN others THEN
            -- Ignora erro caso o próprio PRIMARY KEY já assuma a unicidade no banco
        END;
    END IF;
END $$;

-- 6. Recria a relação de Chave Estrangeira de forma limpa e segura
ALTER TABLE clientes_temp DROP CONSTRAINT IF EXISTS fk_clientes_temp_municipio;

ALTER TABLE clientes_temp
ADD CONSTRAINT fk_clientes_temp_municipio
FOREIGN KEY (municipio_codigo_ibge) 
REFERENCES municipios(codigo_ibge)
ON DELETE SET NULL;

-- 7. Otimiza consultas por meio de indexação
CREATE INDEX IF NOT EXISTS idx_clientes_temp_municipio_ibge ON clientes_temp(municipio_codigo_ibge);

-- 8. COMANDO CRÍTICO: Recarrega o cache de esquemas do PostgREST no Supabase
-- Sem essa instrução, o cache de tabelas e colunas continuará desatualizado produzindo erro PGRST204.
NOTIFY pgrst, 'reload schema';
