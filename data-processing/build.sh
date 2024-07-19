#!/bin/bash

ROOT_DIR="data-processing"
SRC_DIR="$ROOT_DIR/src"
TEMP_DIR="binaries/.temp"

# ビルドディレクトリのクリーニング
rm -rf binaries
mkdir -p binaries $TEMP_DIR

# src ディレクトリ内のすべての .py ファイルをビルド
for py_file in $SRC_DIR/*.py; do
    # ファイル名のみを抽出（拡張子なし）
    base_name=$(basename "$py_file" .py)

    # PyInstallerでビルド
    pyinstaller --onefile --distpath $TEMP_DIR/dist --workpath $TEMP_DIR/build --specpath $TEMP_DIR "$py_file"

    # ビルドされたバイナリを binaries ディレクトリに移動
    mv "$TEMP_DIR/dist/$base_name" binaries/
done

# 一時ファイルの削除
rm -rf $TEMP_DIR
