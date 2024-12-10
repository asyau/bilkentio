import pandas as pd

# Read the CSV file
df = pd.read_csv('priority_grouped_schools.csv')

# Function to extract city from school name
def extract_city(school_name):
    start = school_name.find('(') + 1
    end = school_name.find(')')
    if start > 0 and end > 0:
        city_district = school_name[start:end]
        city = city_district.split('-')[0].strip()
        return city
    return None

# Extract cities and create a new column
df['City'] = df['High School'].apply(extract_city)

# Clean up the school name to remove the location info in parentheses
df['Name'] = df['High School'].apply(lambda x: x[:x.find('(')].strip() if '(' in x else x)

# Create final dataframe with just the columns we need
final_df = pd.DataFrame({
    'name': df['Name'],
    'city': df['City'],
    'priority_rank': df['Priority_Group']
})

# Save to new CSV
final_df.to_csv('processed_schools.csv', index=False)

print("Processing complete. Data saved to processed_schools.csv") 