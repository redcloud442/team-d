# Use the latest Node.js Alpine image
FROM node:20.10-alpine

# Install necessary dependencies
RUN apk add --no-cache openssl bash libc6-compat

# Set the working directory
WORKDIR /usr/src/app

# Copy package files and Prisma schema
COPY package*.json ./ 
COPY prisma ./prisma/

# Install dependencies (including Prisma CLI)
RUN npm install --production
RUN npm install prisma --save-dev

# Generate Prisma Client
RUN npx prisma generate --schema ./prisma/schema.prisma

# Copy the rest of the application files
COPY . .

# Build the application (if applicable)
RUN npm run build

# Expose the application port
ENV PORT=3000
EXPOSE 3000

# Default command to run the app
CMD ["npm", "start"]
