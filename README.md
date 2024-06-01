# Pizza Order App

## How To Use

Once you have started the Docker container using the provided tools and commands below you will need to navigate
to <http://localhost:8000>.

### Dependencies

You will need to install:

- [Docker](https://docs.docker.com/get-docker/)
- [Bun](https://bun.sh/)

### Controls

Starts Docker containers and networks (will build first if no build exists):

```
bun run docker:up
```

Builds Docker images from a docker-compose.yml, Dockerfile and "context";

```
bun run docker:build
```

Stops Docker containers and networks:

```
bun run docker:down
```

### Access to PgAdmin4

- **URL:** [http://localhost:8000](http://localhost:8000)
- **Username:** `pgadmin4@pgadmin.org`
- **Password:** `admin`

#### Add a new server in PgAdmin4

- **Host name/address** `db`
- **Port** `5432`
- **Username** `pern_db`
- **Password** `root`

## Technologies Used

- Docker
- PostgreSQL
- Express JS
- React
- Node JS

## Abbreviations Used

- PERN = (PostgreSQL, Express JS, React, Node.JS)

## Authors

- [Zeilenschubser](https://github.com/zeilenschubser) (Original Author)
- [Josef Müller](https://github.com/am9zZWY)
