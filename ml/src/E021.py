"""
# E021 空き家学習機能
判定用データをインプットとして建物単位で空き家を確率的に判定するための分類用機械学習アルゴリズムにてトレーニングモデルを作成し、分類精度を表示する機能。
""" 

import os
import pickle
import time
import warnings
import json

import matplotlib.pyplot as plt
import japanize_matplotlib
import seaborn as sns
import numpy as np
import pandas as pd
import lightgbm as lgb
import optuna

from memory_profiler import profile
from sklearn.metrics import accuracy_score, confusion_matrix, precision_score, recall_score, f1_score
from sklearn.model_selection import KFold, train_test_split

# Set pandas display options
pd.set_option('display.max_columns', None)

# Define constants
CONSTANTS = {
    'model_name' : 'LightGBM',
    'explanatory_variables': [
        'gml_id', '世帯コード', '世帯人数', '15歳未満人数', '15歳以上64歳以下人数', 
        '65歳以上人数', '15歳未満構成比', '15歳以上64歳以下構成比', '65歳以上構成比', '男女比', 
        '住定期間', '水道番号_suido_residence', '最大使用水量_suido_residence', '閉栓フラグ_suido_residence', '構造名称_touki_residence', 
        '登記日付_touki_residence', 'akiya_result_cleaned_flag', 'juki_suido_touki_akiya_flag'
    ],
    'outcome_variable': 'akiya_result_cleaned_flag'
    }

def setup_directory():
    """
    Set up a working directory

    Returns:
    links04_path (str): Path to the created Links04 directory
    """
    # Generate path to Links04 folder in the user's home directory
    links04_path = os.path.join(os.path.expanduser('~'), 'Links04')
    
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

def prepare_learning_data(df):
    """
    Prepare the learning data by selecting specific columns and filtering rows

    Parameters:
    df (DataFrame): The input DataFrame

    Returns:
    learning_data (DataFrame): Prepared learning data
    """
    df["閉栓フラグ_suido_residence"] = df["閉栓フラグ_suido_residence"].map({"True": True, "False": False}).astype("boolean")

    # Add an identifier column to the DataFrame for future merging
    df["gml_id"] = df.index 
    # Prepare the learning data by selecting specific columns and filtering rows
    learning_data = df.copy()
    learning_data = learning_data[CONSTANTS['explanatory_variables']]
    learning_data = learning_data[learning_data['juki_suido_touki_akiya_flag'] == 1]
    learning_data.drop(columns=['juki_suido_touki_akiya_flag'], inplace=True)
    learning_data.reset_index(drop=True, inplace=True)
    return learning_data

### 1. 学習用データとテスト用データに分割 
# - 入力：「D901　家屋単位GISデータ【CSV】」
# - 出力：学習用データ（70%）、テスト用データ（30%）

def split_data(df, params):
    """
    Split the data into training and testing datasets

    Parameters:
    df (DataFrame): DataFrame containing the entire dataset
    params (dict): Dictionary containing various parameters 

    Returns:
    train_df (DataFrame): DataFrame containing the training data
    test_df (DataFrame): DataFrame containing the test data
    """
    # Separate predictor variables (X) and the outcome variable (y)
    X = df.drop(columns = [CONSTANTS['outcome_variable']])
    y = df[CONSTANTS['outcome_variable']]
    
    # Split the data into training and testing datasets
    # stratify = y ensures the outcome variable's distribution is maintained
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=params['test_size'], stratify = y, random_state = 42)
    
    # If undersampling is enabled, adjust the training set
    if params['undersample']:
        # Count the number of positive cases (vacant houses)
        vacant_count = y_train.value_counts()[1]

        # Determine the number of negative cases (non-vacant houses) to match the undersample ratio
        non_vacant_count = int(vacant_count * params['undersample_ratio'])
        
        # Get indices of positive (vacant) and negative (non-vacant) cases
        vacant_indices = y_train[y_train == 1].index
        non_vacant_indices = y_train[y_train == 0].index
        
        # Ensure non_vacant_count does not exceed the available non_vacant_indices
        non_vacant_count = min(non_vacant_count, len(non_vacant_indices))

        # Randomly sample the required number of negative cases
        sampled_non_vacant_indices = non_vacant_indices.to_series().sample(non_vacant_count, random_state=42).index
        
        # Combine the positive and sampled negative indices
        new_indices = vacant_indices.union(sampled_non_vacant_indices)
        
        # Subset the training data to the new indices
        X_train = X_train.loc[new_indices]
        y_train = y_train.loc[new_indices]
    
    # Combine predictor variables and the outcome variable back into the training and testing DataFrames
    train_df = X_train.copy()
    train_df[CONSTANTS['outcome_variable']] = y_train
    test_df = X_test.copy()
    test_df[CONSTANTS['outcome_variable']] = y_test

    # Return the training and testing DataFrames
    return train_df, test_df

### 2. 機械学習モデル（アルゴリズム：LightGBM）の構築
# - 入力：「1. 学習用データとテスト用データに分割」で作成した学習用データ（70%）
# - 出力：「D014　学習済みモデル【pkl】」

@profile
def train_lgb_with_optuna(train_df, params):
    """
    Train LightGBM models with K-Fold cross-validation and Optuna for hyperparameter tuning 
   
    Parameters:
    train_df (DataFrame): DataFrame containing the training data
    params (dict): Dictionary containing various parameters 

    Returns:
    lgbm_models (list): List of trained LightGBM models
    oof_pred (ndarray): Out-of-fold predictions
    feature_importances_dict_train (dict): Dictionary containing feature importances for training data
    """
    # Start total time measurement
    start_total_time = time.time()  

    # Split the training data into features (X) and target labels (y)
    id_train = train_df.copy()
    X_train = train_df.drop(columns=[CONSTANTS['outcome_variable'], 'gml_id', '世帯コード', '水道番号_suido_residence'])
    y_train = train_df[CONSTANTS['outcome_variable']]
    
    # Calculate the ratio of positive to negatice samples for adjusting class weights
    pos_weight = (y_train == 0).sum() / (y_train == 1).sum()

    # Initialize K-Fold cross-validation
    kf = KFold(n_splits=params['n_splits'], shuffle=True, random_state=42)
    
    # Define Optuna objective function for hyperparameter optimization
    def objective(trial):
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", category=FutureWarning)
            
            lgb_params = {
                'objective': 'binary',
                'lambda_l1': trial.suggest_loguniform('lambda_l1', 1e-10, 10.0),
                'lambda_l2': trial.suggest_loguniform('lambda_l2', 1e-10, 10.0),
                'num_leaves': trial.suggest_int('num_leaves', 2, 256),
                'feature_fraction': trial.suggest_uniform('feature_fraction', 0.5, 1.0),
                'bagging_fraction': trial.suggest_uniform('bagging_fraction', 0.5, 1.0),
                'bagging_freq': trial.suggest_int('bagging_freq', 0, 10),
                'min_data_in_leaf': trial.suggest_int('min_data_in_leaf', 1, 50),
                'random_state': 42,
                'verbosity': -1,
                'scale_pos_weight': pos_weight
            }
            
        # Perform cross-validation with these parameters
        accuracy_list = []
        for fold, (train_index, val_index) in enumerate(kf.split(X_train)):
            # Split data into training and validation sets for this fold
            X_tr, X_val = X_train.iloc[train_index], X_train.iloc[val_index]
            y_tr, y_val = y_train.iloc[train_index], y_train.iloc[val_index]
                
            # Train the model
            model = lgb.LGBMClassifier(**lgb_params)
            model.fit(X_tr, y_tr, eval_set=[(X_val, y_val)])
                
            # Make predictions on the validation set
            preds = model.predict(X_val)

            # Calculate accuracy
            accuracy = accuracy_score(y_val, preds)
            accuracy_list.append(accuracy)
            
        # Return the mean accuracy across all folds
        return np.mean(accuracy_list)
    
    # Set the initial best parameters
    best_params = {
        'random_state': 42,
        'objective': 'binary',
        'verbose': -1,
        'scale_pos_weight': pos_weight
    }
     
    # Run Optuna optimization if hyperparameter tuning is enabled
    if params['hyperparameter_flag']:
        study = optuna.create_study(direction='maximize')
        study.optimize(objective, n_trials=params['n_trials'])
        # Get the best hyperparameters
        best_params = study.best_params
    else:
        # Use default hyperparameters
        best_params = ({
            'lambda_l1': params['lambda_l1'],
            'lambda_l2': params['lambda_l2'],
            'num_leaves': params['num_leaves'],
            'feature_fraction': params['feature_fraction'],
            'bagging_fraction': params['bagging_fraction'],
            'bagging_freq': params['bagging_freq'],
            'min_data_in_leaf': params['min_data_in_leaf'],
        })

    # Print the best hyperparameters
    print("Best Hyperparameters:", best_params)
    
    # List to store trained models
    lgbm_models = []
    # Array to store out-of-fold predictions
    oof_pred = np.zeros(len(X_train))
    # Make an empty dataframe to store future importances
    df_feature_importances = pd.DataFrame()
    
    # Perform K-Fold cross-validation
    for fold, (train_index, val_index) in enumerate(kf.split(X_train)):
        # Split data into training and validation sets for this fold
        id_tr, id_val = id_train.iloc[train_index], id_train.iloc[val_index]
        X_tr, X_val = X_train.iloc[train_index], X_train.iloc[val_index]
        y_tr, y_val = y_train.iloc[train_index], y_train.iloc[val_index]
        
        # Train the model with the best hyperparameters
        model = lgb.LGBMClassifier(**best_params)
        model.fit(X_tr, y_tr, eval_set=[(X_val, y_val)])

        # Calculate feature importances
        feature_importances = pd.DataFrame({
            "feature": X_tr.columns,
            "importance": model.feature_importances_,
            "fold": fold
        })

        # Append feature importances of the current fold to the DataFrame
        df_feature_importances = pd.concat([df_feature_importances, feature_importances], axis=0)

        # Make predictions on the validation set
        preds_proba = model.predict_proba(X_val)[:, 1]
        preds = (preds_proba >= params['threshold']).astype(int)
        oof_pred[val_index] = preds
        
        # Calculate confusion matrix
        cm = confusion_matrix(y_val, preds)
   
        # Calculate specificity
        tn, fp, fn, tp = cm.ravel()
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0

        # Print metrics for the current fold
        print(f"Model: LightGBM, Fold: {fold + 1}")
        print(f"Confusion Matrix:\n{cm}")
        print(f"Accuracy: {accuracy_score(y_val, preds)}")
        print(f"Precision: {precision_score(y_val, preds, zero_division=1)}")
        print(f"Recall: {recall_score(y_val, preds, zero_division=1)}")
        print(f"F1 Score: {f1_score(y_val, preds, zero_division=1)}")
        print(f"Specificity: {specificity}")

        # Append the trained model to the list
        lgbm_models.append(model)
    
    # End time for total training
    end_total_time = time.time()
    total_time = end_total_time - start_total_time
    print(f"Total training time: {total_time:.2f} seconds")

    mean_feature_importances = df_feature_importances.groupby("feature")["importance"].mean().reset_index()
    mean_feature_importances = mean_feature_importances.sort_values(by="importance", ascending=False)
    feature_importances_dict_train = mean_feature_importances.to_dict(orient='records')

    # Directory to save models
    output_file_path = './models'
    os.makedirs(output_file_path, exist_ok=True)
    # Save each trained model to a file
    for i, model in enumerate(lgbm_models):
        model_file = os.path.join(output_file_path, f'{CONSTANTS["model_name"]}_model_fold_{i+1}.pkl')
        with open(model_file, 'wb') as f:
            pickle.dump(model, f)
    
    # Return the trained models, out-of-fold predictions, and feature importances for training data
    return lgbm_models, oof_pred, feature_importances_dict_train 

### 3. 精度検証
# - 入力：テスト用データ
# - 出力：「D902　空き家判定結果データ【CSV】」

def evaluate_models_on_test(test_df, models, params):
    """
    # Evaluate the models on the test set

    Parameters:
    test_df (DataFrame): DataFrame containing the test data
    models (list): List of trained models
    params (dict): Dictionary containing various parameters 

    Returns:
    pred (DataFrame): DataFrame containing the prediction results
    score_dict (dict): Dictionary containing evaluation metrics
    """
    # Extract identifier column from test data
    id_test = test_df[["gml_id"]]
    # Add a flag to identify test data
    id_test["test_flg"] = 1
    # Create a feature matrix by dropping non-feature columns
    X_test = test_df.drop(columns=[CONSTANTS['outcome_variable'], 'gml_id', '世帯コード', '水道番号_suido_residence'])
    # Extract true labels
    y_test = test_df[CONSTANTS['outcome_variable']]

    # Create an empty dictionary to store accuracy and feature importance information
    score_dict = {}
    
    # Initialize an array to store the average prediction probabilities
    test_preds_proba = np.zeros(len(X_test))
    
    # Initialize a DataFrame to store feature importances
    feature_importances = pd.DataFrame()

    # Accumulate the prediction probabilities from each model
    for i, model in enumerate(models):
        test_preds_proba += model.predict_proba(X_test)[:, 1]

        # Calculate feature importances for this model
        importances = pd.DataFrame({
            'feature': X_test.columns,
            'importance': model.feature_importances_,
            'fold': i
        })
        feature_importances = pd.concat([feature_importances, importances], axis=0)
    
    # Calculate the average prediction probabilities
    test_preds_proba /= len(models)
    # Generate binary predictions using the threshold
    test_preds = (test_preds_proba >= params['threshold']).astype(int)
    
    # Create a DataFrame by combining the prediction results
    pred = pd.concat([
        id_test,
        pd.DataFrame({"pred": test_preds}),
        pd.DataFrame({"pred_proba": test_preds_proba}),
    ], axis=1)

    # Calculate evaluation metrics
    cm = confusion_matrix(y_test, test_preds)
    
    # Extract elements from the confusion matrix and calculate specificity
    tn, fp, fn, tp = cm.ravel()
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
    
    # Store evaluation metrics in a dictionary
    score_dict = {
        "cm": cm.tolist(),
        "tn": tn, "fp": fp, "fn": fn, "tp": tp,
        "accuracy": accuracy_score(y_test, test_preds),
        "precision": precision_score(y_test, test_preds, zero_division=1),
        "recall": recall_score(y_test, test_preds, zero_division=1),
        "f1": f1_score(y_test, test_preds, zero_division=1),
        "specificity": specificity
    }

    # Print metrics for the test data
    print("Test Data Evaluation:")
    print(f"Confusion Matrix: {score_dict['cm']}")
    print(f"Accuracy: {score_dict['accuracy']}")
    print(f"Precision: {score_dict['precision']}")
    print(f"Recall: {score_dict['recall']}")
    print(f"F1 Score: {score_dict['f1']}")
    print(f"Specificity: {score_dict['specificity']}")

    # Calculate mean feature importances across all folds
    mean_feature_importances = feature_importances.groupby("feature")["importance"].mean().reset_index()
    mean_feature_importances = mean_feature_importances.sort_values(by="importance", ascending=False)
    feature_importances_dict_test = mean_feature_importances.to_dict(orient='records')

    # Plot feature importances
    plt.figure(figsize=(10, 8))
    sns.barplot(x="importance", y="feature", data=mean_feature_importances)
    plt.title("Feature Importances")  
    plt.xlabel("Importance")   
    plt.ylabel("Feature")     

    plt.tight_layout()
    feature_importance_plot = "feature_importances.png"
    plt.savefig(feature_importance_plot)
    plt.show()

    # Print feature importances
    print("Feature Importances:")
    print(mean_feature_importances)
    
    # Add the predicted labels to the test set
    test_df['predicted_label'] = test_preds
    
    # Return prediction results, evaluation metrics, and feature importances
    return pred, score_dict, feature_importances_dict_test, feature_importance_plot

def merge_and_save_results(df, pred, output_file):
    """
    Merge prediction results with the original DataFrame and save the results

    Parameters:
    df (pd.DataFrame): Original DataFrame
    pred (pd.DataFrame): DataFrame containing prediction results
    output_file (str): Path to the CSV file where results will be saved

    Returns:
    pd.DataFrame: Updated DataFrame with merged results
    """
    # Merge the predictions with the original DataFrame using the identifier column (gml_id)
    merged_df = pd.merge(df, pred, on='gml_id', how='left')

    # Set the test_flg: 1 for test data, 0 for non-test data
    merged_df.loc[merged_df['test_flg'] != 1, 'test_flg'] = 0
    
    # Try saving the updated DataFrame to a CSV file with Shift-JIS encoding
    try:
        merged_df.to_csv(output_file, index=False, encoding='shift_jis')
    except UnicodeEncodeError:
        # If Shift-JIS fails, use CP932 encoding
        merged_df.to_csv(output_file, index=False, encoding='cp932')

    # Return the updated DataFrame
    return merged_df

def save_metrics_and_importances(score_dict, feature_importances_dict_train, feature_importances_dict_test):
    """
    Save evaluation metrics and feature importances to JSON files

    Parameters:
    score_dict (dict): Dictionary containing evaluation metrics
    feature_importances_dict_train (dict): Dictionary containing feature importances from training
    feature_importances_dict_test (dict): Dictionary containing feature importances from testing

    Returns:
    None
    """
    # Create a 'data' directory if it doesn't exist
    os.makedirs('./data', exist_ok=True)

    # Save evaluation metrics to a JSON file
    with open('./data/score_dict.json', 'w') as f:
        # Convert any np.int64 types in the score dictionary to regular int types for JSON serialization
        json.dump({k: int(v) if isinstance(v, np.int64) else v for k, v in score_dict.items()}, f)
    
    # Save feature importances from training to a JSON file
    with open('./data/feature_importances_dict_train.json', 'w') as f:
        json.dump(feature_importances_dict_train, f)

    # Save feature importances from testing to a JSON file
    with open('./data/feature_importances_dict_test.json', 'w') as f:
        json.dump(feature_importances_dict_test, f)

def main(folder_path, file_name, test_size, n_splits, undersample, undersample_ratio, threshold, hyperparameter_flag, n_trials, lambda_l1, lambda_l2, num_leaves, feature_fraction, bagging_fraction, bagging_freq, min_data_in_leaf):
    setup_directory()
    
    df = load_csv(folder_path, file_name)
    learning_data = prepare_learning_data(df)
    
    params = {
        'test_size': float(test_size),
        'n_splits': int(n_splits),
        'undersample': bool(undersample),
        'undersample_ratio': float(undersample_ratio),
        'threshold': float(threshold),
        'hyperparameter_flag': bool(hyperparameter_flag),
        'n_trials': int(n_trials),
        'lambda_l1': float(lambda_l1),
        'lambda_l2': float(lambda_l2),
        'num_leaves': int(num_leaves),
        'feature_fraction': float(feature_fraction),
        'bagging_fraction': float(bagging_fraction),
        'bagging_freq': int(bagging_freq),
        'min_data_in_leaf': int(min_data_in_leaf),
    }
    
    print("Splitting data...")
    train_df, test_df = split_data(learning_data, params)
    
    print("Training models...")
    lgbm_models, oof_pred, feature_importances_dict_train = train_lgb_with_optuna(train_df, params)
    
    print("Evaluating models on test data...")
    pred, score_dict, feature_importances_dict_test, feature_importance_plot = evaluate_models_on_test(test_df, lgbm_models, params)
    
    print("Merging and saving results...")
    merged_df = merge_and_save_results(df, pred, './data/D902_akiya判定結果データ.csv')
    
    print("Saving metrics and importances...")
    save_metrics_and_importances(score_dict, feature_importances_dict_train, feature_importances_dict_test)
    
    print("Training and evaluation completed!")
    
    return merged_df, score_dict, feature_importances_dict_train, feature_importances_dict_test, feature_importance_plot

if __name__ == "__main__":
    folder_path = "path/to/your/folder"
    file_name = "your_file.csv"
    test_size = 0.2
    n_splits = 5
    undersample = True
    undersample_ratio = 1.0
    threshold = 0.5
    hyperparameter_flag = True
    n_trials = 100
    lambda_l1 = 1e-8
    lambda_l2 = 1e-8
    num_leaves = 31
    feature_fraction = 0.9
    bagging_fraction = 0.8
    bagging_freq = 5
    min_data_in_leaf = 20
    
    main(folder_path, file_name, test_size, n_splits, undersample, undersample_ratio, threshold, hyperparameter_flag, n_trials, lambda_l1, lambda_l2, num_leaves, feature_fraction, bagging_fraction, bagging_freq, min_data_in_leaf)