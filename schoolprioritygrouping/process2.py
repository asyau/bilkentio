import pandas as pd
import numpy as np
import ast

# Load the CSV file
file_path = 'processed_high_schools.csv'  # Replace with actual file path
df = pd.read_csv(file_path, encoding='utf-8')

# Function to fix inconsistent success ranks based on dot position
def fix_ranks(success_ranks_str):
    try:
        ranks = ast.literal_eval(success_ranks_str)
        fixed_ranks = []
        for rank in ranks:
            str_rank = str(rank)
            if '.' in str_rank:
                integer_part, decimal_part = str_rank.split('.')
                if len(integer_part) == 1:  # Example: 9.716 -> 9716
                    corrected_rank = float(str_rank) * 1000
                elif len(integer_part) == 2:  # Example: 12.342 -> 12342
                    corrected_rank = float(str_rank) * 1000
                else:  # Example: 945.0 -> 945 (already correct)
                    corrected_rank = float(str_rank)
            else:
                corrected_rank = float(str_rank)  # No dot, consider it correct
            fixed_ranks.append(corrected_rank)
        return fixed_ranks
    except Exception as e:
        print(f"Error fixing ranks: {e}")
        return []

# Apply the correction function
df['Corrected_Success_Ranks'] = df['Success_Ranks'].apply(fix_ranks)

# Function to calculate the median
def calculate_median(ranks):
    if isinstance(ranks, list) and ranks:
        return np.median(ranks)
    return np.nan

# Calculate median success rate
df['Median_Success_Rate'] = df['Corrected_Success_Ranks'].apply(lambda x: np.mean(x) if x else np.nan)

# Sort by Median_Success_Rate
sorted_df = df.sort_values(by='Median_Success_Rate', ascending=True)

# Reorder columns with corrected ranks visible
columns = ['Median_Success_Rate'] + [col for col in df.columns if col not in ['Median_Success_Rate']]
final_df = sorted_df[columns]

# Save the processed DataFrame to a new CSV file
output_file = 'processed_high_schools_mean.csv'
final_df.to_csv(output_file, index=False, encoding='utf-8')

# Test specific row calculation
test_ranks = [1.935, 2.053, 27.815]
corrected_test_ranks = fix_ranks(str(test_ranks))
calculated_median = np.median(corrected_test_ranks)
print(f"Corrected Ranks: {corrected_test_ranks}, Calculated Median: {calculated_median}")


print(f"Processed data saved to {output_file}")
