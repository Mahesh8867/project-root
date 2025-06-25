FROM node:20-alpine
WORKDIR /app
# Copy package files first (optimizes layer caching)
COPY package.json package-lock.json ./
RUN npm install
# Copy the rest of the frontend files
COPY . .
# Build (if using Vite/React)
RUN npm run build
# Start the app
CMD ["npm", "run", "dev"]