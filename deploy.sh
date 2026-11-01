#!/bin/bash

read -p "Enter version (e.g. dev-1.0.1): " VERSION

if [ -z "$VERSION" ]; then
    echo "❌ Version cannot be empty."
    exit 1
fi

IMAGE="nexus.asteroidea.co/internal-tools/dev-templates/astro-template/react-shadcn-gin-go-template/astro-react-vite-shadcn"

echo ""
echo "🚀 Building and pushing:"
echo "$IMAGE:$VERSION"
echo ""

docker build . \
    -t "$IMAGE:$VERSION" \
    --push