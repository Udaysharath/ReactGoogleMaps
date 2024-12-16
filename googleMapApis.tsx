// API for location search

export async function addressSearch(search_query: any) {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${search_query}&key=${process.env.Api_Key}`
  
  try {
    const response = await fetch(url, {
      method: "GET",
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json(); // Assuming the response is in JSON format
    return data;
  } catch (error) {
    console.error("Error fetching address search:", error);
    throw error;
  }
}

// API for reverseGeocoding

export async function reverseGeocoding(lat: any, lan: any) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lan}&key=${process.env.Api_Key}`
  
  try {
    const response = await fetch(url, {
      method: "GET",
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json(); // Assuming the response is in JSON format
    return data;
  } catch (error) {
    console.error("Error fetching address search:", error);
    throw error;
  }
}

