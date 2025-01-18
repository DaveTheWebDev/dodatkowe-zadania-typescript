import { taxRulePolicies } from './TaxRule.policies';

export const taxRuleResolver = ({
  a,
  b,
  c,
}: {
  a: number | null;
  b: number | null;
  c?: number | null;
}): keyof typeof taxRulePolicies => {
  if (!a || a <= 0) {
    throw new Error('Invalid aFactor');
  }
  if (!b || b <= 0) {
    throw new Error('Invalid bFactor');
  }
  if (c && c <= 0) {
    throw new Error('Invalid cFactor');
  }

  if (c !== undefined) {
    return 'square';
  }

  return 'linear';
};
