# 📦 Car Insurance Recommendation System (Docker Compose)

This repository orchestrates the entire deployment of the car insurance recommendation system. It uses Docker Compose to easily launch the frontend (React/Nginx), backend (Node.js), and database (MongoDB) services with a single command.

## 🚀 Project Overview

This project provides a Dockerized application for a car insurance recommendation system, consisting of three main components: a frontend, a backend, and a database. By using the `docker-compose.yml` file, you can quickly set up your development or production environment without complex manual configurations.

## ✨ Features
- **One-Command Deployment**: Start and stop frontend, backend, and MongoDB services all at once.
- **Environment Isolation**: Each service runs in an independent container, preventing dependency conflicts.
- **Data Persistence**: MongoDB data is persisted using Docker volumes.
- **API Key Management**: The backend's Google API Key is securely passed as an environment variable.

## 🛠️ Technology Stack
- **Orchestration**: Docker Compose
- **Containerization**: Docker
- **Frontend**: React, Vite, Nginx (refer to the car-insurance-recommendation-frontend-docker repository for details)
- **Backend**: Node.js, Express.js (refer to the car-insurance-recommendation-backend-docker repository for details)
- **Database**: MongoDB

## ⚙️ Installation and Setup

### Install Docker Desktop / Docker Engine:
You need Docker installed on your system to use Docker Compose. Please follow the official documentation for installation: [Docker Desktop](https://www.docker.com/products/docker-desktop) or [Docker Engine](https://docs.docker.com/engine/install/).

### Clone the Project:
Clone this repository.
```bash
git clone <YOUR_REPOSITORY_URL>  # Adjust repository name as needed
cd car-insurance-recommendation-parent-repo  # Navigate to the root directory of the cloned repository

Note: This assumes that the car-insurance-recommendation-frontend-docker and car-insurance-recommendation-backend-docker subdirectories are part of this main repository structure.

## Backend .env File Configuration:
Ensure a .env file exists in the car-insurance-recommendation-backend-docker directory and that GOOGLE_API_KEY is set.

# C:\Level 5\Mission4_Docker\car-insurance-recommendation-backend-docker\.env
GOOGLE_API_KEY=Your_Google_API_Key
PORT=3000

Alternatively, set the GOOGLE_API_KEY environment variable in your shell before running docker-compose up.

## ▶️ Usage
### Starting the Application
From the root directory of the project (where docker-compose.yml is located), execute the following command:
```bash
docker-compose up --build

The --build flag rebuilds images if necessary. This is important for the first time you run it or if there are changes in your Dockerfiles.

This command will start all services (MongoDB, backend, and frontend) and output their logs to the console.

### Accessing the Application
Once all services are up and running, you can access the frontend application in your web browser by navigating to:

http://localhost/

### Stopping the Application
To stop all services and remove their associated containers, networks, and volumes, run the following command from the project's root directory:
```bash
docker-compose down

Caution: docker-compose down will also remove the MongoDB data volume. If you wish to preserve your data, manage volume deletion separately or back up your persistent volume as needed.


## 🐳 About Docker Compose Configuration
The docker-compose.yml file defines the following services:

mongodb: Uses the official mongo:latest image to provide the database service. Host port 27017 is mapped to container port 27017, and data is persisted using the mongodb_data volume.
backend: Built from the Dockerfile in the car-insurance-recommendation-backend-docker directory. Host port 3000 is mapped to container port 3000, and the GOOGLE_API_KEY environment variable is passed. It depends on the mongodb service.

frontend: Built from the Dockerfile in the car-insurance-recommendation-frontend-docker directory. Host port 80 is mapped to container port 80. It depends on the backend service.
