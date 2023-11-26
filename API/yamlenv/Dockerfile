# Use the official Python base image
FROM python:3.8-slim

# Set the working directory in the container
WORKDIR /app/API

# Copy the requirements file into the container
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

RUN pip install uvicorn

# Copy the rest of the application code
COPY . .

# Expose the port FastAPI runs on
EXPOSE 8000

# Command to start the FastAPI application
CMD ["uvicorn", "script:app", "--host", "0.0.0.0", "--port", "8000"]