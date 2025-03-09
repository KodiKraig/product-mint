import { expect } from 'chai';

export type Metadata = {
  name: string;
  description: string;
  external_url: string;
  image: string;
  background_color: string;
  animation_url: string;
  attributes: {
    trait_type: string;
    value: string | number;
    display_type?: string;
  }[];
};

export function assertMetadata(test: string, expected: Metadata) {
  const split = test.split('base64,');

  expect(split[0]).to.equal('data:application/json;');

  const json = Buffer.from(split[1], 'base64').toString();

  const result = JSON.parse(json);

  if (result === undefined || result.name === undefined) {
    throw new Error(`Invalid JSON: ${json}`);
  }

  expect(result).to.deep.equal(expected);
}

export const DEFAULT_ORGANIZATION_METADATA = {
  name: 'Test Organization',
  description: 'Test Organization Description',
  externalUrl: 'https://test-org.com',
  image: 'https://test-org.com/image.png',
  backgroundColor: '000000',
  animationUrl: 'https://test-org.com/animation.mp4',
};

export const EXPECTED_DEFAULT_ORGANIZATION_METADATA = {
  name: DEFAULT_ORGANIZATION_METADATA.name,
  description: DEFAULT_ORGANIZATION_METADATA.description,
  external_url: DEFAULT_ORGANIZATION_METADATA.externalUrl,
  image: DEFAULT_ORGANIZATION_METADATA.image,
  background_color: DEFAULT_ORGANIZATION_METADATA.backgroundColor,
  animation_url: DEFAULT_ORGANIZATION_METADATA.animationUrl,
};

export const DEFAULT_PASS_METADATA = {
  name: 'Test Product Pass',
  description: 'Test Product Description',
  externalUrl: 'https://test-pass.com',
  image: 'https://test-pass.com/image.png',
  backgroundColor: '111111',
  animationUrl: 'https://test-pass.com/animation.mp4',
};

export const EXPECTED_DEFAULT_PASS_METADATA = {
  name: DEFAULT_PASS_METADATA.name,
  description: DEFAULT_PASS_METADATA.description,
  external_url: DEFAULT_PASS_METADATA.externalUrl,
  image: DEFAULT_PASS_METADATA.image,
  background_color: DEFAULT_PASS_METADATA.backgroundColor,
  animation_url: DEFAULT_PASS_METADATA.animationUrl,
};
