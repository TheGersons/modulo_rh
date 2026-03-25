# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./
# Copiamos la carpeta de prisma para generar el cliente
COPY prisma ./prisma/

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Construimos la aplicación NestJS
RUN npm run build

# Generamos el cliente de Prisma
RUN npx prisma generate

EXPOSE 3000

# Al arrancar, aplicamos migraciones pendientes y levantamos el servidor
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]