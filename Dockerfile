# --------------------------------------------------
# 1. Estágio de Build (Node.js + Vite/React)
# --------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# URL usada pelo frontend para chamar o gateway.
# O padrão "/api" funciona quando a aplicação é servida atrás do Nginx do gateway.
ARG VITE_API_GATEWAY_URL=/api
ARG VITE_API_BASE_URL=/api
ARG VITE_BACKEND_URL=http://api-gateway
ENV VITE_API_GATEWAY_URL=$VITE_API_GATEWAY_URL \
    VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_BACKEND_URL=$VITE_BACKEND_URL

# Copia os arquivos de dependência primeiro para aproveitar o cache
COPY package*.json ./
RUN npm ci

# Copia o código fonte e gera os arquivos estáticos de produção
COPY . .
RUN npm run build

# --------------------------------------------------
# 2. Estágio de Execução (Servidor Nginx leve)
# --------------------------------------------------
FROM nginx:1.25-alpine

# Remove a página padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos estáticos compilados pelo Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Fallback de SPA para rotas do React
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
