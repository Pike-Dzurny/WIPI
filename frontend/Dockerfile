# Use the official lightweight Node.js base image
FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the container
COPY package*.json ./

# Install dependencies including Next.js and any specific packages
RUN npm install lodash.debounce react-tsparticles @types/lodash.debounce next@latest

# Copy the rest of the application code into the Docker image
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Use the start script as the entry point
CMD ["./start.sh"]
