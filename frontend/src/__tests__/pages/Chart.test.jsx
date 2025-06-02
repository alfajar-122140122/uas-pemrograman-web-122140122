import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Chart from '../../pages/Chart';
import api from '../../services/api';
import useAuthStore from '../../hooks/useAuth';
import { vi } from 'vitest';

// Mock dependencies
vi.mock('../../services/api');
vi.mock('../../hooks/useAuth');
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});
vi.mock('recharts', async () => {
    const actual = await vi.importActual('recharts');
    return {
        ...actual,
        ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
        LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
        BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
        Line: () => <div data-testid="line" />,
        Bar: () => <div data-testid="bar" />,
        XAxis: () => <div data-testid="x-axis" />,
        YAxis: () => <div data-testid="y-axis" />,
        CartesianGrid: () => <div data-testid="cartesian-grid" />,
        Tooltip: () => <div data-testid="tooltip" />,
        Legend: () => <div data-testid="legend" />,
    };
});


describe('Chart Page', () => {
    let mockNavigate;

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate = vi.fn();
        useNavigate.mockReturnValue(mockNavigate);
        useAuthStore.mockReturnValue({ user: null, isAuthenticated: false, token: null });
        api.get.mockResolvedValue({ data: [] }); // Default mock for api.get
    });

    describe('Unauthenticated User', () => {
        it('renders login prompt and login button', () => {
            render(
                <MemoryRouter>
                    <Chart />
                </MemoryRouter>
            );
            expect(screen.getByText(/Silakan login untuk melihat progress hafalan./i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
        });

        it('navigates to /login when login button is clicked', () => {
            render(
                <MemoryRouter>
                    <Chart />
                </MemoryRouter>
            );
            fireEvent.click(screen.getByRole('button', { name: /Login/i }));
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    describe('Authenticated User', () => {
        const mockUser = { id: 1, name: 'Test User' };
        const mockHafalanData = [
            { id: 1, surah_name: 'Al-Fatihah', ayah_range: '1-7', status: 'selesai', last_reviewed_at: '2025-05-01T10:00:00Z' },
            { id: 2, surah_name: 'Al-Baqarah', ayah_range: '1-5', status: 'selesai', last_reviewed_at: '2025-05-15T10:00:00Z' },
            { id: 3, surah_name: 'Al-Ikhlas', ayah_range: '1-4', status: 'selesai', last_reviewed_at: '2025-04-20T10:00:00Z' }, // Previous month
            { id: 4, surah_name: 'An-Nas', ayah_range: '1', status: 'belum selesai', last_reviewed_at: '2025-05-20T10:00:00Z' }, // Not completed
            { id: 5, surah_name: 'Al-Falaq', ayah_range: 'invalid', status: 'selesai', last_reviewed_at: '2025-05-22T10:00:00Z' }, // Invalid ayah range
            { id: 6, surah_name: 'Al-Asr', ayah_range: '1-3', status: 'selesai', last_reviewed_at: null }, // No last_reviewed_at
        ];

        beforeEach(() => {
            useAuthStore.mockReturnValue({ user: mockUser, isAuthenticated: true, token: 'fake-token' });
            api.get.mockResolvedValue({ data: mockHafalanData });
        });

        it('renders loading state initially', () => {
            api.get.mockImplementation(() => new Promise(() => { })); // Keep it pending
            render(
                <MemoryRouter>
                    <Chart />
                </MemoryRouter>
            );
            expect(screen.getByText(/Memuat data progress.../i)).toBeInTheDocument();
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('fetches hafalan data on mount for authenticated user', async () => {
            render(
                <MemoryRouter>
                    <Chart />
                </MemoryRouter>
            );
            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith(`/v1/users/${mockUser.id}/hafalan`);
            });
        });

        it('renders chart and summary stats after data is loaded', async () => {
            render(
                <MemoryRouter>
                    <Chart />
                </MemoryRouter>
            );
            await waitFor(() => {
                expect(screen.getByText(/Progress Hafalan Saya/i)).toBeInTheDocument();
                expect(screen.getByText(/Ringkasan Total/i)).toBeInTheDocument();
                // Total Ayahs: (1-7 -> 7) + (1-5 -> 5) + (1-4 -> 4) = 16
                // Al-Falaq has invalid range (0), Al-Asr no review date, An-Nas not completed
                expect(screen.getByText('16')).toBeInTheDocument(); // Total Ayahs
                 // Total Surahs: Al-Fatihah, Al-Baqarah, Al-Ikhlas = 3
                expect(screen.getByText('3')).toBeInTheDocument(); // Total Surahs
                expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
                expect(screen.getByTestId('line-chart')).toBeInTheDocument();
            });
        });

        it('displays error message if fetching data fails', async () => {
            api.get.mockRejectedValue(new Error('Network Error'));
            render(
                <MemoryRouter>
                    <Chart />
                </MemoryRouter>
            );
            await waitFor(() => {
                expect(screen.getByText(/Oops! Terjadi Kesalahan/i)).toBeInTheDocument();
                expect(screen.getByText(/Gagal memuat data progress. Silakan coba lagi./i)).toBeInTheDocument();
            });
        });
        
        it('displays specific error if API returns non-array data', async () => {
            api.get.mockResolvedValue({ data: { message: "Not an array" } });
            render(
                <MemoryRouter>
                    <Chart />
                </MemoryRouter>
            );
            await waitFor(() => {
                expect(screen.getByText(/Data hafalan yang diterima tidak valid./i)).toBeInTheDocument();
            });
        });

        it('handles empty hafalan data correctly', async () => {
            api.get.mockResolvedValue({ data: [] });
            render(
                <MemoryRouter>
                    <Chart />
                </MemoryRouter>
            );
            await waitFor(() => {
                expect(screen.getByText(/Tidak ada data hafalan yang selesai untuk periode "Bulanan"/i)).toBeInTheDocument();
                expect(screen.getByText('0')).toBeInTheDocument(); // Total Ayahs
                expect(screen.getAllByText('0')[1]).toBeInTheDocument(); // Total Surahs
            });
        });
        
        it('correctly calculates ayah count for single and range values', async () => {
             const singleAyahData = [
                { id: 1, surah_name: 'Al-Fatihah', ayah_range: '1', status: 'selesai', last_reviewed_at: '2025-05-01T10:00:00Z' },
                { id: 2, surah_name: 'Al-Baqarah', ayah_range: '1-3', status: 'selesai', last_reviewed_at: '2025-05-15T10:00:00Z' },
            ];
            api.get.mockResolvedValue({ data: singleAyahData });
            render(
                <MemoryRouter>
                    <Chart />
                </MemoryRouter>
            );
            await waitFor(() => {
                // Total Ayahs: 1 (from '1') + 3 (from '1-3') = 4
                expect(screen.getByText('4')).toBeInTheDocument(); 
            });
        });

        describe('Filter Functionality', () => {
            const hafalanForFilter = [
                // Weekly: Last 8 weeks from June 1, 2025.
                // Week of May 26 - June 1 (current week for processing, data up to May 31)
                { id: 'w1', surah_name: 'S1', ayah_range: '1-2', status: 'selesai', last_reviewed_at: '2025-05-28T00:00:00Z' }, // 2 ayahs
                // Week of May 19 - May 25
                { id: 'w2', surah_name: 'S2', ayah_range: '1-3', status: 'selesai', last_reviewed_at: '2025-05-20T00:00:00Z' }, // 3 ayahs
                // Week of Apr 7 - Apr 13 (8th week ago from current week of May 26)
                { id: 'w3', surah_name: 'S3', ayah_range: '1', status: 'selesai', last_reviewed_at: '2025-04-10T00:00:00Z' }, // 1 ayah

                // Monthly: For 2025
                { id: 'm1', surah_name: 'S4', ayah_range: '1-10', status: 'selesai', last_reviewed_at: '2025-01-15T00:00:00Z' }, // Jan, 10 ayahs
                { id: 'm2', surah_name: 'S5', ayah_range: '1-5', status: 'selesai', last_reviewed_at: '2025-03-10T00:00:00Z' },  // Mar, 5 ayahs
                { id: 'm3', surah_name: 'S6', ayah_range: '1-2', status: 'selesai', last_reviewed_at: '2025-05-05T00:00:00Z' },  // May, 2 ayahs (already counted in w1/w2 for weekly)

                // Yearly
                { id: 'y1', surah_name: 'S7', ayah_range: '1-20', status: 'selesai', last_reviewed_at: '2024-11-01T00:00:00Z' }, // 2024, 20 ayahs
                { id: 'y2', surah_name: 'S8', ayah_range: '1-30', status: 'selesai', last_reviewed_at: '2023-07-01T00:00:00Z' }, // 2023, 30 ayahs
            ];
            
            beforeEach(() => {
                 api.get.mockResolvedValue({ data: hafalanForFilter });
            });

            it('defaults to monthly filter and processes data accordingly', async () => {
                render(<MemoryRouter><Chart /></MemoryRouter>);
                await waitFor(() => {
                    // Jan (10), Mar (5), May (2 from m3 + 2 from w1 + 3 from w2 = 7)
                    // Total ayahs for summary: 10+5+2+2+3+1+20+30 = 73
                    // Total surahs: S1,S2,S3,S4,S5,S6,S7,S8 = 8
                    expect(screen.getByText('73')).toBeInTheDocument(); // Total Ayahs
                    expect(screen.getByText('8')).toBeInTheDocument(); // Total Surahs
                    expect(screen.getByRole('tab', { name: /Bulanan/i, selected: true })).toBeInTheDocument();
                    // Check for monthly data points (Jan, Feb, Mar, Apr, May)
                    // Cumulative: Jan (10), Feb (10), Mar (15), Apr (15+1=16), May (16+2+3+2=23)
                    // Note: The component shows cumulative.
                    // The test below will check the `name` which corresponds to XAxis dataKey
                    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
                });
                // Check if specific month labels appear (mocked chart does not render actual labels)
                // We can check if the processing logic for monthly is hit by checking the name prop of Line
                 await waitFor(() => {
                    const lineElement = screen.getByTestId('line');
                    // This is a bit of a hack due to mocking, ideally we'd check chart data directly
                    // For now, we confirm the chart is rendered.
                    expect(lineElement).toBeInTheDocument();
                });
            });

            it('switches to weekly filter and re-processes data', async () => {
                render(<MemoryRouter><Chart /></MemoryRouter>);
                await waitFor(() => expect(screen.getByRole('tab', { name: /Mingguan/i })).toBeInTheDocument());
                
                fireEvent.click(screen.getByRole('tab', { name: /Mingguan/i }));
                
                await waitFor(() => {
                    expect(api.get).toHaveBeenCalledTimes(2); // Initial load (monthly) + 1 for weekly
                    expect(screen.getByRole('tab', { name: /Mingguan/i, selected: true })).toBeInTheDocument();
                     // Check for weekly data points (last 8 weeks)
                    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
                });
            });

            it('switches to yearly filter and re-processes data', async () => {
                render(<MemoryRouter><Chart /></MemoryRouter>);
                await waitFor(() => expect(screen.getByRole('tab', { name: /Tahunan/i })).toBeInTheDocument());

                fireEvent.click(screen.getByRole('tab', { name: /Tahunan/i }));

                await waitFor(() => {
                    expect(api.get).toHaveBeenCalledTimes(2); // Initial load (monthly) + 1 for yearly
                    expect(screen.getByRole('tab', { name: /Tahunan/i, selected: true })).toBeInTheDocument();
                    // Check for yearly data points (e.g., 2023, 2024, 2025)
                    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
                });
            });
            
            it('shows "no data" message if filter results in empty processed data', async () => {
                api.get.mockResolvedValue({ data: [
                     // Only data from 2023, so weekly and monthly for 2025 will be empty
                    { id: 'y2', surah_name: 'S8', ayah_range: '1-30', status: 'selesai', last_reviewed_at: '2023-07-01T00:00:00Z' },
                ] });
                render(<MemoryRouter><Chart /></MemoryRouter>); // Defaults to monthly

                await waitFor(() => {
                     expect(screen.getByText(/Tidak ada data hafalan yang selesai untuk periode "Bulanan"/i)).toBeInTheDocument();
                });

                fireEvent.click(screen.getByRole('tab', { name: /Mingguan/i }));
                 await waitFor(() => {
                    expect(screen.getByText(/Tidak ada data hafalan yang selesai untuk periode "Mingguan"/i)).toBeInTheDocument();
                });
            });
        });
         it('correctly parses ISO dates and handles invalid dates', async () => {
            const dataWithInvalidDate = [
                { id: 1, surah_name: 'Al-Fatihah', ayah_range: '1-7', status: 'selesai', last_reviewed_at: '2025-05-01T10:00:00Z' }, // Valid
                { id: 2, surah_name: 'Al-Baqarah', ayah_range: '1-5', status: 'selesai', last_reviewed_at: 'INVALID-DATE' }, // Invalid
                { id: 3, surah_name: 'Al-Imran', ayah_range: '1-2', status: 'selesai', last_reviewed_at: '2025-05-10T10:00:00Z' }, // Valid
            ];
            api.get.mockResolvedValue({ data: dataWithInvalidDate });
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            render(<MemoryRouter><Chart /></MemoryRouter>);

            await waitFor(() => {
                // Ayahs: 7 (Al-Fatihah) + 2 (Al-Imran) = 9. Al-Baqarah is skipped.
                expect(screen.getByText('9')).toBeInTheDocument(); // Total Ayahs
                expect(screen.getByText('2')).toBeInTheDocument(); // Total Surahs (Al-Fatihah, Al-Imran)
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    expect.stringContaining('[Chart.jsx] Error parsing date for item ID 2: INVALID-DATE'),
                    expect.any(Error)
                );
            });
            consoleErrorSpy.mockRestore();
        });
    });
});
