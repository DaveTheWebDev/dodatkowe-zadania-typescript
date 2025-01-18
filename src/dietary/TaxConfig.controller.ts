import { TaxConfig } from './TaxConfig';
import { TaxRule } from './TaxRule';
import { TaxRuleService } from './TaxRule.service';

export class TaxConfigController {
  constructor(private readonly taxRuleService: TaxRuleService) {}

  async getTaxConfigs(): Promise<Record<string, TaxRule[]>> {
    const taxConfigs: TaxConfig[] = await this.taxRuleService.findAllConfigs();

    const map: Record<string, TaxRule[]> = {};
    for (const tax of taxConfigs) {
      if (!map[tax.getCountryCode()]) {
        map[tax.getCountryCode()] = tax.getTaxRules() || [];
      } else {
        map[tax.getCountryCode()].push(...tax.getTaxRules());
      }
    }

    const newRuleMap: Record<string, TaxRule[]> = {};
    for (const [countryCode, taxRules] of Object.entries(map)) {
      const newList = this.getUniqueRules(taxRules);
      newRuleMap[countryCode] = newList;
    }

    return newRuleMap;
  }

  private getUniqueRules(taxRules: TaxRule[]): TaxRule[] {
    const uniqueTaxCodes = new Set<string>();
    return taxRules.filter((rule) => {
      const taxCode = rule.getTaxCode();
      if (!uniqueTaxCodes.has(taxCode)) {
        uniqueTaxCodes.add(taxCode);
        return true;
      }
      return false;
    });
  }
}
