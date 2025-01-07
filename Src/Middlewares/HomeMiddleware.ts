import axios from 'axios';

interface Store {
  name: string;
  lat: number;
  lon: number;
  distance: number;
}

const getClosestStores = async (userLat: number, userLon: number): Promise<Store[]> => {
  const url = `http://localhost:9000/api/closest-stores?lat=${userLat}&lon=${userLon}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getClosestStores };
