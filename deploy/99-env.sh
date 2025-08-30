#!/bin/sh
set -e

# Defaults if not set
: "${BASE_URL:=http://localhost:3000}"
: "${APP_NAME:=Video Transcoder}"
: "${DEFAULT_PAGE_SIZE:=20}"

cat > /usr/share/nginx/html/env.js <<EOF
window.__ENV__ = {
  BASE_URL: "${BASE_URL}",
  APP_NAME: "${APP_NAME}",
  DEFAULT_PAGE_SIZE: "${DEFAULT_PAGE_SIZE}"
};