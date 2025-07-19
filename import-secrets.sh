#!/bin/bash

while IFS= read -r line; do
  if [[ "$line" == *=* ]]; then
    key=$(echo "$line" | cut -d= -f1 | xargs)
    value=$(echo "$line" | cut -d= -f2-)
    echo "Dodaję sekret: $key"
    echo "$value" | gh secret set "$key"
  fi
done < .env.production

