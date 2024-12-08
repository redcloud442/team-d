# Use the latest Node.js Alpine image
FROM node:20.10-alpine

# Install OpenSSL dependencies (required by Prisma)
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy Prisma files and generate Prisma Client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the application files
COPY . .

# Build the application (if applicable)
RUN npm run build

# Expose the application port
EXPOSE 3000

# Default command to run the app
CMD ["npm", "start"]
