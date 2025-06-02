import factory
from factory.alchemy import SQLAlchemyModelFactory
from faker import Faker

from backend.models.mymodel import User, Hafalan, HafalanStatusEnum, Reminder

fake = Faker()

class BaseFactory(SQLAlchemyModelFactory):
    class Meta:
        abstract = True
        # Session will be set during test setup

class UserFactory(BaseFactory):
    """Factory for creating User objects for testing."""
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f'user_{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')
    password_hash = factory.LazyFunction(lambda: fake.password(length=12))

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        """Override the _create method to properly hash the password if provided"""
        if 'password' in kwargs:
            password = kwargs.pop('password')
            user = model_class(*args, **kwargs)
            user.set_password(password)
            return user
        return super()._create(model_class, *args, **kwargs)

class HafalanFactory(BaseFactory):
    """Factory for creating Hafalan objects for testing."""
    class Meta:
        model = Hafalan
        
    user = factory.SubFactory(UserFactory)
    surah_name = factory.LazyFunction(lambda: fake.random_element(elements=(
        'Al-Fatihah', 'Al-Ikhlas', 'An-Nas', 'Al-Falaq'
    )))
    ayah_range = factory.LazyFunction(lambda: f'{fake.random_int(min=1, max=10)}-{fake.random_int(min=11, max=20)}')
    status = factory.LazyFunction(lambda: fake.random_element(elements=(
        HafalanStatusEnum.not_started, 
        HafalanStatusEnum.in_progress, 
        HafalanStatusEnum.completed
    )))
    last_reviewed = factory.LazyFunction(lambda: fake.date_time_this_year())
    catatan = factory.LazyFunction(lambda: fake.paragraph(nb_sentences=3))
    
class ReminderFactory(BaseFactory):
    """Factory for creating Reminder objects for testing."""
    class Meta:
        model = Reminder
        
    user = factory.SubFactory(UserFactory)
    title = factory.LazyFunction(lambda: fake.sentence())
    time = factory.LazyFunction(lambda: fake.time())
    days = factory.LazyFunction(lambda: fake.random_elements(
        elements=('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        unique=True, length=fake.random_int(min=1, max=7)
    ))
