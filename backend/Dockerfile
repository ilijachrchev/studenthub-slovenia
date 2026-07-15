FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

RUN chmod +x docker-start.sh

EXPOSE 30011

CMD ["./docker-start.sh"]
