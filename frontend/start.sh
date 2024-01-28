#!/bin/sh
# start.sh

# Default to 'production' if NODE_ENV is not set
NODE_ENV=${NODE_ENV:-production}

# Use different start commands based on the NODE_ENV value
if [ "$NODE_ENV" = "development" ]; then
  echo "Starting in development mode..."
  npm run dev
else
  echo "Starting in production mode..."
  npm run start
fi
