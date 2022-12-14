export default {
    ENVIRONMENT: {
        STAGING: {
            FRONTEND: 'https://web-sdk-stg.drisk.io',
            BACKEND: 'https://stg.drisk.io',
            NAME: 'STAGING'
        },
        LOCAL_DEVELOPMENT: {
            FRONTEND: 'http://localhost:3000',
            BACKEND: 'https://dev.drisk.io',
            NAME: 'LOCAL_DEVELOPMENT'
        },
        PRODUCTION: {
            FRONTEND: 'https://web-sdk-app.drisk.io',
            BACKEND: 'https://app.drisk.io',
            NAME: 'PRODUCTION'
        }
    }
}
