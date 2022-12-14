# Drisk SDK

Get Paid For Your Crypto Portfolio Losses

### Installation

To use the dRisk widget with your javascript application, you will need to
use `[@drisk/drisk-sdk](https://www.npmjs.com/package/@drisk/drisk-sdk)` (dRisk’s JavaScript SDK). Add the
Drisk SDK as a dependency using `yarn` or `npm`:

```sh
# Using yarn
$ yarn add @drisk/drisk-sdk

# Using npm
$ npm install @drisk/drisk-sdk
```

For the advance customization, view
our [query parameter documentation.](https://drisk.io)

### Example usage

```sh
import dRiskSDK from '@drisk/drisk-sdk'

let dRisk = new dRiskSDK({
    apiKey: '4fcd6904-706b-4aff-bd9d-77422813bbb7', // Your API Key (Required)
    environment: 'STAGING', // STAGING/PRODUCTION (Required)
    themeColor: '000000', // App theme color in hex
    widgetHeight: '550px',
    widgetWidth: '450px'
});

dRisk.init();

// To get all the events
dRisk.on(dRisk.ALL_EVENTS, (data) => {
		console.log(data)
});

// This will trigger when the user closed the widget
dRisk.on(dRisk.EVENTS.DRISK_WIDGET_CLOSE, (orderData) => {
    dRisk.close();
});

// This will trigger when the user marks payment is made.
dRisk.on(dRisk.EVENTS.DRISK_COVER_PURCHASE_SUCCESS, (orderData) => {
    console.log(orderData);
    dRisk.close();
});
```

For in-depth instructions on integrating dRisk, view [our complete documentation.](https://docs.drisk.io)
