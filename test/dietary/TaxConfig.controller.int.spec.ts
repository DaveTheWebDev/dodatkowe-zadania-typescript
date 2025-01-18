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
import { TaxConfigController } from '@dietary/TaxConfig.controller';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { OrderRepository } from '@dietary/Order.repository';

describe('TaxConfigController', () => {
  const testEnvironment = TestConfiguration();

  let taxConfigController: TaxConfigController;
  let taxRuleService: TaxRuleService;
  let taxRuleRepository: TaxRuleRepository;
  let taxConfigRepository: TaxConfigRepository;
  let orderRepository: OrderRepository;
  let db: NodePgDatabase<typeof schema>;

  beforeAll(async () => {
    db = await testEnvironment.start({ schema });

    taxRuleRepository = new DrizzleTaxRuleRepository(db);
    taxConfigRepository = new DrizzleTaxConfigRepository(db);
    orderRepository = {
      findByOrderState: vi.fn().mockResolvedValue([]),
      findAll: vi.fn(),
      save: vi.fn(),
    } as OrderRepository;

    taxRuleService = new TaxRuleService(
      taxRuleRepository,
      taxConfigRepository,
      orderRepository,
    );
    taxConfigController = new TaxConfigController(taxRuleService);
  }, 30000);

  afterEach(async () => {
    await db.delete(schema.taxRules).execute();
    await db.delete(schema.taxConfigs).execute();
  });

  afterAll(async () => {
    await testEnvironment.stop();
  });

  describe('getTaxConfigs', () => {
    it('should return a map of unique tax rules grouped by country code', async () => {
      await taxRuleService.addTaxRuleToCountry('US', 1, 2, 'TEST1');
      await taxRuleService.addTaxRuleToCountry('US', 3, 4, 'TEST2');
      await taxRuleService.addTaxRuleToCountry('CA', 5, 6, 'TEST3');

      const taxConfigs = await taxConfigController.getTaxConfigs();

      expect(Object.keys(taxConfigs).length).toBe(2);
      expect(taxConfigs['US'].length).toBe(2);
      expect(taxConfigs['CA'].length).toBe(1);
    });

    it('should handle empty tax configurations', async () => {
      const taxConfigs = await taxConfigController.getTaxConfigs();

      expect(Object.keys(taxConfigs).length).toBe(0);
    });

    it('should return unique tax rules for each country', async () => {
      await taxRuleService.addTaxRuleToCountry('US', 1, 2, 'TEST1');
      await taxRuleService.addTaxRuleToCountry('US', 1, 2, 'TEST1');

      const taxConfigs = await taxConfigController.getTaxConfigs();

      expect(taxConfigs['US'].length).toBe(1);
    });

    it('should handle multiple countries with multiple rules', async () => {
      await taxRuleService.addTaxRuleToCountry('US', 1, 2, 'TEST1');
      await taxRuleService.addTaxRuleToCountry('US', 3, 4, 'TEST2');
      await taxRuleService.addTaxRuleToCountry('CA', 5, 6, 'TEST3');
      await taxRuleService.addTaxRuleToCountry('CA', 7, 8, 'TEST4');
      await taxRuleService.addTaxRuleToCountry('UK', 9, 10, 'TEST5');

      const taxConfigs = await taxConfigController.getTaxConfigs();

      expect(Object.keys(taxConfigs).length).toBe(3);
      expect(taxConfigs['US'].length).toBe(2);
      expect(taxConfigs['CA'].length).toBe(2);
      expect(taxConfigs['UK'].length).toBe(1);
    });

    it('should handle tax rules with different factors', async () => {
      await taxRuleService.addTaxRuleToCountry('US', 1, 2, 'TEST1');
      await taxRuleService.addTaxRuleToCountry('US', 3, 4, 'TEST2', 5);

      const taxConfigs = await taxConfigController.getTaxConfigs();

      expect(taxConfigs['US'].length).toBe(2);
      expect(taxConfigs['US'][0].getIsLinear()).toBe(true);
      expect(taxConfigs['US'][1].getIsSquare()).toBe(true);
    });
  });
});
