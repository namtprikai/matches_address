"""
# E032 地域集計機能
* 町丁字単位等の地域単位での集計を実施。
* 空き家判定データとユーザーがアップロードした地域ポリゴンデータを結合し、地域単位で集計し、新規アセットとして保存する機能を提供する。この際、ポリゴンとポリゴンの交差判定を行い、複数のポリゴンにまたがる場合には建物ポリゴンと交差する面積の割合 が多いポリゴンへ集計されることとする。
"""

import numpy as np
import pandas as pd
import argparse

def func_name(param1, param2):
    """
    explanation 

    Parameters
    ----------
    param1 : int
        text 
    param2 : float, optional
        text

    Returns
    -------
    reponse1 : list of tuples
        text
    response2 : list of tuples
        int

    """

if __name__ == '__main__':
    # path
    parser = argparse.ArgumentParser(description='Output voronoi.')
    parser.add_argument('-i', '--input_path', required=True)
    parser.add_argument('-o', '--output_path', required=True)
    args = parser.parse_args()

    input_path = args.input_path
    output_path = args.output_path
    
    func_name(input_path=input_path, output_path=output_path)