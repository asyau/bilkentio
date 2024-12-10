import pandas as pd

# Load the data
df = pd.read_csv('processed_high_schools_mean.csv')

# Filter out schools with Total_Instances < 4
df = df[df['Total_Instances'] >= 4]

# Normalize the relevant factors
df['Norm_Median_Success_Rate'] = df['Median_Success_Rate'] / df['Median_Success_Rate'].max()
df['Norm_Instances'] = df['Total_Instances'] / df['Total_Instances'].max()

# Calculate the success score
df['Success_Score'] = (
    -0.5 * df['Norm_Median_Success_Rate']    # Lower rank is better
    + 0.5 * df['Norm_Instances']             # Higher total instances is better
)

# Sort by Success Score
df_sorted = df.sort_values(by='Success_Score', ascending=False)

# Display result
print(df_sorted[['High School', 'Success_Score', 'Total_Instances']])

# Save the processed data to a new CSV file
output_file = 'processed_high_schoolsfin.csv'
df_sorted.to_csv(output_file, index=False, encoding='utf-8')
