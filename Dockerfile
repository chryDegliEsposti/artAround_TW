# ==========================================
# Multi-Stage Production Dockerfile for ArtAround
# ==========================================

# Stage 1: Build React Navigator Frontend
FROM node:20-alpine AS builder

WORKDIR /build

# Copy client_navigator dependencies & install
COPY client_navigator/package*.json ./client_navigator/
RUN cd client_navigator && npm install

# Copy source and compile Vite production bundle
COPY client_navigator ./client_navigator
RUN cd client_navigator && npm run build

# Stage 2: Production Server
FROM node:20-alpine AS runner

WORKDIR /app

# Install backend production dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy compiled navigator frontend dist
COPY --from=builder /build/client_navigator/dist ./client_navigator/dist

# Copy backend source & static marketplace frontend
COPY backend ./backend
COPY client_marketplace ./client_marketplace

WORKDIR /app/backend

ENV PORT=3000
ENV NODE_ENV=production
ENV MONGO_URI=mongodb://mongodb:27017/artaround
ENV JWT_SECRET=artaround_secret_key_tw_2025_2026_super_secure
ENV JWT_EXPIRES_IN=7d

EXPOSE 3000

# Seed database with Pinacoteca dataset and start unified server
CMD ["sh", "-c", "node src/seed/seedData.js && node src/index.js"]
