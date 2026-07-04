# ---- Build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# As VITE_* são injetadas no build (variáveis de ambiente do Railway).
# Promovidas a ENV para o Vite lê-las durante `npm run build`.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN npm run build

# ---- Serve ----
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
ENV PORT=4173
EXPOSE 4173
CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
