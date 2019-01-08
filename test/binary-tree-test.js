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
const BinaryTree = lib.BinaryTree ;





			/* Tests */



describe( "Binary Tree" , () => {

	describe( "Basic features" , () => {
		
		it( "constructor arguments should be added as elements" , () => {
			var tree ;
			
			tree = new BinaryTree() ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( null , 'jack' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jack' ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( null , 'jack' , 'jean' , 'steve' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
			tree.sanityCheck() ;

			tree = new BinaryTree( null , 'jack' , 'jean' , 'steve' , 'bob' , 'joe' , 'russel' , 'marco' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jack' , 'jean' , 'steve' , 'bob' , 'joe' , 'russel' , 'marco' ] ) ;
			tree.sanityCheck() ;
		} ) ;
		
		it( "BinaryTree.from() should create a tree from any iterable" , () => {
			var tree ;
			
			tree = BinaryTree.from( new Set() ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = BinaryTree.from( new Set( [ 'jack' ] ) ) ;
			expect( [ ... tree ] ).to.equal( [ 'jack' ] ) ;
			tree.sanityCheck() ;
			
			tree = BinaryTree.from( new Set( [ 'jack' , 'jean' , 'steve' ] ) ) ;
			tree.sanityCheck() ;
			expect( [ ... tree ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
		} ) ;
		
		it( ".values(), .keys() and iterator" , () => {
			var tree ;
			
			tree = new BinaryTree() ;
			
			tree.set( 3 , 'jack' ) ;
			tree.set( 2 , 'jean' ) ;
			tree.set( 5 , 'steve' ) ;
			tree.set( 2.5 , 'john' ) ;
			tree.set( 2.7 , 'robert' ) ;
			tree.set( 2.8 , 'johnson' ) ;
			tree.set( 2.75 , 'boris' ) ;
			tree.set( 6 , 'bobby' ) ;
			tree.set( 2.85 , 'carl' ) ;
			tree.set( 2.72 , 'tom' ) ;
			tree.set( 2.76 , 'roger' ) ;
			tree.set( 2.77 , 'vlad' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'john' , 'robert' , 'tom' , 'boris' , 'roger' , 'vlad' , 'johnson' , 'carl' , 'jack' , 'steve' , 'bobby' ] ) ;
			expect( tree.keys() ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 , 2.85 , 3 , 5 , 6 ] ) ;
			expect( [ ... tree.values() ] ).to.equal( [ 'jean' , 'john' , 'robert' , 'tom' , 'boris' , 'roger' , 'vlad' , 'johnson' , 'carl' , 'jack' , 'steve' , 'bobby' ] ) ;
		} ) ;
		
		it( "set and get elements" , () => {
			var tree ;
			
			tree = new BinaryTree() ;
			
			// Try getting unexisting keys
			expect( tree.get( 0 ) ).to.be( undefined ) ;
			expect( tree.get( 9 ) ).to.be( undefined ) ;
			
			tree.set( 3 , 'jack' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jack' ] ) ;
			tree.sanityCheck() ;
			
			tree.set( 2 , 'jean' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'jack' ] ) ;
			tree.sanityCheck() ;
			
			tree.set( 5 , 'steve' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'jack' , 'steve' ] ) ;
			tree.sanityCheck() ;
			
			tree.set( 2.5 , 'john' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'john' , 'jack' , 'steve' ] ) ;
			tree.sanityCheck() ;
			
			tree.set( 2.7 , 'robert' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'john' , 'robert' , 'jack' , 'steve' ] ) ;
			tree.sanityCheck() ;
			
			// Force a left-right heavy
			tree.set( 2.8 , 'johnson' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'john' , 'robert' , 'johnson' , 'jack' , 'steve' ] ) ;
			tree.sanityCheck() ;
			
			tree.set( 2.75 , 'boris' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'john' , 'robert' , 'boris' , 'johnson' , 'jack' , 'steve' ] ) ;
			tree.sanityCheck() ;
			
			tree.set( 6 , 'bobby' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'john' , 'robert' , 'boris' , 'johnson' , 'jack' , 'steve' , 'bobby' ] ) ;
			tree.sanityCheck() ;
			
			tree.set( 2.85 , 'carl' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'john' , 'robert' , 'boris' , 'johnson' , 'carl' , 'jack' , 'steve' , 'bobby' ] ) ;
			tree.sanityCheck() ;
			
			// Force a right-left heavy
			tree.set( 2.72 , 'tom' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'john' , 'robert' , 'tom' , 'boris' , 'johnson' , 'carl' , 'jack' , 'steve' , 'bobby' ] ) ;
			tree.sanityCheck() ;
			
			tree.debug() ;

			expect( tree.get( 3 ) ).to.be( 'jack' ) ;
			expect( tree.get( 2 ) ).to.be( 'jean' ) ;
			expect( tree.get( 5 ) ).to.be( 'steve' ) ;
			expect( tree.get( 2.5 ) ).to.be( 'john' ) ;
			expect( tree.get( 2.7 ) ).to.be( 'robert' ) ;
			expect( tree.get( 2.8 ) ).to.be( 'johnson' ) ;
			expect( tree.get( 2.75 ) ).to.be( 'boris' ) ;
			expect( tree.get( 6 ) ).to.be( 'bobby' ) ;
			expect( tree.get( 2.85 ) ).to.be( 'carl' ) ;
			expect( tree.get( 2.72 ) ).to.be( 'tom' ) ;

			// Try getting unexisting keys
			expect( tree.get( 0 ) ).to.be( undefined ) ;
			expect( tree.get( 9 ) ).to.be( undefined ) ;
		} ) ;
		
		it( "duplicated keys and the 'uniqueKeys' option" , () => {
			var tree ;
			
			tree = new BinaryTree() ;
			
			// Without uniqueKeys
			tree.set( 2 , 'jean' ) ;
			tree.set( 3 , 'jack' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'jack' ] ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 3 ] ) ;
			tree.sanityCheck() ;
			
			tree.set( 2 , 'bob' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'bob' , 'jack' ] ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2 , 3 ] ) ;
			tree.sanityCheck() ;

			// With uniqueKeys
			tree = new BinaryTree( { uniqueKeys: true } ) ;
			
			tree.set( 2 , 'jean' ) ;
			tree.set( 3 , 'jack' ) ;
			tree.set( 2 , 'bob' ) ;
			expect( [ ... tree ] ).to.equal( [ 'bob' , 'jack' ] ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 3 ] ) ;
			tree.sanityCheck() ;
		} ) ;
		
		it( ".insert()" , () => {
			var tree ;
			
			tree = new BinaryTree() ;
			expect( tree ).to.have.length( 0 ) ;
			
			tree.insert( 'bob' ) ;
			tree.insert( 'bill' ) ;
			tree.insert( 'jack' , 'jean' , 'steve' ) ;
			expect( [ ... tree ] ).to.equal( [ 'bob' , 'bill' , 'jack' , 'jean' , 'steve' ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree() ;
			tree.insert( 'jack' , 'jean' , 'steve' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
			tree.sanityCheck() ;
		} ) ;
		
		it( "delete by key" , () => {
			var tree ;
			
			tree = new BinaryTree() ;
			tree.set( 3 , 'jack' ) ;
			tree.delete( 3 ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree() ;
			tree.set( 3 , 'jack' ) ;
			tree.set( 2 , 'jean' ) ;
			tree.delete( 3 ) ;
			expect( [ ... tree ] ).to.equal( [ 'jean' ] ) ;
			tree.sanityCheck() ;
			tree.delete( 2 ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree() ;
			
			tree.set( 3 , 'jack' ) ;
			tree.set( 2 , 'jean' ) ;
			tree.set( 5 , 'steve' ) ;
			tree.set( 2.5 , 'john' ) ;
			tree.set( 2.7 , 'robert' ) ;
			tree.set( 2.8 , 'johnson' ) ;
			tree.set( 2.75 , 'boris' ) ;
			tree.set( 6 , 'bobby' ) ;
			tree.set( 2.85 , 'carl' ) ;
			tree.set( 2.72 , 'tom' ) ;
			tree.set( 2.76 , 'roger' ) ;
			tree.set( 2.77 , 'vlad' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'john' , 'robert' , 'tom' , 'boris' , 'roger' , 'vlad' , 'johnson' , 'carl' , 'jack' , 'steve' , 'bobby' ] ) ;
			tree.sanityCheck() ;
			
			//console.log( '\n\nTree:' ) ; tree.debug() ;
			
			// Delete a leaf and force a left-right heavy
			tree.delete( 2.85 ) ;
			tree.sanityCheck() ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'john' , 'robert' , 'tom' , 'boris' , 'roger' , 'vlad' , 'johnson' , 'jack' , 'steve' , 'bobby' ] ) ;
			expect( tree.get( 2.85 ) ).to.be( undefined ) ;
			
			// Delete a node with only one child
			tree.delete( 2.5 ) ;
			tree.sanityCheck() ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'robert' , 'tom' , 'boris' , 'roger' , 'vlad' , 'johnson' , 'jack' , 'steve' , 'bobby' ] ) ;
			expect( tree.get( 2.5 ) ).to.be( undefined ) ;
			
			// Delete a node with only two children that are not leaves
			tree.delete( 2.8 ) ;
			tree.sanityCheck() ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'robert' , 'tom' , 'boris' , 'roger' , 'vlad' , 'jack' , 'steve' , 'bobby' ] ) ;
			expect( tree.get( 2.8 ) ).to.be( undefined ) ;
			
			// Delete the trunc node, the tree should replace the trunc node, it also cause a right heavy
			tree.delete( 2.75 ) ;
			tree.sanityCheck() ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'robert' , 'tom' , 'roger' , 'vlad' , 'jack' , 'steve' , 'bobby' ] ) ;
			expect( tree.get( 2.75 ) ).to.be( undefined ) ;
			
			tree.debug() ;
		} ) ;
		
	} ) ;
		
	describe( "Advanced Array-like features" , () => {
		
		it( ".keyOf()/.lastKeyOf()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			tree = new BinaryTree( { uniqueKeys: true } , e1 , e2 , e3 ) ;
			expect( tree.keyOf( e2 ) ).to.be( 1 ) ;
			expect( tree.keyOf( e4 ) ).to.be( undefined ) ;
			
			tree.insert( e2 , e2 , e2 ) ;
			tree.set( tree.keyOf( e2 ) , e4 ) ;
			expect( [ ... tree ] ).to.equal( [ { v: 'jack' } , { v: 'bobby' } , { v: 'steve' } , { v: 'bob' } , { v: 'bob' } , { v: 'bob' } ] ) ;
			tree.set( tree.lastKeyOf( e2 ) , e4 ) ;
			expect( [ ... tree ] ).to.equal( [ { v: 'jack' } , { v: 'bobby' } , { v: 'steve' } , { v: 'bob' } , { v: 'bob' } , { v: 'bobby' } ] ) ;
		} ) ;

		it( ".includes()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			tree = new BinaryTree() ;
			expect( tree.includes( e2 ) ).to.be.false() ;
			
			tree = new BinaryTree( null , e1 ) ;
			expect( tree.includes( e2 ) ).to.be.false() ;
			
			tree = new BinaryTree( null , e1 , e3 ) ;
			expect( tree.includes( e2 ) ).to.be.false() ;
			
			tree = new BinaryTree( null , e2 ) ;
			expect( tree.includes( e2 ) ).to.be.true() ;
			
			tree = new BinaryTree( null , e2 , e2 ) ;
			expect( tree.includes( e2 ) ).to.be.true() ;
			
			tree = new BinaryTree( null , e1 , e2 , e3 ) ;
			expect( tree.includes( e2 ) ).to.be.true() ;
			
			tree = new BinaryTree( null , e1 , e3 , e2 ) ;
			expect( tree.includes( e2 ) ).to.be.true() ;
			
			tree = new BinaryTree( null , e2 , e1 , e3 ) ;
			expect( tree.includes( e2 ) ).to.be.true() ;
		} ) ;

		it( ".forEach()" , () => {
			var tree ,
				accumulator = [] ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			tree = new BinaryTree() ;
			tree.forEach( element => accumulator.push( element.v ) ) ;
			expect( accumulator ).to.equal( [] ) ;
			
			tree = new BinaryTree( null , e1 , e2 , e3 ) ;
			tree.forEach( element => accumulator.push( element.v ) ) ;
			expect( accumulator ).to.equal( [ 'jack' , 'bob' , 'steve' ] ) ;
		} ) ;

		it( ".some()/.every()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			tree = new BinaryTree() ;
			expect( tree.some( element => element.v === 'bob' ) ).to.be.false() ;
			expect( tree.every( element => element.v === 'bob' ) ).to.be.true() ;
			
			tree = new BinaryTree( null , e1 ) ;
			expect( tree.some( element => element.v === 'bob' ) ).to.be.false() ;
			expect( tree.every( element => element.v === 'bob' ) ).to.be.false() ;
			
			tree = new BinaryTree( null , e2 ) ;
			expect( tree.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( tree.every( element => element.v === 'bob' ) ).to.be.true() ;
			
			tree = new BinaryTree( null , e1 , e2 ) ;
			expect( tree.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( tree.every( element => element.v === 'bob' ) ).to.be.false() ;
			
			tree = new BinaryTree( null , e2 , e1 ) ;
			expect( tree.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( tree.every( element => element.v === 'bob' ) ).to.be.false() ;
			
			tree = new BinaryTree( null , e1 , e2 , e3 ) ;
			expect( tree.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( tree.every( element => element.v === 'bob' ) ).to.be.false() ;
			
			tree = new BinaryTree( null , e1 , e2 , e2 , e3 ) ;
			expect( tree.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( tree.every( element => element.v === 'bob' ) ).to.be.false() ;
			
			tree = new BinaryTree( null , e2 , e2 , e2 ) ;
			expect( tree.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( tree.every( element => element.v === 'bob' ) ).to.be.true() ;
		} ) ;
		
		it( ".find()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bob' } ;
			
			tree = new BinaryTree( null , e1 , e2 , e3 ) ;
			expect( tree.find( element => element.v === 'bob' ) ).to.be( e2 ) ;
			expect( tree.find( element => element.v === 'bobby' ) ).to.be( undefined ) ;
			
			tree.insert( e4 ) ;
			expect( tree.find( element => element.v === 'bob' ) ).to.be( e2 ) ;
			
			tree.delete( 1 ) ;
			expect( tree.find( element => element.v === 'bob' ) ).to.be( e4 ) ;
		} ) ;
		
		it( ".findKey()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bob' } ;
			
			tree = new BinaryTree( null , e1 , e2 , e3 ) ;
			expect( tree.findKey( element => element.v === 'bob' ) ).to.be( 1 ) ;
			expect( tree.findKey( element => element.v === 'bobby' ) ).to.be( undefined ) ;
			expect( tree.findKey( element => element.v === 'bobby' ) ).to.be( undefined ) ;
			
			tree.insert( e4 ) ;
			expect( tree.findKey( element => element.v === 'bob' ) ).to.be( 1 ) ;
			
			tree.delete( 1 ) ;
			expect( tree.findKey( element => element.v === 'bob' ) ).to.be( 3 ) ;
		} ) ;
		
		it( ".arrayMap()" , () => {
			var array ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			array = new BinaryTree( null ).arrayMap( element => element.v + element.v ) ;
			expect( array ).to.equal( [] ) ;
			
			array = new BinaryTree( null , e1 ).arrayMap( element => element.v + element.v ) ;
			expect( array ).to.equal( [ 'jackjack' ] ) ;
			
			array = new BinaryTree( null , e1 , e2 , e3 ).arrayMap( element => element.v + element.v ) ;
			expect( array ).to.equal( [ 'jackjack' , 'bobbob' , 'stevesteve' ] ) ;
		} ) ;
		
		it( ".reduce()/.reduceRight" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			tree = new BinaryTree() ;
			expect( tree.reduce( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( '' ) ;
			expect( tree.reduceRight( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( '' ) ;
			
			tree = new BinaryTree( null , e1 ) ;
			expect( tree.reduce( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( 'jack' ) ;
			expect( tree.reduceRight( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( 'jack' ) ;
			
			tree = new BinaryTree( null , e1 , e2 , e3 ) ;
			expect( tree.reduce( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( 'jackbobsteve' ) ;
			expect( tree.reduceRight( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( 'stevebobjack' ) ;
		} ) ;
		
		it( ".arrayFilter()" , () => {
			var array ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			array = new BinaryTree().filter( element => element.v.length >= 4 ) ;
			expect( array ).to.equal( [] ) ;
			
			array = new BinaryTree( null , e1 ).filter( element => element.v.length >= 4 ) ;
			expect( array ).to.equal( [ e1 ] ) ;
			
			array = new BinaryTree( null , e1 ).filter( element => element.v.length < 4 ) ;
			expect( array ).to.equal( [] ) ;
			
			array = new BinaryTree( null , e1 , e2 , e3 ).filter( element => element.v.length >= 4 ) ;
			expect( array ).to.equal( [ e1 , e3 ] ) ;
			
			array = new BinaryTree( null , e1 , e3 ).filter( element => element.v.length >= 4 ) ;
			expect( array ).to.equal( [ e1 , e3 ] ) ;
			
			array = new BinaryTree( null , e2 , e2 , e2 ).filter( element => element.v.length >= 4 ) ;
			expect( array ).to.equal( [] ) ;
			
			array = new BinaryTree( null , e1 , e2 , e3 ).filter( element => element.v.length < 4 ) ;
			expect( array ).to.equal( [ e2 ] ) ;
		} ) ;
	} ) ;

	describe( "Advanced custom features" , () => {
		
		it( ".deleteValue()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			tree = new BinaryTree( null , e1 , e2 , e3 ) ;
			tree.deleteValue( e2 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree() ;
			tree.deleteValue( e2 ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( null , e2 ) ;
			tree.deleteValue( e2 ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( null , e2 , e1 , e3 ) ;
			tree.deleteValue( e2 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( null , e1 , e3 , e2 ) ;
			tree.deleteValue( e2 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			// Remove all occurences
			tree = new BinaryTree( null , e2 , e2 , e2 , e1 , e2 , e3 , e2 ) ;
			tree.deleteValue( e2 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			// NaN test
			tree = new BinaryTree( null , NaN , NaN , NaN , e1 , NaN , e3 , NaN ) ;
			tree.deleteValue( NaN ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
		} ) ;
		
		it( ".inPlaceFilter()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			tree = new BinaryTree( null , e2 , e2 , e2 ) ;
			expect( tree.inPlaceFilter( () => true ) ).to.be( tree ) ;
			
			tree = new BinaryTree().inPlaceFilter( element => element.v.length >= 4 ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( null , e1 ).inPlaceFilter( element => element.v.length >= 4 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( true , e1 ).inPlaceFilter( element => element.v.length < 4 ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( null , e1 , e2 , e3 ).inPlaceFilter( element => element.v.length >= 4 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( null , e1 , e3 ).inPlaceFilter( element => element.v.length >= 4 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( null , e2 , e2 , e2 ).inPlaceFilter( element => element.v.length >= 4 ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( null , e1 , e2 , e3 ).inPlaceFilter( element => element.v.length < 4 ) ;
			expect( [ ... tree ] ).to.equal( [ e2 ] ) ;
			tree.sanityCheck() ;
		} ) ;

		it( ".truncateBefore()" , () => {
			var tree ;
			
			var reset = () => {
				tree = new BinaryTree() ;
				tree.set( 3 , 'jack' ) ;
				tree.set( 2 , 'jean' ) ;
				tree.set( 5 , 'steve' ) ;
				tree.set( 2.5 , 'john' ) ;
				tree.set( 2.7 , 'robert' ) ;
				tree.set( 2.8 , 'johnson' ) ;
				tree.set( 2.75 , 'boris' ) ;
				tree.set( 6 , 'bobby' ) ;
				tree.set( 2.85 , 'carl' ) ;
				tree.set( 2.72 , 'tom' ) ;
				tree.set( 2.76 , 'roger' ) ;
				tree.set( 2.77 , 'vlad' ) ;
			} ;
			
			reset() ;
			tree.truncateBefore( 1 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 , 2.85 , 3 , 5 , 6 ] ) ;
			tree.sanityCheck() ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 1 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 , 2.85 , 3 , 5 , 6 ] ) ;
			tree.sanityCheck() ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;
			
			reset() ;
			tree.truncateBefore( 2 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 , 2.85 , 3 , 5 , 6 ] ) ;
			tree.sanityCheck() ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 2 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 , 2.85 , 3 , 5 , 6 ] ) ;
			tree.sanityCheck() ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;
			
			reset() ;
			tree.truncateBefore( 2.72 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2.75 , 2.76 , 2.77 , 2.8 , 2.85 , 3 , 5 , 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 2.72 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2.72 , 2.75 , 2.76 , 2.77 , 2.8 , 2.85 , 3 , 5 , 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 2.73 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2.75 , 2.76 , 2.77 , 2.8 , 2.85 , 3 , 5 , 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 2.73 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2.75 , 2.76 , 2.77 , 2.8 , 2.85 , 3 , 5 , 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 2.8 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2.85 , 3 , 5 , 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 2.8 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2.8 , 2.85 , 3 , 5 , 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 2.85 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 3 , 5 , 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 2.85 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2.85 , 3 , 5 , 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 2.9 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 3 , 5 , 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 2.9 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 3 , 5 , 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 4 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 5 , 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 4 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 5 , 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 5 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 5 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 5 , 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 6 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 6 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 7 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateBefore( 7 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;
		} ) ;
	
		it( ".truncateAfter()" , () => {
			var tree ;
			
			var reset = () => {
				tree = new BinaryTree() ;
				tree.set( 3 , 'jack' ) ;
				tree.set( 2 , 'jean' ) ;
				tree.set( 5 , 'steve' ) ;
				tree.set( 2.5 , 'john' ) ;
				tree.set( 2.7 , 'robert' ) ;
				tree.set( 2.8 , 'johnson' ) ;
				tree.set( 2.75 , 'boris' ) ;
				tree.set( 6 , 'bobby' ) ;
				tree.set( 2.85 , 'carl' ) ;
				tree.set( 2.72 , 'tom' ) ;
				tree.set( 2.76 , 'roger' ) ;
				tree.set( 2.77 , 'vlad' ) ;
			} ;
			
			reset() ;
			tree.truncateAfter( 1 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 1 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;
			
			reset() ;
			tree.truncateAfter( 2 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 2 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 ] ) ;
			tree.sanityCheck() ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;
			
			reset() ;
			tree.truncateAfter( 2.72 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 2.72 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 2.73 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 2.73 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 2.8 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 2.8 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 2.85 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 2.85 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 , 2.85 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 2.9 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 , 2.85 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 2.9 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 , 2.85 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 4 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 , 2.85 , 3 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 4 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 , 2.85 , 3 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 5 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 , 2.85 , 3 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 5 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 , 2.85 , 3 , 5 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 6 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 , 2.85 , 3 , 5 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 6 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 , 2.85 , 3 , 5 , 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 7 , true ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 , 2.85 , 3 , 5 , 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;

			reset() ;
			tree.truncateAfter( 7 ) ;
			expect( [ ... tree.keys() ] ).to.equal( [ 2 , 2.5 , 2.7 , 2.72 , 2.75 , 2.76 , 2.77 , 2.8 , 2.85 , 3 , 5 , 6 ] ) ;
			tree.sanityCheck( true ) ;
			console.log( "Tree after truncate:" ) ;
			tree.debug() ;
		} ) ;
	} ) ;
	
	describe( "Internal methods" , () => {
		it( ".getClosestNode()" , () => {
			var tree  = new BinaryTree() ;
			tree.set( 3 , 'jack' ) ;
			tree.set( 2 , 'jean' ) ;
			tree.set( 5 , 'steve' ) ;
			tree.set( 2.5 , 'john' ) ;
			tree.set( 2.7 , 'robert' ) ;
			tree.set( 2.8 , 'johnson' ) ;
			tree.set( 2.75 , 'boris' ) ;
			tree.set( 6 , 'bobby' ) ;
			tree.set( 2.85 , 'carl' ) ;
			tree.set( 2.72 , 'tom' ) ;
			tree.set( 2.76 , 'roger' ) ;
			tree.set( 2.77 , 'vlad' ) ;
			
			tree.debug() ;
			
			// Including existing
			expect( tree.getClosestNode( 2 , false , -1 ).key ).to.be( 2 ) ;
			expect( tree.getClosestNode( 2 , false , 1 ).key ).to.be( 2 ) ;
			expect( tree.getClosestNode( 2.72 , false , -1 ).key ).to.be( 2.72 ) ;
			expect( tree.getClosestNode( 2.72 , false , 1 ).key ).to.be( 2.72 ) ;
			expect( tree.getClosestNode( 2.8 , false , -1 ).key ).to.be( 2.8 ) ;
			expect( tree.getClosestNode( 2.8 , false , 1 ).key ).to.be( 2.8 ) ;
			expect( tree.getClosestNode( 2.85 , false , -1 ).key ).to.be( 2.85 ) ;
			expect( tree.getClosestNode( 2.85 , false , 1 ).key ).to.be( 2.85 ) ;
			expect( tree.getClosestNode( 6 , false , -1 ).key ).to.be( 6 ) ;
			expect( tree.getClosestNode( 6 , false , 1 ).key ).to.be( 6 ) ;

			// Excluding existing
			expect( tree.getClosestNode( 2 , true , -1 ) ).to.be( null ) ;
			expect( tree.getClosestNode( 2 , true , 1 ).key ).to.be( 2.5 ) ;
			expect( tree.getClosestNode( 2.5 , true , -1 ).key ).to.be( 2 ) ;
			expect( tree.getClosestNode( 2.5 , true , 1 ).key ).to.be( 2.7 ) ;
			expect( tree.getClosestNode( 2.7 , true , -1 ).key ).to.be( 2.5 ) ;
			expect( tree.getClosestNode( 2.7 , true , 1 ).key ).to.be( 2.72 ) ;
			expect( tree.getClosestNode( 2.72 , true , -1 ).key ).to.be( 2.7 ) ;
			expect( tree.getClosestNode( 2.72 , true , 1 ).key ).to.be( 2.75 ) ;
			expect( tree.getClosestNode( 2.75 , true , -1 ).key ).to.be( 2.72 ) ;
			expect( tree.getClosestNode( 2.75 , true , 1 ).key ).to.be( 2.76 ) ;
			expect( tree.getClosestNode( 2.76 , true , -1 ).key ).to.be( 2.75 ) ;
			expect( tree.getClosestNode( 2.76 , true , 1 ).key ).to.be( 2.77 ) ;
			expect( tree.getClosestNode( 2.77 , true , -1 ).key ).to.be( 2.76 ) ;
			expect( tree.getClosestNode( 2.77 , true , 1 ).key ).to.be( 2.8 ) ;
			expect( tree.getClosestNode( 2.8 , true , -1 ).key ).to.be( 2.77 ) ;
			expect( tree.getClosestNode( 2.8 , true , 1 ).key ).to.be( 2.85 ) ;
			expect( tree.getClosestNode( 2.85 , true , -1 ).key ).to.be( 2.8 ) ;
			expect( tree.getClosestNode( 2.85 , true , 1 ).key ).to.be( 3 ) ;
			expect( tree.getClosestNode( 3 , true , -1 ).key ).to.be( 2.85 ) ;
			expect( tree.getClosestNode( 3 , true , 1 ).key ).to.be( 5 ) ;
			expect( tree.getClosestNode( 6 , true , -1 ).key ).to.be( 5 ) ;
			expect( tree.getClosestNode( 6 , true , 1 ) ).to.be( null ) ;

			// Including unexisting
			expect( tree.getClosestNode( 1 , false , -1 ) ).to.be( null ) ;
			expect( tree.getClosestNode( 1 , false , 1 ).key ).to.be( 2 ) ;
			expect( tree.getClosestNode( 2.1 , false , -1 ).key ).to.be( 2 ) ;
			expect( tree.getClosestNode( 2.1 , false , 1 ).key ).to.be( 2.5 ) ;
			expect( tree.getClosestNode( 2.6 , false , -1 ).key ).to.be( 2.5 ) ;
			expect( tree.getClosestNode( 2.6 , false , 1 ).key ).to.be( 2.7 ) ;
			expect( tree.getClosestNode( 2.71 , false , -1 ).key ).to.be( 2.7 ) ;
			expect( tree.getClosestNode( 2.71 , false , 1 ).key ).to.be( 2.72 ) ;
			expect( tree.getClosestNode( 2.73 , false , -1 ).key ).to.be( 2.72 ) ;
			expect( tree.getClosestNode( 2.73 , false , 1 ).key ).to.be( 2.75 ) ;
			expect( tree.getClosestNode( 2.755 , false , -1 ).key ).to.be( 2.75 ) ;
			expect( tree.getClosestNode( 2.755 , false , 1 ).key ).to.be( 2.76 ) ;
			expect( tree.getClosestNode( 2.765 , false , -1 ).key ).to.be( 2.76 ) ;
			expect( tree.getClosestNode( 2.765 , false , 1 ).key ).to.be( 2.77 ) ;
			expect( tree.getClosestNode( 2.78 , false , -1 ).key ).to.be( 2.77 ) ;
			expect( tree.getClosestNode( 2.78 , false , 1 ).key ).to.be( 2.8 ) ;
			expect( tree.getClosestNode( 2.84 , false , -1 ).key ).to.be( 2.8 ) ;
			expect( tree.getClosestNode( 2.84 , false , 1 ).key ).to.be( 2.85 ) ;
			expect( tree.getClosestNode( 2.9 , false , -1 ).key ).to.be( 2.85 ) ;
			expect( tree.getClosestNode( 2.9 , false , 1 ).key ).to.be( 3 ) ;
			expect( tree.getClosestNode( 4 , false , -1 ).key ).to.be( 3 ) ;
			expect( tree.getClosestNode( 4 , false , 1 ).key ).to.be( 5 ) ;
			expect( tree.getClosestNode( 7 , false , -1 ).key ).to.be( 6 ) ;
			expect( tree.getClosestNode( 7 , false , 1 ) ).to.be( null ) ;
			
			// Excluding unexisting -- should be identical to 'including unexisting'
			expect( tree.getClosestNode( 1 , true , -1 ) ).to.be( null ) ;
			expect( tree.getClosestNode( 1 , true , 1 ).key ).to.be( 2 ) ;
			expect( tree.getClosestNode( 2.1 , true , -1 ).key ).to.be( 2 ) ;
			expect( tree.getClosestNode( 2.1 , true , 1 ).key ).to.be( 2.5 ) ;
			expect( tree.getClosestNode( 2.6 , true , -1 ).key ).to.be( 2.5 ) ;
			expect( tree.getClosestNode( 2.6 , true , 1 ).key ).to.be( 2.7 ) ;
			expect( tree.getClosestNode( 2.71 , true , -1 ).key ).to.be( 2.7 ) ;
			expect( tree.getClosestNode( 2.71 , true , 1 ).key ).to.be( 2.72 ) ;
			expect( tree.getClosestNode( 2.73 , true , -1 ).key ).to.be( 2.72 ) ;
			expect( tree.getClosestNode( 2.73 , true , 1 ).key ).to.be( 2.75 ) ;
			expect( tree.getClosestNode( 2.755 , true , -1 ).key ).to.be( 2.75 ) ;
			expect( tree.getClosestNode( 2.755 , true , 1 ).key ).to.be( 2.76 ) ;
			expect( tree.getClosestNode( 2.765 , true , -1 ).key ).to.be( 2.76 ) ;
			expect( tree.getClosestNode( 2.765 , true , 1 ).key ).to.be( 2.77 ) ;
			expect( tree.getClosestNode( 2.78 , true , -1 ).key ).to.be( 2.77 ) ;
			expect( tree.getClosestNode( 2.78 , true , 1 ).key ).to.be( 2.8 ) ;
			expect( tree.getClosestNode( 2.84 , true , -1 ).key ).to.be( 2.8 ) ;
			expect( tree.getClosestNode( 2.84 , true , 1 ).key ).to.be( 2.85 ) ;
			expect( tree.getClosestNode( 2.9 , true , -1 ).key ).to.be( 2.85 ) ;
			expect( tree.getClosestNode( 2.9 , true , 1 ).key ).to.be( 3 ) ;
			expect( tree.getClosestNode( 4 , true , -1 ).key ).to.be( 3 ) ;
			expect( tree.getClosestNode( 4 , true , 1 ).key ).to.be( 5 ) ;
			expect( tree.getClosestNode( 7 , true , -1 ).key ).to.be( 6 ) ;
			expect( tree.getClosestNode( 7 , true , 1 ) ).to.be( null ) ;
		} ) ;
	} ) ;
} ) ;

