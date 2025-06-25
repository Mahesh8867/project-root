# frontend/Dockerfile

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copy rest of the app
COPY frontend/ .

# Build the app
RUN npm run build

# Serve the build using a static server
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "5173"]
