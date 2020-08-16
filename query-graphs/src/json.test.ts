import {loadJsonFromText} from "./json";

describe("JSON parsing", function() {
    it("parses arrays", function() {
        expect(loadJsonFromText('[1, true, null, "asd"]')).toMatchInlineSnapshot(`
            Object {
              "root": Object {
                "children": Array [
                  Object {
                    "children": Array [
                      Object {
                        "name": "1:number",
                        "properties": Object {
                          "type": "number",
                          "value": "1",
                        },
                      },
                    ],
                    "name": "0",
                  },
                  Object {
                    "children": Array [
                      Object {
                        "name": "true:boolean",
                        "properties": Object {
                          "type": "boolean",
                          "value": "true",
                        },
                      },
                    ],
                    "name": "1",
                  },
                  Object {
                    "children": Array [
                      Object {
                        "name": "null:object",
                        "properties": Object {
                          "type": "object",
                          "value": "null",
                        },
                      },
                    ],
                    "name": "2",
                  },
                  Object {
                    "children": Array [
                      Object {
                        "name": "asd:string",
                        "properties": Object {
                          "type": "string",
                          "value": "asd",
                        },
                      },
                    ],
                    "name": "3",
                  },
                ],
                "name": "root",
              },
            }
        `);
    });

    it("parses nested arrays", function() {
        expect(loadJsonFromText("[[1,2],3,[[]],4]")).toMatchInlineSnapshot(`
            Object {
              "root": Object {
                "children": Array [
                  Object {
                    "children": Array [
                      Object {
                        "children": Array [
                          Object {
                            "name": "1:number",
                            "properties": Object {
                              "type": "number",
                              "value": "1",
                            },
                          },
                        ],
                        "name": "0",
                      },
                      Object {
                        "children": Array [
                          Object {
                            "name": "2:number",
                            "properties": Object {
                              "type": "number",
                              "value": "2",
                            },
                          },
                        ],
                        "name": "1",
                      },
                    ],
                    "name": "0",
                  },
                  Object {
                    "children": Array [
                      Object {
                        "name": "3:number",
                        "properties": Object {
                          "type": "number",
                          "value": "3",
                        },
                      },
                    ],
                    "name": "1",
                  },
                  Object {
                    "children": Array [
                      Object {
                        "children": Array [],
                        "name": "0",
                      },
                    ],
                    "name": "2",
                  },
                  Object {
                    "children": Array [
                      Object {
                        "name": "4:number",
                        "properties": Object {
                          "type": "number",
                          "value": "4",
                        },
                      },
                    ],
                    "name": "3",
                  },
                ],
                "name": "root",
              },
            }
        `);
    });

    it("parses objects", function() {
        expect(loadJsonFromText('{"a": "b", "c": 1}')).toMatchInlineSnapshot(`
            Object {
              "root": Object {
                "children": Array [
                  Object {
                    "children": Array [
                      Object {
                        "name": "b:string",
                        "properties": Object {
                          "type": "string",
                          "value": "b",
                        },
                      },
                    ],
                    "name": "a",
                  },
                  Object {
                    "children": Array [
                      Object {
                        "name": "1:number",
                        "properties": Object {
                          "type": "number",
                          "value": "1",
                        },
                      },
                    ],
                    "name": "c",
                  },
                ],
                "name": "root",
              },
            }
        `);
    });
});
