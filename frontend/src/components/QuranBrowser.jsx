import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, 
  FormControl, InputLabel, Select, MenuItem,
  TextField, Button, IconButton, CircularProgress,
  Pagination, Alert, Card, CardContent, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { QuranAPI } from '../utils/api';

function QuranBrowser() {
  // State untuk mengatur loading dan error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State untuk data Al-Qur'an
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [verses, setVerses] = useState([]);
  
  // State untuk bookmark dan pagination
  const [bookmarkedVerses, setBookmarkedVerses] = useState([]);
  const [page, setPage] = useState(1);
  const versesPerPage = 10;
  
  // State untuk pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  // Mengambil daftar surah ketika komponen dimuat pertama kali
  useEffect(() => {
    // Fungsi untuk mengambil data surah dari API
    async function fetchSurahs() {
      setLoading(true);
      try {
        // Mengambil data dari Quran API
        const response = await QuranAPI.getAllSurahs();
        setSurahs(response.data);
      } catch (err) {
        setError('Gagal memuat daftar surah. Silakan coba lagi nanti.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    // Memanggil fungsi untuk mengambil data
    fetchSurahs();
    
    // Memuat ayat-ayat yang sudah dibookmark dari localStorage
    const saved = localStorage.getItem('bookmarkedVerses');
    if (saved) {
      setBookmarkedVerses(JSON.parse(saved));
    }
  }, []);

  // Mengambil ayat-ayat ketika surah dipilih
  useEffect(() => {
    if (selectedSurah) {
      fetchVerses(selectedSurah);
    }
  }, [selectedSurah]);

  // Fungsi untuk mengambil ayat-ayat dari surah tertentu
  async function fetchVerses(surahNumber) {
    setLoading(true);
    try {
      const response = await QuranAPI.getSurahVerses(surahNumber);
      setVerses(response.data.verses);
      setPage(1);
      setSearchResults(null);
      setSearchQuery('');
    } catch (err) {
      setError(`Gagal memuat ayat-ayat surah. Silakan coba lagi nanti.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  // Handler untuk perubahan surah yang dipilih
  const handleSurahChange = (event) => {
    setSelectedSurah(event.target.value);
  };

  // Handler untuk pencarian ayat
  const handleSearch = async () => {
    // Pastikan ada yang diketik sebelum melakukan pencarian
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await QuranAPI.searchQuran(searchQuery);
      setSearchResults(response.data);
    } catch (err) {
      setError('Gagal melakukan pencarian. Silakan coba lagi nanti.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk pergantian halaman
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Fungsi untuk menambah atau menghapus bookmark
  const toggleBookmark = (verse) => {
    // Membuat ID unik untuk ayat ini
    const verseId = `${selectedSurah}:${verse.number}`;
    let updatedBookmarks;
    
    // Jika sudah ada di bookmark, hapus
    if (bookmarkedVerses.some(bv => bv.id === verseId)) {
      updatedBookmarks = bookmarkedVerses.filter(bv => bv.id !== verseId);
    } 
    // Jika belum, tambahkan ke bookmark
    else {
      updatedBookmarks = [...bookmarkedVerses, {
        id: verseId,
        surahNumber: selectedSurah,
        surahName: surahs.find(s => s.number === selectedSurah)?.name,
        verseNumber: verse.number,
        text: verse.text
      }];
    }
    
    // Update state dan simpan ke localStorage
    setBookmarkedVerses(updatedBookmarks);
    localStorage.setItem('bookmarkedVerses', JSON.stringify(updatedBookmarks));
  };

  // Fungsi untuk mengecek apakah ayat sudah dibookmark
  const isBookmarked = (surahNum, verseNum) => {
    return bookmarkedVerses.some(bv => bv.id === `${surahNum}:${verseNum}`);
  };

  // Calculate pagination
  const currentVerses = verses.slice(
    (page - 1) * versesPerPage,
    page * versesPerPage
  );

  const pageCount = Math.ceil(verses.length / versesPerPage);
  
  return (
    <Box sx={{ minHeight: '600px' }}>
      <Typography component="h2" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Baca Al-Qur'an
      </Typography>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={3}>
          {/* Surah Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Surah</InputLabel>
              <Select
                value={selectedSurah || ''}
                onChange={handleSurahChange}
                label="Surah"
              >
                {surahs.map(surah => (
                  <MenuItem key={surah.number} value={surah.number}>
                    {surah.number}. {surah.name} ({surah.englishName})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Search */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Cari ayat"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
              >
                Cari
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Loading and error states */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        )}

        {/* Display search results if available */}
        {searchResults && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hasil Pencarian: {searchResults.matches.length} hasil untuk "{searchQuery}"
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            {searchResults.matches.length === 0 ? (
              <Alert severity="info">Tidak ditemukan hasil untuk pencarian Anda.</Alert>
            ) : (
              searchResults.matches.map(match => (
                <Card key={match.id} sx={{ mb: 2, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Surah {match.surahName} ({match.surahEnglishName}), Ayat {match.verseNumber}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      component="p" 
                      sx={{ 
                        mt: 1, 
                        fontFamily: 'traditional-arabic, serif',
                        fontSize: '1.8rem',
                        textAlign: 'right',
                        direction: 'rtl'
                      }}
                    >
                      {match.text}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {match.translation}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}

        {/* Display surah content if selected and not in search mode */}
        {selectedSurah && !searchResults && !loading && verses.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ 
              py: 2, 
              px: 3, 
              bgcolor: 'primary.main', 
              color: 'white', 
              borderRadius: 2,
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6" component="h3">
                {surahs.find(s => s.number === selectedSurah)?.name || 'Surah'} 
                {' '}
                ({surahs.find(s => s.number === selectedSurah)?.englishName})
              </Typography>
              <Typography variant="subtitle2">
                {surahs.find(s => s.number === selectedSurah)?.revelationType} • 
                {' '}
                {surahs.find(s => s.number === selectedSurah)?.numberOfAyahs} Ayat
              </Typography>
            </Box>
            
            {/* Bismillah header (except for Al-Tawbah) */}
            {selectedSurah !== 9 && (
              <Box sx={{ 
                my: 3, 
                textAlign: 'center',
                direction: 'rtl',
                fontFamily: 'traditional-arabic, serif',
                fontSize: '1.8rem'
              }}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </Box>
            )}
            
            {/* Display verses */}
            {currentVerses.map(verse => (
              <Box key={verse.number} sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography 
                    variant="subtitle2" 
                    component="span" 
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 10
                    }}
                  >
                    {verse.number}
                  </Typography>
                  
                  <IconButton 
                    onClick={() => toggleBookmark(verse)} 
                    color="primary"
                    aria-label={isBookmarked(selectedSurah, verse.number) ? "Hapus bookmark" : "Tambah bookmark"}
                  >
                    {isBookmarked(selectedSurah, verse.number) ? 
                      <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                </Box>
                
                {/* Arabic text */}
                <Typography 
                  sx={{ 
                    fontFamily: 'traditional-arabic, serif',
                    fontSize: '1.8rem',
                    textAlign: 'right',
                    direction: 'rtl',
                    lineHeight: 2,
                    mb: 1
                  }}
                >
                  {verse.text}
                </Typography>
                
                {/* Translation */}
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {verse.translation}
                </Typography>
              </Box>
            ))}
            
            {/* Pagination */}
            {pageCount > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination 
                  count={pageCount} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                />
              </Box>
            )}
          </Box>
        )}

        {/* Display when no surah is selected */}
        {!selectedSurah && !loading && !searchResults && (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h6" color="text.secondary">
              Silakan pilih surah untuk mulai membaca.
            </Typography>
          </Box>
        )}

        {/* Display bookmarked verses */}
        {bookmarkedVerses.length > 0 && !selectedSurah && !searchResults && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Ayat yang Anda Bookmark
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {bookmarkedVerses.map(bookmark => (
              <Card key={bookmark.id} sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {bookmark.surahName}, Ayat {bookmark.verseNumber}
                    </Typography>
                    <IconButton 
                      size="small"
                      onClick={() => toggleBookmark({ 
                        number: bookmark.verseNumber, 
                        text: bookmark.text 
                      })}
                      color="primary"
                    >
                      <BookmarkIcon />
                    </IconButton>
                  </Box>
                  <Typography 
                    sx={{ 
                      mt: 1, 
                      fontFamily: 'traditional-arabic, serif',
                      fontSize: '1.8rem',
                      textAlign: 'right',
                      direction: 'rtl'
                    }}
                  >
                    {bookmark.text}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default QuranBrowser;
