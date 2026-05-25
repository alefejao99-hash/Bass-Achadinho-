/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  shopeeUrl: string;
  adGroup: string;
  description?: string;
}

export interface CustomAdGroup {
  id: string;
  name: string;
}
