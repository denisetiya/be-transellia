#!/bin/bash

echo "Running database diagnostic inside Docker container..."

# Execute the diagnostic script inside the running backend container
docker exec transellia-backend node -e "
const { diagnoseDatabase } = require('./dist/debug/database-diagnostic.js');
diagnoseDatabase().catch(console.error);
"