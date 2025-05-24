from sqlalchemy import (
    Column,
    DateTime,
    Enum,  # For status in Hafalan
    ForeignKey,
    Integer,
    Boolean,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func  # For server_default=func.now()
import enum

from .meta import Base


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=True)  # From Login.jsx (registration), assuming it can be optional or handled
    email = Column(String(120), unique=True, nullable=False, index=True)  # From Login.jsx
    password_hash = Column(String(255), nullable=False)  # To store hashed passwords
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    hafalan_records = relationship("Hafalan", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<User {self.email}>'


class Surah(Base):
    __tablename__ = 'surahs'
    id = Column(Integer, primary_key=True, index=True)  # Internal ID
    surah_number = Column(Integer, unique=True, nullable=False)  # From Quran.jsx (api.alquran.cloud/v1/surah)
    name_arabic = Column(String(100), nullable=False)  # From Quran.jsx (api.alquran.cloud) - e.g., الفاتحة
    name_english = Column(String(100), nullable=False)  # From Quran.jsx (api.alquran.cloud) - e.g., Al-Fatiha
    english_translation = Column(String(100))  # From Quran.jsx (api.alquran.cloud) - e.g., The Opening
    number_of_ayahs = Column(Integer, nullable=False)  # From Quran.jsx (api.alquran.cloud)
    revelation_type = Column(String(20))  # From Quran.jsx (api.alquran.cloud) - E.g., \'Meccan\', \'Medinan\'

    # Relationship
    ayahs = relationship("Ayah", back_populates="surah", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Surah {self.surah_number}: {self.name_english}>'


class Ayah(Base):
    __tablename__ = 'ayahs'
    id = Column(Integer, primary_key=True, index=True)  # Internal ID
    surah_id = Column(Integer, ForeignKey('surahs.id'), nullable=False)
    ayah_number_in_surah = Column(Integer, nullable=False)  # From Quran.jsx (api.alquran.cloud)
    text_uthmani = Column(Text, nullable=False)  # From Quran.jsx (api.alquran.cloud - quran-uthmani)
    translation_id = Column(Text)  # From Quran.jsx (api.alquran.cloud - id.indonesian)
    translation_en = Column(Text)  # From Quran.jsx (api.alquran.cloud - en.sahih)
    # audio_url = Column(String(255)) # Optional: if you plan to store audio links

    # Relationships
    surah = relationship("Surah", back_populates="ayahs")
    hafalan_records = relationship("Hafalan", back_populates="ayah", cascade="all, delete-orphan")  # If linking Hafalan to specific Ayah

    def __repr__(self):
        return f'<Ayah Surah {self.surah_id}:{self.ayah_number_in_surah}>'


# Enum for Hafalan status
class HafalanStatusEnum(enum.Enum):
    belum = "belum"
    dihafal = "dihafal"
    dilupa = "dilupa"


class Hafalan(Base):
    __tablename__ = 'hafalan'  # Matches HafalanForm.jsx
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    # Option 1: Store surah name and ayah range as text (as in HafalanForm.jsx)
    surah_name = Column(String(100), nullable=False)  # From HafalanForm.jsx (state \'surat\')
    ayah_range = Column(String(50), nullable=False)  # From HafalanForm.jsx (state \'ayat\')

    # Option 2: Link to a specific Ayah (if granularity is per-ayah)
    # This might be more complex if hafalan is for a range of ayahs.
    # If choosing this, ensure Ayah model has hafalan_records relationship correctly defined.
    ayah_id = Column(Integer, ForeignKey('ayahs.id'), nullable=True)  # Link to a specific starting ayah if needed

    status = Column(Enum(HafalanStatusEnum), default=HafalanStatusEnum.belum, nullable=False)  # From HafalanForm.jsx (state \'status\')
    catatan = Column(Text, nullable=True)  # From HafalanForm.jsx (state \'catatan\')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_reviewed_at = Column(DateTime(timezone=True), nullable=True)  # Optional: for tracking reviews

    # Relationships
    user = relationship("User", back_populates="hafalan_records")
    ayah = relationship("Ayah", back_populates="hafalan_records")  # If using ayah_id

    def __repr__(self):
        return f'<Hafalan User {self.user_id} - {self.surah_name}:{self.ayah_range} [{self.status.value if self.status else ""}]>'


class Reminder(Base):
    __tablename__ = 'reminders'  # Matches Reminder.jsx
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    surat = Column(String(100), nullable=False)  # From Reminder.jsx (state \'surat\')
    ayat = Column(String(50), nullable=False)  # From Reminder.jsx (state \'ayat\') - can be a range
    due_date = Column(DateTime(timezone=True), nullable=False)  # From Reminder.jsx (state \'tanggal\')
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # notification_sent = Column(Boolean, default=False) # Optional: if tracking push notifications

    # Relationship
    user = relationship("User", back_populates="reminders")

    def __repr__(self):
        return f'<Reminder User {self.user_id} - {self.surat} {self.ayat} on {self.due_date}>'
    
