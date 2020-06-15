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

