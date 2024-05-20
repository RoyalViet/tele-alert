# Use an official Node.js runtime as the base image
FROM node:18
# Set the working directory in the container
WORKDIR /src
# Copy package.json and package-lock.json to the container
COPY package*.json ./
# Install application dependencies
RUN npm install
# Copy the rest of the application code
COPY . .
# Specify the command to run your application
RUN npm run build

CMD ["node", "dist/server.js"]
 