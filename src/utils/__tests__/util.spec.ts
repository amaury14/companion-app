import { Timestamp } from 'firebase/firestore';

import { Service } from '../../types/service';
import { statusTexts } from '../keys/status-keys';
import { formatDateWithTime, getCosts, getDistanceFromLatLonInKm, getStatusIcon, sortServices } from '../util';

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
        id: '',
        category: '',
        date: new Timestamp(10, 0),
        price: 0,
        status: '',
        timeStamp: 0,
        companionId: '',
        companionPayment: 0,
        duration: 0,
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
    it('formats a known date and time correctly', () => {
        const formatted = formatDateWithTime(new Date('2025-05-13T15:45:00'));
        expect(formatted).toContain('13/05/2025');
        expect(formatted).toMatch(/15:45/);
    });

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
