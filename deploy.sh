#!/bin/bash

# deploy.sh used to send build files to the server
set -e

# Get updates from repo
echo "Getting updates from the repository..."
git reset --hard HEAD
git pull

# Update packages from node
echo "Uploading packages from node..."
npm install

# Build the Angular project
echo "Building the Angular project..."
ng build

# Removing previous files
echo "Removing previous files from typecircle.com..."
sudo rm -r /var/www/typecircle.com/*

# Copy files to destination directory
echo "Copying files to typecircle.com ..."
sudo cp -r dist/type-circle/browser/* /var/www/typecircle.com/

# Remove temporary files
echo "Removing temporary files..."
sudo rm -r dist .angular

echo "Deploy completed successfully!"