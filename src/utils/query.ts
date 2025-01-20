// Helper function to calculate the distance between two lat/lng points (Haversine formula)
export function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

export const uniqueBy = (arr: any = [], prop: string) => {
  return [...new Map(arr.map((item: any) => [item[prop], item])).values()];

  // return arr.reduce((a:any, d:any) => {
  //   if (!a.includes(d[prop])) { a.push(d[prop]); }
  //   return a;
  // }, []);
};

export const responseError = (
  file: string,
  message: string,
  data: any = {},
) => {
  console.error({file, message, data});
  return new Error(message, data);
};
