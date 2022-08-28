export const REGION = 'REGION';
export const LOCATION_RECORD_BUCKET_NAME = 'LOCATION_RECORD_BUCKET_NAME';

export default () => ({
  [REGION]: process.env.REGION || 'us-west-2',
  [LOCATION_RECORD_BUCKET_NAME]:
    process.env.LOCATION_RECORD_BUCKET_NAME || 'pingee',
});
