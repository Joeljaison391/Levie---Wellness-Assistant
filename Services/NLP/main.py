from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import spacy
import stanza
import networkx as nx
import json
import re
import http.client
from typing import Dict, Any
from sentence_transformers import SentenceTransformer
import httpx

# SQLAlchemy imports for PostgreSQL integration
from sqlalchemy import create_engine, Column, Integer, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# ----------------------------
# Database Configuration
# ----------------------------
DATABASE_URL = "postgresql://admin:root@localhost/main"
print("DEBUG: Creating SQLAlchemy engine with DATABASE_URL =", DATABASE_URL)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Updated database model for storing annotated diary entries (stories)
class Story(Base):
    __tablename__ = "stories"
    id = Column(Integer, primary_key=True, index=True)
    diary_text = Column(Text, nullable=False)
    annotated_story = Column(Text, nullable=True)
    personal_data = Column(JSON, nullable=False)
    annotations = Column(JSON)
    ai_enhanced_annotations = Column(JSON)

# For development only: Uncomment to drop and recreate tables if schema changes.
# print("DEBUG: Dropping existing tables (development only) and recreating them")
# Base.metadata.drop_all(bind=engine)
# Base.metadata.create_all(bind=engine)

# Dependency to get a DB session
def get_db():
    db = SessionLocal()
    try:
        print("DEBUG: DB session started")
        yield db
    finally:
        db.close()
        print("DEBUG: DB session closed")

# ----------------------------
# Initialize FastAPI
# ----------------------------
app = FastAPI(title="Diary Annotation API", version="1.1")

origins = [f"http://localhost:{port}" for port in range(5000, 8501)]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("DEBUG: FastAPI app initialized")

# ----------------------------
# Load NLP Models and AI Config
# ----------------------------
print("DEBUG: Loading spaCy model 'en_core_web_sm'")
nlp_spacy = spacy.load("en_core_web_sm")
print("DEBUG: spaCy model loaded")

print("DEBUG: Downloading and initializing stanza English model")
stanza.download("en")
nlp_stanza = stanza.Pipeline(lang="en", processors="tokenize,ner,pos,ner")
print("DEBUG: Stanza model initialized")

print("DEBUG: Loading SentenceTransformer model 'all-MiniLM-L6-v2'")
sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
print("DEBUG: SentenceTransformer model loaded")

# AI Model Configuration
LM_HOST = "localhost"
LM_PORT = 1234
print(f"DEBUG: AI Model configured to use host {LM_HOST} and port {LM_PORT}")

# ----------------------------
# Dictionary for Common Relation Words
# ----------------------------
relation_words = {
    "dad": ["pitaji", "baba", "abba", "appa", "achan"],
    "mom": ["maa", "amma", "mataji", "aai"],
    "brother": ["bhai", "anna", "annan", "ettan"],
    "sister": ["didi", "akka", "chechi", "behan"],
    "uncle": ["chacha", "mama", "kaka", "chittappa"],
    "aunt": ["chachi", "maasi", "kaki", "chithi"],
    "cousin": ["bhaiya", "didi"],
    "teacher": ["guruji", "masterji", "acharya"],
    "friend": ["dost", "mitra", "sakha", "yaar"],
    "grandfather": ["dadaji", "thatha", "ajja", "nana"],
    "grandmother": ["dadiji", "paati", "ajji", "nani"],
    "son": ["beta", "magan", "putra"],
    "daughter": ["beti", "magal", "putri"],
    "husband": ["pati", "kanavan", "bharya"],
    "wife": ["patni", "manaivi", "bharya"]
}

# ----------------------------
# Helper Functions for Relationship Extraction
# ----------------------------
def canonical_kinship(term, relation_words):
    term = term.lower()
    for canonical, synonyms in relation_words.items():
        if term in synonyms:
            return canonical
    return term

def build_kinship_regex():
    print("DEBUG: Building kinship regex")
    patterns = [r"my\s+(?:" + "|".join(synonyms) + r")" for synonyms in relation_words.values()]
    regex = re.compile("(" + "|".join(patterns) + ")", re.IGNORECASE)
    print("DEBUG: Kinship regex compiled:", regex.pattern)
    return regex, relation_words

def build_relationship_graph(personal_data):
    print("DEBUG: Building relationship graph")
    G = nx.DiGraph()
    main_user = personal_data["full_name"].lower()
    G.add_node(main_user, info=personal_data)
    print("DEBUG: Added main user node:", main_user)

    # Add family members
    family = personal_data.get("social_interactions", {}).get("family", {})
    for child_key, child_info in family.items():
        name = child_info["name"].lower()
        relation = f"{child_key}"
        G.add_node(name, info=child_info)
        G.add_edge(main_user, name, relation=relation)
        G.add_edge(name, main_user, relation=f"{relation} of {main_user}")
        print(f"DEBUG: Added family member '{name}' with relation '{relation}'")
        for grandchild in child_info.get("children", []):
            gc_name = grandchild["name"].lower()
            gc_relation = f"grandchild ({child_key})"
            G.add_node(gc_name, info=grandchild)
            G.add_edge(name, gc_name, relation=gc_relation)
            G.add_edge(gc_name, name, relation=f"{gc_relation} of {name}")
            print(f"DEBUG: Added grandchild '{gc_name}' with relation '{gc_relation}' to '{name}'")

    # Add friends
    friends = personal_data.get("social_interactions", {}).get("friends", {}).get("close_friends", [])
    for friend in friends:
        name = friend["name"].lower()
        relation = "friend"
        G.add_node(name, info=friend)
        G.add_edge(main_user, name, relation=relation)
        G.add_edge(name, main_user, relation=f"{relation} of {main_user}")
        print(f"DEBUG: Added friend '{name}' with relation '{relation}'")

    print("DEBUG: Relationship graph built with nodes:", list(G.nodes))
    return G

def find_relationship(G, main_user, target_name):
    target_name = target_name.lower()
    main_user = main_user.lower()
    print(f"DEBUG: Finding relationship from '{main_user}' to '{target_name}'")
    if target_name not in G.nodes:
        print(f"DEBUG: '{target_name}' not found in graph nodes")
        return "Unknown"
    try:
        path = nx.shortest_path(G, source=main_user, target=target_name)
        if len(path) >= 2:
            relation = G.get_edge_data(main_user, path[1])["relation"]
            print(f"DEBUG: Relationship found: {relation}")
            return relation
        else:
            print("DEBUG: Path length less than 2, relationship unknown")
            return "Unknown"
    except nx.NetworkXNoPath:
        print("DEBUG: No path found between nodes")
        return "Unknown"

# ----------------------------
# NLP Extraction Functions
# ----------------------------
def extract_entities(text):
    print("DEBUG: Extracting entities from text")
    doc = nlp_spacy(text)
    persons = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
    print("DEBUG: Persons extracted:", persons)
    stanza_doc = nlp_stanza(text)
    locations = [ent.text for sentence in stanza_doc.sentences for ent in sentence.ents if ent.type in ["GPE", "LOCATION"]]
    print("DEBUG: Locations extracted:", locations)
    return {"persons": persons, "locations": locations}

def resolve_coreferences(text):
    print("DEBUG: Resolving coreferences in text")
    doc = nlp_spacy(text)
    mentions = {token.text.lower(): token.head.text for token in doc if token.dep_ in ("nsubj", "dobj", "pobj")}
    for token in doc:
        if token.pos_ == "PRON" and token.text.lower() in mentions:
            original_token = token.text
            replacement = mentions[token.text.lower()]
            text = text.replace(original_token, replacement)
            print(f"DEBUG: Replaced '{original_token}' with '{replacement}'")
    print("DEBUG: Coreferences resolved. Resulting text:", text)
    return text

# ----------------------------
# Helper to Extract Writer's Signature
# ----------------------------
def extract_writer_name(diary_entry: str) -> str:
    lines = diary_entry.strip().splitlines()
    for line in reversed(lines):
        if line.strip():
            return line.strip()
    return ""

# ----------------------------
# Diary Annotation Pipeline
# ----------------------------
def annotate_diary(diary_entry, personal_data):
    print("DEBUG: Starting diary annotation")
    original_text = diary_entry
    diary_entry = resolve_coreferences(diary_entry)
    writer = extract_writer_name(diary_entry)
    print("DEBUG: Extracted writer name:", writer)

    # Build relationship graph from profile
    G = build_relationship_graph(personal_data)
    annotations = []
    persons = extract_entities(diary_entry)["persons"]
    print("DEBUG: Annotating the following persons:", persons)

    # Determine if the diary is written by a child of the profile using a fuzzy match
    writer_is_child = False
    family = personal_data.get("social_interactions", {}).get("family", {})
    for key, child in family.items():
        child_name = child["name"].lower()
        if writer.lower() in child_name or child_name in writer.lower():
            writer_is_child = True
            break

    for name in persons:
        canonical_name = canonical_kinship(name, relation_words)
        relationship = find_relationship(G, personal_data["full_name"], canonical_name)
        # If the writer is a child and the entity is a common relation word, update accordingly.
        if writer_is_child and canonical_name in ["dad", "mom"]:
            if canonical_name == "dad":
                relationship = "father"
            elif canonical_name == "mom":
                relationship = "mother"
        annotations.append({
            "entity": name,
            "relationship": relationship,
            "context": diary_entry  # For simplicity, using the full text.
        })
        print(f"DEBUG: Annotation added for '{name}' with relationship '{relationship}'")

    annotation_result = {
        "original_text": original_text,
        "annotations": annotations
    }
    print("DEBUG: Diary annotation completed:", json.dumps(annotation_result, indent=2))
    return annotation_result

# ----------------------------
# AI Model Processing with Structured JSON Output
# ----------------------------
def process_with_ai(diary_entry, nlp_annotations):
    print("DEBUG: Processing with AI model using structured JSON output")
    ai_prompt = {
        "model": "amethyst-13b-mistral",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an AI specialized in diary analysis. "
                    "Extract relevant entities and relationships from the diary entry and return a JSON object with two keys: "
                    "'refined_text' (a refined version of the diary entry) and "
                    "'annotations' (a list of annotation objects). Each annotation object should contain 'entity', 'relationship', and 'context' keys."
                )
            },
            {
                "role": "user",
                "content": f"Diary Entry:\n{diary_entry}\n\nNLP Annotations:\n{json.dumps(nlp_annotations, indent=2)}\n\n"
                           "Please produce the JSON output as described."
            }
        ],
        "temperature": 0.5,
        "max_tokens": 4096
    }
    print("DEBUG: AI prompt:", json.dumps(ai_prompt, indent=2))

    conn_ai = http.client.HTTPConnection(LM_HOST, LM_PORT)
    headers = {"Content-Type": "application/json"}
    conn_ai.request("POST", "/v1/chat/completions", json.dumps(ai_prompt), headers)
    res = conn_ai.getresponse()
    response_data = json.loads(res.read().decode("utf-8"))
    print("DEBUG: Raw AI response received:", json.dumps(response_data, indent=2))
    return response_data

def parse_structured_ai_output(ai_response):
    print("DEBUG: Parsing structured AI output")
    try:
        ai_content = ai_response["choices"][0]["message"]["content"]
        if "```" in ai_content:
            parts = ai_content.split("```")
            for part in parts:
                part = part.strip()
                if part.startswith("{") and part.endswith("}"):
                    ai_content = part
                    break
        structured_output = json.loads(ai_content)
        print("DEBUG: Structured AI output parsed successfully")
        return structured_output
    except Exception as e:
        print("DEBUG: Failed to parse AI output as JSON:", e)
        raise Exception(f"Failed to parse AI output as JSON: {e}")

# ----------------------------
# FastAPI Endpoints
# ----------------------------
@app.get("/memory/count")
async def get_memory_count(db: Session = Depends(get_db)):
    print("DEBUG: Fetching total memory count")
    count = db.query(Story).count()
    return {"count": count}

@app.get("/memory/{memory_id}")
async def get_memory(memory_id: int, db: Session = Depends(get_db)):
    print("DEBUG: Fetching memory with ID:", memory_id)
    memory = db.query(Story).filter(Story.id == memory_id).first()
    if memory is None:
        raise HTTPException(status_code=404, detail="Memory not found")
    return memory

# New route: Fetch all stories
@app.get("/stories/")
async def get_all_stories(db: Session = Depends(get_db)):
    print("DEBUG: Fetching all stories")
    stories = db.query(Story).all()
    return stories

@app.post("/annotate/")
async def annotate_diary_entry(data: Dict[str, Any], db: Session = Depends(get_db)):
    print("DEBUG: Received request for diary annotation")
    try:
        diary_entry = data.get("diary_entry")
        personal_id = data.get("personal_id")
        print("DEBUG: diary_entry:", diary_entry)
        print("DEBUG: personal_id:", personal_id)

        if not diary_entry or not personal_id:
            raise HTTPException(status_code=400, detail="Missing diary_entry or personal_id")

        # Fetch personal data from the profile service
        try:
            print("DEBUG: Fetching personal data from profile service")
            async with httpx.AsyncClient() as client:
                response = await client.get(f"http://0.0.0.0:6040/profiles/{personal_id}")
                print("DEBUG: Profile service response status:", response.status_code)
                print("DEBUG: Profile service response text:", response.text)
                if response.status_code != 200:
                    raise HTTPException(status_code=response.status_code, detail="Failed to fetch personal data")
                personal_data = response.json()
                print("DEBUG: Personal data received:", json.dumps(personal_data, indent=2))
        except Exception as ex:
            print("DEBUG: Exception while fetching personal data:", ex)
            raise HTTPException(status_code=500, detail=f"Error fetching personal data: {ex}")

        # Step 1: NLP-Based Annotation (with writer extraction and common relation mapping)
        print("DEBUG: Starting NLP-based annotation")
        nlp_annotations = annotate_diary(diary_entry, personal_data)
        print("DEBUG: NLP-based annotation completed")

        # Step 2: AI-Based Refinement with structured JSON output
        print("DEBUG: Starting AI-based annotation refinement (structured JSON output)")
        ai_response = process_with_ai(diary_entry, nlp_annotations)
        structured_ai_output = parse_structured_ai_output(ai_response)
        refined_text = structured_ai_output.get("refined_text", diary_entry)
        annotations = structured_ai_output.get("annotations", [])

        print("DEBUG: Refined text received:", refined_text)
        print("DEBUG: Annotations received:", json.dumps(annotations, indent=2))

        # Save the refined annotated diary (story) in the database
        story = Story(
            diary_text=diary_entry,
            annotated_story=refined_text,
            personal_data=personal_data,
            annotations=annotations,
            ai_enhanced_annotations=ai_response
        )
        db.add(story)
        db.commit()
        db.refresh(story)
        print("DEBUG: Story saved with ID:", story.id)

        return {
            "story_id": story.id,
            "original_diary_text": diary_entry,
            "annotated_story": refined_text,
            "annotations": annotations,
            "ai_enhanced_annotations": ai_response
        }

    except Exception as e:
        print("DEBUG: Exception occurred:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------
# Run FastAPI (if executed directly)
# ----------------------------
if __name__ == "__main__":
    import uvicorn
    print("DEBUG: Starting FastAPI server on host 0.0.0.0 and port 6060")
    uvicorn.run(app, host="0.0.0.0", port=6060)
