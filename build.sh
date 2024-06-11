#!/bin/bash

# Define the JSON file
FILE="angular.json"

# Add the line "externalDependencies": ["jsdom"] on line 41
sed -i '41 i\ "externalDependencies": ["jsdom"],' $FILE

# Run the build
ng build

# Remove the line "externalDependencies": ["jsdom"]
sed -i '41d' $FILE

# Success message
echo "Build completed and externalDependencies removed."