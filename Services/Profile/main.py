from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import psycopg2
from psycopg2.extras import Json
from pgvector.psycopg2 import register_vector
from sklearn.feature_extraction.text import TfidfVectorizer
import uvicorn

# FastAPI app setup
app = FastAPI()

# Database connection setup
DATABASE_URL = "postgresql://admin:root@localhost/main"

# Connect to PostgreSQL and register vector extension
conn = psycopg2.connect(DATABASE_URL)
register_vector(conn)


# Create the table if it doesn't exist
def create_table_if_not_exists():
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE EXTENSION IF NOT EXISTS vector;
            CREATE TABLE IF NOT EXISTS profiles (
                id SERIAL PRIMARY KEY,
                full_name TEXT,
                nickname TEXT,
                gender TEXT,
                age INT,
                date_of_birth DATE,
                place_of_birth TEXT,
                nationality TEXT,
                languages_spoken TEXT[],
                religion TEXT,
                caste TEXT,
                marital_status TEXT,
                current_residence JSONB,
                previous_residence JSONB,
                personal_details JSONB,
                appearance JSONB,
                interests_and_hobbies JSONB,
                social_interactions JSONB,
                work_and_education JSONB,
                important_life_events JSONB,
                embedding vector(300)
            );
        """)
        conn.commit()
        cursor.close()
        print("DEBUG: Table created or already exists.")
    except Exception as e:
        print(f"DEBUG: Error creating table: {e}")


# Call the function to create the table on startup
create_table_if_not_exists()


# Pydantic model for the persona data
class Persona(BaseModel):
    full_name: str
    nickname: str
    gender: str
    age: int
    date_of_birth: str
    place_of_birth: str
    nationality: str
    languages_spoken: List[str]
    religion: str
    caste: str
    marital_status: str
    current_residence: dict
    previous_residence: dict
    personal_details: dict
    appearance: dict
    interests_and_hobbies: dict
    social_interactions: dict
    work_and_education: dict
    important_life_events: List[dict]


# Function to generate vector embeddings from text, ensuring 300 dimensions
def generate_embedding(text: str):
    vectorizer = TfidfVectorizer(stop_words="english")
    embeddings = vectorizer.fit_transform([text])
    dense_vec = embeddings.toarray()[0]
    if len(dense_vec) < 300:
        padded = dense_vec.tolist() + [0.0] * (300 - len(dense_vec))
    else:
        padded = dense_vec.tolist()[:300]
    print("DEBUG: Generated raw vector of length", len(dense_vec), "and padded/truncated to", len(padded))
    return padded


# Endpoint to insert data
@app.post("/profiles/")
async def create_profile(persona: Persona):
    try:
        print("DEBUG: Received persona data:", persona)
        # Generate an embedding based on the full name (extend as needed)
        full_name_embedding = generate_embedding(persona.full_name)
        print("DEBUG: Generated embedding for full_name:", full_name_embedding)

        cursor = conn.cursor()
        query = """
            INSERT INTO profiles (
                full_name, nickname, gender, age, date_of_birth, place_of_birth, nationality,
                languages_spoken, religion, caste, marital_status, current_residence, previous_residence,
                personal_details, appearance, interests_and_hobbies, social_interactions, work_and_education, 
                important_life_events, embedding
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            persona.full_name, persona.nickname, persona.gender, persona.age, persona.date_of_birth,
            persona.place_of_birth, persona.nationality, persona.languages_spoken, persona.religion,
            persona.caste, persona.marital_status, Json(persona.current_residence),
            Json(persona.previous_residence), Json(persona.personal_details), Json(persona.appearance),
            Json(persona.interests_and_hobbies), Json(persona.social_interactions),
            Json(persona.work_and_education), Json(persona.important_life_events), full_name_embedding
        )
        print("DEBUG: Executing insert query with values:", values)
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        print("DEBUG: Profile inserted successfully.")
        return {"message": "Profile created successfully."}
    except Exception as e:
        print("DEBUG: Error in create_profile:", e)
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to retrieve a profile by id
@app.get("/profiles/{profile_id}")
async def get_profile(profile_id: int, include_embeddings: bool = False):
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM profiles WHERE id = %s", (profile_id,))
        profile = cursor.fetchone()
        # Retrieve the column descriptions before closing the cursor
        description = cursor.description
        print("DEBUG: Fetched profile row:", profile)
        print("DEBUG: Cursor description:", description)
        cursor.close()

        if profile is None:
            raise HTTPException(status_code=404, detail="Profile not found")

        column_names = [desc[0] for desc in description]
        profile_dict = dict(zip(column_names, profile))
        print("DEBUG: Profile dictionary after zipping:", profile_dict)

        # Remove embedding if not requested
        if not include_embeddings and 'embedding' in profile_dict:
            print("DEBUG: Removing embedding from response")
            del profile_dict['embedding']
        elif 'embedding' in profile_dict:
            if hasattr(profile_dict['embedding'], 'tolist'):
                profile_dict['embedding'] = profile_dict['embedding'].tolist()
            elif isinstance(profile_dict['embedding'], bytes):
                profile_dict['embedding'] = list(profile_dict['embedding'])

        print("DEBUG: Final profile dictionary to be returned:", profile_dict)
        return profile_dict
    except Exception as e:
        print("DEBUG: Error in get_profile:", e)
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to retrieve all profiles
@app.get("/all-profiles/")
async def get_all_profiles():
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM profiles")
        profiles = cursor.fetchall()
        # Retrieve the column descriptions before closing the cursor
        description = cursor.description
        print("DEBUG: Fetched profiles:", profiles)
        print("DEBUG: Cursor description in get_all_profiles:", description)
        cursor.close()

        if not profiles:
            raise HTTPException(status_code=404, detail="No profiles found")

        column_names = [desc[0] for desc in description]
        profiles_list = []
        for profile in profiles:
            profile_dict = dict(zip(column_names, profile))
            print("DEBUG: Individual profile dictionary:", profile_dict)
            if 'embedding' in profile_dict:
                print("DEBUG: Removing embedding from individual profile dictionary")
                del profile_dict['embedding']
            profiles_list.append(profile_dict)

        print("DEBUG: Final profiles list to be returned:", profiles_list)
        return profiles_list
    except Exception as e:
        print("DEBUG: Error in get_all_profiles:", e)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6040)
