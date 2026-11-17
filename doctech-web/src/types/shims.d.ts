// Ambient module shim for jsbarcode (ships no TypeScript types).
declare module "jsbarcode" {
  interface JsBarcodeOptions {
    format?: string;
    width?: number;
    height?: number;
    displayValue?: boolean;
    text?: string;
    fontSize?: number;
    lineColor?: string;
    background?: string;
    margin?: number;
    [key: string]: unknown;
  }
  function JsBarcode(
    element: Element | string,
    value: string,
    options?: JsBarcodeOptions,
  ): void;
  export default JsBarcode;
}
