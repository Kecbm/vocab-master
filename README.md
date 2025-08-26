# Vocab Master

![Project Image](public/screenshot.png)

## Project info

**URL**: https://lovable.dev/projects/050e5681-0863-4d6a-92f6-60b409f1d39e

## 🚀 Como inicializar a aplicação

### Método 1: Inicialização completa (Recomendado)

```bash
# Instala dependências
npm install

# Inicia tanto o json-server quanto a aplicação web
./start.sh
```

### Método 2: Inicialização manual

```bash
# Terminal 1: Inicia o servidor de dados
npm run db

# Terminal 2: Inicia a aplicação web
npm run dev
```

### 📊 URLs da aplicação

- **Aplicação web**: http://localhost:8080
- **API de dados**: http://localhost:3001
- **Dados JSON**: http://localhost:3001/words

## 💾 Sistema de persistência

A aplicação agora usa **json-server** como backend mínimo:

- ✅ **Persistência real** - Dados salvos em `db.json`
- ✅ **API REST completa** - GET, POST, PUT, DELETE
- ✅ **Sincronização automática** - Mudanças refletem imediatamente
- ✅ **Backup simples** - Arquivo `db.json` pode ser versionado

## 🔧 Scripts disponíveis

```bash
npm run dev        # Apenas aplicação web
npm run db         # Apenas json-server
npm run dev:full   # Ambos simultaneamente
npm run build      # Build de produção
npm run lint       # Verificação de código
```

## How can I edit this code?

**Use your preferred IDE**

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm install

# Step 4: Start the complete application
./start.sh
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/050e5681-0863-4d6a-92f6-60b409f1d39e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
