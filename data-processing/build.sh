#!/bin/bash

# スクリプトがエラーで終了したら、スクリプト全体を終了する
set -e

# パスの変数定義
ROOT_DIR="data-processing"
SRC_DIR="$ROOT_DIR/src"
SCRIPT_NAME="hello.py"
BUILD_DIR="$ROOT_DIR/build"
DIST_DIR="$ROOT_DIR/dist"
SPEC_DIR="$ROOT_DIR/build"

# ビルドのためのクリーンアップ
echo "Cleaning previous builds..."
rm -rf $BUILD_DIR/
rm -rf $DIST_DIR/

# PyInstallerを使ってhello.pyをビルド
echo "Building $SCRIPT_NAME..."
pyinstaller --onefile --distpath $DIST_DIR --workpath $BUILD_DIR --specpath $SPEC_DIR $SRC_DIR/$SCRIPT_NAME

echo "Build completed. The binary can be found in the '$DIST_DIR' directory."
