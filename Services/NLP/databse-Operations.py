from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import NoResultFound
from main import Story  # Assuming Story model is defined in main.py

# Database Configuration
DATABASE_URL = "postgresql://admin:root@localhost/main"

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def delete_diary_entry_by_id(db: Session, entry_id: int):
    try:
        # Query the diary entry by ID
        entry = db.query(Story).filter(Story.id == entry_id).one()
        # Delete the entry
        db.delete(entry)
        # Commit the transaction
        db.commit()
        print(f"Diary entry with ID {entry_id} has been deleted.")
    except NoResultFound:
        print(f"No diary entry found with ID {entry_id}.")
    except Exception as e:
        db.rollback()
        print(f"An error occurred while deleting the diary entry: {e}")


def delete_stories_database():
    try:
        # Drop all tables in the database
        Story.metadata.drop_all(bind=engine)
        print("All tables in the stories database have been deleted.")
    except Exception as e:
        print(f"An error occurred while deleting the stories database: {e}")


# Example usage
if __name__ == "__main__":
    # Create a new session
    db = SessionLocal()
    try:
        # Delete a diary entry by ID
        delete_diary_entry_by_id(db, 1)
    finally:
        # Close the session
        db.close()

    # Delete the stories database
    delete_stories_database()