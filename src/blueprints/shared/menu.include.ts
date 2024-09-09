import {IncludePriceRelation} from './price.include';
import {IncludeProductRelation} from './product.include';

export const IncludeMenuRelation: any = {
  relation: "menu",
  scope: {
    include: [
      {
        relation: "products",
        scope: {
          include: [
            IncludePriceRelation,
            IncludeProductRelation,
          ],
        },
      },
    ],
  },
};


/*

{
  "include": [
    {
      "relation": "menu",
      "scope": {
        "include": [
          {
            "relation": "menuProducts",
            "scope": {
              "include": [
                {
                  "relation": "price"
                }
              ]
            }
          }
        ]
      }
    }
  ]
}
  */
// {"include":[{"relation":"menu","scope":{"include":[{"relation":"products","scope":{"include":[{"relation":"price"},{"relation":"ingredients"}]}}]}}]}
