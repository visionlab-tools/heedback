#!/bin/sh
# Inject runtime API_URL into the SPA index.html
sed -i "s|__API_URL__|${API_URL:-}|g" /usr/share/nginx/html/index.html
