FROM node:20-alpine AS build

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build

# Route file-based Winston logs to container streams so kubectl logs can capture them.
RUN ln -sf /dev/stderr /app/error.log \
	&& ln -sf /dev/stderr /app/exceptions.log

CMD ["node","dist/index.js"]
