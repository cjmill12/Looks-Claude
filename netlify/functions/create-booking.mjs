export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      datetime,
      appointmentType,
      styleName,
      stylePrompt,
      imageReference,
      notes
    } = JSON.parse(event.body);

    if (!firstName || !email || !datetime) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const [date, time] = datetime.split('T');
    const timeSlot = time.substring(0, 5);

    // Create record in Airtable
    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Appointments`;
    
    const airtableData = {
      fields: {
        'Name': `${firstName} ${lastName}`,
        'Email': email,
        'Phone': phone || '',
        'Appointment Date': date,
        'Appointment Time': timeSlot,
        'Service Type': appointmentType || "Men's Cut",
        'Style Name': styleName || '',
        'Style Prompt': stylePrompt || '',
        'Status': 'Pending',
        'Shop ID': 'pilot-shop'
      }
    };

    const response = await fetch(airtableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(airtableData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to create booking');
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        appointmentId: result.id,
        message: 'Appointment booked successfully'
      })
    };

  } catch (error) {
    console.error('Booking error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to create booking',
        details: error.message
      })
    };
  }
}
