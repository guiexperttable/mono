/** @category Utilities */
export const PROPERTY_TYPE_KEY_ANY = 'any';
/** @category Utilities */
export const PROPERTY_TYPE_KEY_UNDEFINED = 'undefined';
/** @category Utilities */
export const PROPERTY_TYPE_KEY_NULL = 'null';
/** @category Utilities */
export const PROPERTY_TYPE_KEY_STRING = 'string';
/** @category Utilities */
export const PROPERTY_TYPE_KEY_NUMBER = 'number';
/** @category Utilities */
export const PROPERTY_TYPE_KEY_BOOLEAN = 'boolean';
/** @category Utilities */
export const PROPERTY_TYPE_KEY_ARRAY = 'Array';
/** @category Utilities */
export const PROPERTY_TYPE_KEY_OBJECT = 'object';

/** @category Utilities */
export const UNIMPORTANT_TYPES = [PROPERTY_TYPE_KEY_NULL, PROPERTY_TYPE_KEY_UNDEFINED, PROPERTY_TYPE_KEY_ANY];

/** @category Utilities */
export interface PropertyType {
  type: string;
  propertyName: string;
}



/** @category Utilities */
export class AnyPropertyType implements PropertyType {
  public type: string = PROPERTY_TYPE_KEY_ANY;
  constructor(public propertyName:string) {}
}

/** @category Utilities */
export class UndefinedPropertyType implements PropertyType {
  public type: string = PROPERTY_TYPE_KEY_UNDEFINED;
  constructor(public propertyName:string) {}
}

/** @category Utilities */
export class NullPropertyType implements PropertyType {
  public type: string = PROPERTY_TYPE_KEY_NULL;
  constructor(public propertyName:string) {}
}

/** @category Utilities */
export class StringPropertyType implements PropertyType {
  public type: string = PROPERTY_TYPE_KEY_STRING;
  constructor(public propertyName:string) {}
}

/** @category Utilities */
export class NumberPropertyType implements PropertyType {
  public type: string = PROPERTY_TYPE_KEY_NUMBER;
  constructor(public propertyName:string) {}
}

/** @category Utilities */
export class BooleanPropertyType implements PropertyType {
  public type: string = PROPERTY_TYPE_KEY_BOOLEAN;
  constructor(public propertyName:string) {}
}

/** @category Utilities */
export class ArrayPropertyType implements PropertyType {
  public type: string = PROPERTY_TYPE_KEY_ARRAY;

  constructor(
    public propertyName:string,
    public items: PropertyType[] = []
  ) {
  }
}

/** @category Utilities */
export class PropertyItem {
  constructor(
    public propertyName: string,
    public types: PropertyType[] = []
  ) {
  }

  public toString(): string {
    return `PropertyItem(propertyName: ${this.propertyName}, types: [${this.types.map(type => type.type).join(', ')}])`;
  }
}

/** @category Utilities */
export class ObjectPropertyType implements PropertyType{
  public type: string = PROPERTY_TYPE_KEY_OBJECT;

  constructor(
    public propertyName:string,
    public className: string,
    public properties: PropertyItem[] = []
  ) {
  }
}