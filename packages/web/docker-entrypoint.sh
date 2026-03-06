#!/bin/sh
# Inject runtime env vars into the SPA index.html
sed -i "s|__API_URL__|${API_URL:-}|g" /usr/share/nginx/html/index.html
sed -i "s|__WIDGET_URL__|${WIDGET_URL:-}|g" /usr/share/nginx/html/index.html
