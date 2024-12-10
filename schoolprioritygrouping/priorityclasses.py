import pandas as pd

# Load the sorted data
final_sorted_df = pd.read_csv('final_sorted_schools3.csv')

# Calculate group labels
group_labels = list(range(1, 16))

# Assign groups using pandas `qcut` to create 15 equal-sized groups
final_sorted_df['Priority_Group'] = pd.qcut(
    final_sorted_df.index, 
    q=15, 
    labels=group_labels
)


priority_df = final_sorted_df[['High School', 'Priority_Group']]
# Save the updated file
output_file = 'priority_grouped_schools.csv'
priority_df.to_csv(output_file, index=False, encoding='utf-8')

# Print a summary for verification
print(final_sorted_df[['High School', 'Priority_Score', 'Priority_Group']].head(20))