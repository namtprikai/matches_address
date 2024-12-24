#!/bin/bash

DIST_DIR="./dist"
SRC_DIR="./src"

# ビルドディレクトリのクリーニング
rm -rf $DIST_DIR
mkdir -p $DIST_DIR

poetry run pyinstaller --onefile --distpath $DIST_DIR --collect-all chardet --collect-all pandas --collect-all geopandas --collect-all pyogrio --collect-all shapely --add-data "src:src" --paths="$SRC_DIR" --name IF001 ./async_tasks/IF001.py

poetry run pyinstaller --onefile --distpath $DIST_DIR --collect-all japanize_matplotlib --collect-all memory_profiler --collect-all chardet --collect-all pandas --collect-all sklearn --collect-all lightgbm --collect-all numpy --collect-all optuna --collect-all seaborn --collect-all japanize_matplotlib --add-data "src:src" --paths="$SRC_DIR" --name IF002 ./async_tasks/IF002.py

poetry run pyinstaller --onefile --distpath $DIST_DIR --collect-all chardet --collect-all pandas --collect-all geopandas --collect-all shapely --collect-all lightgbm --collect-all numpy --add-data "async_tasks:async_tasks" --add-data "src:src" --paths="$SRC_DIR" --name IF003 ./async_tasks/IF003.py

poetry run pyinstaller --onefile --distpath $DIST_DIR --collect-all chardet --collect-all pandas --collect-all geopandas --collect-all shapely --collect-all fiona --add-data "async_tasks:async_tasks" --add-data "src:src" --paths="$SRC_DIR" --name IF004 ./async_tasks/IF004.py
