const axios = require('axios');
const https = require('https');


const storeHash = ""//your store hash
const endpoint = 'https://api.bigcommerce.com/stores/'+storeHash+'/v2/orders';
const authToken = ""//your api access token

const DummyOrderData = {
    "billing_address": {
      "first_name": "John",
      "last_name": "Doe",
      "street_1": "123 Fake Street",
      "city": "Anytown",
      "state": "California",
      "zip": "90001",
      "country": "United States",
      "email": "john.doe@example.com"
    },
    "products": [
      {
        "product_id": 324,//pick a valid product id from your store
        "quantity": 2
      }
    ]
  }

const api = axios.create({
  baseURL: endpoint,
  timeout: 3000,
  headers: {
    'X-Auth-Token': authToken,
    'Content-Type': 'application/json',
  },
  httpsAgent: new https.Agent({ keepAlive: true })
});

async function makeCall() {
  try {
    const response = await api.post('', DummyOrderData);
    console.log('Request succeeded with status:', response.status);
    return {
      requestsLeft: parseInt(response.headers['x-rate-limit-requests-left'], 10),
      timeResetMs: parseInt(response.headers['x-rate-limit-time-reset-ms'], 10),
    };
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error('Rate limit reached. Too many requests.');
      return {
        requestsLeft: 0,
        timeResetMs: parseInt(error.response.headers['x-rate-limit-time-reset-ms'], 10),
      };
    } else {
      console.error('Request failed:', error.message);
      throw error;
    }
  }
}

async function testRateLimit() {
  let count = 0;
  let continueTesting = true;
  const startTime = new Date();
  let delayBetweenCalls = 50;

  while (continueTesting) {
    makeCall() // Fire and forget
      .then(result => {
        console.log(`Request succeeded with status:`, result);
        count++;
      })
      .catch(error => {
        if (error.response && error.response.status === 429) {
          console.error('Rate limit reached. Too many requests.');
        } else {
          console.error('Request failed:', error.message);
        }
      });

    // Insert delay between calls
    await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));

    // Check if we've been running for more than a minute
    if ((new Date() - startTime) > 60000) {
      continueTesting = false;
    }
  }

  console.log(`Fired ${count} calls`);
}

testRateLimit();


