## Overview

The purpose of this project is to showcase the design, deployment, and operation of a **cloud-native application stack** using **Kubernetes** as a local, production-like cloud environment. It demonstrates how modern software systems can be developed, packaged, deployed, and managed using containerization and orchestration technologies, even on a personal machine.

The project provisions a **local Kubernetes cluster** using *k3d* (K3s running in Docker) and deploys a complete application composed of:
- a backend service,
- a web frontend,
- and a MongoDB database,

all managed declaratively through **Helm charts** and exposed externally via **Ingress-based routing**. A **private container registry** is integrated to support local image builds and versioned application updates without relying on external cloud services.

From an educational standpoint, the project highlights key concepts relevant to *Cloud Computing*, *Virtualization and Containers*, and *Automation of Development Processes*, including:
- container-based application packaging,
- service discovery and networking within Kubernetes,
- persistent storage for stateful workloads,
- versioned deployments and upgrades using Helm,
- and ingress-driven traffic management.

By running entirely on a local machine (Windows + WSL2), the project provides a safe and reproducible environment for experimentation while closely mirroring real-world cloud deployment patterns. It serves both as a functional application platform and as a practical learning exercise illustrating how Kubernetes can act as a lightweight, developer-friendly “local cloud”.

---

## Pre-requisities:

### Patch Windows hosts for apps & registry
1. Patch Windows /etc/hosts so cluster local address is resolved:
   1. Open a powershell terminal **by running as Administrator** and navigate to repository location. Example: `cd D:\repos\MIP-kube-server-stack\`
   2. Run the [preparation script](./scripts/00-prepare-windows-hosts.ps1) (will bypass the strict default no scripts policy for Windows 11): 
      ```ps
      powershell -ExecutionPolicy Bypass -File .\scripts\00-prepare-windows-hosts.ps1
      ```
   ---

   > Alternatively, you can open `C:\Windows\System32\drivers\etc\hosts` via Notepad **ran as Administrator** and manually add the following local host entries for the k3d internal registry and app (frontend + api): 
   
   ```
   127.0.0.1 registry.localhost
   127.0.0.1 app.mip.localhost
   ```

## Set-up requirements:

### For Windows:

1.  **WSL2 (Windows Subsystem for Linux)** - Required for running kubectl, Helm, k3d and Docker tooling in a proper Linux environment.

      > Documentation: https://learn.microsoft.com/en-us/windows/wsl/about#what-is-wsl-2

      ```ps
      wsl --install
      ```

2.  **Docker Desktop (+ wsl backend enabled)** - Provides the Docker engine used by k3d.

      > Download & Install from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/).

      > After configuring, test Docker CLI WSL integration is enabled with: `docker info`

### For WSL:

3. **Base linux utilities**

   ```bash
   sudo apt update
   sudo apt install -y ca-certificates curl gnupg
   ```

4. **kubectl** (Kubernetes CLI) - Required for control and interaction with kube clusters

   > Documentation: https://kubernetes.io/docs/reference/kubectl/

   ```bash
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   chmod +x kubectl
   sudo mv kubectl /usr/local/bin/
   kubectl version --client
   ```

5. **Helm** (Kubernetes package manager) - Used to deploy MongoDB, backend, frontend, etc together with their services and other manifests.

   > Documentation: https://helm.sh/

   ```bash
   curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
   helm version
   ```

6. **k3d** (local Kubernetes cluster using Docker) - Creates and runs the local Kubernetes cloud.

   > Documenrtation: https://k3d.io/stable/

   ```bash
   curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
   k3d version
   ```

7. **Node.js** (for building backend & frontend) - Needed if you want to build images locally for the backend/frontend.

   > Easiest method: **`nvm`**

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
   source ~/.bashrc

   nvm install --lts
   node -v
   npm -v
   ```

### Optional:

8. **Git** - For version management, likely already installed:

   ```bash
   sudo apt install -y git
   git -v
   ```

9. **MongoDB Compass** - Official dedicated GUI for managing MongoDB instances, if you don't have the [recomended VSCode extension](./.vscode/extensions.json) for MongoDB, and neither `mongosh` CLI.

   > Install from: [https://www.mongodb.com/products/tools/compass](https://www.mongodb.com/products/tools/compass)

<br>

---

## Application Services and Technology Stack

### Backend Service

The backend is implemented as a **lightweight REST API** built with **Node.js and Express**, designed to expose a simple data model persisted in MongoDB.

**Key characteristics:**
- **Express.js** used as the HTTP server framework
- **Mongoose** used as an Object Data Modeling (ODM) layer for MongoDB
- **OpenAPI (Swagger) specification** used to formally describe the API contract
- **Swagger UI** integrated into the application to provide interactive API documentation
- Stateless service architecture, suitable for horizontal scaling in Kubernetes

The backend is deployed as a Kubernetes `Deployment`, exposed internally via a `Service`, and externally via an `Ingress` path.

---

### Frontend Service

The frontend is a modern **single-page application (SPA)** built using the latest React tooling and ecosystem libraries.

**Key characteristics:**
- **Vite** as the build tool and development server
- **React 19**, including the **React Compiler**, for optimized rendering and developer ergonomics
- Bootstrapped using the official Vite scaffolding tool (`npm create vite`)
- **TanStack Query** used for data fetching, caching, and server-state management
- **Axios** used as the HTTP client for backend communication
- **Material React Table (MRT) v5** used as the primary component and data presentation library

The frontend is packaged as a static site, served from a containerized web server, and exposed through the same Kubernetes Ingress as the backend, enabling clean frontend–backend routing under a single host.

---

## Server flow

This project runs entirely on a **local Kubernetes cluster (k3d + K3s)**, using a **local Docker registry**, **Helm-managed services**, and an ingress-based setup.  
Each step is scripted to keep the environment reproducible, easy to debug, and easy to reset.

---

### 1. Create cluster
> Script: [01-create-cluster.sh](./scripts/01-create-cluster.sh)

This step provisions a local Kubernetes cluster using `k3d`.

**What it does:**
- Ensures `registry.localhost` resolves to `127.0.0.1` inside WSL
- Creates a k3d cluster named `mip-server` with:
  - 1 server (control-plane) node
  - 2 agent (worker) nodes
- Creates and configures a local Docker registry at `registry.localhost:5000`
- Exposes ingress ports:
  - `80` for HTTP
  - `443` for HTTPS
- Switches `kubectl` to the new cluster context
- Verifies cluster readiness by listing nodes

**Purpose:**
- Provides a production-like local Kubernetes environment
- Enables ingress-based access without manual port mapping
- Supports fast local development without external registries

---

### 2. Build and push images to registry
> Script: [02-build-and-push-images.sh](./scripts/02-build-and-push-images.sh)

This step builds the application images and pushes them to the local registry.

**What it does:**
- Builds the backend Docker image from `./backend`
- Builds the frontend Docker image from `./frontend`
- Tags images as:
  `registry.localhost:5000/<image>:<tag>`
- Pushes both images to the local registry

**Purpose:**
- Makes application images available inside the cluster
- Avoids reliance on external image registries
- Keeps the development feedback loop fast

---

### 3. Deploy MongoDB via Helm
> Script: [03-deploy-mongo.sh](./scripts/03-deploy-mongo.sh)

This step deploys MongoDB into Kubernetes using the Bitnami Helm chart.

**What it does:**
- Adds and updates the Bitnami Helm repository
- Installs MongoDB from the official public Bitnami chart via Helm, configuring:
  - Custom username
  - Password
  - Database name
- Waits for the MongoDB deployment to become ready
- Lists MongoDB pods for verification
- Prints:
  - A `kubectl port-forward` command for forwarding mongo service port 27017 to the one from the local machine.
  - A ready-to-use local MongoDB connection string to be used within MongoDB VSCode extension or MongoDB Compass.

**Purpose:**
- Provides a persistent database service in the cluster
- Keeps database lifecycle consistent with the application stack
- Allows optional local debugging via port-forwarding

---

### 4. Deploy apps via Helm
> Script: [04-deploy-apps.sh](./scripts/04-deploy-apps.sh)

This step deploys the backend and frontend applications.

**What it does:**
- Installs or upgrades the `backend` Helm release
- Installs or upgrades the `frontend` Helm release
- Applies the Kubernetes Ingress configuration
- Lists all cluster resources for visibility

**Purpose:**
- Deploys application workloads in a Kubernetes-native way
- Enables repeatable upgrades via Helm
- Exposes services through ingress on ports 80 and 443

---

### 5. Deletion & clean-up
> Script: [05-cleanup.sh](./scripts/05-cleanup.sh)

This step removes all resources created during setup.

**What it does:**
- Uninstalls frontend, backend, and MongoDB Helm releases
- Deletes the `mip-server` k3d cluster
- Uses safe cleanup (`|| true`) to continue even if resources are missing

**Purpose:**
- Fully resets the local environment
- Prevents leftover resources from affecting future runs
- Enables quick teardown and re-creation

---

### Flow summary

1. Create Kubernetes cluster and local registry  
2. Build and publish application images  
3. Deploy MongoDB  
4. Deploy backend and frontend applications  
5. Tear down and clean up everything
