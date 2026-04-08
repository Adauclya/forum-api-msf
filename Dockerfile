# Base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (only production if possible, but migrations need dev deps sometimes)
# Note: node-pg-migrate is in devDependencies according to package.json
RUN npm install

# Copy application code
COPY . .

# Expose port (default 3000)
EXPOSE 3000

# Set environment variables for production
ENV NODE_ENV=production

# Start script: run migrations and then start the app
CMD ["sh", "-c", "npm run migrate up && npm start"]
