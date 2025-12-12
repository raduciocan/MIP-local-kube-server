#!/usr/bin/env bash
set -e

# Ensure registry.localhost is resolvable inside WSL
if ! grep -qE '^\s*127\.0\.0\.1\s+registry\.localhost\s*$' /etc/hosts; then
  echo "Adding registry.localhost to /etc/hosts (WSL)..."
  echo "127.0.0.1 registry.localhost" | sudo tee -a /etc/hosts >/dev/null
else
  echo "registry.localhost already present in /etc/hosts (WSL)"
fi

# Start docker engine manually (without systemd):
# sudo dockerd > /tmp/dockerd.log 2>&1 &

# Regenerate kubeconfig from k3d:
# k3d kubeconfig get mip-server > ~/.kube/config

k3d cluster create mip-server \
  --servers 1 \
  --agents 2 \
  --registry-create registry.localhost:5000 \
  -p "80:80@loadbalancer" \
  -p "443:443@loadbalancer"

kubectl config use-context k3d-mip-server
kubectl get nodes
