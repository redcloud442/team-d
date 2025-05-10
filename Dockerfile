# Use slim instead of alpine for full glibc compatibility (Bun requires glibc)
FROM node:20.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
  curl \
  bash \
  openssl \
  wget \
  ca-certificates \
  gnupg \
  dos2unix \
  unzip \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64.zip -o bun.zip && \
  unzip bun.zip -d /usr/local/bin/ && \
  mv /usr/local/bin/bun-linux-x64/bun /usr/local/bin/bun && \
  rm -rf bun.zip /usr/local/bin/bun-linux-x64

RUN mkdir -p /usr/share/keyrings

RUN apt-get update && apt-get install -y apt-transport-https ca-certificates curl gnupg && \
    curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | \
    gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" > /etc/apt/sources.list.d/doppler-cli.list && \
    apt-get update && apt-get install -y doppler

# Set working directory
WORKDIR /usr/src/app

# Copy and install app dependencies
COPY package.json bun.lock ./ 
COPY prisma ./prisma/
RUN bun install

ARG DOPPLER_TOKEN
ENV DOPPLER_TOKEN=$DOPPLER_TOKEN

# ✅ Download secrets into `.env`
RUN doppler secrets download --no-file --format env > .env

# 🔁 Use env file for Prisma and Bun
ENV $(cat .env | xargs)
# Generate Prisma client
RUN bun prisma generate --schema ./prisma/schema.prisma

COPY . .

# Inject Doppler secrets and build
RUN bun run build

# Set runtime environment
ENV PORT=8080
EXPOSE 8080

# Run the app
CMD ["bun", "start"]
