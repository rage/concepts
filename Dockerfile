FROM node:12-alpine AS builder

COPY /concepts/backend /concepts/backend
COPY /concepts/frontend /concepts/frontend
RUN cd /concepts/frontend && yarn --prod && yarn build
RUN cd /concepts/backend && yarn && yarn build

FROM node:12-alpine

COPY --from=builder /concepts/frontend/build /concepts/frontend
COPY --from=builder /concepts/backend/dist /concepts/backend
COPY /concepts/backend/package.json /concepts/backend/package.json
COPY /concepts/backend/prisma.yml /concepts/backend/prisma.yml

WORKDIR /concepts/backend

RUN yarn --prod

USER 1337:1337

ENV FRONTEND_PATH=/concepts/frontend \
    ENVIRONMENT=production \
    PORT=8080

EXPOSE 8080

CMD ["node", "index.js"]
