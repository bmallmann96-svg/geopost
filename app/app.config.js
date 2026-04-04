export default {
    name: 'GeoPost',
    slug: 'geopost',
    version: '1.0.0',
    orientation: 'portrait',
    hostUri: '192.168.0.15:8081',
    ios: {
        supportsTablet: false,
        config: {
            googleMapsApiKey: 'AIzaSyA5u0yMtmI3V23lw177o-889C04vC4JIGI',
        },
    },
    android: {
        adaptiveIcon: {
            backgroundColor: '#F97316',
        },
        config: {
            googleMaps: {
                apiKey: 'AIzaSyA5u0yMtmI3V23lw177o-889C04vC4JIGI',
            },
        },
    },
    extra: {
        cloudinaryCloudName: 'dlbbd5jnh',
        cloudinaryUploadPreset: 'geopost_unsigned',
    },
}