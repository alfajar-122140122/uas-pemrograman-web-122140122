def includeme(config):
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('home', '/')

    # API routes
    api_prefix = '/api/v1' # Moved from __init__.py

    # User routes
    config.add_route('users_collection', f'{api_prefix}/users')
    config.add_route('user_detail', f'{api_prefix}/users/{{user_id}}')

    # Hafalan routes
    # Hafalan terkait user tertentu
    config.add_route('user_hafalan_collection', f'{api_prefix}/users/{{user_id}}/hafalan')
    # Hafalan spesifik by ID (bisa juga di-nest di bawah user jika selalu terkait)
    config.add_route('hafalan_detail', f'{api_prefix}/hafalan/{{hafalan_id}}')
    
    # Surah routes
    config.add_route('surahs_collection', f'{api_prefix}/surahs')
    # Regex \\\\d+ memastikan surah_id_or_number hanya digit, bisa juga lebih spesifik
    config.add_route('surah_detail', f'{api_prefix}/surahs/{{surah_id_or_number:\\\\d+}}')
    config.add_route('surah_ayahs_collection', f'{api_prefix}/surahs/{{surah_id_or_number:\\\\d+}}/ayahs')

    # Ayah routes
    config.add_route('ayahs_collection', f'{api_prefix}/ayahs') # General collection, can be filtered by surah_id
    config.add_route('ayah_detail', f'{api_prefix}/ayahs/{{ayah_id:\\\\d+}}')

    # Reminder routes
    config.add_route('user_reminders_collection', f'{api_prefix}/users/{{user_id}}/reminders')
    config.add_route('reminder_detail', f'{api_prefix}/reminders/{{reminder_id:\\\\d+}}')
