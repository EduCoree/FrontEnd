
import axios from 'axios';

async function checkCenters() {
  try {
    const response = await axios.get('https://edu-coree.runasp.net/api/Centers');
    console.log('Centers:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching centers:', error.message);
  }
}

checkCenters();
