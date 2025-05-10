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
  && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/download/latest -o bun.tar.gz && \
    mkdir -p /usr/local/bun && \
    tar -xzf bun.tar.gz -C /usr/local/bun && \
    ln -s /usr/local/bun/bun /usr/local/bin/bun && \
    rm bun.tar.gz
# Install Doppler CLI via official Debian package repo
RUN wget -q -t3 'https://packages.doppler.com/public/cli/gpg.8004D9FF50437357.key' -O- | gpg --dearmor -o /usr/share/keyrings/doppler.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/doppler.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" > /etc/apt/sources.list.d/doppler.list && \
    apt-get update && apt-get install -y doppler

# Set working directory
WORKDIR /usr/src/app

# Copy and install app dependencies
COPY package.json bun.lock ./
COPY prisma ./prisma/
RUN bun install

# Generate Prisma client
RUN bun prisma generate --schema ./prisma/schema.prisma

# Copy rest of the application files
COPY . .

# Set Doppler token via build arg
ARG DOPPLER_TOKEN
ENV DOPPLER_TOKEN=$DOPPLER_TOKEN

# Inject Doppler secrets and build
RUN doppler run --config production --mount .env -- bun run build

# Set runtime environment
ENV PORT=8080
EXPOSE 8080
# Run Bun app
CMD ["bun", "start"]
