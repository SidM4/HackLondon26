/**
 * postcodes.io API wrapper for UK postcode geocoding.
 * Free, no authentication required.
 */

export interface PostcodeResult {
  postcode: string;
  latitude: number;
  longitude: number;
  admin_district: string;
  region: string;
  outcode: string;
}

export async function lookupPostcode(postcode: string): Promise<PostcodeResult> {
  const encoded = encodeURIComponent(postcode.trim());
  const res = await fetch(`https://api.postcodes.io/postcodes/${encoded}`);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Invalid postcode: ${postcode}`);
    }
    throw new Error(`postcodes.io returned ${res.status}`);
  }

  const data = (await res.json()) as {
    result: {
      postcode: string;
      latitude: number;
      longitude: number;
      admin_district: string;
      region: string;
      outcode: string;
    };
  };

  const r = data.result;
  return {
    postcode: r.postcode,
    latitude: r.latitude,
    longitude: r.longitude,
    admin_district: r.admin_district,
    region: r.region,
    outcode: r.outcode,
  };
}

// CLI test: npx tsx postcodes.ts "SW1A 1AA"
if (require.main === module) {
  const pc = process.argv[2] ?? "SW1A 1AA";
  lookupPostcode(pc).then((r) => console.log(JSON.stringify(r, null, 2)));
}
