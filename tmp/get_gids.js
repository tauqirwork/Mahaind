const https = require('https');

function extractGids(sheetId) {
  https.get(`https://docs.google.com/spreadsheets/d/${sheetId}/edit`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      // Dump the titles and gids
      const regex = /\["([^"]+)",(\d+)\]/g;
      
      let match;
      console.log(`\nSheet IDs for ${sheetId}:`);
      // Google puts sheets in a structure: [ "Sheet Name" , 123456 ] or similar.
      // Often the name is in a string and the ID in the next value.
      // Let's just find anything containing "Bag Master Data"
      if (data.includes('Bag Master Data')) {
          const index = data.indexOf('Bag Master Data');
          console.log("Found Bag Master Data. Surrounding context:");
          console.log(data.substring(index - 50, index + 150));
      }
      if (data.includes('Conversion')) {
          const index = data.indexOf('Conversion');
          console.log("Found Conversion. Context:");
          console.log(data.substring(index - 50, index + 150));
      }
      
      const sheetNamePattern = /\"([^\"]+)\",\d+,\[\d+\]\,\d+/g;
       
      console.log(data.substring(0, 100)); // check successful load
    });
  });
}

extractGids('1q_ma0v0w-cK1qnBbR5aqU0egvCN-JBFKZjYK-4T8N_M'); 
