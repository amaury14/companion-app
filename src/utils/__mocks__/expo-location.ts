export const reverseGeocodeAsync = jest.fn().mockResolvedValue([
    {
        street: 'Fake Street 123',
        city: 'Montevideo',
        region: 'Montevideo',
        name: 'Fake Department'
    }
]);
