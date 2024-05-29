FROM node:latest
# RUN mkdir -p /api/config /api/src
WORKDIR /api

COPY package.json /api/package.json
COPY package-lock.json /api/package-lock.json

RUN npm install
RUN npm run build

# we need to run dist/server.js
CMD ["npm", "run", "start"] 
