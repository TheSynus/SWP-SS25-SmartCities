# Softwareprojekt SmartCities Sommer Semester 2025
This repository contains the full web application project SmartCities, developed during the Software Project course in the summer semester of 2025. The application consists of a frontend and backend, each packaged in its own Docker container.

## Project Structure

. \
├── SmartCities_Backend/ # Backend source code & Dockerfile \
├── SmartCities_Frontend/ # Frontend source code & Dockerfile \
├── ansible/ # Automation playbook for deployment \
└── .github/workflows/ # CI/CD pipeline using GitHub Actions

## Development
To run the backend locally, use the provided helper script:

```bash
 SmartCities_Backend/restart.sh
```

Additional development instructions can be found in the subdirectories (README.md inside Frontend and Backend).

## Continuous Integration (CI/CD)
GitHub Actions is configured to automatically build container images for both the frontend and backend whenever a release is published. The images are pushed to the GitHub Container Registry (GHCR).

Available container images:

ghcr.io/TheSynus/smartcities-frontend

ghcr.io/TheSynus/smartcities-backend

Each image is tagged with the release version (e.g. v1.0.0) and with latest

## Automated Deployment with Ansible
The ansible/ directory contains a playbook (playbook.yaml) that fully prepares a server (tested with Ubuntu 24.04 LTS) for running the application. It includes tasks for Docker installation, image pulling, and container launch.

To run the playbook:

```bash
 ansible-playbook -i inventory.ini ansible/playbook.yaml
```

## Tested Environment
Ubuntu Server 24.04 LTS \
Ansible 9+ \
Docker 24.x 

# License
?