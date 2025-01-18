export const taxRulePolicies = {
  linear: (a: number | null, b: number | null) => {
    return {
      isLinear: true,
      aFactor: a,
      bFactor: b,
      isSquare: false,
      aSquareFactor: null,
      bSquareFactor: null,
      cSquareFactor: null,
    };
  },
  square: (a: number | null, b: number | null, c: number | null) => {
    return {
      isLinear: false,
      aFactor: null,
      bFactor: null,
      isSquare: true,
      aSquareFactor: a,
      bSquareFactor: b,
      cSquareFactor: c,
    };
  },
};
