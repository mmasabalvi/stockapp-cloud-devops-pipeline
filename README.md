# StockApp Cloud DevOps Pipeline

This project deploys a three-tier stock prediction application to AWS using Docker, Terraform, Ansible, Kubernetes, and ArgoCD.

## Application Architecture

The application has three services:

- `frontend`: static HTML/CSS/JS served by Nginx
- `backend`: Flask API for stock history and prediction
- `database`: MySQL database initialized with stock price data

Runtime flow:

```text
User browser
  -> frontend service
  -> backend Flask API
  -> MySQL database
```

## DevOps Architecture

Infrastructure and deployment flow:

```text
Terraform
  -> creates AWS EC2, VPC, subnet, route table, security group

Ansible
  -> installs Docker, kubectl, kind
  -> creates a local Kubernetes cluster on EC2

Kubernetes
  -> runs frontend, backend, and database pods
  -> exposes frontend/backend using Services
  -> stores MySQL data using a PVC

ArgoCD
  -> watches the GitHub repository
  -> syncs manifests from the k8s/ folder into the cluster
```

## Project Structure

```text
backend/       Flask backend service
frontend/      Nginx frontend service
database/      MySQL Docker image and init.sql
k8s/           Kubernetes manifests
terraform/     AWS infrastructure code
ansible/       EC2 configuration playbook and inventory
argocd/        ArgoCD Application manifest
.github/       GitHub Actions workflow folder
```

## What Was Implemented

1. Dockerized all services:
   - backend
   - frontend
   - database

2. Created Kubernetes manifests:
   - namespace
   - MySQL Secret
   - MySQL PVC
   - frontend Deployment and Service
   - backend Deployment and Service
   - database Deployment and Service

3. Created AWS infrastructure with Terraform:
   - VPC
   - public subnet
   - internet gateway
   - route table
   - security group
   - Ubuntu EC2 instance

4. Configured EC2 with Ansible:
   - Docker
   - kubectl
   - kind
   - local Kubernetes cluster

5. Installed and configured ArgoCD:
   - ArgoCD runs inside the Kubernetes cluster
   - ArgoCD watches this repo
   - ArgoCD syncs the `k8s/` folder

## Local Docker Test

Create a `.env` file locally:

```env
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=stockdb
MYSQL_USER=stockuser
MYSQL_PASSWORD=stockpass
DOCKERHUB_USER=mmasabalvi
IMAGE_TAG=latest
```

Run:

```powershell
docker compose up --build
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:5000
```

## Terraform Commands

From the `terraform/` folder:

```powershell
terraform init
terraform plan
terraform apply
```

To destroy infrastructure after the demo:

```powershell
terraform destroy
```

## Ansible Commands

Run from WSL:

```bash
ansible -i ansible/inventory.ini k8s_host -m ping
ansible-playbook -i ansible/inventory.ini ansible/setup-k8s.yml
```

## Demo Resume Checklist

If resuming the project for demo, follow this checklist.

### 1. Get Current EC2 Public IP

If the EC2 instance was stopped and started again, its public IP may change.

```powershell
aws ec2 describe-instances --instance-ids i-0a69b993e3733c3b1 --region us-east-1 --query "Reservations[0].Instances[0].PublicIpAddress" --output text
```

Update `ansible/inventory.ini` if the IP changed.

Also update `frontend/src/app.js` if the frontend API URL changed:

```js
const API_BASE = "http://EC2_PUBLIC_IP:30050";
```

Then rebuild and push the frontend image.

### 2. SSH Into EC2

From WSL:

```bash
ssh -i ~/.ssh/stockapp-key.pem ubuntu@EC2_PUBLIC_IP
```

### 3. Check Kubernetes

On EC2:

```bash
kubectl get nodes
kubectl get pods -A
kubectl get pods -n stockapp
```

Expected app pods:

```text
backend    1/1 Running
database   1/1 Running
frontend   1/1 Running
```

### 4. Restart Port Forwards

Because this cluster uses kind, external access is provided using port-forward commands:

```bash
nohup kubectl port-forward svc/frontend -n stockapp 30080:80 --address 0.0.0.0 > frontend-portforward.log 2>&1 &
nohup kubectl port-forward svc/backend -n stockapp 30050:5000 --address 0.0.0.0 > backend-portforward.log 2>&1 &
```

Check:

```bash
ps aux | grep port-forward
```

### 5. Test Backend

```bash
curl http://localhost:30050/
curl http://localhost:30050/history/AAPL
curl http://localhost:30050/predict/AAPL
```

### 6. Open App

Frontend:

```text
http://EC2_PUBLIC_IP:30080
```

Backend:

```text
http://EC2_PUBLIC_IP:30050
```

### 7. Open ArgoCD

Start ArgoCD port-forward:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443 --address 0.0.0.0
```

Open:

```text
https://EC2_PUBLIC_IP:8080
```

Username:

```text
admin
```

Retrieve the password safely on EC2:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
echo
```

Do not commit ArgoCD passwords, AWS keys, `.pem` files, `.env` files, or Terraform state files to GitHub.

## Useful Kubernetes Commands

```bash
kubectl get all -n stockapp
kubectl logs deployment/backend -n stockapp --tail=80
kubectl logs deployment/database -n stockapp --tail=80
kubectl rollout restart deployment/backend -n stockapp
kubectl rollout restart deployment/frontend -n stockapp
kubectl rollout restart deployment/database -n stockapp
```

## Current Notes

- The app is running on a single EC2 instance using kind.
- A 2 GB swap file was added on EC2 because `t3.small` has limited RAM.
- Docker images are pushed to Docker Hub under `mmasabalvi`.
- GitHub Actions CI is planned as the next step to automate image builds and pushes.
mrpY0saB6FIOqQa8