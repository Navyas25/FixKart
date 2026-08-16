# FixKart backend - Express + Supabase API
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the rest of the application
COPY . .

# The API port (published by docker-compose as host port 5000)
EXPOSE 5000

CMD ["npm", "start"]
