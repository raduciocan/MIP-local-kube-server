#!/usr/bin/env bash
set -e

helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

helm install mongo bitnami/mongodb \
  --set auth.username=MIP_User \
  --set auth.password=MIP_Pass \
  --set auth.database=MIP_DB

# Wait for the deployment to become ready
kubectl rollout status deployment/mongo-mongodb --timeout=120s
# List pods
kubectl get pods

# Port-forwarding from service/mongo-mongodb:27017 so db is available on localhost
printf "\nPort forward: kubectl port-forward service/mongo-mongodb 27017:27017\n"
# Mongo local connection string
printf "Local connection string: mongodb://MIP_User:MIP_Pass@localhost:27017/MIP_DB?authSource=MIP_DB\n\n"

# Keep script running briefly so user can see output (but not block indefinitely)
sleep 1
