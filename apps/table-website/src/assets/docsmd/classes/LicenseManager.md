[GuiExpert Table API](../README.md) / [Exports](../modules.md) / LicenseManager

# Class: LicenseManager

LicenseManager class responsible for managing license keys.
As it's a singleton class, it only allows one instance of itself to exist.

Usage: LicenseManager.getInstance().setLicenseKey('Your API key');

## Table of contents

### Methods

- [setLicenseKey](LicenseManager.md#setlicensekey)
- [getInstance](LicenseManager.md#getinstance)

## Methods

### setLicenseKey

▸ **setLicenseKey**(`key`): `void`

Method to set the license key for the application.
A 'meta' element is created with content as 'guiexperttable=<license key>'
and appended into the head section of the document

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `undefined` \| `string` | The license key to set for the application. |

#### Returns

`void`

- This method does not return anything

#### Defined in

[src/lib/table/license-manager.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/license-manager.ts#L37)

___

### getInstance

▸ **getInstance**(): [`LicenseManager`](LicenseManager.md)

#### Returns

[`LicenseManager`](LicenseManager.md)

#### Defined in

[src/lib/table/license-manager.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/license-manager.ts#L20)
