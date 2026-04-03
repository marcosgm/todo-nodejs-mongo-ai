# Todo Node.js + MongoDB + AI

This project is based on the original [todo-nodejs-mongo-aca](https://github.com/Azure-Samples/todo-nodejs-mongo-aca) sample from the [Azure-Samples](https://github.com/Azure-Samples) organization on GitHub.

All credit for the original application architecture, code structure, and implementation goes to the original authors and contributors of that repository.

## Running Locally

The easiest way to run the full stack locally is with the provided `run-local.sh` script. It builds Docker images for the API and web frontend, then starts MongoDB, the API, and the web app as containers on a shared Docker network.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running

### Steps

```bash
./run-local.sh
```

Once all containers are running you can access the app at:

| Service | URL |
|---------|-----|
| Web     | http://localhost:8080 |
| API     | http://localhost:3100 |
| MongoDB | mongodb://localhost:27017 |

### Stopping the app

```bash
docker rm -f todo-web todo-api todo-mongodb
```

## Original Source

- **Repository**: https://github.com/Azure-Samples/todo-nodejs-mongo-aca
- **Organization**: [Azure-Samples](https://github.com/Azure-Samples)
- **License**: See [LICENSE](./LICENSE)
