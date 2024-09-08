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
FILE="angular.json"
sed -i '41 i\ "externalDependencies": ["jsdom"],' $FILE
ng build
sed -i '41d' $FILE

# Removing previous files
DIR=~/htdocs/typecircle.com

# Check if the directory exists
if [ -d "$DIR" ]; then
    # Check if the directory is empty
    if [ "$(ls -A $DIR)" ]; then
        echo "Removing previous files from typecircle.com..."
        rm -r "$DIR"/*
        echo "Files removed."
    else
        echo "Directory is empty, nothing to remove."
    fi
else
    echo "Directory does not exist."
fi


# Copy files to destination directory
echo "Copying files to typecircle.com ..."
cp -r dist/type-circle/browser/* "$DIR"

# Remove temporary files
echo "Removing temporary files..."
rm -r dist .angular

echo "Deploy completed successfully!"