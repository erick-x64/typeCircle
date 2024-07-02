echo "Building the Angular project..."
FILE="angular.json"
sed -i '41 i\ "externalDependencies": ["jsdom"],' $FILE
ng build
sed -i '41d' $FILE