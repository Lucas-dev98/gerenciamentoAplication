# Dockerfile para React + Vite (produção)
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro (para cache do Docker)
COPY package*.json ./

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci --ignore-scripts

# Copiar código fonte
COPY . .

# Copiar arquivo de ambiente de produção
COPY .env.production .env

# Build da aplicação
RUN npm run build

# Stage de produção com nginx
FROM nginx:alpine

# Instalar wget para health check
RUN apk add --no-cache wget

# Copiar build da aplicação
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Criar grupo nodejs e ajustar permissões
RUN addgroup -g 1001 -S nodejs && \
    adduser nginx nodejs

# Ajustar permissões
RUN chown -R nginx:nodejs /usr/share/nginx/html && \
    chown -R nginx:nodejs /var/cache/nginx && \
    chown -R nginx:nodejs /var/log/nginx && \
    chown -R nginx:nodejs /etc/nginx/conf.d

# Criar diretório para PID do nginx
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nodejs /var/run/nginx.pid

# Usar usuário não-root
USER nginx

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
