declare module "class-variance-authority" {
  export function cva(base: string, config?: any): any;
  export type VariantProps<T extends (...args: any) => any> = any;
}
