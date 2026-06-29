# client/Dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
# Copiamos los archivos de React ya construidos
COPY --from=build /app/dist /usr/share/nginx/html
# Página de migración (app retirada) — servida por nginx para todas las rutas
COPY migracion.html /usr/share/nginx/html/migracion.html
# Copiamos nuestra configuración especial de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]