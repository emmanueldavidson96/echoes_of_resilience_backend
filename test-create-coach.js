import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function createCoach() {
  try {
    console.log('Creating coach...');
    const response = await axios.post(`${API_URL}/auth/register`, {
      firstName: 'John',
      lastName: 'Coach',
      email: 'john.coach@test.com',
      password: 'password123',
      role: 'coach'
    });
    
    console.log('Success! Coach created:', response.data);
  } catch (error) {
    console.error('Error creating coach:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Errors:', error.response?.data?.errors);
  }
}

createCoach();
