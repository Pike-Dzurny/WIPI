# Use the official lightweight Node.js base image
FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the container
COPY package*.json ./

COPY package*.json next.config.js ./

# Install dependencies
RUN npm install

 # Install missing dependencies
RUN npm install lodash.debounce date-fns

RUN npm install --save-dev @types/lodash.debounce

# Copy the rest of the application code
# If you want the src directory to be inside the /app directory in the Docker image, you should adjust the COPY command in your Dockerfile:
COPY src/ /app/src/

COPY *.js /app/
COPY *.json /app/
COPY *.ts /app/ 


# Expose the port Next.js runs on
EXPOSE 3000

# Build the Next.js application
RUN npm run build



CMD ["npm", "run", "dev"]
