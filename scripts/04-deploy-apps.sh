#!/usr/bin/env bash
set -e

# Install backend & frontend via Helm
helm upgrade --install backend ./helm-charts/backend
helm upgrade --install frontend ./helm-charts/frontend

# Apply ingress
kubectl apply -f k8s/ingress.yaml

kubectl get all
