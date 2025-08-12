# NestJS Redis K8s DevOps Assignment

## Project Description

This project is a simple NestJS application created for a DevOps test assignment. The main goal is to build a full CI/CD pipeline to deploy the application to a Kubernetes cluster. The application has a single GET `/redis` endpoint that checks the connection to a Redis instance and returns its status.

## Design Decisions

- **Modular Design**: The application is structured into modules to separate concerns. The Redis functionality is encapsulated within its own service (`RedisService`), making it reusable and easier to maintain.
- **Configuration Management**: In Kubernetes, configuration is managed using `ConfigMaps` for non-sensitive data and `Secrets` for sensitive data like passwords. The application is configured to consume these resources directly.
- **Dependency Injection**: NestJS's built-in dependency injection is used to manage the dependencies between components, such as injecting the `RedisService` into the `AppService`.

## Kubernetes Architecture

The following diagram illustrates the Kubernetes cluster architecture:

```mermaid
graph TD
    subgraph "Kubernetes Cluster"
        ingress(Ingress) --> app-service(Service)
        app-service --> app-deployment(Deployment)
        app-employment --> redis-service(Service)
        redis-service --> redis-deployment(Deployment)
        app-deployment --> secret(Secret)
    end

    subgraph "CI/CD Pipeline"
        github(GitHub) --> actions(GitHub Actions)
        actions --> docker(Docker Hub)
        actions --> kubernetes(Kubernetes Cluster)
    end

    style app-deployment fill:#cce5ff,stroke:#333,stroke-width:2px
    style redis-deployment fill:#ffcccc,stroke:#333,stroke-width:2px
```

## Deployment Instructions

These instructions guide you through deploying the application to a local or remote Kubernetes cluster.

### Prerequisites

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Set Environment Variables:**
    Export the following environment variables in your shell. These will be used to configure the Kubernetes manifests and log in to your container registry.

    ```bash
    export DOCKER_USERNAME="your-dockerhub-username"
    export DOCKER_PASSWORD="your-dockerhub-password"
    export REDIS_PASSWORD="your-super-secret-redis-password"
    ```

### Step 1: Build and Push the Docker Image

1.  **Log in to Docker Hub:**
    ```bash
    echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
    ```

2.  **Build and push the image:**
    ```bash
    docker build -t $DOCKER_USERNAME/test:latest .
    docker push $DOCKER_USERNAME/test:latest
    ```

### Step 2: Configure and Deploy to Kubernetes

1.  **Update Kubernetes Manifests:**
    The following commands will replace the placeholder values in the Kubernetes manifest files with the environment variables you set earlier. The Redis password will be Base64-encoded as required by Kubernetes Secrets.

    ```bash
    # Update the image in the deployment
    sed -i "s|image: YOUR_DOCKER_REGISTRY/test:latest|image: $DOCKER_USERNAME/test:latest|g" k8s/app.yml

    # Update the Redis password in the secret manifest
    BASE64_REDIS_PASSWORD=$(echo -n $REDIS_PASSWORD | base64)
    sed -i "s/REDIS_PASSWORD: \"\"/REDIS_PASSWORD: $BASE64_REDIS_PASSWORD/g" k8s/secret.yml
    ```

2.  **Apply the manifests to your cluster:**
    ```bash
    kubectl apply -f k8s/
    ```

### Step 3: Verify the Deployment

1.  **Check the status of your pods and services:**
    ```bash
    kubectl get pods
    kubectl get services
    ```
    You should see the `nestjs-app` and `redis` pods in a `Running` state.

2.  **Access the application:**
    Once the application is running, you can access the `/redis` endpoint through the Ingress or by port-forwarding the service:
    ```bash
    kubectl port-forward svc/nestjs-app-service 8080:80
    ```
    Then, open a new terminal and run:
    ```bash
    curl http://localhost:8080/redis
