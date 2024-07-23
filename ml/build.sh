#!/bin/bash

DEMO_DIR="./src/_demo"
TEMP_DIR="./dist/.temp"

# ビルドディレクトリのクリーニング
rm -rf dist
mkdir -p dist $TEMP_DIR

# src ディレクトリ内のすべての .py ファイルをビルド
for py_file in $DEMO_DIR/*.py; do
    # ファイル名のみを抽出（拡張子なし）
    base_name=$(basename "$py_file" .py)

    # PyInstallerでビルド
    pyinstaller --onefile --distpath $TEMP_DIR/dist --workpath $TEMP_DIR/build --specpath $TEMP_DIR "$py_file"

    # ビルドされたバイナリを binaries ディレクトリに移動
    mv "$TEMP_DIR/dist/$base_name" dist/
done

# 一時ファイルの削除
rm -rf $TEMP_DIR
