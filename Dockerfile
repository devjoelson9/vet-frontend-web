# --------------------------------------------------
# 1. Estágio de Build (Node.js + Vite/React)
# --------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copia os arquivos de dependência primeiro para aproveitar o cache
COPY package*.json ./
RUN npm install

# Copia o código fonte e gera os arquivos estáticos de produção
COPY . .
RUN npm run build

# --------------------------------------------------
# 2. Estágio de Execução (Servidor Nginx leve)
# --------------------------------------------------
FROM nginx:1.25-alpine

# Remove a página padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos estáticos compilados (no Vite o padrão é 'dist', no CRA é 'build')
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]