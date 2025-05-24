import argparse
import sys

from pyramid.paster import bootstrap, setup_logging
from sqlalchemy.exc import OperationalError
from sqlalchemy import engine_from_config  # Added to get engine directly

# Import Base from your models' metadata
from ..models.meta import Base
# Import your models if you plan to add seed data
# from ..models.mymodel import User, Surah # etc.


def setup_models(dbsession, engine):  # Added engine parameter
    """
    Create all tables in the database.
    Optionally, add fixtures / seed data here.
    """
    # Create all tables
    Base.metadata.create_all(engine)
    print("Database tables created (if they didn't exist).")

    # Example of adding seed data (optional):
    # if not dbsession.query(User).filter_by(email=\'\'\'admin@example.com\'\'\').first():
    #     admin_user = User(email=\'\'\'admin@example.com\'\'\', password_hash=\'\'\'some_hashed_password\'\'\') # Remember to hash passwords properly
    #     dbsession.add(admin_user)
    #     print("Added seed admin user.")


def parse_args(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument(
        'config_uri',
        help='Configuration file, e.g., development.ini',
    )
    return parser.parse_args(argv[1:])


def main(argv=sys.argv):
    args = parse_args(argv)
    setup_logging(args.config_uri)
    env = bootstrap(args.config_uri)

    # Get the SQLAlchemy engine from the settings
    settings = env['registry'].settings
    engine = engine_from_config(settings, 'sqlalchemy.')

    try:
        with env['request'].tm:
            dbsession = env['request'].dbsession
            # Pass both dbsession and engine to setup_models
            setup_models(dbsession, engine)
    except OperationalError:
        print('''
Pyramid is having a problem using your SQL database.  The problem
might be caused by one of the following things:

1.  You may need to initialize your database tables with `alembic`.
    Check your README.txt for description and try to run it.

2.  Your database server may not be running.  Check that the
    database server referred to by the "sqlalchemy.url" setting in
    your "development.ini" file is running.
            ''')
