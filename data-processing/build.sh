#!/bin/bash

ROOT_DIR="data-processing"
SRC_DIR="$ROOT_DIR/src"

# ビルドディレクトリのクリーニング
rm -rf .temp binaries
mkdir -p .temp binaries

# src ディレクトリ内のすべての .py ファイルをビルド
for py_file in $SRC_DIR/*.py; do
    # ファイル名のみを抽出（拡張子なし）
    base_name=$(basename "$py_file" .py)

    # PyInstallerでビルド
    pyinstaller --onefile --distpath .temp/dist --workpath .temp/build --specpath .temp "$py_file"

    # ビルドされたバイナリを binaries ディレクトリに移動
    mv ".temp/dist/$base_name" binaries/
done

# 一時ファイルの削除
rm -rf .temp
