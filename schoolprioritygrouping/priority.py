import pandas as pd
from collections import defaultdict

# Function to calculate scores and rank schools
def calculate_scores(data):
    # Aggregate data for each school
    school_scores = defaultdict(lambda: {'Total Graduates': 0, 'Weighted Rank': 0})
    
    for _, row in data.iterrows():
        school = row['High School']
        total_graduates = row['Total']
        success_rank = row['Success Rank']
        
        # Update totals
        school_scores[school]['Total Graduates'] += total_graduates
        school_scores[school]['Weighted Rank'] += total_graduates * success_rank

    # Calculate final score for each school
    result = []
    for school, values in school_scores.items():
        total_graduates = values['Total Graduates']
        weighted_rank = values['Weighted Rank']
        average_rank = weighted_rank / total_graduates  # Lower rank is better
        result.append({
            'High School': school,
            'Average Success Rank': average_rank
        })

    # Convert result to DataFrame and rank schools
    result_df = pd.DataFrame(result)
    result_df['Priority'] = result_df['Average Success Rank'].rank(ascending=True).astype(int)
    result_df.sort_values(by='Priority', inplace=True)
    
    return result_df[['High School', 'Priority']]

# Read the data from the CSV file
file_path = 'high_school_success_combined.csv'  # Replace with your CSV file path
data = pd.read_csv(file_path)

# Ensure correct data types
data['Total'] = pd.to_numeric(data['Total'], errors='coerce')
data['Success Rank'] = pd.to_numeric(data['Success Rank'], errors='coerce')

# Calculate scores and priorities
ranked_schools = calculate_scores(data)

# Display the results and save to a new CSV file
ranked_schools.reset_index(drop=True, inplace=True)
print(ranked_schools)
ranked_schools.to_csv('high_school_priorities.csv', index=False, encoding='utf-8')
print("Ranked high school priorities saved to 'high_school_priorities.csv'.")
