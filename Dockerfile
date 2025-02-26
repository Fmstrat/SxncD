FROM node:20
ADD src /app
WORKDIR /app
RUN npm install
CMD ["npm", "start"]
