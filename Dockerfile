FROM node:12-alpine AS frontend

COPY ./frontend /concepts/frontend
COPY ./backend/src/static/port.schema.json /concepts/backend/src/static/port.schema.json
RUN cd /concepts/frontend && yarn --prod && yarn build

FROM node:12-alpine

COPY --from=frontend /concepts/frontend/build /concepts/frontend
COPY ./backend /concepts/backend

WORKDIR /concepts/backend

RUN yarn --prod

USER 1337:1337

ENV FRONTEND_PATH=/concepts/frontend \
    ENVIRONMENT=production \
    PORT=8080

EXPOSE 8080

CMD ["node", "src/index.js"]
