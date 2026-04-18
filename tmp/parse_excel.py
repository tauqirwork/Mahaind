import pandas as pd
import json

file_path = "c:\\Users\\tauqi\\Mahaind\\Production Calculator 4.4.xlsm"

try:
    xl = pd.ExcelFile(file_path)
    output = {"sheets": {}}
    for sheet_name in xl.sheet_names:
        df = xl.parse(sheet_name, nrows=10) # Just get top 10 rows to see structure
        output["sheets"][sheet_name] = df.to_dict(orient="records")
    
    with open("c:\\Users\\tauqi\\Mahaind\\tmp\\excel_dump.json", "w") as f:
        json.dump(output, f, default=str)
        
    print("Successfully parsed excel info to excel_dump.json")
except Exception as e:
    print(f"Error reading excel: {e}")
