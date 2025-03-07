import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import hre, { ethers } from 'hardhat';
import { expect } from 'chai';

describe('MintToken', () => {
  async function deployMintToken() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const MintToken = await hre.ethers.getContractFactory('MintToken');
    const mintToken = await MintToken.deploy();

    return {
      mintToken,
      owner,
      otherAccount,
    };
  }

  describe('Deployment', () => {
    it('should set the correct name and symbol', async () => {
      const { mintToken } = await loadFixture(deployMintToken);

      expect(await mintToken.name()).to.equal('MintToken');
      expect(await mintToken.symbol()).to.equal('MINT');
    });
  });

  describe('Minting', () => {
    it('should mint tokens', async () => {
      const { mintToken, owner } = await loadFixture(deployMintToken);

      await mintToken
        .connect(owner)
        .mint(owner.address, ethers.parseUnits('100', 6));

      expect(await mintToken.balanceOf(owner.address)).to.equal(
        ethers.parseUnits('100', 6),
      );
    });
  });

  describe('Implements IERC165', () => {
    it('should return true for supportsInterface', async () => {
      const { mintToken } = await loadFixture(deployMintToken);

      expect(await mintToken.supportsInterface('0x01ffc9a7')).to.be.true;
    });
  });
});
