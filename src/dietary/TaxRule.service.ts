import { TaxConfig } from '@dietary/TaxConfig';
import { TaxRuleRepository } from './TaxRule.repository';
import { TaxConfigRepository } from './TaxConfig.repository';
import { TaxRule } from './TaxRule';
import { OrderState } from './OrderState.enum';
import { CustomerType } from './CustomerType.enum';
import { OrderRepository } from './Order.repository';

export class TaxRuleService {
  constructor(
    private taxRuleRepository: TaxRuleRepository,
    private taxConfigRepository: TaxConfigRepository,
    private orderRepository: OrderRepository,
  ) {}

  async addTaxRuleToCountry(
    countryCode: string,
    aFactor: number,
    bFactor: number,
    taxCode: string,
    cFactor?: number,
  ): Promise<TaxConfig | void> {
    const year = new Date().getFullYear();
    const taxRule = TaxRule.create({
      taxCode: `A. 899. ${year}${taxCode}`,
      aFactor,
      bFactor,
      cFactor,
    });

    let taxConfig =
      await this.taxConfigRepository.findByCountryCode(countryCode);

    if (!taxConfig) {
      return await this.createTaxConfigWithRule(countryCode, taxRule);
    }

    taxConfig.addTaxRule(taxRule);

    if (cFactor === undefined) {
      const orders = await this.orderRepository.findByOrderState(
        OrderState.Initial,
      );
      for (const order of orders) {
        if (
          order.getCustomerOrderGroup().getCustomer().getType() ===
          CustomerType.Person
        ) {
          order.getTaxRules().push(taxRule);
          await this.orderRepository.save(order);
        }
      }
    }

    return await this.taxConfigRepository.save(taxConfig);
  }

  async createTaxConfigWithRule(
    countryCode: string,
    taxRule: TaxRule,
    maxRulesCount?: number,
  ): Promise<TaxConfig> {
    const taxConfig = TaxConfig.create({
      countryCode,
      maxRulesCount: maxRulesCount ?? 10,
      lastModifiedDate: new Date(),
      taxRules: [taxRule],
      description: '',
      countryReason: '',
      currentRulesCount: 1,
    });

    const savedTaxConfig = await this.taxConfigRepository.save(taxConfig);
    return savedTaxConfig;
  }

  async deleteRule(taxRuleId: number, configId: number): Promise<void> {
    const taxRule = await this.taxRuleRepository.findById(taxRuleId);
    const taxConfig = await this.taxConfigRepository.findById(configId);

    const canBeRemoved = taxConfig?.removeTaxRule(taxRule);
    if (canBeRemoved) {
      await this.taxRuleRepository.delete(taxRule);
    }
  }

  async findRules(countryCode: string): Promise<TaxRule[]> {
    const taxConfig =
      await this.taxConfigRepository.findByCountryCode(countryCode);
    return taxConfig ? taxConfig.getTaxRules() : [];
  }

  async rulesCount(countryCode: string): Promise<number> {
    const taxConfig =
      await this.taxConfigRepository.findByCountryCode(countryCode);
    return taxConfig ? taxConfig.getCurrentRulesCount() : 0;
  }

  async findAllConfigs(): Promise<TaxConfig[]> {
    return this.taxConfigRepository.findAll();
  }
}
