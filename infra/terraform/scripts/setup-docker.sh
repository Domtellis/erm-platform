#!/bin/bash
# ---
# Description: Standard Cloud-Init script to prepare a fresh Linux VPS for Docker.
# This script runs automatically during the first boot of your cloud server.
# ---

set -e

echo "🚀 Starting DevOps Environment Setup..."

# 1. Update system packages
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get upgrade -y

# 2. Install essential tools
apt-get install -y apt-transport-https ca-certificates curl software-properties-common git jq make netfilter-persistent iptables-persistent

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. Install Docker Compose
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | jq -r '.tag_name')
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 5. Optimization: Set up Docker Log Rotation (Prevent disk fill-up)
cat <<EOF > /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
systemctl restart docker

# 6. Global Networking Sync (Allow Application Ports)
iptables -I INPUT 6 -m state --state NEW -p tcp --match multiport --dports 5180,3000,8080,16686,8025 -j ACCEPT
netfilter-persistent save

echo "✅ Environment Ready! Docker $(docker --version) and Docker Compose installed."
