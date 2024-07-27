const cron = require('node-cron');
const axios = require('axios')
const MEASUREMENT_ID = '************'
const API_SECRET = '*******************'

async function getUsdCurrency() {
    try {
        const currenciesResponse = await axios.get('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
        const usdValue = currenciesResponse?.data?.find(currency => currency?.cc === 'USD')
        if (!usdValue.rate)
            throw new Error('usd was not found');
        else return usdValue.rate;
    } catch (error) {
        console.error('Error happened during syncing currencies:', error)
        throw new Error(error);
    }
}

cron.schedule('0 * * * *', async () => {
    try {
        const usdCurrency = await getUsdCurrency();
        await axios.post(`https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`, JSON.stringify(
            {
                "client_id": "backend_service",
                "events": [
                    {
                        "name": "uah_usd_ratio",
                        "params": {
                            "value": usdCurrency.toString()
                        }
                    }
                ]
            }
        ))
    } catch (error) {
        console.error('Error happened during syncing currencies:', error)
    }
})