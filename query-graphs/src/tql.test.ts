// -----------------------------------------------------------------------------
// tql.test.js
// -----------------------------------------------------------------------------

import * as TQL from "./tql";

///////////////////////////////////////////////////////////////////////////

describe("TQL parsing", function() {
    it("should ignore comments", function() {
        const setup = [
            "; comment ",
            " ; comment with leading whitespace",
            ";",
            '(database "BlackBox/Window")',
            "; comment between plans",
            '; (database "commented/out")',
            "(table [tpcds].[catalog_sales]) ; comment at the end of a line",
            "; comment at the end\n",
        ].join("\n");

        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "class": "string",
                    "name": "BlackBox/Window",
                  },
                ],
                "class": "command",
                "name": "database",
                "properties": Object {},
              },
              Object {
                "children": Array [],
                "class": "table",
                "name": "[catalog_sales]",
                "properties": Object {
                  "schema": "[tpcds]",
                  "table": "[catalog_sales]",
                },
              },
            ]
        `);
    });

    it("should parse aggregate", function() {
        const setup =
            "(aggregate " +
            "  (table [tpcds].[catalog_sales]) " +
            "  ( [cs_ship_date_sk] [cs_sold_date_sk] ) " +
            "  ( ( [count] (total [count] ) ) ) )";

        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[catalog_sales]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[catalog_sales]",
                    },
                  },
                  Object {
                    "children": Array [
                      Object {
                        "class": "field",
                        "name": "[cs_ship_date_sk]",
                      },
                      Object {
                        "class": "field",
                        "name": "[cs_sold_date_sk]",
                      },
                    ],
                    "class": "fields",
                    "name": "groupbys",
                  },
                  Object {
                    "children": Array [
                      Object {
                        "children": Array [
                          Object {
                            "children": Array [
                              Object {
                                "class": "field",
                                "name": "[count]",
                              },
                            ],
                            "class": "function",
                            "name": "total",
                          },
                        ],
                        "class": "binding",
                        "name": "[count]",
                      },
                    ],
                    "class": "bindings",
                    "name": "measures",
                  },
                ],
                "class": "reference",
                "name": "aggregate",
                "properties": Object {},
              },
            ]
        `);
    });

    it("should parse cartprod", function() {
        const setup =
            "(cartprod " +
            "  (table [tpcds].[catalog_sales]) " +
            "  (table [tpcds].[date_dim]) " +
            "  ( ([d_date_sk] [d_date_sk]) ) " +
            "  ) ";

        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[catalog_sales]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[catalog_sales]",
                    },
                  },
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[date_dim]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[date_dim]",
                    },
                  },
                  Object {
                    "children": Array [
                      Object {
                        "class": "rename",
                        "name": "[d_date_sk]",
                        "source": "[d_date_sk]",
                      },
                    ],
                    "class": "renames",
                    "name": "imports",
                  },
                ],
                "class": "join",
                "name": "cartprod",
                "properties": Object {},
              },
            ]
        `);
    });

    it("should parse database", function() {
        const setup = '(database "BlackBox/Window")';
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "class": "string",
                    "name": "BlackBox/Window",
                  },
                ],
                "class": "command",
                "name": "database",
                "properties": Object {},
              },
            ]
        `);
    });

    it("should parse dict", function() {
        const setup = "(dict [d_date_sk] (table [tpcds].[date_dim]) )";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[date_dim]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[date_dim]",
                    },
                  },
                ],
                "class": "reference",
                "name": "dict",
                "properties": Object {
                  "name": "[d_date_sk]",
                },
              },
            ]
        `);
    });

    it("should parse exchange", function() {
        const setup = "(exchange (table [tpcds].[catalog_sales]) 4 [] false )";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[catalog_sales]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[catalog_sales]",
                    },
                  },
                ],
                "class": "reference",
                "name": "exchange",
                "properties": Object {
                  "affinity": "[]",
                  "concurrency": 4,
                  "ordered": false,
                  "thread": 0,
                },
              },
            ]
        `);
    });

    it("should parse flowtable", function() {
        const setup = "(flowtable (table [tpcds].[catalog_sales]) none )";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[catalog_sales]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[catalog_sales]",
                    },
                  },
                ],
                "class": "reference",
                "name": "flowtable",
                "properties": Object {
                  "encodings": "none",
                },
              },
            ]
        `);
    });

    it("should parse fraction", function() {
        const setup = "(fraction (table [tpcds].[catalog_sales]) 4 0 () )";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[catalog_sales]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[catalog_sales]",
                    },
                  },
                  Object {
                    "children": Array [],
                    "class": "fields",
                    "name": "clustering",
                  },
                ],
                "class": "reference",
                "name": "fraction",
                "properties": Object {
                  "concurrency": 4,
                  "thread": 0,
                },
              },
            ]
        `);
    });

    it("should parse groupjoin", function() {
        const setup =
            "(groupjoin " +
            "  (table [tpcds].[catalog_sales]) " +
            "  (table [tpcds].[date_dim]) " +
            "  ( ( [cs_ship_date_sk] [d_date_sk] ) ) " +
            "  ( ( [sum] [sum] ) ) " +
            "  ( ( [sum] (total [d_date_sk] ) ) ) )";

        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[catalog_sales]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[catalog_sales]",
                    },
                  },
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[date_dim]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[date_dim]",
                    },
                  },
                  Object {
                    "children": Array [
                      Object {
                        "children": Array [
                          Object {
                            "class": "field",
                            "name": "[d_date_sk]",
                          },
                          Object {
                            "class": "field",
                            "name": "[cs_ship_date_sk]",
                          },
                        ],
                        "class": "function",
                        "name": "isnotdistinct",
                      },
                    ],
                    "class": "expressions",
                    "name": "conditions",
                  },
                  Object {
                    "children": Array [
                      Object {
                        "class": "rename",
                        "name": "[sum]",
                        "source": "[sum]",
                      },
                    ],
                    "class": "renames",
                    "name": "imports",
                  },
                  Object {
                    "children": Array [
                      Object {
                        "children": Array [
                          Object {
                            "children": Array [
                              Object {
                                "class": "field",
                                "name": "[d_date_sk]",
                              },
                            ],
                            "class": "function",
                            "name": "total",
                          },
                        ],
                        "class": "binding",
                        "name": "[sum]",
                      },
                    ],
                    "class": "bindings",
                    "name": "measures",
                  },
                ],
                "class": "join",
                "name": "groupjoin",
                "properties": Object {},
              },
            ]
        `);
    });

    it("should parse iejoin", function() {
        const setup =
            "(iejoin " +
            "  (table [tpcds].[catalog_sales]) " +
            "  (table [tpcds].[date_dim]) " +
            "  ( ( <= [cs_sold_date_sk] [d_date_sk] ) ( >= [cs_ship_date_sk] [d_date_sk] ) ) " +
            "  ( ([d_date_sk] [d_date_sk]) ) " +
            "  inner 4 ) ";

        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[catalog_sales]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[catalog_sales]",
                    },
                  },
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[date_dim]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[date_dim]",
                    },
                  },
                  Object {
                    "children": Array [
                      Object {
                        "children": Array [
                          Object {
                            "class": "field",
                            "name": "[cs_sold_date_sk]",
                          },
                          Object {
                            "class": "field",
                            "name": "[d_date_sk]",
                          },
                        ],
                        "class": "function",
                        "name": "<=",
                      },
                      Object {
                        "children": Array [
                          Object {
                            "class": "field",
                            "name": "[cs_ship_date_sk]",
                          },
                          Object {
                            "class": "field",
                            "name": "[d_date_sk]",
                          },
                        ],
                        "class": "function",
                        "name": ">=",
                      },
                    ],
                    "class": "expressions",
                    "name": "conditions",
                  },
                  Object {
                    "children": Array [
                      Object {
                        "class": "rename",
                        "name": "[d_date_sk]",
                        "source": "[d_date_sk]",
                      },
                    ],
                    "class": "renames",
                    "name": "imports",
                  },
                ],
                "class": "join",
                "name": "iejoin",
                "properties": Object {
                  "concurrency": 4,
                  "join": "inner",
                },
              },
            ]
        `);
    });

    it("should parse indextable", function() {
        const setup = "(indextable [d_date_sk] (table [tpcds].[date_dim]) )";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[date_dim]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[date_dim]",
                    },
                  },
                ],
                "class": "reference",
                "name": "indextable",
                "properties": Object {
                  "name": "[d_date_sk]",
                },
              },
            ]
        `);
    });

    it("should parse indexjoin", function() {
        const setup =
            "(indexjoin " +
            "  (table [tpcds].[catalog_sales]) " +
            "  (indextable [cs_sold_date_sk] (table [tpcds].[catalog_sales]) ) " +
            "  ( [cs_ship_date_sk] [cs_sold_date_sk] ) " +
            "  ( ([cs_sold_date_sk] [cs_sold_date_sk]) ) " +
            "  ( [.RANK] [.COUNT]) ) ";

        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[catalog_sales]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[catalog_sales]",
                    },
                  },
                  Object {
                    "children": Array [
                      Object {
                        "children": Array [],
                        "class": "table",
                        "name": "[catalog_sales]",
                        "properties": Object {
                          "schema": "[tpcds]",
                          "table": "[catalog_sales]",
                        },
                      },
                    ],
                    "class": "reference",
                    "name": "indextable",
                    "properties": Object {
                      "name": "[cs_sold_date_sk]",
                    },
                  },
                  Object {
                    "children": Array [
                      Object {
                        "class": "field",
                        "name": "[cs_ship_date_sk]",
                      },
                      Object {
                        "class": "field",
                        "name": "[cs_sold_date_sk]",
                      },
                    ],
                    "class": "fields",
                    "name": "restrictions",
                  },
                  Object {
                    "children": Array [
                      Object {
                        "class": "rename",
                        "name": "[cs_sold_date_sk]",
                        "source": "[cs_sold_date_sk]",
                      },
                    ],
                    "class": "renames",
                    "name": "imports",
                  },
                ],
                "class": "join",
                "name": "indexjoin",
                "properties": Object {
                  "index": Object {
                    "class": "rename",
                    "name": "[.COUNT]",
                    "source": "[.RANK]",
                  },
                  "join": "inner",
                },
              },
            ]
        `);
    });

    it("should parse iterate", function() {
        const setup = "(iterate " + "  (table [tpcds].[catalog_sales]) " + "  (table [tpcds].[date_dim]) " + "  [Iterate] ) ";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[catalog_sales]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[catalog_sales]",
                    },
                  },
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[date_dim]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[date_dim]",
                    },
                  },
                ],
                "class": "reference",
                "name": "iterate",
                "properties": Object {
                  "name": "[Iterate]",
                },
              },
            ]
        `);
    });

    it("should parse join", function() {
        const setup =
            "(join " +
            "  (table [tpcds].[catalog_sales]) " +
            "  (table [tpcds].[date_dim]) " +
            "  ( ( [cs_sold_date_sk] [d_date_sk] ) ) " +
            "  ( ([d_date_sk] [d_date_sk]) ) " +
            "  left ) ";

        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[catalog_sales]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[catalog_sales]",
                    },
                  },
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[date_dim]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[date_dim]",
                    },
                  },
                  Object {
                    "children": Array [
                      Object {
                        "children": Array [
                          Object {
                            "class": "field",
                            "name": "[d_date_sk]",
                          },
                          Object {
                            "class": "field",
                            "name": "[cs_sold_date_sk]",
                          },
                        ],
                        "class": "function",
                        "name": "=",
                      },
                    ],
                    "class": "expressions",
                    "name": "conditions",
                  },
                  Object {
                    "children": Array [
                      Object {
                        "class": "rename",
                        "name": "[d_date_sk]",
                        "source": "[d_date_sk]",
                      },
                    ],
                    "class": "renames",
                    "name": "imports",
                  },
                ],
                "class": "join",
                "name": "join",
                "properties": Object {
                  "join": "left",
                },
              },
            ]
        `);
    });

    it("should parse order", function() {
        const setup = "(order (table [tpcds].[date_dim]) ( ( [d_date_sk] asc ) ) )";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[date_dim]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[date_dim]",
                    },
                  },
                  Object {
                    "children": Array [
                      Object {
                        "class": "orderby",
                        "name": "[d_date_sk]",
                        "sense": "asc",
                      },
                    ],
                    "class": "orderbys",
                    "name": "orderbys",
                  },
                ],
                "class": "reference",
                "name": "order",
                "properties": Object {},
              },
            ]
        `);
    });

    it("should parse partition-restart", function() {
        const setup = "(partition-restart (table [tpcds].[date_dim]) )";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[date_dim]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[date_dim]",
                    },
                  },
                ],
                "class": "reference",
                "name": "partition-restart",
                "properties": Object {},
              },
            ]
        `);
    });

    it("should parse partition-split", function() {
        const setup = "(partition-split [d_date_sk] (table [tpcds].[date_dim]) )";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[date_dim]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[date_dim]",
                    },
                  },
                ],
                "class": "reference",
                "name": "partition-split",
                "properties": Object {
                  "name": "[d_date_sk]",
                },
              },
            ]
        `);
    });

    it("should parse pivot", function() {
        const setup =
            "(pivot (table [TestV1].[Calcs] ) " +
            " ( [index] ( [0] [1] [2] [3] ) ) " +
            " ( ( [bool] ( [bool0] [bool1] [bool2] [bool3] ) ) " +
            "   ( [int]  ( [int0]  [int1]  [int2]  [int3]  ) ) " +
            "   ( [num]  ( [num0]  [num1]  [num2]  [num3]  ) ) " +
            "   ( [str]  ( [str0]  [str1]  [str2]  [str3]  ) ) ) )";

        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[Calcs]",
                    "properties": Object {
                      "schema": "[TestV1]",
                      "table": "[Calcs]",
                    },
                  },
                  Object {
                    "children": Array [
                      Object {
                        "class": "field",
                        "name": "[0]",
                      },
                      Object {
                        "class": "field",
                        "name": "[1]",
                      },
                      Object {
                        "class": "field",
                        "name": "[2]",
                      },
                      Object {
                        "class": "field",
                        "name": "[3]",
                      },
                    ],
                    "class": "fields",
                    "name": "[index]",
                  },
                  Object {
                    "children": Array [
                      Object {
                        "children": Array [
                          Object {
                            "class": "field",
                            "name": "[bool0]",
                          },
                          Object {
                            "class": "field",
                            "name": "[bool1]",
                          },
                          Object {
                            "class": "field",
                            "name": "[bool2]",
                          },
                          Object {
                            "class": "field",
                            "name": "[bool3]",
                          },
                        ],
                        "class": "fields",
                        "name": "[bool]",
                      },
                      Object {
                        "children": Array [
                          Object {
                            "class": "field",
                            "name": "[int0]",
                          },
                          Object {
                            "class": "field",
                            "name": "[int1]",
                          },
                          Object {
                            "class": "field",
                            "name": "[int2]",
                          },
                          Object {
                            "class": "field",
                            "name": "[int3]",
                          },
                        ],
                        "class": "fields",
                        "name": "[int]",
                      },
                      Object {
                        "children": Array [
                          Object {
                            "class": "field",
                            "name": "[num0]",
                          },
                          Object {
                            "class": "field",
                            "name": "[num1]",
                          },
                          Object {
                            "class": "field",
                            "name": "[num2]",
                          },
                          Object {
                            "class": "field",
                            "name": "[num3]",
                          },
                        ],
                        "class": "fields",
                        "name": "[num]",
                      },
                      Object {
                        "children": Array [
                          Object {
                            "class": "field",
                            "name": "[str0]",
                          },
                          Object {
                            "class": "field",
                            "name": "[str1]",
                          },
                          Object {
                            "class": "field",
                            "name": "[str2]",
                          },
                          Object {
                            "class": "field",
                            "name": "[str3]",
                          },
                        ],
                        "class": "fields",
                        "name": "[str]",
                      },
                    ],
                    "class": "groups",
                    "name": "groups",
                  },
                ],
                "class": "reference",
                "name": "pivot",
                "properties": Object {},
              },
            ]
        `);
    });

    it("should parse positionaljoin", function() {
        const setup = "(positionaljoin " + "  (table [tpcds].[catalog_sales]) " + "  (table [tpcds].[date_dim]) )";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[catalog_sales]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[catalog_sales]",
                    },
                  },
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[date_dim]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[date_dim]",
                    },
                  },
                ],
                "class": "join",
                "name": "positionaljoin",
                "properties": Object {
                  "join": "inner",
                },
              },
            ]
        `);
    });

    it("should parse project", function() {
        const setup = "(project " + "  (table [tpcds].[catalog_sales]) " + "  ( ( [count] (abs [count] ) ) ) )";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[catalog_sales]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[catalog_sales]",
                    },
                  },
                  Object {
                    "children": Array [
                      Object {
                        "children": Array [
                          Object {
                            "children": Array [
                              Object {
                                "class": "field",
                                "name": "[count]",
                              },
                            ],
                            "class": "function",
                            "name": "abs",
                          },
                        ],
                        "class": "binding",
                        "name": "[count]",
                      },
                    ],
                    "class": "bindings",
                    "name": "expressions",
                  },
                ],
                "class": "reference",
                "name": "project",
                "properties": Object {},
              },
            ]
        `);
    });

    it("should parse radix-sort", function() {
        const setup = "(radix-sort (table [tpcds].[date_dim]) ( ( [d_date_sk] asc ) ) )";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[date_dim]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[date_dim]",
                    },
                  },
                  Object {
                    "children": Array [
                      Object {
                        "class": "orderby",
                        "name": "[d_date_sk]",
                        "sense": "asc",
                      },
                    ],
                    "class": "orderbys",
                    "name": "orderbys",
                  },
                ],
                "class": "reference",
                "name": "radix-sort",
                "properties": Object {},
              },
            ]
        `);
    });

    it("should parse restrict", function() {
        const setup = "(restrict (table [tpcds].[catalog_sales]) ( [cs_ship_date_sk] [cs_sold_date_sk] ) )";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[catalog_sales]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[catalog_sales]",
                    },
                  },
                  Object {
                    "children": Array [
                      Object {
                        "class": "field",
                        "name": "[cs_ship_date_sk]",
                      },
                      Object {
                        "class": "field",
                        "name": "[cs_sold_date_sk]",
                      },
                    ],
                    "class": "fields",
                    "name": "restrictions",
                  },
                ],
                "class": "reference",
                "name": "restrict",
                "properties": Object {},
              },
            ]
        `);
    });

    it("should parse scan", function() {
        const setup = "(scan (table [tpcds].[catalog_sales]) ( [cs_ship_date_sk] [cs_sold_date_sk] ) )";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[catalog_sales]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[catalog_sales]",
                    },
                  },
                  Object {
                    "children": Array [
                      Object {
                        "class": "field",
                        "name": "[cs_ship_date_sk]",
                      },
                      Object {
                        "class": "field",
                        "name": "[cs_sold_date_sk]",
                      },
                    ],
                    "class": "fields",
                    "name": "restrictions",
                  },
                ],
                "class": "reference",
                "name": "scan",
                "properties": Object {},
              },
            ]
        `);
    });

    it("should parse select", function() {
        const setup = "(select (table [tpcds].[date_dim]) (>= [d_date_sk] 2450815 ) )";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[date_dim]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[date_dim]",
                    },
                  },
                  Object {
                    "children": Array [
                      Object {
                        "children": Array [
                          Object {
                            "class": "field",
                            "name": "[d_date_sk]",
                          },
                          Object {
                            "class": "integer",
                            "name": "2450815",
                          },
                        ],
                        "class": "function",
                        "name": ">=",
                      },
                    ],
                    "class": "expressions",
                    "name": "predicate",
                  },
                ],
                "class": "reference",
                "name": "select",
                "properties": Object {},
              },
            ]
        `);
    });

    it("should parse shared", function() {
        const setup = '(shared (table [tpcds].[catalog_sales]) "0")';
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[catalog_sales]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[catalog_sales]",
                    },
                  },
                ],
                "class": "reference",
                "name": "shared",
                "properties": Object {
                  "reference": 0,
                },
              },
            ]
        `);
    });

    it("should parse table", function() {
        const setup = "(table [tpcds].[catalog_sales])";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [],
                "class": "table",
                "name": "[catalog_sales]",
                "properties": Object {
                  "schema": "[tpcds]",
                  "table": "[catalog_sales]",
                },
              },
            ]
        `);
    });

    it("should parse text", function() {
        const setup =
            '(text "DebugBlackBox/tpcds/cs_date_sk.csv" ( ' +
            '  ( ( "name" "cs_sold_date_sk" ) ( "factory" "builtin" ) ("builtin" "long" ) ) ' +
            '  ( ( "name" "cs_ship_date_sk" ) ( "factory" "builtin" ) ("builtin" "long" ) ) ) ' +
            '  ( ( "field-separator" "|" ) ( "header-row" "false" ) ) )';

        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [
                      Object {
                        "class": "properties",
                        "name": "[cs_sold_date_sk]",
                        "properties": Object {
                          "builtin": "long",
                          "factory": "builtin",
                        },
                      },
                      Object {
                        "class": "properties",
                        "name": "[cs_ship_date_sk]",
                        "properties": Object {
                          "builtin": "long",
                          "factory": "builtin",
                        },
                      },
                    ],
                    "class": "schema",
                    "name": "schema",
                  },
                ],
                "class": "table",
                "name": "DebugBlackBox/tpcds/cs_date_sk.csv",
                "properties": Object {
                  "field-separator": "|",
                  "header-row": "false",
                },
              },
            ]
        `);
    });

    it("should parse top", function() {
        const setup = "(top (table [tpcds].[date_dim]) ( ( [d_date_sk] asc ) ) 10 )";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[date_dim]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[date_dim]",
                    },
                  },
                  Object {
                    "children": Array [
                      Object {
                        "class": "orderby",
                        "name": "[d_date_sk]",
                        "sense": "asc",
                      },
                    ],
                    "class": "orderbys",
                    "name": "orderbys",
                  },
                ],
                "class": "reference",
                "name": "top",
                "properties": Object {
                  "top": 10,
                },
              },
            ]
        `);
    });

    it("should parse update", function() {
        const setup = "(update " + "  (table [tpcds].[catalog_sales]) " + "  ( ([cs_ship_date_sk] [cs_sold_date_sk]) ) " + "  ) ";
        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[catalog_sales]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[catalog_sales]",
                    },
                  },
                  Object {
                    "children": Array [
                      Object {
                        "class": "rename",
                        "name": "[cs_sold_date_sk]",
                        "source": "[cs_ship_date_sk]",
                      },
                    ],
                    "class": "renames",
                    "name": "updates",
                  },
                ],
                "class": "reference",
                "name": "update",
                "properties": Object {},
              },
            ]
        `);
    });

    it("should parse window", function() {
        const setup =
            "(window " +
            "  (table [tpcds].[catalog_sales]) " +
            "  ( [cs_ship_date_sk] ) " +
            "  ( ( [cs_sold_date_sk] asc ) ) " +
            "  ( ([Length] (rowno) ) ) ) ";

        expect(TQL.parse(setup)).toMatchInlineSnapshot(`
            Array [
              Object {
                "children": Array [
                  Object {
                    "children": Array [],
                    "class": "table",
                    "name": "[catalog_sales]",
                    "properties": Object {
                      "schema": "[tpcds]",
                      "table": "[catalog_sales]",
                    },
                  },
                  Object {
                    "children": Array [
                      Object {
                        "class": "field",
                        "name": "[cs_ship_date_sk]",
                      },
                    ],
                    "class": "fields",
                    "name": "partitionbys",
                  },
                  Object {
                    "children": Array [
                      Object {
                        "class": "orderby",
                        "name": "[cs_sold_date_sk]",
                        "sense": "asc",
                      },
                    ],
                    "class": "orderbys",
                    "name": "orderbys",
                  },
                  Object {
                    "children": Array [
                      Object {
                        "children": Array [
                          Object {
                            "children": Array [],
                            "class": "function",
                            "name": "rowno",
                          },
                        ],
                        "class": "binding",
                        "name": "[Length]",
                      },
                    ],
                    "class": "bindings",
                    "name": "expressions",
                  },
                ],
                "class": "reference",
                "name": "window",
                "properties": Object {},
              },
            ]
        `);
    });
});
