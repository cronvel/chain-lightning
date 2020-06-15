/*
	Chain Lightning

	Copyright (c) 2018 Cédric Ronvel

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
const SquareTree = lib.SquareTree ;



describe( "Square Tree" , () => {

	describe( "Basic features" , () => {

		it( "Iterator" , () => {
			var tree ;
			
			tree = new SquareTree( { maxLeafPoints: 4 , minLeafPoints: 2 , minChildrenPoints: 3 } ) ;
			
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
			
			tree = new SquareTree() ;
			
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
			
			tree = new SquareTree() ;
			
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

		it( "Node subdivision and node merging" , () => {
			var tree , i , point , leaf ;
			
			tree = new SquareTree( { maxLeafPoints: 4 , minLeafPoints: 2 , minChildrenPoints: 3 } ) ;
			
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
			
			tree = new SquareTree() ;
			tree.add( 0.1 , 0.1 , "bob" ) ;
			tree.debug() ;
		} ) ;

		it( "test2" , () => {
			var tree , i , point , leaf ;
			
			tree = new SquareTree( { maxLeafPoints: 4 } ) ;
			
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
			
			leaf = tree.getLeaf( point ) ;
			console.log( "Searching point: " , point ) ;
			console.log( leaf ) ;
			console.log( leaf.node.points ) ;
		} ) ;

		it( "test3" , () => {
			var tree , i , point , leaf ;
			
			tree = new SquareTree( { maxLeafPoints: 4 } ) ;
			
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

