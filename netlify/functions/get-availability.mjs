export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { date } = JSON.parse(event.body || '{}');
    
    if (!date) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Date required' })
      };
    }

    // Fetch existing bookings for this date from Airtable
    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Appointments?filterByFormula=AND({Appointment Date}='${date}')`;
    
    const response = await fetch(airtableUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
      }
    });

    const data = await response.json();
    
    // Define all possible time slots
    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30'
    ];

    // Get booked times
    const bookedTimes = data.records?.map(r => r.fields['Appointment Time']) || [];

    // Filter out booked slots
    const availableSlots = allSlots
      .filter(slot => !bookedTimes.includes(slot))
      .map(time => ({ time, spotsLeft: 1 }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ availableSlots })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get availability' })
    };
  }
}
