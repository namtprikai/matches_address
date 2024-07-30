"""
# E022 空き家分類機能
判定用データをインプットとして建物単位で空き家を確率的に判定するための分類用機械学習アルゴリズム（トレーニング済み）を実行する機能。 
""" 

import os
import pickle
import numpy as np
import pandas as pd
import geopandas as gpd
import glob
import argparse
from sklearn.metrics import accuracy_score, confusion_matrix, precision_score, recall_score, f1_score

# Set pandas display options
pd.set_option('display.max_columns', None)

def setup_directory(base_dir):
    """
    Set up a working directory

    Returns:
    links04_path (str): Path to the created Links04 directory
    """
    # Generate path to Links04 folder in the user's home directory
    links04_path = os.path.join(base_dir, 'Links04')

    # Create Links04 folder if it doesn't already exist
    os.makedirs(links04_path, exist_ok=True)

    # Change the current working directory to the Links04 folder
    os.chdir(links04_path)

    # Return the path to the Links04 directory
    return links04_path

def load_csv(folder_path, file_name, encodings=['utf-8', 'shift_jis', 'cp932']):
    """
    Read a CSV file from the specified folder

    Parameters:
    folder_path (str): Path to the folder containing the CSV file
    file_name (str): Name of the CSV file to be loaded
    encodings (list): List of encodings to try

    Returns:
    DataFrame: DataFrame containing the data from the CSV file

    Raises:
    FileNotFoundError: If the specified file does not exist
    UnicodeDecodeError: If not being able to decode
    """
    # Generate the full file path by joining the folder path and file name, and ensure the path format is correct
    file_path = os.path.join(folder_path, file_name).replace("\\", "/")
    
    # Check if the file exists at the specified path
    if not os.path.isfile(file_path):
        # Raise an error if the file does not exist
        raise FileNotFoundError(f"The file {file_path} does not exist.")
    
    # Read the CSV file into a DataFrame and return it
    for encoding in encodings:
        try:
            return pd.read_csv(file_path, encoding=encoding, low_memory=False)
        except UnicodeDecodeError:
            continue

    raise UnicodeDecodeError(f"Failed to decode the file {file_path} with encodings: {encodings}")

def load_models(directory):
    """
    Load trained models from pickle files in a directory.
    
    Parameters:
    directory (str): Path to the directory containing model files
    
    Returns:
    list: List of loaded trained models
    """
    model_files = glob.glob(os.path.join(directory, '*.pkl'))
    models = []
    for model_file in model_files:
        with open(model_file, 'rb') as f:
            models.append(pickle.load(f))
    return models

def check_features(new_data, required_features, outcome_variable):
    """
    Check if the new data contains all required features and remove extra features

    Parameters:
    new_data (pd.DataFrame): DataFrame containing the new data
    required_features (list): List of required feature names
    outcome_variable: Name of the outcome variable

    Returns:
    tuple: (pd.DataFrame, bool, str) - (Adjusted DataFrame, True if features match, error message if they don't)
    """
    # Ensure 'geometry' is not in the required_features list for the check
    required_features_without_geometry = [feature for feature in required_features if feature != 'geometry']
    all_required_features = required_features_without_geometry + [outcome_variable]

    new_data_features = new_data.columns.tolist()
    missing_features = [feature for feature in all_required_features if feature not in new_data_features]
    extra_features = [feature for feature in new_data_features if feature not in all_required_features and feature != 'geometry']

    if missing_features:
        error_message = "The columns do not match in the data used for training and the data used for forecasting!\n"
        error_message += f"Missing features: {missing_features}\n"
        return new_data, False, error_message

    if extra_features:
        # Remove extra features
        new_data = new_data.drop(columns=extra_features)
        info_message = f"Extra features removed: {extra_features}\n"
        return new_data, True, info_message

    return new_data, True, ""

def predict(models, new_data, required_features, threshold):
    """
    Make predictions using the trained models

    Parameters:
    models (list): List of trained models
    new_data (pd.DataFrame): DataFrame containing the new data
    required_features (list): List of required feature names
    threshold (float): Threshold for binary classification

    Returns:
    tuple: (np.array, np.array) - (Binary predictions, Prediction probabilities)
    """
    X_pred = new_data[required_features]
    test_preds_proba = np.mean([model.predict_proba(X_pred)[:, 1] for model in models], axis=0)
    test_preds = (test_preds_proba >= threshold).astype(int)
    return test_preds, test_preds_proba

def process_and_predict(input_folder, input_file, model_directory, threshold, output_file, required_features, outcome_variable):
    """
    Process input data, make predictions, and save results

    Parameters:
    input_folder (str): Path to the folder containing the input CSV file
    input_file (str): Name of the input CSV file (D901)
    model_directory (str): Path to the directory containing trained model files
    threshold (float): Threshold for binary classification
    output_file (str): Path to save the output CSV file (D902)
    required_features (list): List of required feature names
    outcome_variable (str): Name of the target variable
    progress (gr.Progress, optional): Gradio progress bar

    Returns:
    tuple: (str, str) - (Result message, Path to the output file)
    """
    print("Setting up directory...")  
    setup_directory(os.path.expanduser('~'))

    print("Loading input data...")
    input_data = load_csv(input_folder, input_file)

    # Ensure the 'geometry' column is not included in the prediction input
    geometry_data = input_data['geometry']
    input_data = input_data.drop(columns=['geometry'], errors='ignore')

    input_data["閉栓フラグ_suido_residence"] = input_data["閉栓フラグ_suido_residence"].map({"True": True, "False": False}).astype("boolean")
    
    print("Loading trained models...")
    models = load_models(model_directory)

    print("Checking features...")
    input_data, features_match, message = check_features(input_data, required_features, outcome_variable)
    if not features_match:
        return message, None

    print("Predicting...")
    test_preds, test_preds_proba = predict(models, input_data, required_features, threshold)

    print("Saving results...")
    # Re-add the 'geometry' column to the output if needed
    input_data['geometry'] = geometry_data
    input_data['predicted_label'] = test_preds
    input_data['predicted_probability'] = test_preds_proba
    # Try saving the updated DataFrame to a CSV file with Shift-JIS encoding
    try:
        input_data.to_csv(output_file, index=False, encoding='shift_jis')
    except UnicodeEncodeError:
        # If Shift-JIS fails, use CP932 encoding
        input_data.to_csv(output_file, index=False, encoding='cp932')

    return f"Predictions saved to {output_file}", output_file

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="E022 - 空き家分類機能")
    parser.add_argument("input_file", help="Path to the input CSV file (D901)")
    parser.add_argument("model_directory", help="Path to the directory containing trained model files")
    parser.add_argument("--threshold", type=float, default=0.3, help="Threshold for binary classification (default: 0.3)")
    parser.add_argument("--output_file", default="D902.csv", help="Path to save the output CSV file (default: D902.csv)")
    args = parser.parse_args()

    REQUIRED_FEATURES = [
        '世帯人数', '15歳未満人数', '15歳以上64歳以下人数', '65歳以上人数', '15歳未満構成比', 
        '15歳以上64歳以下構成比', '65歳以上構成比', '男女比', '住定期間', '最大使用水量_suido_residence', 
        '閉栓フラグ_suido_residence', '構造名称_touki_residence', '登記日付_touki_residence' 
    ]
    OUTCOME_VARIABLE = 'akiya_result_cleaned_flag'

    result = process_and_predict(
    os.path.dirname(args.input_file),
    os.path.basename(args.input_file),
    args.model_directory,
    args.threshold,
    args.output_file,
    REQUIRED_FEATURES,
    OUTCOME_VARIABLE
    )
    print(result)