# Use Node.js as the base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema first
COPY prisma ./prisma

# Generate Prisma client (with binary targets from updated schema)
RUN npx prisma generate

# Now copy the rest of the application
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the app port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
