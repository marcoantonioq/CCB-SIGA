FROM node:20
WORKDIR /app/server
COPY server .
RUN npm install && npm run migrate && npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]