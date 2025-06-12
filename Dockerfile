# Dockerfile for the car-insurance-recommendation-frontend

# Stage 1: Build stage (Building the React application)

# Use the official Node.js image as a base.

FROM node:20-alpine AS builder

# Set the working directory to /app.

WORKDIR /app

# Copy package.json and package-lock.json to the working directory.

# This allows dependency installation to be optimized with Docker caching.

COPY package*.json ./

# Install all dependencies, including devDependencies, which are needed for testing.

RUN npm install

# Copy all application source code to the working directory.

# Files specified in .dockerignore will not be copied.

# This MUST be before running tests, so the test files are present.

COPY . .

# --- DEBUGGING STEP START ---

# List the contents of the /app directory just before `npm test`.

# This will verify that the test files are in the Docker container.
RUN ls -R /app # <-- This debugging line is now in the correct place
# --- DEBUGGING STEP END ---

# Run tests. If tests fail, the build process will stop.
# This ensures that only code that passes tests is built into the image.
RUN npm test # <-- This test command is now in the correct place after `COPY . .`

# Build the React application.
# The build script is defined in vite.config.js.
RUN npm run build

# Stage 2: Runtime stage (Serving static files with Nginx)
# Use the lightweight official Nginx image as a base.
FROM nginx:alpine

# Copy the Nginx configuration file.
# Override the default Nginx configuration and configure it to serve static files for the React app.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build artifacts (dist directory) of the React application generated in the build stage

# to the directory where Nginx will serve files.

COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the port that Nginx will listen on.

# Typically, web servers listen on port 80.

EXPOSE 80

# Start the Nginx server when the container starts.

CMD ["nginx", "-g", "daemon off;"]