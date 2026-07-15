#!/bin/sh
set -e

echo "Running database migrations..."
npx knex migrate:latest

echo "Running database seeds..."
npx knex seed:run

echo "Starting server..."
exec node server.js
