# --- Fase 1: Instalar dependencias del sistema operativo y Node.js ---
# Usamos una imagen oficial de Node.js (v18) que corre en Debian (Linux)
FROM mcr.microsoft.com/playwright/python:v1.39.0-jammy AS base

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Actualiza los permisos para Playwright
RUN mkdir -p /app && chown -R 1000:1000 /app

# Cambia al usuario 'pwuser' que ya tiene permisos
USER pwuser

# Copia los archivos de definición del proyecto
COPY --chown=1000:1000 package.json package-lock.json ./

# Instala solo las dependencias de producción.
# Esto aprovecha el caché de Docker y hace las builds futuras más rápidas.
RUN npm install --omit=dev

# Copia el resto del código de tu aplicación
COPY --chown=1000:1000 . .

# Expone el puerto en el que tu app va a correr
# Tu index.js usa process.env.PORT || 4000. Render usará el 10000 por defecto.
ENV PORT=10000
EXPOSE 10000

# --- Fase 2: Comando final para iniciar la aplicación ---
# Este es el comando que Render ejecutará para iniciar tu app.
CMD ["node", "src/index.js"]