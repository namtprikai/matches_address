#!/bin/bash

TEMP_DIR="./dist/.temp"
DIST_DIR="./dist"

# List of files to build
FILES=(
    "./async_tasks/IF001.py"
    "./async_tasks/IF003.py"
    "./async_tasks/IF004.py"
)

# Generate collect-all options from requirements.txt
COLLECT_ALL_OPTS=()
while IFS= read -r line; do
    package=$(echo "$line" | cut -d'=' -f1)
    COLLECT_ALL_OPTS+=("--collect-all" "$package")
done <requirements.txt

# ビルドディレクトリのクリーニング
rm -rf dist
mkdir -p dist $TEMP_DIR

# Build each file in the list
for py_file in "${FILES[@]}"; do
    # ファイル名のみを抽出（拡張子なし）
    base_name=$(basename "$py_file" .py)

    # I want to run these kind of command
    # pyinstaller --onefile --collect-all chardet --collect-all pandas --collect-all geopandas --collect-all pyogrio --add-data "async_tasks:async_tasks" --add-data "src;src" --paths=./src --name IF001 ./async_tasks/IF001.py

    poetry run pyinstaller --onefile \
        --distpath $DIST_DIR \
        "${COLLECT_ALL_OPTS[@]}" \
        --add-data="async_tasks:async_tasks" \
        --add-data="src:src" \
        --paths="./src" \
        --name "$base_name" \
        "$py_file"

done
