import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import hre, { ethers } from 'hardhat';
import { expect } from 'chai';
import calculateInterfaceId from '../../utils/calculate-interface-id';

describe('MintStableToken', () => {
  async function deployMintStableToken() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const MintStableToken = await hre.ethers.getContractFactory(
      'MintStableToken',
    );
    const mintStableToken = await MintStableToken.deploy();

    return {
      mintStableToken,
      owner,
      otherAccount,
    };
  }

  describe('Deployment', () => {
    it('should set the correct name and symbol', async () => {
      const { mintStableToken } = await loadFixture(deployMintStableToken);

      expect(await mintStableToken.name()).to.equal('MintStableToken');
      expect(await mintStableToken.symbol()).to.equal('USDC');
    });
  });

  describe('Minting', () => {
    it('should mint tokens', async () => {
      const { mintStableToken, owner } = await loadFixture(
        deployMintStableToken,
      );

      await mintStableToken
        .connect(owner)
        .mint(owner.address, ethers.parseUnits('100', 6));

      expect(await mintStableToken.balanceOf(owner.address)).to.equal(
        ethers.parseUnits('100', 6),
      );
    });
  });

  describe('Supports Interface', () => {
    it('should return true for the IERC165 interface', async () => {
      const { mintStableToken } = await loadFixture(deployMintStableToken);

      expect(await mintStableToken.supportsInterface('0x01ffc9a7')).to.be.true;
    });

    it('should return true for the IERC20 interface', async () => {
      const { mintStableToken } = await loadFixture(deployMintStableToken);

      const interfaceId = calculateInterfaceId([
        'totalSupply()',
        'balanceOf(address)',
        'transfer(address,uint256)',
        'transferFrom(address,address,uint256)',
        'approve(address,uint256)',
        'allowance(address,address)',
      ]);

      expect(await mintStableToken.supportsInterface(interfaceId)).to.be.true;
    });

    it('should return false for an unknown interface', async () => {
      const { mintStableToken } = await loadFixture(deployMintStableToken);

      expect(await mintStableToken.supportsInterface('0xffffffff')).to.be.false;
    });
  });

  it('should have 6 decimals', async () => {
    const { mintStableToken } = await loadFixture(deployMintStableToken);

    expect(await mintStableToken.decimals()).to.equal(6);
  });
});
