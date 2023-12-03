# Use the official lightweight Node.js base image
FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Install specific dependencies
RUN npm install lodash.debounce
RUN npm install --save-dev @types/lodash.debounce
RUN npm install -g next


# Copy the rest of the application code
# COPY . .
# Don't use this while developing. It will copy the code from the host machine to the container.

# Expose the port Next.js runs on
EXPOSE 3000

CMD ["npm", "run", "dev"]