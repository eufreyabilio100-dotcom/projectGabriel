# Eventos Académicos ISPT

Plataforma de gestão de eventos académicos do Instituto Superior de Tete (ISPT).

## Funcionalidades

- **Gestão de Eventos**: Criar, editar, eliminar e listar eventos académicos
- **Autenticação**: Registo e login de utilizadores com JWT
- **Inscrições**: Inscrição em eventos com emissão de bilhetes digitais
- **Painel de Estatísticas**: Dashboard para organizadores com métricas

## Stack Tecnológico

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Deploy**: Vercel (frontend)

## Pré-requisitos

- Node.js (v18 ou superior)
- Conta no [Supabase](https://supabase.com)
- Conta no [Vercel](https://vercel.com) (para deploy)

## Instruções de Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/eufreyabilio100-dotcom/projectGabriel.git
cd ispt-eventos
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Criar um ficheiro `.env` na raiz do projecto com as credenciais do Supabase:

```
VITE_SUPABASE_URL=https://SEU_PROJECTO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA
```

### 4. Configurar a Base de Dados

Aceder ao Supabase Dashboard → SQL Editor e executar o conteúdo do ficheiro `supabase/schema.sql`.

### 5. Executar em desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### 6. Criar utilizador administrador

Após registar uma conta, aceder ao Supabase Dashboard → Table Editor → utilizadores e alterar o campo `tipo` para `admin`.

## Deploy no Vercel

1. Criar conta no [Vercel](https://vercel.com)
2. Importar o repositório do GitHub
3. Configurar as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy automático

## Estrutura do Projecto

```
ispt-eventos/
├── public/
├── src/
│   ├── components/    # Componentes React reutilizáveis
│   ├── pages/         # Páginas da aplicação
│   ├── lib/           # Configurações e utilitários
│   └── assets/        # Recursos estáticos
├── supabase/
│   └── schema.sql     # Estrutura da base de dados
├── .env.example       # Exemplo de variáveis de ambiente
└── README.md
```

## Autores

- **Gabriel** - Desenvolvimento

## Licença

Este projecto foi desenvolvido para fins académicos no ISPT.
