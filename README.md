# TueTops

Welcome to the **TueTops**! Get ready to embark on a delightful journey of ordering and managing pizzas, brought to you
by the enthusiastic students of the University of Tübingen's student council.

## How To Use

Once you have the Docker container up and running with the steps provided below, simply navigate
to <http://localhost:3000> and start your pizza adventure!

### Dependencies

Before you begin, make sure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/)
- [Bun](https://bun.sh/)

### Controls

#### Start the Fun

To start your Docker containers and networks (it will build first if no build exists):

```sh
bun run docker:up
```

#### Build the Magic

To build Docker images from a `docker-compose.yml`, `Dockerfile`, and context:

```sh
bun run docker:build
```

#### Pause the Party

To stop Docker containers and networks:

```sh
bun run docker:down
```

### Access to MongoDB

Want to dive into the data? Access the MongoDB instance using the following tools:

- **Mongo Express:** [http://localhost:8081](http://localhost:8081)
- **Username:** `admin`
- **Password:** `admin`

Connect to the MongoDB database with these settings:

- **Host name/address:** `db`
- **Port:** `27017`
- **Username:** `admin`
- **Password:** `admin`

## Technologies Used

This app is powered by a robust tech stack:

- Docker
- MongoDB
- Next.js

## Authors

Meet the creative minds behind the project:

- [Zeilenschubser](https://github.com/zeilenschubser) (Original Author)
- [Josef Müller](https://github.com/am9zZWY)

Enjoy using **TueTops – Pizza Ordering App** and have fun at the summer fest! 🍕
