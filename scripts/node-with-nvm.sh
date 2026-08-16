#!/bin/sh

set -eu

# Android StudioのGradleはnvmのPATHを引き継がないため、.nvmrcからNode本体を直接解決する。
script_directory=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_directory=$(dirname "$script_directory")
node_version=$(tr -d '[:space:]' < "$project_directory/.nvmrc")
nvm_directory=${NVM_DIR:-"$HOME/.nvm"}
node_executable="$nvm_directory/versions/node/v$node_version/bin/node"

if [ ! -x "$node_executable" ]; then
  echo "Node.js v$node_version is not installed in $nvm_directory." >&2
  echo "Run 'nvm install' in the project root." >&2
  exit 127
fi

exec "$node_executable" "$@"
