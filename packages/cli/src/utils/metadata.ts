export interface MetadataResponse {
  encoding: string;
  metadata: string;
}

export const parseMetadata = (metadata: string): MetadataResponse => {
  const split = metadata.split(',');
  const json = JSON.parse(Buffer.from(split[1], 'base64').toString());
  return {
    encoding: split[0],
    metadata: json,
  };
};
