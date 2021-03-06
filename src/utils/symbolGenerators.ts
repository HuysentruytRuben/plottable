///<reference path="../reference.ts" />

module Plottable {

  /**
   * A SymbolGenerator is a function that takes in a datum and the index of the datum to
   * produce an svg path string analogous to the datum/index pair.
   *
   * Note that SymbolGenerators used in Plottable will be assumed to work within a 100x100 square
   * to be scaled appropriately for use within Plottable
   */
  export type SymbolGenerator = (datum: any, index: number) => string;

  export module SymbolGenerators {

    /**
     * The radius that symbol generators will be assumed to have for their symbols.
     */
    export var SYMBOL_GENERATOR_RADIUS = 50;

    export type StringAccessor = ((datum: any, index: number) => string);

    /**
     * A wrapper for D3's symbol generator as documented here:
     * https://github.com/mbostock/d3/wiki/SVG-Shapes#symbol
     *
     * Note that since D3 symbols compute the path strings by knowing how much area it can take up instead of
     * knowing its dimensions, the total area expected may be off by some constant factor.
     *
     * @param {string | ((datum: any, index: number) => string)} symbolType Accessor for the d3 symbol type
     * @returns {SymbolGenerator} the symbol generator for a D3 symbol
     */
    export function d3Symbol(symbolType: string | StringAccessor) {
      // Since D3 symbols use a size concept, we have to convert our radius value to the corresponding area value
      // This is done by inspecting the symbol size calculation in d3.js and solving how sizes are calculated from a given radius
      var typeToSize = (symbolTypeString: string) => {
        var sizeFactor: number;
        switch(symbolTypeString) {
          case "circle":
            sizeFactor = Math.PI;
            break;
          case "square":
            sizeFactor = 4;
            break;
          case "cross":
            sizeFactor = 20/9;
            break;
          case "diamond":
            sizeFactor = 2 * Math.tan(Math.PI / 6);
            break;
          case "triangle-up":
          case "triangle-down":
            sizeFactor = Math.sqrt(3);
            break;
          default:
            sizeFactor = 1;
            break;
        }

        return sizeFactor * Math.pow(SYMBOL_GENERATOR_RADIUS, 2);
      };

      function ensureSymbolType(symTypeString: string) {
        if (d3.svg.symbolTypes.indexOf(symTypeString) === -1) {
          throw new Error(symTypeString + " is an invalid D3 symbol type.  d3.svg.symbolTypes can retrieve the valid symbol types.");
        }
        return symTypeString;
      }

      var symbolSize = typeof(symbolType) === "string" ?
                         typeToSize(ensureSymbolType(<string> symbolType)) :
                         (datum: any, index: number) => typeToSize(ensureSymbolType((<StringAccessor> symbolType)(datum, index)));

      return d3.svg.symbol().type(symbolType).size(symbolSize);
    }

  }
}
