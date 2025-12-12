#!/usr/bin/env bash
set -e

helm uninstall frontend || true
helm uninstall backend || true
helm uninstall mongo || true
k3d cluster delete mip-server || true
