# 1. Usa la imagen OFICIAL de Playwright con Node.js (no la de Python)
# Esta imagen ya incluye Node, npm, y TODAS las dependencias de Chromium
FROM mcr.microsoft.com/playwright:v1.39.0-jammy

# 2. Establece el directorio de trabajo
WORKDIR /app

# 3. Copia los archivos de definición del proyecto
COPY package.json package-lock.json ./

# 4. Instala solo las dependencias de producción
# (Ahora sí encontrará 'npm')
RUN npm install --omit=dev

# 5. Copia el resto del código de tu aplicación
COPY . .

# 6. Cambia al usuario no-privilegiado 'pwuser' que Playwright crea
USER pwuser

# 7. Expone el puerto que Render usará
ENV PORT=10000
EXPOSE 10000

# 8. Comando para iniciar la aplicación
CMD ["node", "src/index.js"]