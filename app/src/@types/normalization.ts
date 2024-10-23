export type NormalizationParameters = {
  settings: {
    referencedData: "waterSupply" | "residentRegister";
    referenceDate: string;
    advanced: {
      similarityThreshold: number;
      nGramSize: 1 | 2 | 3;
      joiningMethod: "intersection" | "nearest";
    };
  };
  data: {
    residentRegister: {
      columns: {
        householdCode: string;
        age: string;
        gender: string;
        address: string;
      };
      path: string;
    };
  };
};
