#!/usr/bin/env bash
set -euo pipefail

# Get absolute path of this script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Resolve source and destination paths
ICONS_DIR="${SCRIPT_DIR}/icons"
OUTPUT_DIR="${SCRIPT_DIR}/../../../public/map-assets"

# Create output directory if needed
mkdir -p "$OUTPUT_DIR"

# Run spreet using absolute output paths
spreet "$ICONS_DIR" "${OUTPUT_DIR}/sprite"
spreet "$ICONS_DIR" "${OUTPUT_DIR}/sprite@2x" --retina
