from sqlalchemy import (
    Column,
    Integer,
    Text,
    String,  # Added for VARCHAR type fields
    ForeignKey,
    DateTime,
    Boolean  # Added for boolean fields
)
from sqlalchemy.orm import relationship  # Added for defining relationships
from sqlalchemy.sql import func  # Added for server-side SQL functions like now()

from .meta import Base


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    # name = Column(String(100), nullable=False) # From Login.jsx (registration)
    email = Column(String(120), unique=True, nullable=False, index=True) # From Login.jsx
    password_hash = Column(String(255), nullable=False) # Store hashed passwords
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    hafalan_records = relationship("Hafalan", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<User {self.email}>'


class Surah(Base):
    __tablename__ = 'surahs'
    id = Column(Integer, primary_key=True, index=True) # Internal ID
    surah_number = Column(Integer, unique=True, nullable=False) # As per alquran.cloud
    name_arabic = Column(String(100), nullable=False) # e.g., الفاتحة
    name_english = Column(String(100), nullable=False) # e.g., Al-Fatiha
    english_translation = Column(String(100)) # e.g., The Opening
    number_of_ayahs = Column(Integer, nullable=False)
    revelation_type = Column(String(20))  # E.g., 'Meccan', 'Medinan'

    ayahs = relationship("Ayah", back_populates="surah", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Surah {self.surah_number}: {self.name_english}>'


class Ayah(Base):
    __tablename__ = 'ayahs'
    id = Column(Integer, primary_key=True, index=True) # Internal ID
    surah_id = Column(Integer, ForeignKey('surahs.id'), nullable=False)
    ayah_number_in_surah = Column(Integer, nullable=False) # Verse number within the surah
    # juz_number = Column(Integer) # Optional, can be derived or stored
    # hizb_number = Column(Integer) # Optional
    text_uthmani = Column(Text, nullable=False) # Arabic text
    translation_id = Column(Text) # Indonesian translation from alquran.cloud
    translation_en = Column(Text) # English translation from alquran.cloud
    # audio_url = Column(String(255)) # Optional: link to audio recitation

    surah = relationship("Surah", back_populates="ayahs")
    hafalan_records = relationship("Hafalan", back_populates="ayah", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Ayah Surah {self.surah_id}:{self.ayah_number_in_surah}>'


class Hafalan(Base):
    __tablename__ = 'hafalan' # Matches HafalanForm.jsx logic
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    # Storing surah and ayah numbers directly as per HafalanForm.jsx state
    # If you normalize further, you might link to Ayah.id
    surah_name = Column(String(100)) # As entered in form (e.g., "Al-Fatihah")
    ayah_range = Column(String(50)) # As entered in form (e.g., "1-7" or "5")

    # Alternatively, if you want to link to specific Ayah entries:
    ayah_id = Column(Integer, ForeignKey('ayahs.id'), nullable=True) # Link to a specific ayah if needed

    status = Column(String(50), default='belum')  # 'belum', 'dihafal', 'dilupa' (from HafalanForm)
    catatan = Column(Text, nullable=True) # 'catatan' from HafalanForm
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_reviewed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="hafalan_records")
    ayah = relationship("Ayah", back_populates="hafalan_records") # If using ayah_id

    def __repr__(self):
        return f'<Hafalan User {self.user_id} - {self.surah_name}:{self.ayah_range} [{self.status}]>'


class Reminder(Base):
    __tablename__ = 'reminders' # Matches Reminder.jsx logic
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    surat = Column(String(100), nullable=False) # 'surat' from Reminder.jsx form
    ayat = Column(String(50), nullable=False) # 'ayat' (range) from Reminder.jsx form
    due_date = Column(DateTime(timezone=True), nullable=False) # 'tanggal' from Reminder.jsx form
    # title = Column(String(200), nullable=False) # Alternative if 'surat' is not descriptive enough
    # description = Column(Text, nullable=True) # Alternative for 'ayat'
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # notification_sent = Column(Boolean, default=False) # If you track push notifications

    user = relationship("User", back_populates="reminders")

    def __repr__(self):
        return f'<Reminder User {self.user_id} - {self.surat} {self.ayat} on {self.due_date}>'
