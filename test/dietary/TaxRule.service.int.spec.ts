import { TestConfiguration } from '../config';
import * as schema from '@schemas';
import {
  DrizzleTaxRuleRepository,
  TaxRuleRepository,
} from '@dietary/TaxRule.repository';
import {
  DrizzleTaxConfigRepository,
  TaxConfigRepository,
} from '@dietary/TaxConfig.repository';
import { TaxRuleService } from '@dietary/TaxRule.service';
import { OrderRepository } from '@dietary/Order.repository';
import { TaxRule } from '@dietary/TaxRule';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vi,
} from 'vitest';
import { OrderState } from '@dietary/OrderState.enum';
import { CustomerType } from '@dietary/CustomerType.enum';

describe('TaxRuleService', () => {
  const testEnvironment = TestConfiguration();

  let taxRuleService: TaxRuleService;
  let taxRuleRepository: TaxRuleRepository;
  let taxConfigRepository: TaxConfigRepository;
  let orderRepository: OrderRepository;
  let db: NodePgDatabase<typeof schema>;

  const US_COUNTRY = 'US';
  const CA_COUNTRY = 'CA';
  const DE_COUNTRY = 'DE';
  const FR_COUNTRY = 'FR';
  const PL_COUNTRY = 'PL';
  const CZ_COUNTRY = 'CZ';
  const NL_COUNTRY = 'NL';
  const ES_COUNTRY = 'ES';
  const UK_COUNTRY = 'UK';
  const IT_COUNTRY = 'IT';
  const AT_COUNTRY = 'AT';

  beforeAll(async () => {
    db = await testEnvironment.start({ schema });

    taxRuleRepository = new DrizzleTaxRuleRepository(db);
    taxConfigRepository = new DrizzleTaxConfigRepository(db);
    orderRepository = {
      findByOrderState: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
    } as OrderRepository;

    taxRuleService = new TaxRuleService(
      taxRuleRepository,
      taxConfigRepository,
      orderRepository,
    );
  }, 30000);

  afterEach(async () => {
    vi.resetAllMocks();
    await db.delete(schema.taxRules).execute();
    await db.delete(schema.taxConfigs).execute();
  });

  afterAll(async () => {
    await testEnvironment.stop();
  });

  describe('addTaxRuleToCountry', () => {
    it('should add a new tax rule to a new country', async () => {
      await taxRuleService.addTaxRuleToCountry(US_COUNTRY, 1, 2, 'TEST');

      const rules = await taxRuleService.findRules(US_COUNTRY);
      expect(rules.length).toBe(1);
      expect(rules[0].getAFactor()).toBe(1);
      expect(rules[0].getBFactor()).toBe(2);
      expect(rules[0].getTaxCode()).toMatch(/^A\. 899\. \d{4}TEST$/);
    });

    it('should add a square tax rule', async () => {
      await taxRuleService.addTaxRuleToCountry(CA_COUNTRY, 1, 2, 'TEST', 3);

      const rules = await taxRuleService.findRules(CA_COUNTRY);
      expect(rules.length).toBe(1);
      expect(rules[0].getASquareFactor()).toBe(1);
      expect(rules[0].getBSquareFactor()).toBe(2);
      expect(rules[0].getCSquareFactor()).toBe(3);
      expect(rules[0].getIsSquare()).toBe(true);
    });

    it('should throw an error for invalid country code', async () => {
      await expect(
        taxRuleService.addTaxRuleToCountry('', 1, 2, 'TEST'),
      ).rejects.toThrow('Invalid country code');
    });

    it('should throw an error for invalid aFactor', async () => {
      await expect(
        taxRuleService.addTaxRuleToCountry(AT_COUNTRY, 0, 2, 'TEST'),
      ).rejects.toThrow('Invalid aFactor');
    });

    it('should add a linear tax rule and update orders', async () => {
      const mockOrder = {
        getCustomerOrderGroup: () => ({
          getCustomer: () => ({ getType: () => CustomerType.Person }),
        }),
        getTaxRules: () => [],
      };
      (orderRepository.findByOrderState as Mock).mockResolvedValue([mockOrder]);
      (orderRepository.save as Mock).mockResolvedValue(mockOrder);

      await taxRuleService.addTaxRuleToCountry(IT_COUNTRY, 1, 2, 'TEST');
      await taxRuleService.addTaxRuleToCountry(IT_COUNTRY, 1, 2, 'TEST');

      const rules = await taxRuleService.findRules(IT_COUNTRY);
      expect(rules.length).toBe(2);
      expect(rules[0].getIsLinear()).toBe(true);
      expect(orderRepository.findByOrderState).toHaveBeenCalledWith(
        OrderState.Initial,
      );
      expect(orderRepository.save).toHaveBeenCalled();
    });

    it('should throw an error when max rules count is reached', async () => {
      await taxRuleService.createTaxConfigWithRule(
        ES_COUNTRY,
        TaxRule.create({ taxCode: 'TEST', aFactor: 1, bFactor: 2 }),
        1,
      );

      await expect(
        taxRuleService.addTaxRuleToCountry(ES_COUNTRY, 1, 2, 'TEST2'),
      ).rejects.toThrow('Too many rules');
    });

    it('should throw an error for invalid country code', async () => {
      const taxRule = TaxRule.create({
        taxCode: 'TEST',
        aFactor: 1,
        bFactor: 2,
      });
      await expect(
        taxRuleService.createTaxConfigWithRule('', taxRule),
      ).rejects.toThrow('Invalid country code');
    });
  });

  describe('deleteRule', () => {
    it('should delete a tax rule', async () => {
      const taxConfig = await taxRuleService.createTaxConfigWithRule(
        CZ_COUNTRY,
        TaxRule.create({ taxCode: 'TEST', aFactor: 1, bFactor: 2 }),
      );
      const updatedTaxConfig = await taxRuleService.addTaxRuleToCountry(
        CZ_COUNTRY,
        1,
        2,
        'TEST2',
        5,
      );
      const taxRule = updatedTaxConfig!.getTaxRules()[0];

      await taxRuleService.deleteRule(taxRule.getId(), taxConfig.getId());

      const rules = await taxRuleService.findRules(CZ_COUNTRY);
      expect(rules.length).toBe(1);
    });

    it('should throw an error when trying to delete the last rule', async () => {
      const taxConfig = await taxRuleService.createTaxConfigWithRule(
        PL_COUNTRY,
        TaxRule.create({ taxCode: 'TEST', aFactor: 1, bFactor: 2 }),
      );
      const taxRule = taxConfig.getTaxRules()[0];

      await expect(
        taxRuleService.deleteRule(taxRule.getId(), taxConfig.getId()),
      ).rejects.toThrow('Last rule in country config');
    });

    it("should not delete a rule if it doesn't exist in the config", async () => {
      const taxConfig = await taxRuleService.createTaxConfigWithRule(
        UK_COUNTRY,
        TaxRule.create({ taxCode: 'TEST', aFactor: 1, bFactor: 2 }),
      );
      const nonExistentRuleId = 9999;

      await expect(
        taxRuleService.deleteRule(nonExistentRuleId, taxConfig.getId()),
      ).rejects.toThrow(`TaxRule with id ${nonExistentRuleId} not found`);

      const rules = await taxRuleService.findRules(UK_COUNTRY);
      expect(rules.length).toBe(1);
    });
  });

  describe('findRules', () => {
    it('should return rules for a country', async () => {
      await taxRuleService.addTaxRuleToCountry(DE_COUNTRY, 1, 2, 'TEST1', 1);
      await taxRuleService.addTaxRuleToCountry(DE_COUNTRY, 3, 4, 'TEST2', 2);

      const rules = await taxRuleService.findRules(DE_COUNTRY);
      expect(rules.length).toBe(2);
    });

    it('should return an empty array for a country with no rules', async () => {
      const rules = await taxRuleService.findRules(FR_COUNTRY);
      expect(rules).toEqual([]);
    });
  });

  describe('rulesCount', () => {
    it('should return the correct count of rules for a country', async () => {
      (orderRepository.findByOrderState as Mock).mockResolvedValue([]);

      await taxRuleService.addTaxRuleToCountry(NL_COUNTRY, 1, 2, 'TEST1', 1);
      await taxRuleService.addTaxRuleToCountry(NL_COUNTRY, 3, 4, 'TEST2', 2);

      const count = await taxRuleService.rulesCount(NL_COUNTRY);
      expect(count).toBe(2);
    });

    it('should return 0 for a country with no rules', async () => {
      const count = await taxRuleService.rulesCount(FR_COUNTRY);
      expect(count).toBe(0);
    });
  });

  describe('findAllConfigs', () => {
    it('should return all tax configs', async () => {
      await taxRuleService.addTaxRuleToCountry(ES_COUNTRY, 1, 2, 'TEST1', 2);
      await taxRuleService.addTaxRuleToCountry(UK_COUNTRY, 3, 4, 'TEST2', 6);

      const configs = await taxRuleService.findAllConfigs();
      expect(configs.length).toBe(2);
    });
  });
});
