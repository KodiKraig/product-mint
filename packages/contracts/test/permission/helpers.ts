import { expect } from 'chai';
import { IPermissionFactory } from '../../typechain-types';
import { ethers } from 'hardhat';

export type TestPermission = {
  name: string;
  description: string;
  isActive: boolean;
  createdAt: number;
};

export const assertPermission = ({
  test,
  expected,
}: {
  test: IPermissionFactory.PermissionStructOutput;
  expected: TestPermission;
}) => {
  expect(test.id).to.equal(hashPermissionId(expected.name));
  expect(test.name).to.equal(expected.name);
  expect(test.description).to.equal(expected.description);
  expect(test.isActive).to.equal(expected.isActive);
  expect(test.createdAt).to.equal(expected.createdAt);
};

export const hashPermissionId = (name: string) => {
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(['string'], [name]),
  );
};
