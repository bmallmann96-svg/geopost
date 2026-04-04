export default {
    name: 'GeoPost',
    slug: 'geopost',
    version: '1.0.0',
    orientation: 'portrait',
    hostUri: '192.168.0.15:8081',
    ios: {
        supportsTablet: false,
        config: {
            googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
        },
    },
    android: {
        adaptiveIcon: {
            backgroundColor: '#F97316',
        },
        config: {
            googleMaps: {
                apiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
            },
        },
    },
    extra: {
        cloudinaryCloudName: 'dlbbd5jnh',
        cloudinaryUploadPreset: 'geopost_unsigned',
    },
}