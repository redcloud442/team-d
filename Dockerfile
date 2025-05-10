
FROM node:20.10-alpine

RUN apk add --no-cache curl bash openssl libc6-compat wget && \
    curl -fsSL https://bun.sh/install | bash && \
    mv /root/.bun/bin/bun /usr/local/bin && \
    wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' >> /etc/apk/repositories && \
    apk update && apk add doppler

WORKDIR /usr/src/app

# Copy application dependencies
COPY package.json bun.lock ./ 
COPY prisma ./prisma/


RUN bun install

# Generate Prisma client
RUN bun prisma generate --schema ./prisma/schema.prisma

# Copy the rest of the application files
COPY . .

# Copy the entrypoint script
COPY /scripts/entrypoint_overwrited.sh /usr/src/app/entrypoint.sh

RUN curl -Ls https://cli.doppler.com/install.sh | sh && \
    ln -s /root/.doppler/bin/doppler /usr/local/bin/doppler

ARG DOPPLER_TOKEN
ENV DOPPLER_TOKEN=$DOPPLER_TOKEN

RUN doppler run --mount .env -- bun run build

ENV PORT=8080
EXPOSE 8080


ENTRYPOINT ["/bin/bash"]

CMD ["bun", "start"]