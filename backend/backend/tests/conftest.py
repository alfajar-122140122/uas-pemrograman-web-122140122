import alembic
import alembic.config
import alembic.command
import os
from pyramid.paster import get_appsettings
from pyramid.scripting import prepare
from pyramid.testing import DummyRequest, testConfig
import pytest
import transaction
import webtest

from backend import main
from backend import models
from backend.models.meta import Base


def pytest_addoption(parser):
    parser.addoption('--ini', action='store', metavar='INI_FILE')

@pytest.fixture(scope='session')
def ini_file(request):
    # Construct the path to testing.ini relative to the conftest.py file
    # conftest.py is in backend/backend/tests/
    # testing.ini is in backend/
    return os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'testing.ini')

@pytest.fixture(scope='session')
def app_settings(ini_file):
    return get_appsettings(ini_file)

@pytest.fixture(scope='session')
def dbengine(app_settings, ini_file):
    engine = models.get_engine(app_settings)
    
    # Debug print
    print(f"\nDEBUG: Creating database tables with settings: {app_settings}")
    
    # Cara yang lebih aman: Hapus database terlebih dahulu jika ada
    import os
    db_url = app_settings['sqlalchemy.url']
    if db_url.startswith('sqlite:///'):
        # Handle windows paths with //
        if db_url.startswith('sqlite:////'):
            db_path = db_url.replace('sqlite:////', '')
        else:
            db_path = db_url.replace('sqlite:///', '')
        
        # Relative path check
        if not os.path.isabs(db_path):
            # Get directory of ini file and make path absolute
            ini_dir = os.path.dirname(os.path.abspath(ini_file))
            db_path = os.path.join(ini_dir, db_path)
        
        # Print debug info
        print(f"DEBUG: SQLite DB path: {db_path}")
        
        # Delete the file if it exists
        if os.path.exists(db_path):
            os.remove(db_path)
            print(f"DEBUG: Removed existing database file")
    
    # Create all tables before starting tests
    from backend.models.mymodel import User, Hafalan, Surah, Ayah, Reminder
    # Force recreate all tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print(f"DEBUG: Created tables: {Base.metadata.tables.keys()}")
    
    # Skip alembic stamp for testing
    # alembic_cfg = alembic.config.Config(ini_file)
    # alembic.command.stamp(alembic_cfg, "head")

    yield engine

    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    print("DEBUG: Dropped all tables at teardown")
    
    # Skip alembic stamp in teardown as well
    # alembic_cfg = alembic.config.Config(ini_file)
    # alembic.command.stamp(alembic_cfg, None, purge=True)

@pytest.fixture(scope='session')
def app(app_settings, dbengine):
    return main({}, dbengine=dbengine, **app_settings)

@pytest.fixture
def tm():
    tm = transaction.TransactionManager(explicit=True)
    tm.begin()
    tm.doom()

    yield tm

    tm.abort()

@pytest.fixture
def dbsession(app, tm):
    session_factory = app.registry['dbsession_factory']
    return models.get_tm_session(session_factory, tm)

@pytest.fixture
def testapp(app, tm, dbsession):
    # override request.dbsession and request.tm with our own
    # externally-controlled values that are shared across requests but aborted
    # at the end
    testapp = webtest.TestApp(app, extra_environ={
        'HTTP_HOST': 'example.com',
        'tm.active': True,
        'tm.manager': tm,
        'app.dbsession': dbsession,
    })

    return testapp

@pytest.fixture
def app_request(app, tm, dbsession):
    """
    A real request.

    This request is almost identical to a real request but it has some
    drawbacks in tests as it's harder to mock data and is heavier.

    """
    with prepare(registry=app.registry) as env:
        request = env['request']
        request.host = 'example.com'

        # without this, request.dbsession will be joined to the same transaction
        # manager but it will be using a different sqlalchemy.orm.Session using
        # a separate database transaction
        request.dbsession = dbsession
        request.tm = tm

        yield request

@pytest.fixture
def dummy_request(tm, dbsession):
    """
    A lightweight dummy request.

    This request is ultra-lightweight and should be used only when the request
    itself is not a large focus in the call-stack.  It is much easier to mock
    and control side-effects using this object, however:

    - It does not have request extensions applied.
    - Threadlocals are not properly pushed.

    """
    request = DummyRequest()
    request.host = 'example.com'
    request.dbsession = dbsession
    request.tm = tm

    return request

@pytest.fixture
def dummy_config(dummy_request):
    """
    A dummy :class:`pyramid.config.Configurator` object.  This allows for
    mock configuration, including configuration for ``dummy_request``, as well
    as pushing the appropriate threadlocals.

    """
    with testConfig(request=dummy_request) as config:
        yield config
