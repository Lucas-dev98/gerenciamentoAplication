# EPU-Gestão - Configuração Docker

Este documento explica como executar a aplicação EPU-Gestão usando Docker e Docker Compose.

## 📋 Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) (incluído no Docker Desktop)
- Pelo menos 4GB de RAM disponível
- Portas 3000, 5000 e 27017 livres

## 🚀 Início Rápido

### Windows (PowerShell)

```powershell
# Clonar o repositório (se ainda não fez)
git clone <url-do-repositorio>
cd EPU-Gestão

# Executar script de inicialização
.\start-docker.ps1
```

### Linux/macOS (Bash)

```bash
# Clonar o repositório (se ainda não fez)
git clone <url-do-repositorio>
cd EPU-Gestão

# Dar permissão de execução e executar
chmod +x start-docker.sh
./start-docker.sh
```

### Manual

```bash
# Construir e iniciar todos os serviços
docker-compose up -d --build

# Verificar status
docker-compose ps
```

## 🔧 Arquitetura dos Containers

### Serviços Incluídos

1. **Frontend (React)** - Porta 3000

   - Aplicação React servida pelo Nginx
   - Build otimizado para produção
   - Configuração de SPA (Single Page Application)

2. **Backend (Node.js)** - Porta 5000

   - API REST em Node.js/Express
   - Conexão com MongoDB
   - Validação e autenticação JWT

3. **MongoDB** - Porta 27017
   - Banco de dados NoSQL
   - Inicialização automática com dados de exemplo
   - Volume persistente para dados

### Volumes

- `mongodb_data`: Armazena dados do MongoDB persistentemente

### Network

- `epu-network`: Rede bridge privada para comunicação entre containers

## 🔐 Credenciais Padrão

Após a inicialização, use estas credenciais para acessar o sistema:

- **Email**: admin@epugestao.com
- **Senha**: admin123

## 📊 URLs de Acesso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **MongoDB**: localhost:27017

## 🛠️ Comandos Úteis

### Gerenciamento Básico

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Construção e Reconstrução

```bash
# Reconstruir imagens
docker-compose build --no-cache

# Reconstruir e iniciar
docker-compose up -d --build

# Reconstruir apenas um serviço
docker-compose build --no-cache backend
```

### Manutenção

```bash
# Reiniciar um serviço específico
docker-compose restart backend

# Ver status dos containers
docker-compose ps

# Executar comando dentro de um container
docker-compose exec backend npm run test
docker-compose exec mongodb mongosh
```

### Limpeza

```bash
# Parar e remover containers (mantém volumes)
docker-compose down

# Parar e remover containers + volumes (PERDE DADOS!)
docker-compose down -v

# Limpar imagens órfãs
docker image prune -f

# Limpeza completa do Docker
docker system prune -a
```

## 🔧 Configuração Personalizada

### Variáveis de Ambiente

Copie o arquivo `.env.docker` para `.env` e modifique conforme necessário:

```bash
cp .env.docker .env
```

Principais configurações:

- `DB_URI`: String de conexão MongoDB
- `JWT_SECRET`: Chave secreta para JWT
- `CORS_ORIGIN`: Origem permitida para CORS
- `PORT`: Porta do backend

### Personalizando MongoDB

Edite o arquivo `mongo-init/init-mongo.js` para:

- Adicionar dados iniciais personalizados
- Modificar estrutura de coleções
- Configurar usuários adicionais

### Personalizando Nginx

Edite `frontend/nginx.conf` para:

- Configurar cache
- Adicionar cabeçalhos de segurança
- Modificar configurações de proxy

## 🐛 Solução de Problemas

### Container não inicia

```bash
# Ver logs de erro
docker-compose logs <nome-do-serviço>

# Verificar recursos do sistema
docker system df
```

### Porta em uso

```bash
# Windows - encontrar processo usando porta
netstat -ano | findstr :3000

# Linux/macOS - encontrar processo usando porta
lsof -i :3000
```

### Problemas de conexão MongoDB

```bash
# Verificar se o MongoDB está rodando
docker-compose exec mongodb mongosh --eval "db.runCommand('ping')"

# Reiniciar MongoDB
docker-compose restart mongodb
```

### Limpar cache e reconstruir

```bash
# Limpeza completa e reconstrução
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

### Logs detalhados

```bash
# Logs com timestamp
docker-compose logs -f -t

# Logs das últimas 100 linhas
docker-compose logs --tail=100
```

## 📈 Monitoramento

### Health Checks

Os containers incluem health checks automáticos:

```bash
# Ver status de saúde
docker-compose ps

# Testar manualmente
curl http://localhost:5000/health
curl http://localhost:3000
```

### Recursos do Sistema

```bash
# Ver uso de recursos
docker stats

# Ver espaço usado
docker system df
```

## 🔄 Atualizações

Para atualizar a aplicação:

```bash
# 1. Parar aplicação
docker-compose down

# 2. Atualizar código
git pull

# 3. Reconstruir e iniciar
docker-compose up -d --build
```

## 🤝 Desenvolvimento

Para desenvolvimento com hot-reload:

```bash
# Usar docker-compose.dev.yml (se disponível)
docker-compose -f docker-compose.dev.yml up -d

# Ou montar volumes de desenvolvimento
docker-compose up -d
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs -f`
2. Verifique recursos do sistema: `docker system df`
3. Tente limpeza completa e reconstrução
4. Consulte a documentação do Docker

## 📝 Notas Importantes

- Os dados do MongoDB são persistentes (volume `mongodb_data`)
- Para resetar completamente, use `docker-compose down -v`
- Em produção, altere as senhas padrão
- Monitore o uso de recursos regularmente
