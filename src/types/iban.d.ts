declare module "iban" {
  interface IbanModule {
    isValid(iban: string): boolean;
    electronicFormat(iban: string): string;
  }

  const iban: IbanModule;
  export default iban;
}
