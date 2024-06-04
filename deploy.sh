#!/bin/bash

# deploy.sh used to send build files to the server

set -e

# Build the Angular project
echo "Building the Angular project..."
ng build

# Copy files to destination directory
echo "Copying files to typecircle.com ..."
sudo cp -r dist/type-circle/browser/* /var/www/typecircle.com/

# Remove temporary files
echo "Removing temporary files..."
sudo rm -r dist .angular

echo "Deploy completed successfully!"