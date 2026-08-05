#!/bin/bash
# Build script for Arostech Next.js standalone deployment
# This script ensures static files are properly copied to the standalone directory
# after each build, which is required for Next.js standalone output mode.

set -e

echo "==> Cleaning old build..."
rm -rf .next

echo "==> Building Next.js..."
npx next build

echo "==> Copying static files to standalone directory..."
if [ -d ".next/standalone" ]; then
  cp -r .next/static .next/standalone/.next/static
  echo "    Static files copied successfully."
else
  echo "    WARNING: .next/standalone directory not found. Skipping static copy."
fi

echo "==> Copying public directory to standalone..."
if [ -d ".next/standalone" ] && [ -d "public" ]; then
  cp -r public .next/standalone/public
  echo "    Public directory copied successfully."
fi

echo "==> Build complete!"
