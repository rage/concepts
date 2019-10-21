FROM node:12-alpine AS builder

ARG REACT_APP_HAKA_URL
ENV REACT_APP_HAKA_URL=$REACT_APP_HAKA_URL

COPY ./backend /concepts/backend
COPY ./frontend /concepts/frontend
RUN cd /concepts/frontend && yarn --prod && yarn build
RUN cd /concepts/backend && yarn && yarn build

FROM node:12-alpine

COPY --from=builder /concepts/frontend/build /concepts/frontend
COPY --from=builder /concepts/backend/dist /concepts/backend/dist
COPY --from=builder /concepts/backend/package.json /concepts/backend/package.json
COPY --from=builder /concepts/backend/prisma.yml /concepts/backend/prisma.yml
COPY --from=builder /concepts/backend/schema /concepts/backend/schema

WORKDIR /concepts/backend

RUN yarn --prod && npm install --global prisma

USER 1337:1337

ENV FRONTEND_PATH=/concepts/frontend \
    ENVIRONMENT=production \
    PORT=8080

EXPOSE 8080

CMD ["node", "dist/index.js"]
