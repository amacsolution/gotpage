#!/bin/bash

# Ścieżka do pliku .env
ENV_FILE=".env.production"

# Sprawdzenie, czy plik .env istnieje
if [ ! -f "$ENV_FILE" ]; then
  echo "Plik .env nie istnieje!"
  exit 1
fi

# Wczytanie zmiennych z pliku .env i dodanie ich do sekretów GitHub
while IFS= read -r line; do
  # Ignorowanie pustych linii i komentarzy
  if [[ ! -z "$line" && "$line" != \#* ]]; then
    # Ekstrakcja zmiennej i jej wartości
    VAR_NAME=$(echo $line | cut -d '=' -f 1)
    VAR_VALUE=$(echo $line | cut -d '=' -f 2-)

    # Dodanie zmiennej do sekretu GitHub
    gh secret set "$VAR_NAME" --body "$VAR_VALUE"
    echo "Dodano sekret: $VAR_NAME"
  fi
done < "$ENV_FILE"
