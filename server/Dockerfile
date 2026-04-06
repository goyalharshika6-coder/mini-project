FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
