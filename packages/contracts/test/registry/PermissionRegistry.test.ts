import { expect } from 'chai';
import { loadWithDefaultProduct } from '../manager/helpers';

describe('PermissionRegistry', () => {
  describe('Deployment', () => {
    it('has owner and registry set', async () => {
      const { permissionRegistry, contractRegistry, owner } =
        await loadWithDefaultProduct();

      expect(await permissionRegistry.owner()).to.equal(owner);
      expect(await permissionRegistry.registry()).to.equal(
        await contractRegistry.getAddress(),
      );
    });
  });
});
