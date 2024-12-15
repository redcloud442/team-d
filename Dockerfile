
FROM node:20.10-alpine


RUN apk add --no-cache openssl bash libc6-compat

WORKDIR /usr/src/app

COPY package*.json ./ 
COPY prisma ./prisma/


RUN npm install --production
RUN npm install prisma --save-dev


RUN npx prisma generate --schema ./prisma/schema.prisma
# Copy the rest of the application files
COPY . .

# Build the application (if applicable)
RUN npm run build

# Expose the application port
ENV PORT=8080
EXPOSE 8080

# Default command to run the app
CMD ["npm", "start"]
