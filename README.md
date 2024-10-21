# Wipi Application

Wipi is a full-stack application with a Next.js frontend, a FastAPI backend, and a PostgreSQL database. The application is containerized using Docker to ensure consistent development environments and deployment.

## Prerequisites

Before you begin, ensure you have the following installed on your development machine:

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

## Getting Started

To get started with the application, follow these steps:

### Clone the repository

Clone this repository to your local machine using the following command:

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### Environment Setup

Create a `.env` file in the root of your project (or adjust environment variables in `docker-compose.yml` if preferred) with the necessary environment variables for your PostgreSQL database:

```plaintext
POSTGRES_USER=yourusername
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=yourdbname
```

### Build and Run the Application

Use Docker Compose to build and run the application:

```bash
docker-compose up --build
```

This command will build the images for the frontend, API, and database services (if not already built) and start the containers.

### Accessing the Application

Once the containers are up and running, you can access:

- The Next.js frontend at [http://localhost:3000](http://localhost:3000)
- The FastAPI backend at [http://localhost:8000](http://localhost:8000)

### Shutting Down the Application

To stop the running containers, use the following command:

```bash
docker-compose down
```

## Development Workflow

To make changes to the application:

1. Edit the files in the respective service directory (`frontend` or `API`).
2. Use `docker-compose up --build` to rebuild the services and see the changes in effect.

If you want to run the services in the background, you can start Docker Compose with the `-d` (detached) option:

```bash
docker-compose up -d
```

## Additional Commands

Here are some additional Docker Compose commands that might be useful:

- To view the logs of all running services, use `docker-compose logs`.
- To rebuild a specific service, use `docker-compose up --build <service_name>`.
- To force a rebuild of all services without using cache, use `docker-compose build --no-cache`.

## Contributing

To contribute to this project, please create a branch for your feature or fix, make your changes, and submit a pull request to the main repository for review.

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository issue tracker.

## License

This project is licensed under the [BSD 2-Clause License](LICENSE).

