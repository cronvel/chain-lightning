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
const QuadTree = lib.QuadTree ;



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
			
			tree = new QuadTree( { maxLeafPoints: 4 , minLeafPoints: 2 , minChildrenPoints: 3 } ) ;
			
			tree.add( 0.1 , 0.1 , "one" ) ;
			tree.add( 0.1 , 0.1 , "two" ) ;
			tree.add( 0.2 , 0.2 , "three" ) ;
			tree.add( 0.3 , 0.3 , "four" ) ;
			expect( [ ... tree.values() ] ).to.equal( [ "one" , "two" , "three" , "four" ] ) ;

			tree.add( 0.11 , 0.11 , "five" ) ;
			tree.add( 0.12 , 0.12 , "six" ) ;
			tree.add( 0.13 , 0.13 , "seven" ) ;
			tree.add( 0.13 , 0.13 , "eight" ) ;
			tree.add( 0.13 , 0.13 , "nine" ) ;
			expect( [ ... tree.values() ] ).to.equal( [ "one" , "two" , "five" , "six" , "three" , "seven" , "eight" , "nine" , "four" ] ) ;
		} ) ;

		it( "Stack elements on the same point" , () => {
			var tree ;
			
			tree = new QuadTree() ;
			
			tree.add( 0.1 , 0.1 , "one" ) ;
			expect( tree.getOne( 0.1 , 0.1 ) ).to.be( "one" ) ;
			expect( tree.getMany( 0.1 , 0.1 ) ).to.equal( [ "one" ] ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;

			tree.add( 0.1 , 0.1 , "two" ) ;
			expect( tree.getOne( 0.1 , 0.1 ) ).to.be( "one" ) ;
			expect( tree.getMany( 0.1 , 0.1 ) ).to.equal( [ "one" , "two" ] ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;
		} ) ;

		it( ".deleteElement()" , () => {
			var tree ;
			
			tree = new QuadTree() ;
			
			tree.add( 0.1 , 0.1 , "one" ) ;
			tree.add( 0.1 , 0.1 , "two" ) ;
			tree.add( 0.2 , 0.2 , "three" ) ;
			expect( [ ... tree ] ).to.equal( [
				[ { x: 0.1 , y: 0.1 } , "one" ] ,
				[ { x: 0.1 , y: 0.1 } , "two" ] ,
				[ { x: 0.2 , y: 0.2 } , "three" ]
			] ) ;

			tree.deleteElement( 0.2 , 0.2 , "one" ) 
			expect( [ ... tree ] ).to.equal( [
				[ { x: 0.1 , y: 0.1 } , "one" ] ,
				[ { x: 0.1 , y: 0.1 } , "two" ] ,
				[ { x: 0.2 , y: 0.2 } , "three" ]
			] ) ;

			tree.deleteElement( 0.1 , 0.1 , "one" ) 
			expect( [ ... tree ] ).to.equal( [
				[ { x: 0.1 , y: 0.1 } , "two" ] ,
				[ { x: 0.2 , y: 0.2 } , "three" ]
			] ) ;

			tree.deleteElement( 0.1 , 0.1 , "two" ) 
			expect( [ ... tree ] ).to.equal( [
				[ { x: 0.2 , y: 0.2 } , "three" ]
			] ) ;

			tree.deleteElement( 0.2 , 0.2 , "three" ) 
			expect( [ ... tree ] ).to.equal( [] ) ;
		} ) ;

		it( "zzz Get leaves/points/elements of an area" , () => {
			var tree , elements , points , leaves ;
			
			tree = new QuadTree( { maxLeafPoints: 4 , minLeafPoints: 2 , minChildrenPoints: 3 } ) ;
			
			tree.add( 0.11 , 0.11 , "one" ) ;
			tree.add( 0.12 , 0.12 , "two" ) ;
			tree.add( 0.13 , 0.13 , "three" ) ;
			tree.add( 0.13 , 0.13 , "three²" ) ;
			tree.add( 0.14 , 0.14 , "four" ) ;
			tree.add( 0.15 , 0.15 , "five" ) ;
			leaves = tree.getAreaLeaves( 0.1 , 0.1 , 0.03 , 0.03 ) ;
			console.log( "leaves" , leaves ) ;
			points = tree.getAreaPoints( 0.1 , 0.1 , 0.03 , 0.03 ) ;
			console.log( "points:" , points ) ;
			elements = tree.getArea( 0.1 , 0.1 , 0.03 , 0.03 ) ;
			console.log( "elements:" , elements ) ;
		} ) ;

		it( "Test the area algorithm on random data, comparing it to brute-force results" , () => {
			var tree , points , elements , rawElements ,
				randomX , randomY , randomX2 , randomY2 , randomW , randomH ,
				testCount = 100 ,
				rawData = generateRawData( 1000 ) ;
			
			tree = new QuadTree() ;
			for ( let e of rawData ) { tree.add( ... e ) ; }

			while ( testCount -- ) {
				randomX = Math.random() ;
				randomX2 = Math.random() ;
				if ( randomX <= randomX2 ) { randomW = randomX2 - randomX ; }
				else { randomW = randomX - randomX2 ; randomX = randomX2 ; }

				randomY = Math.random() ;
				randomY2 = Math.random() ;
				if ( randomY <= randomY2 ) { randomH = randomY2 - randomY ; }
				else { randomH = randomY - randomY2 ; randomY = randomY2 ; }

				points = tree.getAreaPoints( randomX , randomY , randomW , randomH ) ;
				elements = tree.getArea( randomX , randomY , randomW , randomH ) ;
				// They must come in the same order, and BTW the test should be performed BEFORE sorting
				expect( points.map( p => p.e ) ).to.equal( elements ) ;

				points.sort( ( a , b ) => a.x === b.x ? a.y - b.y : a.x - b.x ) ;
				points = points.map( e => [ e.x , e.y , e.e ] ) ;
				rawElements = rawDataArea( rawData , randomX , randomY , randomW , randomH ) ;

				expect( points ).to.equal( rawElements ) ;
			}
		} ) ;

		it( "Test the closest point algorithme on random data, comparing it to brute-force results" , () => {
			var tree , point , element , rawElement ,
				randomX , randomY ,
				testCount = 100 ,
				rawData = generateRawData( 1000 ) ;
			
			tree = new QuadTree() ;
			for ( let e of rawData ) { tree.add( ... e ) ; }

			while ( testCount -- ) {
				randomX = Math.random() ;
				randomY = Math.random() ;
				point = tree.getClosestPointTo( randomX , randomY ) ;
				element = tree.getClosestTo( randomX , randomY ) ;
				rawElement = rawDataClosest( rawData , randomX , randomY ) ;
				//console.log( "\n\nRESULTS:\n" , point , rawElement ) ;
				expect( point.x ).to.be( rawElement[ 0 ] ) ;
				expect( point.y ).to.be( rawElement[ 1 ] ) ;
				expect( point.e ).to.be( rawElement[ 2 ] ) ;
				expect( point.e ).to.be( element ) ;
			}
		} ) ;

		it( "Node subdivision and node merging" , () => {
			var tree , i , point , leaf ;
			
			tree = new QuadTree( { maxLeafPoints: 4 , minLeafPoints: 2 , minChildrenPoints: 3 } ) ;
			
			tree.add( 0.11 , 0.11 , "one" ) ;
			tree.add( 0.12 , 0.12 , "two" ) ;
			tree.add( 0.13 , 0.13 , "three" ) ;
			tree.add( 0.14 , 0.14 , "four" ) ;
			expect( tree.trunc.children ).to.be( null ) ;
			expect( [ ... tree.trunc.points ] ).to.be.like( [
				{ x: 0.11, y: 0.11, e: "one" } ,
				{ x: 0.12, y: 0.12, e: "two" } ,
				{ x: 0.13, y: 0.13, e: "three" } ,
				{ x: 0.14, y: 0.14, e: "four" } ,
			] ) ;

			tree.add( 0.15 , 0.15 , "five" ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;
			expect( [ ... tree.trunc.children[0].children[0].children[0].points ] ).to.be.like( [
				{ x: 0.11, y: 0.11, e: "one" } ,
				{ x: 0.12, y: 0.12, e: "two" }
			] ) ;
			expect( [ ... tree.trunc.children[0].children[0].children[3].points ] ).to.be.like( [
				{ x: 0.13, y: 0.13, e: "three" } ,
				{ x: 0.14, y: 0.14, e: "four" } ,
				{ x: 0.15, y: 0.15, e: "five" }
			] ) ;

			tree.removePoint( 0.11 , 0.11 ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;
			expect( [ ... tree.trunc.children[0].children[0].children[0].points ] ).to.be.like( [
				{ x: 0.12, y: 0.12, e: "two" }
			] ) ;
			expect( [ ... tree.trunc.children[0].children[0].children[3].points ] ).to.be.like( [
				{ x: 0.13, y: 0.13, e: "three" } ,
				{ x: 0.14, y: 0.14, e: "four" } ,
				{ x: 0.15, y: 0.15, e: "five" }
			] ) ;

			tree.removePoint( 0.12 , 0.12 ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;
			expect( [ ... tree.trunc.children[0].children[0].children[0].points ] ).to.be.like( [] ) ;
			expect( [ ... tree.trunc.children[0].children[0].children[3].points ] ).to.be.like( [
				{ x: 0.13, y: 0.13, e: "three" } ,
				{ x: 0.14, y: 0.14, e: "four" } ,
				{ x: 0.15, y: 0.15, e: "five" }
			] ) ;

			tree.removePoint( 0.13 , 0.13 ) ;
			//tree.debugValues() ; console.log( "\n\n------------\n\n" ) ;
			expect( tree.trunc.children ).to.be( null ) ;
			expect( [ ... tree.trunc.points ] ).to.be.like( [
				{ x: 0.14, y: 0.14, e: "four" } ,
				{ x: 0.15, y: 0.15, e: "five" }
			] ) ;
		} ) ;
	} ) ;

	describe( "misc tests" , () => {
		
		it( "test1" , () => {
			var tree ;
			
			tree = new QuadTree() ;
			tree.add( 0.1 , 0.1 , "bob" ) ;
			tree.debug() ;
		} ) ;

		it( "test2" , () => {
			var tree , i , point , leaf ;
			
			tree = new QuadTree( { maxLeafPoints: 4 } ) ;
			
			for ( i = 0 ; i < 16 ; i ++ ) {
				tree.add( Math.random() , Math.random() , "bob" + Math.floor( 1000 * Math.random() ) ) ;
			}
			tree.debugValues() ;

			console.log( "\n\n------------\n\n" ) ;

			point = tree.add( Math.random() , Math.random() , "bob" + Math.floor( 1000 * Math.random() ) ) ;
			tree.debugValues() ;

			console.log( "\n\n------------\n\n" ) ;

			for ( i = 0 ; i < 64 ; i ++ ) {
				tree.add( Math.random() , Math.random() , "bob" + Math.floor( 1000 * Math.random() ) ) ;
			}
			tree.debugValues() ;
			
			leaf = tree.getLeaf( point.x , point.y ) ;
			console.log( "Searching point: " , point ) ;
			console.log( leaf ) ;
			console.log( leaf.node.points ) ;
		} ) ;

		it( "test3" , () => {
			var tree , i , point , leaf ;
			
			tree = new QuadTree( { maxLeafPoints: 4 } ) ;
			
			console.log( "\n\n------------\n\n" ) ;

			for ( i = 0 ; i < 64 ; i ++ ) {
				tree.add( 0.1 * Math.random() , 0.1 * Math.random() , "bob" + Math.floor( 1000 * Math.random() ) ) ;
			}

			point = tree.add( 0.1 * Math.random() , 0.1 * Math.random() , "bob" + Math.floor( 1000 * Math.random() ) ) ;
			tree.debugValues() ;
			
			leaf = tree.getLeaf( point.x , point.y ) ;
			console.log( "Searching point: " , point ) ;
			console.log( leaf ) ;
			console.log( leaf.node.points ) ;
		} ) ;
	} ) ;
} ) ;

