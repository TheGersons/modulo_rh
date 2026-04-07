#!/bin/sh
# Ejecutar UNA SOLA VEZ en el servidor para activar los git hooks del proyecto
git config core.hooksPath .githooks
chmod +x .githooks/post-merge
echo "✅ Git hooks activados. Desde ahora, 'git pull' reconstruirá automáticamente los contenedores."
