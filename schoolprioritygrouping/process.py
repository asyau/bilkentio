

import pandas as pd

# Load the CSV file
file_path = 'high_school_success_combined.csv'  # Replace this with the actual file path
df = pd.read_csv(file_path, encoding='utf-8')

# Strip extra spaces from column names
df.columns = df.columns.str.strip()

# Remove rows that start with "Toplam"
df_filtered = df[~df['High School'].str.startswith("Toplam")]

# Group by school, count occurrences, and aggregate success ranks
df_grouped = df_filtered.groupby('High School').agg(
    Total_Instances=('High School', 'count'),
    Success_Ranks=('Success Rank', list)
).reset_index()

# Sort by total instances and average success rank
df_grouped = df_grouped.sort_values(by=['Total_Instances'], ascending=False)

# Save the processed data to a new CSV file
output_file = 'processed_high_schools.csv'
df_grouped.to_csv(output_file, index=False, encoding='utf-8')

print(f"Processed data saved to {output_file}")
