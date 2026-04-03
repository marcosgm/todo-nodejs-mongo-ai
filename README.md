# Todo Node.js + MongoDB + AI

This project is based on the original [todo-nodejs-mongo-aca](https://github.com/Azure-Samples/todo-nodejs-mongo-aca) sample from the [Azure-Samples](https://github.com/Azure-Samples) organization on GitHub.

All credit for the original application architecture, code structure, and implementation goes to the original authors and contributors of that repository.

## AI-powered feature
This app has a new option (called "Generate AI-powered checklist) in the UI and the API, shown to the user when creating a Todo item. When selected, the backend the backend will call an OpenAI model and create a bullet point summary of the steps to achieve that task, stored in the description after the original text.

## Running Locally

The easiest way to run the full stack locally is with the provided `run-local.sh` script. It builds Docker images for the API and web frontend, then starts MongoDB, the API, and the web app as containers on a shared Docker network.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- An [Azure OpenAI](https://learn.microsoft.com/azure/ai-services/openai/overview) resource or an [Azure AI Foundry](https://learn.microsoft.com/azure/ai-foundry/) project with a deployed model (e.g. `gpt-4o`)

### Environment variables

The AI checklist feature requires the following variables to be set in your shell before running the script:

| Variable | Required | Description |
|---|---|---|
| `AZURE_OPENAI_ENDPOINT` | Yes | Endpoint URL of your Azure OpenAI / AI Foundry resource, e.g. `https://<resource>.openai.azure.com/` |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | No | Name of the model deployment to use (default: `gpt-4o`) |
| `AZURE_OPENAI_API_KEY` | No | API key for the resource. Omit to authenticate with `DefaultAzureCredential` (managed identity / `az login`) |

Example:

```bash
export AZURE_OPENAI_ENDPOINT="https://my-resource.openai.azure.com/"
export AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
export AZURE_OPENAI_API_KEY="<your-api-key>"   # optional
```

The MongoDB and Application Insights variables are set automatically by the script and do not need to be configured manually for local runs.

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
