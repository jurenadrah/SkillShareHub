import { GoogleCalendarAPI } from '../googleCalendar';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      setSession: jest.fn(),
    },
  },
}));

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

describe('GoogleCalendarAPI', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkGoogleConnection', () => {
    it('returns true if access token is valid', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: {
          session: {
            provider_token: 'valid-token',
            provider_refresh_token: 'refresh-token',
          },
        },
      });

      mockFetch.mockResolvedValueOnce({ ok: true }); // tokeninfo check

      const result = await GoogleCalendarAPI.checkGoogleConnection();
      expect(result).toBe(true);
    });

    it('returns false if access token is missing', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
      });

      const result = await GoogleCalendarAPI.checkGoogleConnection();
      expect(result).toBe(false);
    });
  });

  describe('createEvent', () => {
    it('creates an event and returns its id', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: {
          session: {
            provider_token: 'valid-token',
            provider_refresh_token: 'refresh-token',
            access_token: 'supabase-access',
            refresh_token: 'supabase-refresh',
          },
        },
      });

      mockFetch
        .mockResolvedValueOnce({ ok: true }) // tokeninfo check
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'event123' }),
        });

      const result = await GoogleCalendarAPI.createEvent({ summary: 'Test Event' });
      expect(result).toBe('event123');
    });
  });

  describe('deleteEvent', () => {
    it('successfully deletes an event', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await expect(
        GoogleCalendarAPI.deleteEvent('event123', 'valid-token')
      ).resolves.toBeUndefined();
    });
  });
});
