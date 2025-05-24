from passlib.context import CryptContext # For password hashing
import enum
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    TIMESTAMP,
    Boolean,
    Enum as SQLEnum, # Alias to avoid conflict with Python's enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func # For server_default=func.now()
from .meta import Base

# Setup passlib
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    hafalan = relationship("Hafalan", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = pwd_context.hash(password)

    def check_password(self, password):
        return pwd_context.verify(password, self.password_hash)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Surah(Base):
    __tablename__ = 'surahs'
    id = Column(Integer, primary_key=True, index=True)
    surah_number = Column(Integer, unique=True, nullable=False, index=True)
    name_arabic = Column(String(100), nullable=False)
    name_english = Column(String(100), nullable=False)
    english_translation = Column(String(100))
    number_of_ayahs = Column(Integer, nullable=False)
    revelation_type = Column(String(20)) # Mecca or Medina

    ayahs = relationship("Ayah", back_populates="surah", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "surah_number": self.surah_number,
            "name_arabic": self.name_arabic,
            "name_english": self.name_english,
            "english_translation": self.english_translation,
            "number_of_ayahs": self.number_of_ayahs,
            "revelation_type": self.revelation_type
        }

class Ayah(Base):
    __tablename__ = 'ayahs'
    id = Column(Integer, primary_key=True, index=True)
    surah_id = Column(Integer, ForeignKey('surahs.id', ondelete="CASCADE"), nullable=False, index=True)
    ayah_number_in_surah = Column(Integer, nullable=False)
    text_uthmani = Column(Text, nullable=False)
    translation_id = Column(Text) # Indonesian translation
    translation_en = Column(Text) # English translation

    surah = relationship("Surah", back_populates="ayahs")
    hafalan_entries = relationship("Hafalan", back_populates="ayah", foreign_keys='[Hafalan.ayah_id]')


    def to_dict(self):
        return {
            "id": self.id,
            "surah_id": self.surah_id,
            "ayah_number_in_surah": self.ayah_number_in_surah,
            "text_uthmani": self.text_uthmani,
            "translation_id": self.translation_id,
            "translation_en": self.translation_en
        }

class HafalanStatusEnum(enum.Enum):
    belum = "belum"
    sedang = "sedang"
    selesai = "selesai"

class Hafalan(Base):
    __tablename__ = 'hafalan'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), nullable=False, index=True)
    surah_name = Column(String(100)) # Can be denormalized or linked to Surah model
    ayah_range = Column(String(50)) # e.g., "1-10" or "5"
    status = Column(SQLEnum(HafalanStatusEnum), default=HafalanStatusEnum.belum, nullable=False)
    catatan = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    last_reviewed_at = Column(TIMESTAMP(timezone=True), nullable=True)
    
    # Optional: Link directly to an Ayah if memorization is per specific ayah
    ayah_id = Column(Integer, ForeignKey('ayahs.id', ondelete="SET NULL"), nullable=True)


    user = relationship("User", back_populates="hafalan")
    ayah = relationship("Ayah", back_populates="hafalan_entries", foreign_keys=[ayah_id])

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "surah_name": self.surah_name,
            "ayah_range": self.ayah_range,
            "status": self.status.value if self.status else None,
            "catatan": self.catatan,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_reviewed_at": self.last_reviewed_at.isoformat() if self.last_reviewed_at else None,
            "ayah_id": self.ayah_id
        }

class Reminder(Base):
    __tablename__ = 'reminders'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), nullable=False, index=True)
    surat = Column(String(100), nullable=False) # Surah name or number
    ayat = Column(String(50), nullable=False) # Ayah range or number
    due_date = Column(TIMESTAMP(timezone=True), nullable=False, index=True)
    is_completed = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reminders")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "surat": self.surat,
            "ayat": self.ayat,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "is_completed": self.is_completed,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

