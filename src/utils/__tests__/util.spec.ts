import * as Location from 'expo-location';
import { Timestamp } from 'firebase/firestore';

import { Service } from '../../types/service';
import { uiTexts } from '../data/ui-text-data';
import { statusTexts } from '../keys/status-keys';
import { formatDateWithTime, generateMonthsBetweenDates, getAddressFromCoords, getCosts, getDistanceFromLatLonInKm, getStatusIcon, getTimeDiffText, sortServices } from '../util';

jest.mock('expo-location');

describe('getCosts', () => {
    it('should return correct costs', () => {
        expect(getCosts(4, 120, 0.15)).toEqual(552);
    });

    it('should return 0', () => {
        expect(getCosts(0, 100, 0.10)).toEqual(0);
    });

    it('should return 200', () => {
        expect(getCosts(2, 100, 0)).toEqual(200);
    });

    it('should return 0 again', () => {
        expect(getCosts(0, 100, 0)).toEqual(0);
    });
});

describe('getStatusIcon', () => {
    it('should return accepted icon', () => {
        expect(getStatusIcon(statusTexts.accepted)).toEqual('🟢');
    });

    it('should return cancelled icon', () => {
        expect(getStatusIcon(statusTexts.cancelled)).toEqual('❌');
    });

    it('should return Completado icon', () => {
        expect(getStatusIcon(statusTexts.completed)).toEqual('✅');
    });

    it('should return conflicts icon', () => {
        expect(getStatusIcon(statusTexts.conflicts)).toEqual('⚠️');
    });

    it('should return En Progreso icon', () => {
        expect(getStatusIcon(statusTexts.in_progress)).toEqual('🚶‍♂️');
    });

    it('should return Pendiente icon', () => {
        expect(getStatusIcon(statusTexts.pending)).toEqual('⏳');
    });

    it('should return calendar icon', () => {
        expect(getStatusIcon('mock')).toEqual('🗓️');
    });
});

describe('sortServices', () => {
    const mock = (overrides: Partial<Service>): Service => ({
        additionalInfo: '',
        id: '',
        category: '',
        confirmed: false,
        date: new Timestamp(10, 0),
        price: 0,
        status: '',
        timeStamp: 0,
        companionId: '',
        companionPayment: 0,
        duration: 0,
        requesterId: '',
        reviewed: false,
        ...overrides,
    });

    it('puts pending services first', () => {
        const input: Service[] = [
            mock({ status: 'Completado', timeStamp: 1000 }),
            mock({ status: 'Pendiente', timeStamp: 500 }),
            mock({ status: 'En Progreso', timeStamp: 2000 }),
        ];

        const result = sortServices(input);

        expect(result[0].status).toBe('Pendiente');
    });

    it('sorts within same status by timeStamp descending', () => {
        const input: Service[] = [
            mock({ status: 'Pendiente', timeStamp: 1000 }),
            mock({ status: 'Pendiente', timeStamp: 3000 }),
            mock({ status: 'Pendiente', timeStamp: 2000 }),
        ];

        const result = sortServices(input);

        expect(result.map(s => s.timeStamp)).toEqual([3000, 2000, 1000]);
    });

    it('places non-pending items in time order after pending', () => {
        const input: Service[] = [
            mock({ status: 'En Progreso', timeStamp: 3000 }),
            mock({ status: 'Completado', timeStamp: 1000 }),
            mock({ status: 'Pendiente', timeStamp: 2000 }),
        ];

        const result = sortServices(input);

        expect(result[0].status).toBe('Pendiente');
        expect(result[1].status).toBe('En Progreso');
        expect(result[2].status).toBe('Completado');
    });

    it('should return empty', () => {
        expect(sortServices([])).toEqual([]);
    });
});

describe('getDistanceFromLatLonInKm', () => {
    it('returns 0 when both locations are the same', () => {
        const dist = getDistanceFromLatLonInKm(0, 0, 0, 0);
        expect(dist).toBeCloseTo(0, 5);
    });

    it('calculates correct distance between Montevideo and Buenos Aires', () => {
        // Approx distance: ~203 km
        const dist = getDistanceFromLatLonInKm(-34.9011, -56.1645, -34.6037, -58.3816);
        expect(dist).toBeGreaterThan(200);
        expect(dist).toBeLessThan(210);
    });

    it('calculates correct distance between New York and Los Angeles', () => {
        // Approx distance: ~3940 km
        const dist = getDistanceFromLatLonInKm(40.7128, -74.0060, 34.0522, -118.2437);
        expect(dist).toBeGreaterThan(3900);
        expect(dist).toBeLessThan(4000);
    });

    it('is symmetric (A to B equals B to A)', () => {
        const d1 = getDistanceFromLatLonInKm(10, 20, 30, 40);
        const d2 = getDistanceFromLatLonInKm(30, 40, 10, 20);
        expect(d1).toBeCloseTo(d2, 5);
    });
});

describe('formatDateWithTime', () => {
    it('returns a string', () => {
        const formatted = formatDateWithTime(new Date());
        expect(typeof formatted).toBe('string');
    });

    it('includes day, month, year, hour and minute', () => {
        const formatted = formatDateWithTime(new Date('2025-12-01T08:05:00'));
        expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}.*\d{2}:\d{2}/);
    });

    it('pads single-digit values with zeros', () => {
        const formatted = formatDateWithTime(new Date('2025-01-02T04:07:00'));
        expect(formatted).toContain('02/01/2025');
        expect(formatted).toMatch(/04:07/);
    });
});

describe('getAddressFromCoords', () => {
    it('returns formatted address when geocode succeeds', async () => {
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
            {
                street: 'Av. 18 de Julio',
                city: 'Montevideo',
                region: 'Montevideo',
                name: 'Centro',
            },
        ]);

        const result = await getAddressFromCoords(-34.9, -56.2);
        expect(result).toBe('Av. 18 de Julio, Montevideo, Montevideo');
    });

    it('returns fallback text if no address found', async () => {
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([]);
        const result = await getAddressFromCoords(-34.9, -56.2);
        expect(result).toEqual(uiTexts.noAddress);
    });

    it('returns fallback text on error', async () => {
        (Location.reverseGeocodeAsync as jest.Mock).mockRejectedValue(new Error('Failed'));
        const result = await getAddressFromCoords(-34.9, -56.2);
        expect(result).toEqual(uiTexts.noAddress);
    });
});

describe('getTimeDiffText', () => {
    it('returns 0 hours 0 minutes when both dates are the same', () => {
        const now = new Date();
        expect(getTimeDiffText(now, now)).toBe(`0 ${uiTexts.hours} 0 ${uiTexts.min}`);
    });

    it('returns correct diff for 2h 15min', () => {
        const dateA = new Date('2025-05-16T10:00:00');
        const dateB = new Date('2025-05-16T12:15:00');
        expect(getTimeDiffText(dateA, dateB)).toBe(`2 ${uiTexts.hours} 15 ${uiTexts.min}`);
    });

    it('works even if dateB is before dateA', () => {
        const dateA = new Date('2025-05-16T14:00:00');
        const dateB = new Date('2025-05-16T13:30:00');
        expect(getTimeDiffText(dateA, dateB)).toBe(`0 ${uiTexts.hours} 30 ${uiTexts.min}`);
    });

    it('returns only minutes if duration is less than 1 hour', () => {
        const dateA = new Date('2025-05-16T10:00:00');
        const dateB = new Date('2025-05-16T10:45:00');
        expect(getTimeDiffText(dateA, dateB)).toBe(`0 ${uiTexts.hours} 45 ${uiTexts.min}`);
    });

    it('returns default text if dateA is undefined', () => {
        const dateB = new Date();
        expect(getTimeDiffText(undefined as unknown as Date, dateB)).toBe(`0 ${uiTexts.min}`);
    });
});

describe('generateMonthsBetweenDates', () => {
    it('should return a single month when start and end are the same month', () => {
        const result = generateMonthsBetweenDates(new Date(2025, 5), new Date(2025, 5));
        expect(result).toEqual([
            { label: 'Junio - 2025', date: '2025-06-01' }
        ]);
    });

    it('should return correct range of months (inclusive)', () => {
        const result = generateMonthsBetweenDates(new Date(2025, 0), new Date(2025, 2));
        expect(result).toEqual([
            { label: 'Marzo - 2025', date: '2025-03-01' },
            { label: 'Febrero - 2025', date: '2025-02-01' },
            { label: 'Enero - 2025', date: '2025-01-01' }
        ]);
    });

    it('should capitalize first letter of label', () => {
        const result = generateMonthsBetweenDates(new Date(2025, 10), new Date(2025, 10));
        expect(result[0].label[0]).toBe(result[0].label[0].toUpperCase());
    });

    it('should return an empty array if start > end', () => {
        const result = generateMonthsBetweenDates(new Date(2025, 5), new Date(2025, 4));
        expect(result).toEqual([]);
    });

    it('should handle full year correctly and return in reverse order', () => {
        const result = generateMonthsBetweenDates(new Date(2025, 0), new Date(2025, 11));
        expect(result.length).toBe(12);
        expect(result[0]).toEqual({ label: 'Diciembre - 2025', date: '2025-12-01' });
        expect(result[11]).toEqual({ label: 'Enero - 2025', date: '2025-01-01' });
    });
});
