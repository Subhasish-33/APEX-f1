import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api';

// Mock global fetch
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getDrivers should fetch with correct pagination params', async () => {
    const mockResponse = { data: [], total_count: 0, page: 1, limit: 10 };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await api.getDrivers(1, 10);
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/drivers?page=1&limit=10'),
      expect.any(Object)
    );
    expect(result).toEqual(mockResponse);
  });

  it('getDriver should fetch a single driver by ref', async () => {
    const mockDriver = { driver_ref: 'verstappen', forename: 'Max', surname: 'Verstappen' };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDriver),
    });

    const result = await api.getDriver('verstappen');
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/drivers/verstappen'),
      expect.any(Object)
    );
    expect(result.surname).toBe('Verstappen');
  });

  it('getSeasonStandings should fetch standings for a specific year', async () => {
    const mockStandings = { data: [] };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStandings),
    });

    await api.getSeasonStandings(2023);
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/seasons/2023/standings/drivers'),
      expect.any(Object)
    );
  });
});
