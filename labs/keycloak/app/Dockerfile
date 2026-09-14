ARG NODE_IMAGE=node:24.21.0-bookworm-slim@sha256:2fe369e969550cde8e867afc3fe370b260140cab4a23d467074295b42163d553
FROM ${NODE_IMAGE}

WORKDIR /opt/keycloak-lab-app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY api-healthcheck.mjs api.mjs healthcheck.mjs seed-d09.mjs seed-p07.mjs seed-p08.mjs seed-p09.mjs server.mjs ./

USER node

CMD ["node", "server.mjs"]
