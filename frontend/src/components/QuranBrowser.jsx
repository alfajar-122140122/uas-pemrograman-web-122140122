import { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Paper, Grid, 
  FormControl, InputLabel, Select, MenuItem,
  TextField, Button, IconButton, CircularProgress,
  Pagination, Alert, Card, CardContent, Divider,
  Tabs, Tab, Tooltip, Menu, ListItemIcon,
  ListItemText, MenuItem as MenuItemMui, Dialog,
  DialogTitle, DialogContent, DialogActions,
  ButtonGroup, TableContainer, Table, TableHead,
  TableRow, TableCell, TableBody
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import FilterListIcon from '@mui/icons-material/FilterList';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { QuranAPI } from '../utils/api';

function QuranBrowser() {
  // State untuk mengatur loading dan error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State untuk data Al-Qur'an
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [verses, setVerses] = useState([]);
  const [surahInfo, setSurahInfo] = useState(null);
  
  // State untuk bookmark dan pagination
  const [bookmarkedVerses, setBookmarkedVerses] = useState([]);
  const [page, setPage] = useState(1);
  const versesPerPage = 10;
  
  // State untuk pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  
  // State untuk fitur audio
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentVerse, setCurrentVerse] = useState(null);
  const audioRef = useRef(null);
  const [reciters, setReciters] = useState([]);
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy'); // Sheikh Mishary Rashid Alafasy as default
  
  // State untuk tab view
  const [viewMode, setViewMode] = useState('surah'); // 'surah', 'juz', atau 'page'
  const [selectedJuz, setSelectedJuz] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null); // For dropdown menu
  const [reciterDialogOpen, setReciterDialogOpen] = useState(false);  // Mengambil daftar surah ketika komponen dimuat pertama kali
  useEffect(() => {
    // Fungsi untuk mengambil data surah dan qari dari API
    async function fetchInitialData() {
      setLoading(true);
      try {
        // Mengambil data surah dan qari secara paralel
        const [surahsResponse, recitersResponse] = await Promise.all([
          QuranAPI.getAllSurahs(),
          QuranAPI.getReciters()
        ]);
        
        setSurahs(surahsResponse.data);
        
        // Filter untuk hanya mendapatkan qari Quran lengkap
        const completeReciters = recitersResponse.data.filter(reciter => 
          reciter.format === 'audio' && 
          reciter.language === 'ar' && 
          reciter.type === 'versebyverse'
        );
        setReciters(completeReciters);
      } catch (err) {
        setError('Gagal memuat data awal. Silakan coba lagi nanti.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    // Memanggil fungsi untuk mengambil data awal
    fetchInitialData();
    
    // Memuat ayat-ayat yang sudah dibookmark dari localStorage
    const saved = localStorage.getItem('bookmarkedVerses');
    if (saved) {
      setBookmarkedVerses(JSON.parse(saved));
    }
    
    // Cleanup audio ketika komponen unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  // Mengambil ayat-ayat ketika surah dipilih atau mode tampilan berubah
  useEffect(() => {
    if (viewMode === 'surah' && selectedSurah) {
      fetchVerses(selectedSurah);
    } else if (viewMode === 'juz' && selectedJuz) {
      fetchJuzVerses(selectedJuz);
    } else if (viewMode === 'page' && selectedPage) {
      fetchPageVerses(selectedPage);
    }
    
    // Reset audio player when changing content
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioPlaying(false);
      setCurrentVerse(null);
    }
  }, [selectedSurah, selectedJuz, selectedPage, viewMode, selectedReciter]);

  // Fungsi untuk mengambil ayat-ayat dari surah tertentu
  async function fetchVerses(surahNumber) {
    setLoading(true);
    try {
      const response = await QuranAPI.getSurahVerses(surahNumber);
      setVerses(response.data.verses);
      setSurahInfo({
        name: response.data.name,
        englishName: response.data.englishName,
        englishNameTranslation: response.data.englishNameTranslation,
        numberOfAyahs: response.data.numberOfAyahs,
        revelationType: response.data.revelationType
      });
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
  
  // Fungsi untuk mengambil ayat-ayat dari juz tertentu
  async function fetchJuzVerses(juzNumber) {
    setLoading(true);
    try {
      const response = await QuranAPI.getJuzDetails(juzNumber);
      
      // Format the verses from juz data
      const juzVerses = response.data.ayahs.map((ayah) => ({
        number: ayah.numberInSurah,
        text: ayah.text,
        translation: '', // Translation will need a separate API call in real implementation
        audio: ayah.audio,
        page: ayah.page,
        juz: juzNumber,
        surahNumber: ayah.surah.number,
        surahName: ayah.surah.name,
        surahEnglishName: ayah.surah.englishName
      }));
      
      setVerses(juzVerses);
      setSurahInfo({
        name: `Juz ${juzNumber}`,
        englishName: `Juz ${juzNumber}`,
        numberOfAyahs: juzVerses.length,
        revelationType: '-'
      });
      setPage(1);
      setSearchResults(null);
      setSearchQuery('');
    } catch (err) {
      setError(`Gagal memuat ayat-ayat Juz ${juzNumber}. Silakan coba lagi nanti.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  // Fungsi untuk mengambil ayat-ayat dari halaman tertentu
  async function fetchPageVerses(pageNumber) {
    setLoading(true);
    try {
      const response = await QuranAPI.getPageVerses(pageNumber);
      
      // Format the verses from page data
      const pageVerses = response.data.ayahs.map((ayah) => ({
        number: ayah.numberInSurah,
        text: ayah.text,
        translation: '', // Translation will need a separate API call in real implementation
        audio: ayah.audio,
        page: pageNumber,
        juz: ayah.juz,
        surahNumber: ayah.surah.number,
        surahName: ayah.surah.name,
        surahEnglishName: ayah.surah.englishName
      }));
      
      setVerses(pageVerses);
      setSurahInfo({
        name: `Halaman ${pageNumber}`,
        englishName: `Page ${pageNumber}`,
        numberOfAyahs: pageVerses.length,
        revelationType: '-'
      });
      setPage(1);
      setSearchResults(null);
      setSearchQuery('');
    } catch (err) {
      setError(`Gagal memuat ayat-ayat halaman ${pageNumber}. Silakan coba lagi nanti.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  // Handler untuk perubahan surah yang dipilih
  const handleSurahChange = (event) => {
    setSelectedSurah(event.target.value);
    setViewMode('surah');
    setSelectedJuz(null);
    setSelectedPage(null);
  };

  // Handler untuk perubahan juz yang dipilih
  const handleJuzChange = (event) => {
    setSelectedJuz(event.target.value);
    setViewMode('juz');
    setSelectedSurah(null);
    setSelectedPage(null);
  };

  // Handler untuk perubahan halaman yang dipilih
  const handlePageChange = (event, value) => {
    if (viewMode === 'page') {
      setSelectedPage(value);
    } else {
      // For regular pagination within surah or juz view
      setPage(value);
    }
  };

  // Handler untuk perubahan mode tampilan
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
      // Reset selections based on new mode
      if (newMode === 'surah') {
        setSelectedJuz(null);
        setSelectedPage(null);
      } else if (newMode === 'juz') {
        setSelectedSurah(null);
        setSelectedPage(null);
      } else if (newMode === 'page') {
        setSelectedSurah(null);
        setSelectedJuz(null);
        setSelectedPage(1); // Default to first page
      }
    }
  };

  // Handler untuk perubahan qari yang dipilih
  const handleReciterChange = (reciterId) => {
    setSelectedReciter(reciterId);
    setReciterDialogOpen(false);
  };

  // Fungsi untuk memutar audio ayat
  const playAudio = (verse) => {
    // Stop current audio if any
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Initialize new audio if needed
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    // Get the audio URL based on the verse and selected reciter
    let audioUrl;
    if (verse.audio) {
      // If we already have audio URL from API
      audioUrl = verse.audio;
    } else {
      // Construct URL based on reciter and verse info
      const surahNumber = viewMode === 'surah' ? selectedSurah : verse.surahNumber;
      audioUrl = `https://cdn.islamic.network/quran/audio/${selectedReciter}/${surahNumber}:${verse.number}.mp3`;
    }
    
    // Set up the audio
    audioRef.current.src = audioUrl;
    audioRef.current.onended = () => {
      setAudioPlaying(false);
      setCurrentVerse(null);
    };
    audioRef.current.onerror = () => {
      setError('Gagal memutar audio. Silakan coba lagi atau pilih qari lain.');
      setAudioPlaying(false);
    };

    // Play the audio
    audioRef.current.play()
      .then(() => {
        setAudioPlaying(true);
        setCurrentVerse(verse.number);
      })
      .catch((err) => {
        console.error('Error playing audio:', err);
        setError('Gagal memutar audio. Silakan coba lagi nanti.');
      });
  };

  // Fungsi untuk menghentikan audio
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioPlaying(false);
      setCurrentVerse(null);
    }
  };

  // Handler untuk membuka dialog qari
  const handleOpenReciterDialog = () => {
    setReciterDialogOpen(true);
  };
  
  // Handler untuk menutup dialog qari
  const handleCloseReciterDialog = () => {
    setReciterDialogOpen(false);
  };

  // Handler untuk membuka menu opsi
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handler untuk menutup menu opsi
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Handler untuk pencarian ayat
  const handleSearch = async () => {
    // Pastikan ada yang diketik sebelum melakukan pencarian
    if (!searchQuery.trim()) return;
    
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioPlaying(false);
      setCurrentVerse(null);
    }
    
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
      </Typography>      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        {/* View Mode Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={viewMode} 
            onChange={handleViewModeChange}
            aria-label="Quran view mode tabs"
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab value="surah" label="Surah" icon={<MenuBookIcon />} iconPosition="start" />
            <Tab value="juz" label="Juz" icon={<ViewModuleIcon />} iconPosition="start" />
            <Tab value="page" label="Halaman" icon={<MenuBookIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {/* Dynamic Selection Based on View Mode */}
          <Grid item xs={12} md={6}>
            {viewMode === 'surah' && (
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
            )}
            
            {viewMode === 'juz' && (
              <FormControl fullWidth variant="outlined">
                <InputLabel>Juz</InputLabel>
                <Select
                  value={selectedJuz || ''}
                  onChange={handleJuzChange}
                  label="Juz"
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => (
                    <MenuItem key={juz} value={juz}>
                      Juz {juz}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            {viewMode === 'page' && (
              <FormControl fullWidth variant="outlined">
                <InputLabel>Halaman</InputLabel>
                <Select
                  value={selectedPage || ''}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  label="Halaman"
                >
                  {Array.from({ length: 604 }, (_, i) => i + 1).map(page => (
                    <MenuItem key={page} value={page}>
                      Halaman {page}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>

          {/* Search */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
              
              {/* Audio Options Button */}
              <Tooltip title="Pilih Qari">
                <IconButton 
                  color="primary" 
                  onClick={handleOpenReciterDialog}
                  aria-label="Pilih qari"
                >
                  <VolumeUpIcon />
                </IconButton>
              </Tooltip>

              {/* Options Menu Button */}
              <Tooltip title="Opsi Tampilan">
                <IconButton 
                  color="primary" 
                  onClick={handleOpenMenu}
                  aria-label="Opsi tampilan"
                >
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
        
        {/* Reciter Selection Dialog */}
        <Dialog 
          open={reciterDialogOpen} 
          onClose={handleCloseReciterDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Pilih Qari</DialogTitle>
          <DialogContent dividers>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama</TableCell>
                    <TableCell>Identifier</TableCell>
                    <TableCell>Tindakan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reciters.map((reciter) => (
                    <TableRow key={reciter.identifier}>
                      <TableCell>{reciter.englishName}</TableCell>
                      <TableCell>{reciter.identifier}</TableCell>
                      <TableCell>
                        <Button 
                          variant="contained" 
                          color="primary"
                          size="small"
                          onClick={() => handleReciterChange(reciter.identifier)}
                        >
                          Pilih
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReciterDialog}>Tutup</Button>
          </DialogActions>
        </Dialog>
        
        {/* Options Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItemMui onClick={() => {
            handleCloseMenu();
            // Toggle font size or other UI settings here
          }}>
            <ListItemIcon>
              <MenuBookIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Ukuran Font</ListItemText>
          </MenuItemMui>
          
          <MenuItemMui onClick={() => {
            handleCloseMenu();
            // Toggle translation
          }}>
            <ListItemIcon>
              <MenuBookIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Tampilkan Terjemahan</ListItemText>
          </MenuItemMui>
        </Menu>

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
          <Box sx={{ mt: 3 }}>            <Box sx={{ 
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
                {surahInfo?.name || 'Quran Viewer'} 
                {surahInfo?.englishName && surahInfo.englishName !== surahInfo?.name && ` (${surahInfo.englishName})`}
              </Typography>
              <Box>
                {viewMode === 'surah' && surahInfo?.revelationType && (
                  <Typography variant="subtitle2" component="span" sx={{ mr: 1 }}>
                    {surahInfo.revelationType}
                  </Typography>
                )}
                <Typography variant="subtitle2" component="span">
                  {surahInfo?.numberOfAyahs} Ayat
                </Typography>
                
                {/* Navigation for Page and Juz views */}
                {viewMode === 'page' && (
                  <ButtonGroup size="small" sx={{ ml: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <Button 
                      onClick={() => setSelectedPage(prev => Math.max(1, prev - 1))}
                      disabled={selectedPage <= 1}
                    >
                      <ArrowBackIosIcon sx={{ fontSize: 14 }} />
                    </Button>
                    <Button 
                      onClick={() => setSelectedPage(prev => Math.min(604, prev + 1))}
                      disabled={selectedPage >= 604}
                    >
                      <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
                    </Button>
                  </ButtonGroup>
                )}
                
                {viewMode === 'juz' && (
                  <ButtonGroup size="small" sx={{ ml: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <Button 
                      onClick={() => setSelectedJuz(prev => Math.max(1, prev - 1))}
                      disabled={selectedJuz <= 1}
                    >
                      <ArrowBackIosIcon sx={{ fontSize: 14 }} />
                    </Button>
                    <Button 
                      onClick={() => setSelectedJuz(prev => Math.min(30, prev + 1))}
                      disabled={selectedJuz >= 30}
                    >
                      <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
                    </Button>
                  </ButtonGroup>
                )}
              </Box>
            </Box>
              {/* Bismillah header (except for Al-Tawbah and only in surah view) */}
            {viewMode === 'surah' && selectedSurah !== 9 && (
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
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="subtitle2" 
                      component="span" 
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 10,
                        mr: 1
                      }}
                    >
                      {verse.number}
                    </Typography>
                    
                    {/* Audio play button */}
                    <Tooltip title={audioPlaying && currentVerse === verse.number ? "Berhenti" : "Dengarkan"}>
                      <IconButton 
                        size="small"
                        onClick={() => audioPlaying && currentVerse === verse.number ? stopAudio() : playAudio(verse)}
                        color={audioPlaying && currentVerse === verse.number ? "secondary" : "primary"}
                      >
                        {audioPlaying && currentVerse === verse.number ? <PauseIcon /> : <PlayArrowIcon />}
                      </IconButton>
                    </Tooltip>
                    
                    {/* Additional verse info for juz and page views */}
                    {viewMode !== 'surah' && (
                      <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        {verse.surahName} ({verse.surahNumber})
                      </Typography>
                    )}
                    
                    {/* Show page number in juz view, or juz in page view */}
                    {viewMode === 'juz' && verse.page && (
                      <Tooltip title="Nomor Halaman">
                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary', display: 'inline-flex', alignItems: 'center' }}>
                          <MenuBookIcon fontSize="inherit" sx={{ mr: 0.5 }} /> {verse.page}
                        </Typography>
                      </Tooltip>
                    )}
                    
                    {viewMode === 'page' && verse.juz && (
                      <Tooltip title="Nomor Juz">
                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary', display: 'inline-flex', alignItems: 'center' }}>
                          <ViewModuleIcon fontSize="inherit" sx={{ mr: 0.5 }} /> {verse.juz}
                        </Typography>
                      </Tooltip>
                    )}
                  </Box>
                  
                  <Box>
                    <IconButton 
                      onClick={() => toggleBookmark(verse)} 
                      color="primary"
                      size="small"
                      aria-label={isBookmarked(
                        viewMode === 'surah' ? selectedSurah : verse.surahNumber, 
                        verse.number
                      ) ? "Hapus bookmark" : "Tambah bookmark"}
                    >
                      {isBookmarked(
                        viewMode === 'surah' ? selectedSurah : verse.surahNumber, 
                        verse.number
                      ) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                  </Box>
                </Box>
                
                {/* Arabic text */}
                <Typography 
                  sx={{ 
                    fontFamily: 'traditional-arabic, serif',
                    fontSize: '1.8rem',
                    textAlign: 'right',
                    direction: 'rtl',
                    lineHeight: 2,
                    mb: 1,
                    backgroundColor: currentVerse === verse.number ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    padding: currentVerse === verse.number ? 1.5 : 0,
                    borderRadius: currentVerse === verse.number ? 1 : 0,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {verse.text}
                </Typography>
                
                {/* Translation */}
                {verse.translation && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {verse.translation}
                  </Typography>
                )}
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
        )}        {/* Display when no content is selected */}
        {!selectedSurah && !selectedJuz && !selectedPage && !loading && !searchResults && (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h6" color="text.secondary">
              {viewMode === 'surah' && "Silakan pilih surah untuk mulai membaca."}
              {viewMode === 'juz' && "Silakan pilih juz untuk mulai membaca."}
              {viewMode === 'page' && "Silakan pilih halaman untuk mulai membaca."}
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
