# Backend Dockerfile
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install --only=production --legacy-peer-deps

# Copiar código fonte
COPY . .

# Copiar arquivo de ambiente Docker
COPY src/.env.docker src/.env

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Alterar propriedade dos arquivos
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expor porta
EXPOSE 3001

# Comando de saúde
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Comando para iniciar a aplicação
CMD ["npm", "start"]
