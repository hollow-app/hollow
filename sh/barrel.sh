for f in *; do
  if [ "$f" = "index.ts" ]; then
    continue
  elif [ -f "$f" ] && [[ "$f" == *.ts ]]; then
    name="${f%.ts}"
    echo "export * from './$name';"
  elif [ -d "$f" ]; then
    echo "export * from './$f';"
  fi
done > "$1"

