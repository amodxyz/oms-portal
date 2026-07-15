const https = require('https');

function testEndpoint(host, path) {
  const data = JSON.stringify({ email: 'amod@solution4u.com', password: 'password123' });
  const options = {
    hostname: host,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => responseBody += chunk);
    res.on('end', () => {
      console.log(`\n--- Response from ${host} ---`);
      console.log(`Status: ${res.statusCode}`);
      console.log(`Body: ${responseBody}`);
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request to ${host}: ${e.message}`);
  });

  req.write(data);
  req.end();
}

testEndpoint('oms-portal-backend.vercel.app', '/api/auth/login');
testEndpoint('api.digitaladwords.in', '/api/auth/login'); // just a guess
testEndpoint('oms.digitaladwords.in', '/api/auth/login'); // if it's hitting its own domain
