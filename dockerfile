# Estágio de construção do client
FROM node:18-alpine 
WORKDIR /app/client
COPY client .
RUN npm install && npm run build
WORKDIR /app/server
COPY server .
RUN npm install && npm run migrate && rm -rf src/infra/express/dist && cp -rf ../client/dist src/infra/express/

EXPOSE 3000

CMD ["npm", "run", "start"]