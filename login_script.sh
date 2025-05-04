#!/bin/bash

# IMPORTANT: Replace with your actual Firebase project's WEB app API key
# Find this in Firebase Console -> Project Settings -> General -> Your apps -> Web app -> Config
API_KEY="AIzaSyBD64PYetcAeT5yP-_08FwtPM2PlsukmEQ"

# Your admin credentials
ADMIN_EMAIL="admin@tu.kielce.pl"
ADMIN_PASSWORD="adminadmin"

# Firebase REST API endpoint for email/password sign-in
REST_API_URL="https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}"

# JSON payload for the request
JSON_PAYLOAD=$(cat <<EOF
{
  "email": "${ADMIN_EMAIL}",
  "password": "${ADMIN_PASSWORD}",
  "returnSecureToken": true
}
EOF
)

echo "Attempting login for: ${ADMIN_EMAIL}"

# Make the POST request using curl
RESPONSE=$(curl -s -X POST \
     -H "Content-Type: application/json" \
     -d "${JSON_PAYLOAD}" \
     --connect-timeout 10 \
     "${REST_API_URL}")

# Check if curl command was successful (exit code 0)
if [ $? -ne 0 ]; then
  echo "Login failed: curl command error."
  read -p "Press [Enter] key to exit..."
  exit 1
fi

# Try parsing with jq if available
if command -v jq &> /dev/null; then
  # jq is available
  echo "jq found. Attempting to parse response..."
  # Try to extract token, redirect jq's own errors
  ID_TOKEN=$(echo "${RESPONSE}" | jq -r '.idToken' 2>/dev/null)
  JQ_EXIT_CODE=$?

  # Check if jq succeeded (exit code 0) AND found a non-empty, non-null token
  if [ ${JQ_EXIT_CODE} -eq 0 ] && [ -n "${ID_TOKEN}" ] && [ "${ID_TOKEN}" != "null" ]; then
    echo "Login Successful! (parsed with jq)"
    echo -e "\nFirebase ID Token:"
    echo "${ID_TOKEN}" # <-- COPY THIS TOKEN
  # Check if jq could parse the response as valid JSON, even if idToken wasn't found correctly
  elif echo "${RESPONSE}" | jq -e '.' > /dev/null 2>&1; then
    echo "Login failed: Response is valid JSON, but idToken might be missing/null or jq failed."
    echo "jq exit code was: ${JQ_EXIT_CODE}"
    echo "Full Response: ${RESPONSE}"
    read -p "Press [Enter] key to exit..."
    exit 1
  else
    # jq failed to parse the response as JSON at all
    echo "Login failed: Could not parse response as JSON using jq."
    echo "Full Response: ${RESPONSE}"
    read -p "Press [Enter] key to exit..."
    exit 1
  fi
else
  # jq not found, fallback to basic string check (less reliable)
  echo "jq not found. Falling back to basic string check..."
  # Check if the response contains the literal string "idToken" and does NOT contain "error"
  if [[ "${RESPONSE}" == *"idToken"* ]] && [[ "${RESPONSE}" != *"error"* ]]; then
    echo "Login Successful! (basic check)"
    echo "WARNING: Could not use jq for reliable token extraction."
    echo "Attempting basic extraction (may be fragile):"
    # Very basic extraction attempt using sed - might break easily
    ID_TOKEN=$(echo "${RESPONSE}" | sed -n 's/.*"idToken": "\(.*\)".*/\1/p' | head -n 1)
    echo -e "\nFirebase ID Token (extracted):"
    echo "${ID_TOKEN}" # <-- COPY THIS TOKEN
  elif [[ "${RESPONSE}" == *"error"* ]]; then
    echo "Login failed: Firebase error detected (basic check)."
    ERROR_MESSAGE=$(echo "${RESPONSE}" | sed -n 's/.*"message": "\(.*\)".*/\1/p')
    echo "Error: ${ERROR_MESSAGE:-Unknown error in response}"
    echo "Full Response: ${RESPONSE}"
    read -p "Press [Enter] key to exit..."
    exit 1
  else
    echo "Login failed: Unexpected response format (basic check)."
    echo "Full Response: ${RESPONSE}"
    read -p "Press [Enter] key to exit..."
    exit 1
  fi
fi

# Keep window open on success
read -p "Press [Enter] key to exit..."
exit 0