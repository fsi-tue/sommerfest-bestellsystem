# Pizza Order App

## How To Use

Once you have started the Docker container using the provided tools and commands below, you will need to navigate
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

Builds Docker images from a docker-compose.yml, Dockerfile, and "context":

```
bun run docker:build
```

Stops Docker containers and networks:

```
bun run docker:down
```

### Access to MongoDB

You can access the MongoDB instance through the following tools:

- **Mongo Express:** [http://localhost:8081](http://localhost:8081)
- **Username:** `admin`
- **Password:** `admin`

To connect to the MongoDB database, use the following configuration in your MongoDB client:

- **Host name/address:** `db`
- **Port:** `27017`
- **Username:** `admin`
- **Password:** `admin`

## Technologies Used

- Docker
- MongoDB
- Next.js

## Authors

- [Zeilenschubser](https://github.com/zeilenschubser) (Original Author)
- [Josef Müller](https://github.com/am9zZWY)
