export function extractLatLng(url: string): { lat: number; lon: number } {
    try {
        // Handle different Google Maps URL formats
        
        // Format 1: https://www.google.com/maps?q=12.3456,78.9012
        const queryRegex = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
        
        // Format 2: https://www.google.com/maps/@12.3456,78.9012,15z
        const atRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        
        // Format 3: https://goo.gl/maps/XXX or https://maps.google.com/?ll=12.3456,78.9012
        const llRegex = /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/;
        
        let match = url.match(queryRegex) || url.match(atRegex) || url.match(llRegex);
        
        if (match) {
            return {
            lat: parseFloat(match[1]),
            lon: parseFloat(match[2])
            };
        }

        return {
            lat: 0,
            lon: 0
        };
    } catch (error) {
        console.error('Error extracting coordinates:', error);
        return {
            lat: 0,
            lon: 0
        };
    }
}
  