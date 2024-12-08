import pandas as pd

# Load the data
bilkent_df = pd.read_csv('bilkent_entered.csv')
success_df = pd.read_csv('processed_high_schoolsfin.csv')

# Merge the two files based on the school names
merged_df = pd.merge(success_df, bilkent_df, on='High School', how='left')

# Normalize the number of students entering Bilkent
merged_df['Total Students'] = merged_df['Total Students'].fillna(0)
merged_df['Norm_Bilkent_Entries'] = merged_df['Total Students'] / merged_df['Total Students'].max()




# Calculate the final priority score (lower entries and higher success score are better)
merged_df['Priority_Score'] = (
    merged_df['Success_Score'] - 0.5 * merged_df['Norm_Bilkent_Entries']
)

# Sort by the priority score
final_sorted_df = merged_df.sort_values(by='Priority_Score', ascending=False)

# Save the result to a new CSV file
output_file = 'final_sorted_schools3.csv'
final_sorted_df.to_csv(output_file, index=False, encoding='utf-8')

# Print a summary
print(final_sorted_df[['High School', 'Priority_Score', 'Total Students', 'Success_Score']])
