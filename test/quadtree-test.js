/*
	Chain Lightning

	Copyright (c) 2018 - 2020 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;

/* global describe, it, before, after */



const lib = require( '..' ) ;
const QuadTree = lib.trees() ;
//const QuadTree = require( '../lib/Tree.template.js' ) ;



/*
	Helpers
*/



// Generate data
function generateRawData( n ) {
	var i , array = new Array( n ) ;

	for ( i = 0 ; i < n ; i ++ ) {
		array[ i ] = [ Math.random() , Math.random() , '#' + i ] ;
	}

	return array ;
}



function rawDataClosest( array , x , y ) {
	var element , closest , dist , minDist = Infinity ;

	for ( element of array ) {
		dist = Math.hypot( x - element[ 0 ] , y - element[ 1 ] ) ;
		if ( dist < minDist ) {
			minDist = dist ;
			closest = element ;
		}
	}

	return closest ;
}



function rawDataArea( array , x , y , w , h ) {
	var element , result = [] ;

	for ( element of array ) {
		if ( element[ 0 ] >= x && element[ 0 ] <= x + w && element[ 1 ] >= y && element[ 1 ] <= y + h ) {
			result.push( element ) ;
		}
	}

	result.sort( ( a , b ) => a[ 0 ] === b[ 0 ] ? a[ 1 ] - b[ 1 ] : a[ 0 ] - b[ 0 ] ) ;

	return result ;
}



describe( "Quad Tree" , () => {

	describe( "Basic features" , () => {

		it( "Iterator" , () => {
			var tree ;
			
			tree = new QuadTree( { maxLeafSlots: 4 , minLeafSlots: 2 , minChildrenSlots: 3 } ) ;
			expect( tree.size ).to.be( 0 ) ;
			
			tree.add( 0.1 , 0.1 , "one" ) ;
			tree.add( 0.1 , 0.1 , "two" ) ;
			tree.add( 0.2 , 0.2 , "three" ) ;
			tree.add( 0.3 , 0.3 , "four" ) ;
			expect( [ ... tree.values() ] ).to.equal( [ "one" , "two" , "three" , "four" ] ) ;
			expect( tree.size ).to.be( 4 ) ;

			tree.add( 0.11 , 0.11 , "five" ) ;
			tree.add( 0.12 , 0.12 , "six" ) ;
			tree.add( 0.13 , 0.13 , "seven" ) ;
			tree.add( 0.13 , 0.13 , "eight" ) ;
			tree.add( 0.13 , 0.13 , "nine" ) ;
			expect( [ ... tree.values() ] ).to.equal( [ "one" , "two" , "five" , "six" , "three" , "seven" , "eight" , "nine" , "four" ] ) ;
			expect( tree.size ).to.be( 9 ) ;
		} ) ;

		it( "Stack elements on the same slot" , () => {
			var tree ;
			
			tree = new QuadTree() ;
			
			tree.add( 0.1 , 0.1 , "one" ) ;
			expect( tree.size ).to.be( 1 ) ;
			expect( tree.getOne( 0.1 , 0.1 ) ).to.be( "one" ) ;
			expect( tree.getMany( 0.1 , 0.1 ) ).to.equal( [ "one" ] ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;

			tree.add( 0.1 , 0.1 , "two" ) ;
			expect( tree.size ).to.be( 2 ) ;
			expect( tree.getOne( 0.1 , 0.1 ) ).to.be( "one" ) ;
			expect( tree.getMany( 0.1 , 0.1 ) ).to.equal( [ "one" , "two" ] ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;
		} ) ;

		it( ".deleteElement()" , () => {
			var tree , deletedCount ;
			
			tree = new QuadTree() ;
			
			tree.add( 0.1 , 0.1 , "one" ) ;
			tree.add( 0.1 , 0.1 , "two" ) ;
			tree.add( 0.2 , 0.2 , "three" ) ;
			expect( tree.size ).to.be( 3 ) ;
			expect( [ ... tree ] ).to.equal( [
				[ { x: 0.1 , y: 0.1 } , "one" ] ,
				[ { x: 0.1 , y: 0.1 } , "two" ] ,
				[ { x: 0.2 , y: 0.2 } , "three" ]
			] ) ;

			deletedCount = tree.deleteElement( 0.2 , 0.2 , "one" ) 
			expect( deletedCount ).to.be( 0 ) ;
			expect( tree.size ).to.be( 3 ) ;
			expect( [ ... tree ] ).to.equal( [
				[ { x: 0.1 , y: 0.1 } , "one" ] ,
				[ { x: 0.1 , y: 0.1 } , "two" ] ,
				[ { x: 0.2 , y: 0.2 } , "three" ]
			] ) ;

			deletedCount = tree.deleteElement( 0.1 , 0.1 , "one" ) 
			expect( deletedCount ).to.be( 1 ) ;
			expect( tree.size ).to.be( 2 ) ;
			expect( [ ... tree ] ).to.equal( [
				[ { x: 0.1 , y: 0.1 } , "two" ] ,
				[ { x: 0.2 , y: 0.2 } , "three" ]
			] ) ;

			deletedCount = tree.deleteElement( 0.1 , 0.1 , "two" ) 
			expect( deletedCount ).to.be( 1 ) ;
			expect( tree.size ).to.be( 1 ) ;
			expect( [ ... tree ] ).to.equal( [
				[ { x: 0.2 , y: 0.2 } , "three" ]
			] ) ;

			deletedCount = tree.deleteElement( 0.2 , 0.2 , "three" ) 
			expect( deletedCount ).to.be( 1 ) ;
			expect( tree.size ).to.be( 0 ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;

			// Now delete identical values at the same slot
			tree = new QuadTree() ;
			
			tree.add( 0.1 , 0.1 , "other1" ) ;
			tree.add( 0.1 , 0.1 , "same" ) ;
			tree.add( 0.1 , 0.1 , "same" ) ;
			tree.add( 0.1 , 0.1 , "same" ) ;
			tree.add( 0.1 , 0.1 , "other2" ) ;
			tree.add( 0.2 , 0.2 , "other3" ) ;
			tree.add( 0.2 , 0.2 , "same" ) ;
			expect( tree.size ).to.be( 7 ) ;
			expect( [ ... tree ] ).to.equal( [
				[ { x: 0.1 , y: 0.1 } , "other1" ] ,
				[ { x: 0.1 , y: 0.1 } , "same" ] ,
				[ { x: 0.1 , y: 0.1 } , "same" ] ,
				[ { x: 0.1 , y: 0.1 } , "same" ] ,
				[ { x: 0.1 , y: 0.1 } , "other2" ] ,
				[ { x: 0.2 , y: 0.2 } , "other3" ] ,
				[ { x: 0.2 , y: 0.2 } , "same" ]
			] ) ;

			deletedCount = tree.deleteElement( 0.1 , 0.1 , "same" ) 
			expect( deletedCount ).to.be( 3 ) ;
			expect( tree.size ).to.be( 4 ) ;
			expect( [ ... tree ] ).to.equal( [
				[ { x: 0.1 , y: 0.1 } , "other1" ] ,
				[ { x: 0.1 , y: 0.1 } , "other2" ] ,
				[ { x: 0.2 , y: 0.2 } , "other3" ] ,
				[ { x: 0.2 , y: 0.2 } , "same" ]
			] ) ;
		} ) ;

		it( "Get leaves/slots/elements of an area" , () => {
			var tree , elements , slots , leaves ;
			
			tree = new QuadTree( { maxLeafSlots: 4 , minLeafSlots: 2 , minChildrenSlots: 3 } ) ;
			
			tree.add( 0.11 , 0.11 , "one" ) ;
			tree.add( 0.12 , 0.12 , "two" ) ;
			tree.add( 0.13 , 0.13 , "three" ) ;
			tree.add( 0.13 , 0.13 , "three²" ) ;
			tree.add( 0.14 , 0.14 , "four" ) ;
			tree.add( 0.15 , 0.15 , "five" ) ;
			leaves = tree.getAreaLeaves( 0.1 , 0.1 , 0.03 , 0.03 ) ;
			
			// Make it suitable for the assertion lib, transform Set into simple array
			leaves[ 0 ].slots = [ ... leaves[ 0 ].slots ] ;
			leaves[ 1 ].slots = [ ... leaves[ 1 ].slots ] ;
			//console.log( "leaves" , leaves ) ;
			expect( leaves ).to.be.like( [
				{
					slots: [
						{ x: 0.11, y: 0.11, e: 'one', s: null },
						{ x: 0.12, y: 0.12, e: 'two', s: null }
					],
					children: null
				},
				{
					slots: [
						{ x: 0.13, y: 0.13, e: undefined, s: [ 'three', 'three²' ] },
						{ x: 0.14, y: 0.14, e: 'four', s: null },
						{ x: 0.15, y: 0.15, e: 'five', s: null }
					],
					children: null
				}
			] ) ;
			
			slots = tree.getAreaSlots( 0.1 , 0.1 , 0.03 , 0.03 ) ;
			//console.log( "slots:" , slots ) ;
			expect( slots ).to.be.like( [
				{ x: 0.11, y: 0.11, e: 'one', s: null },
				{ x: 0.12, y: 0.12, e: 'two', s: null },
				{ x: 0.13, y: 0.13, e: undefined, s: [ 'three', 'three²' ] }
			] ) ;

			elements = tree.getArea( 0.1 , 0.1 , 0.03 , 0.03 ) ;
			//console.log( "elements:" , elements ) ;
			expect( elements ).to.equal( [ 'one', 'two', 'three', 'three²' ] ) ;
		} ) ;

		it( "Test the area algorithm on random data, comparing it to brute-force results" , () => {
			var tree , slots , elements , rawElements ,
				randomX , randomY , randomW , randomH ,
				testCount = 100 , areaSizeLimit = 0.5 ,
				rawData = generateRawData( 1000 ) ;
			
			tree = new QuadTree() ;
			for ( let e of rawData ) { tree.add( ... e ) ; }

			//console.log( "tree node:" , tree.nodeCount() , " -- tree leaves:" , tree.leafCount() ) ;

			while ( testCount -- ) {
				//QuadTree.overlap = QuadTree.encompass = QuadTree.seen = 0 ;
				randomW = Math.random() * areaSizeLimit ;
				randomX = Math.random() * ( 1 - randomW ) ;
				
				randomH = Math.random() * areaSizeLimit ;
				randomY = Math.random() * ( 1 - randomH ) ;

				slots = tree.getAreaSlots( randomX , randomY , randomW , randomH ) ;
				//console.log( "Seen:" , QuadTree.seen , " -- Overlap:" , QuadTree.overlap , " -- Encompass:" , QuadTree.encompass ) ;
				elements = tree.getArea( randomX , randomY , randomW , randomH ) ;
				// They must come in the same order, and BTW the test should be performed BEFORE sorting
				expect( slots.map( p => p.e ) ).to.equal( elements ) ;

				slots.sort( ( a , b ) => a.x === b.x ? a.y - b.y : a.x - b.x ) ;
				slots = slots.map( e => [ e.x , e.y , e.e ] ) ;
				rawElements = rawDataArea( rawData , randomX , randomY , randomW , randomH ) ;

				expect( slots ).to.equal( rawElements ) ;
			}
		} ) ;

		it( "Test the closest slot algorithm on random data, comparing it to brute-force results" , () => {
			var tree , slot , element , rawElement ,
				randomX , randomY ,
				testCount = 100 ,
				rawData = generateRawData( 1000 ) ;
			
			tree = new QuadTree() ;
			for ( let e of rawData ) { tree.add( ... e ) ; }

			while ( testCount -- ) {
				randomX = Math.random() ;
				randomY = Math.random() ;
				slot = tree.getClosestSlotTo( randomX , randomY ) ;
				element = tree.getClosestTo( randomX , randomY ) ;
				rawElement = rawDataClosest( rawData , randomX , randomY ) ;
				//console.log( "\n\nRESULTS:\n" , slot , rawElement ) ;
				expect( slot.x ).to.be( rawElement[ 0 ] ) ;
				expect( slot.y ).to.be( rawElement[ 1 ] ) ;
				expect( slot.e ).to.be( rawElement[ 2 ] ) ;
				expect( slot.e ).to.be( element ) ;
			}
		} ) ;

		it( "Node subdivision and node merging" , () => {
			var tree , i , slot , leaf ;
			
			tree = new QuadTree( { maxLeafSlots: 4 , minLeafSlots: 2 , minChildrenSlots: 3 } ) ;
			
			tree.add( 0.11 , 0.11 , "one" ) ;
			tree.add( 0.12 , 0.12 , "two" ) ;
			tree.add( 0.13 , 0.13 , "three" ) ;
			tree.add( 0.14 , 0.14 , "four" ) ;
			expect( tree.trunk.children ).to.be( null ) ;
			expect( [ ... tree.trunk.slots ] ).to.be.like( [
				{ x: 0.11, y: 0.11, e: "one", s: null } ,
				{ x: 0.12, y: 0.12, e: "two", s: null } ,
				{ x: 0.13, y: 0.13, e: "three", s: null } ,
				{ x: 0.14, y: 0.14, e: "four", s: null } ,
			] ) ;

			tree.add( 0.15 , 0.15 , "five" ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;
			expect( [ ... tree.trunk.children[0].children[0].children[0].slots ] ).to.be.like( [
				{ x: 0.11, y: 0.11, e: "one", s: null } ,
				{ x: 0.12, y: 0.12, e: "two", s: null }
			] ) ;
			expect( [ ... tree.trunk.children[0].children[0].children[3].slots ] ).to.be.like( [
				{ x: 0.13, y: 0.13, e: "three", s: null } ,
				{ x: 0.14, y: 0.14, e: "four", s: null } ,
				{ x: 0.15, y: 0.15, e: "five", s: null }
			] ) ;

			tree.removeSlot( 0.11 , 0.11 ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;
			expect( [ ... tree.trunk.children[0].children[0].children[0].slots ] ).to.be.like( [
				{ x: 0.12, y: 0.12, e: "two", s: null }
			] ) ;
			expect( [ ... tree.trunk.children[0].children[0].children[3].slots ] ).to.be.like( [
				{ x: 0.13, y: 0.13, e: "three", s: null } ,
				{ x: 0.14, y: 0.14, e: "four", s: null } ,
				{ x: 0.15, y: 0.15, e: "five", s: null }
			] ) ;

			tree.removeSlot( 0.12 , 0.12 ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;
			expect( [ ... tree.trunk.children[0].children[0].children[0].slots ] ).to.be.like( [] ) ;
			expect( [ ... tree.trunk.children[0].children[0].children[3].slots ] ).to.be.like( [
				{ x: 0.13, y: 0.13, e: "three", s: null } ,
				{ x: 0.14, y: 0.14, e: "four", s: null } ,
				{ x: 0.15, y: 0.15, e: "five", s: null }
			] ) ;

			tree.removeSlot( 0.13 , 0.13 ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;
			expect( tree.trunk.children ).to.be( null ) ;
			expect( [ ... tree.trunk.slots ] ).to.be.like( [
				{ x: 0.14, y: 0.14, e: "four", s: null } ,
				{ x: 0.15, y: 0.15, e: "five", s: null }
			] ) ;
		} ) ;

		it( "Out of trunk-node BBox should create a new zoomed-out trunk-node" , () => {
			var tree , i , slot , leaf ;
			
			tree = new QuadTree( { maxLeafSlots: 4 , minLeafSlots: 2 , minChildrenSlots: 3 , autoResize: true } ) ;
			
			tree.add( 0.11 , 0.11 , "one" ) ;
			tree.add( 0.12 , 0.12 , "two" ) ;
			tree.add( 0.13 , 0.13 , "three" ) ;
			tree.add( 0.14 , 0.14 , "four" ) ;
			tree.add( 0.15 , 0.15 , "five" ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;
			expect( [ ... tree.trunk.children[0].children[0].children[0].slots ] ).to.be.like( [
				{ x: 0.11, y: 0.11, e: "one", s: null } ,
				{ x: 0.12, y: 0.12, e: "two", s: null }
			] ) ;
			expect( [ ... tree.trunk.children[0].children[0].children[3].slots ] ).to.be.like( [
				{ x: 0.13, y: 0.13, e: "three", s: null } ,
				{ x: 0.14, y: 0.14, e: "four", s: null } ,
				{ x: 0.15, y: 0.15, e: "five", s: null }
			] ) ;

			// Force a single zoom-out
			tree.add( 1.2 , 1.2 , "out-one" ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;
			expect( [ ... tree.trunk.children[0].children[0].children[0].children[0].slots ] ).to.be.like( [
				{ x: 0.11, y: 0.11, e: "one", s: null } ,
				{ x: 0.12, y: 0.12, e: "two", s: null }
			] ) ;
			expect( [ ... tree.trunk.children[0].children[0].children[0].children[3].slots ] ).to.be.like( [
				{ x: 0.13, y: 0.13, e: "three", s: null } ,
				{ x: 0.14, y: 0.14, e: "four", s: null } ,
				{ x: 0.15, y: 0.15, e: "five", s: null }
			] ) ;
			expect( [ ... tree.trunk.children[3].slots ] ).to.be.like( [
				{ x: 1.2, y: 1.2, e: "out-one", s: null }
			] ) ;


			// Force a double zoom-out
			tree = new QuadTree( { maxLeafSlots: 4 , minLeafSlots: 2 , minChildrenSlots: 3 , autoResize: true } ) ;
			
			tree.add( 0.11 , 0.11 , "one" ) ;
			tree.add( 0.12 , 0.12 , "two" ) ;
			tree.add( 0.13 , 0.13 , "three" ) ;
			tree.add( 0.14 , 0.14 , "four" ) ;
			tree.add( 0.15 , 0.15 , "five" ) ;
			tree.add( 2.2 , 2.2 , "out-one" ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;
			expect( [ ... tree.trunk.children[0].children[0].children[0].children[0].children[0].slots ] ).to.be.like( [
				{ x: 0.11, y: 0.11, e: "one", s: null } ,
				{ x: 0.12, y: 0.12, e: "two", s: null }
			] ) ;
			expect( [ ... tree.trunk.children[0].children[0].children[0].children[0].children[3].slots ] ).to.be.like( [
				{ x: 0.13, y: 0.13, e: "three", s: null } ,
				{ x: 0.14, y: 0.14, e: "four", s: null } ,
				{ x: 0.15, y: 0.15, e: "five", s: null }
			] ) ;
			expect( [ ... tree.trunk.children[3].slots ] ).to.be.like( [
				{ x: 2.2, y: 2.2, e: "out-one", s: null }
			] ) ;


			// Translate trunk BBox when the first item to be inserted is out of bounds
			tree = new QuadTree( { maxLeafSlots: 4 , minLeafSlots: 2 , minChildrenSlots: 3 , autoResize: true } ) ;
			
			tree.add( 2.2 , 2.2 , "out-one" ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;
			expect( tree.x ).to.be( 2 ) ;
			expect( tree.y ).to.be( 2 ) ;
			expect( tree.areaSize ).to.be( 1 ) ;
			expect( [ ... tree.trunk.slots ] ).to.be.like( [
				{ x: 2.2, y: 2.2, e: "out-one", s: null }
			] ) ;

			tree.add( 2.2 , 2.3 , "out-two" ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;
			expect( tree.x ).to.be( 2 ) ;
			expect( tree.y ).to.be( 2 ) ;
			expect( tree.areaSize ).to.be( 1 ) ;
			expect( [ ... tree.trunk.slots ] ).to.be.like( [
				{ x: 2.2, y: 2.2, e: "out-one", s: null } ,
				{ x: 2.2, y: 2.3, e: "out-two", s: null }
			] ) ;

			tree = new QuadTree( { maxLeafSlots: 4 , minLeafSlots: 2 , minChildrenSlots: 3 , autoResize: true } ) ;
			
			tree.add( -0.3 , 0.4 , "out-one" ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;
			expect( tree.x ).to.be( -1 ) ;
			expect( tree.y ).to.be( 0 ) ;
			expect( tree.areaSize ).to.be( 1 ) ;
			expect( [ ... tree.trunk.slots ] ).to.be.like( [
				{ x: -0.3, y: 0.4, e: "out-one", s: null }
			] ) ;

			tree = new QuadTree( { maxLeafSlots: 4 , minLeafSlots: 2 , minChildrenSlots: 3 , autoResize: true } ) ;
			
			tree.add( 12.3 , 0.4 , "out-one" ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;
			expect( tree.x ).to.be( 12 ) ;
			expect( tree.y ).to.be( 0 ) ;
			expect( tree.areaSize ).to.be( 1 ) ;
			expect( [ ... tree.trunk.slots ] ).to.be.like( [
				{ x: 12.3, y: 0.4, e: "out-one", s: null }
			] ) ;
		} ) ;
	} ) ;
} ) ;

