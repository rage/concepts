# Concepts

## Setting up a dev env
0. Clone the repo (`git clone https://github.com/rage/concepts.git`)
1. Create `.env.local` in the `frontend` directory that contains your
   `REACT_APP_TMC_CLIENT_ID` and `REACT_APP_TMC_SECRET` variables.
2. Install dependencies with `yarn` in both the `frontend` and `backend` directories.
3. Create `config/development.env` in the `backend` directory that contains
   `ENDPOINT=<your prisma backend>` and `SECRET=random string`. The prisma
   backend is usually `http://localhost:4466`.
4. Install [docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/).
5. Start the prisma backend with `docker-compose up -d` in the `backend` directory.
6. Start the backend with `yarn watch` in the `backend` directory.
7. Start the frontend dev server with `yarn start` in the `frontend` directory.

## Previews

### Main concept view
![preview-concepts.png](preview-concepts.png)

### Concept matrix
![preview-matrix.png](preview-matrix.png)
