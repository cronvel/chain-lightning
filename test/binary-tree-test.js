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
			
			console.log( '\n\nTree:' ) ;
			tree.debug() ;
			
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
		
		return ;
		
		it( ".unshift()/.prepend()" , () => {
			var tree ;
			
			tree = new BinaryTree() ;
			expect( tree ).to.have.length( 0 ) ;
			
			tree.unshift( 'bob' ) ;
			tree.prepend( 'bill' ) ;
			tree.unshift( 'jack' , 'jean' , 'steve' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jack' , 'jean' , 'steve' , 'bill' , 'bob' ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree() ;
			tree.push( 'jack' , 'jean' , 'steve' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
			tree.sanityCheck() ;
		} ) ;
		
		it( ".pop()" , () => {
			var tree ;
			
			tree = new BinaryTree() ;
			expect( tree.pop() ).to.be( undefined ) ;
			expect( tree ).to.have.length( 0 ) ;
			tree.sanityCheck() ;
			
			tree.push( 'jack' , 'jean' , 'steve' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
			tree.sanityCheck() ;
			
			expect( tree.pop() ).to.be( 'steve' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jack' , 'jean' ] ) ;
			tree.sanityCheck() ;
			
			expect( tree.pop() ).to.be( 'jean' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jack' ] ) ;
			tree.sanityCheck() ;
			
			expect( tree.pop() ).to.be( 'jack' ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			expect( tree.pop() ).to.be( undefined ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
		} ) ;
		
		it( ".shift()" , () => {
			var tree ;
			
			tree = new BinaryTree() ;
			expect( tree.shift() ).to.be( undefined ) ;
			expect( tree ).to.have.length( 0 ) ;
			tree.sanityCheck() ;
			
			tree.push( 'jack' , 'jean' , 'steve' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
			tree.sanityCheck() ;
			
			expect( tree.shift() ).to.be( 'jack' ) ;
			expect( [ ... tree ] ).to.equal( [ 'jean' , 'steve' ] ) ;
			tree.sanityCheck() ;
			
			expect( tree.shift() ).to.be( 'jean' ) ;
			expect( [ ... tree ] ).to.equal( [ 'steve' ] ) ;
			tree.sanityCheck() ;
			
			expect( tree.shift() ).to.be( 'steve' ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			expect( tree.shift() ).to.be( undefined ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
		} ) ;
	} ) ;
		
	return ;











	describe( "Advanced Array-like features" , () => {
		
		it( ".nodes()" , () => {
			var nodes ;
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			nodes = tree.nodes() ;
			expect( nodes ).to.be.an( Array ) ;
			expect( nodes ).to.have.length( 3 ) ;
			expect( nodes.map( e => e.element ) ).to.equal( [ e1 , e2 , e3 ] ) ;
			
			tree = new BinaryTree() ;
			nodes = tree.nodes() ;
			expect( nodes ).to.be.an( Array ) ;
			expect( nodes ).to.have.length( 0 ) ;
			expect( nodes.map( e => e.element ) ).to.equal( [] ) ;
			
			tree = new BinaryTree( e1 , e2 , e2 , e2 , e3 ) ;
			nodes = tree.nodes() ;
			expect( nodes ).to.be.an( Array ) ;
			expect( nodes ).to.have.length( 5 ) ;
			expect( nodes.map( e => e.element ) ).to.equal( [ e1 , e2 , e2 , e2 , e3 ] ) ;
		} ) ;
		
		it( ".nodeOf()/.lastNodeOf()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.nodeOf( e2 ).element ).to.be( e2 ) ;
			expect( tree.nodeOf( e4 ) ).to.be( null ) ;
			
			tree.push( e2 , e2 , e2 ) ;
			tree.set( tree.nodeOf( e2 ) , e4 ) ;
			expect( [ ... tree ] ).to.equal( [ { v: 'jack' } , { v: 'bobby' } , { v: 'steve' } , { v: 'bob' } , { v: 'bob' } , { v: 'bob' } ] ) ;
			tree.set( tree.lastNodeOf( e2 ) , e4 ) ;
			expect( [ ... tree ] ).to.equal( [ { v: 'jack' } , { v: 'bobby' } , { v: 'steve' } , { v: 'bob' } , { v: 'bob' } , { v: 'bobby' } ] ) ;
		} ) ;
		
		it( ".includes()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			tree = new BinaryTree() ;
			expect( tree.includes( e2 ) ).to.be.false() ;
			
			tree = new BinaryTree( e1 ) ;
			expect( tree.includes( e2 ) ).to.be.false() ;
			
			tree = new BinaryTree( e1 , e3 ) ;
			expect( tree.includes( e2 ) ).to.be.false() ;
			
			tree = new BinaryTree( e2 ) ;
			expect( tree.includes( e2 ) ).to.be.true() ;
			
			tree = new BinaryTree( e2 , e2 ) ;
			expect( tree.includes( e2 ) ).to.be.true() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.includes( e2 ) ).to.be.true() ;
			
			tree = new BinaryTree( e1 , e3 , e2 ) ;
			expect( tree.includes( e2 ) ).to.be.true() ;
			
			tree = new BinaryTree( e2 , e1 , e3 ) ;
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
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
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
			
			tree = new BinaryTree( e1 ) ;
			expect( tree.some( element => element.v === 'bob' ) ).to.be.false() ;
			expect( tree.every( element => element.v === 'bob' ) ).to.be.false() ;
			
			tree = new BinaryTree( e2 ) ;
			expect( tree.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( tree.every( element => element.v === 'bob' ) ).to.be.true() ;
			
			tree = new BinaryTree( e1 , e2 ) ;
			expect( tree.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( tree.every( element => element.v === 'bob' ) ).to.be.false() ;
			
			tree = new BinaryTree( e2 , e1 ) ;
			expect( tree.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( tree.every( element => element.v === 'bob' ) ).to.be.false() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( tree.every( element => element.v === 'bob' ) ).to.be.false() ;
			
			tree = new BinaryTree( e1 , e2 , e2 , e3 ) ;
			expect( tree.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( tree.every( element => element.v === 'bob' ) ).to.be.false() ;
			
			tree = new BinaryTree( e2 , e2 , e2 ) ;
			expect( tree.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( tree.every( element => element.v === 'bob' ) ).to.be.true() ;
		} ) ;
		
		it( ".find()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bob' } ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.find( element => element.v === 'bob' ) ).to.be( e2 ) ;
			expect( tree.find( element => element.v === 'bobby' ) ).to.be( undefined ) ;
			
			tree.push( e4 ) ;
			expect( tree.find( element => element.v === 'bob' ) ).to.be( e2 ) ;
			
			tree.unshift( e4 ) ;
			expect( tree.find( element => element.v === 'bob' ) ).to.be( e4 ) ;
		} ) ;
		
		it( ".findNode()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bob' } ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.get( tree.findNode( element => element.v === 'bob' ) ) ).to.be( e2 ) ;
			expect( tree.findNode( element => element.v === 'bobby' ) ).to.be( null ) ;
			expect( tree.get( tree.findNode( element => element.v === 'bobby' ) ) ).to.be( undefined ) ;
			
			tree.push( e4 ) ;
			expect( tree.get( tree.findNode( element => element.v === 'bob' ) ) ).to.be( e2 ) ;
			
			tree.unshift( e4 ) ;
			expect( tree.get( tree.findNode( element => element.v === 'bob' ) ) ).to.be( e4 ) ;
		} ) ;
		
		it( ".map()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			tree = new BinaryTree().map( element => element.v + element.v ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 ).map( element => element.v + element.v ) ;
			expect( [ ... tree ] ).to.equal( [ 'jackjack' ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ).map( element => element.v + element.v ) ;
			expect( [ ... tree ] ).to.equal( [ 'jackjack' , 'bobbob' , 'stevesteve' ] ) ;
			tree.sanityCheck() ;
		} ) ;
		
		it( ".reduce()/.reduceRight" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			tree = new BinaryTree() ;
			expect( tree.reduce( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( '' ) ;
			expect( tree.reduceRight( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( '' ) ;
			
			tree = new BinaryTree( e1 ) ;
			expect( tree.reduce( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( 'jack' ) ;
			expect( tree.reduceRight( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( 'jack' ) ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.reduce( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( 'jackbobsteve' ) ;
			expect( tree.reduceRight( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( 'stevebobjack' ) ;
		} ) ;
		
		it( ".filter()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			tree = new BinaryTree( e2 , e2 , e2 ) ;
			expect( tree.filter( () => true ) ).not.to.be( tree ) ;
			
			tree = new BinaryTree().filter( element => element.v.length >= 4 ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 ).filter( element => element.v.length >= 4 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 ).filter( element => element.v.length < 4 ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ).filter( element => element.v.length >= 4 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e3 ).filter( element => element.v.length >= 4 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e2 , e2 , e2 ).filter( element => element.v.length >= 4 ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ).filter( element => element.v.length < 4 ) ;
			expect( [ ... tree ] ).to.equal( [ e2 ] ) ;
			tree.sanityCheck() ;
		} ) ;
		
		it( ".reverse()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			tree = new BinaryTree().reverse() ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 ).reverse() ;
			expect( [ ... tree ] ).to.equal( [ e1 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ).reverse() ;
			expect( [ ... tree ] ).to.equal( [ e3 , e2 , e1 ] ) ;
			tree.sanityCheck() ;
		} ) ;
		
		it( "missing .concat()" ) ;
		it( "missing .copyWithin()" ) ;
		it( "missing .slice()" ) ;
		it( "missing .splice()" ) ;
		it( "missing .sort()" ) ;
	} ) ;



	describe( "Advanced custom features" , () => {
		
		it( ".removeNode()/.deleteNode()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			tree.removeNode( tree.nodeOf( e2 ) ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree() ;
			tree.removeNode( tree.nodeOf( e2 ) ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e2 ) ;
			tree.removeNode( tree.nodeOf( e2 ) ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e2 , e1 , e3 ) ;
			tree.removeNode( tree.nodeOf( e2 ) ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e3 , e2 ) ;
			tree.removeNode( tree.nodeOf( e2 ) ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
		} ) ;
		
		it( ".remove()/.delete()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			tree.remove( e2 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree() ;
			tree.remove( e2 ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e2 ) ;
			tree.remove( e2 ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e2 , e1 , e3 ) ;
			tree.remove( e2 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e3 , e2 ) ;
			tree.remove( e2 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			// Remove all occurences
			tree = new BinaryTree( e2 , e2 , e2 , e1 , e2 , e3 , e2 ) ;
			tree.remove( e2 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			// NaN test
			tree = new BinaryTree( NaN , NaN , NaN , e1 , NaN , e3 , NaN ) ;
			tree.remove( NaN ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
		} ) ;
		
		it( ".moveAfter()/.moveToTail()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveAfter( tree.nodeOf( e1 ) , tree.nodeOf( e1 ) ) ).to.be.false() ;
			expect( [ ... tree ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveAfter( tree.nodeOf( e1 ) , tree.nodeOf( e2 ) ) ).to.be.true() ;
			expect( [ ... tree ] ).to.equal( [ e2 , e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveAfter( tree.nodeOf( e1 ) , tree.nodeOf( e3 ) ) ).to.be.true() ;
			expect( [ ... tree ] ).to.equal( [ e2 , e3 , e1 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveToTail( tree.nodeOf( e1 ) ) ).to.be.true() ;
			expect( [ ... tree ] ).to.equal( [ e2 , e3 , e1 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveAfter( tree.nodeOf( e2 ) , tree.nodeOf( e1 ) ) ).to.be.false() ;
			expect( [ ... tree ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveAfter( tree.nodeOf( e2 ) , tree.nodeOf( e2 ) ) ).to.be.false() ;
			expect( [ ... tree ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveAfter( tree.nodeOf( e2 ) , tree.nodeOf( e3 ) ) ).to.be.true() ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 , e2 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveToTail( tree.nodeOf( e2 ) ) ).to.be.true() ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 , e2 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveAfter( tree.nodeOf( e3 ) , tree.nodeOf( e1 ) ) ).to.be.true() ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 , e2 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveAfter( tree.nodeOf( e3 ) , tree.nodeOf( e2 ) ) ).to.be.false() ;
			expect( [ ... tree ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveAfter( tree.nodeOf( e3 ) , tree.nodeOf( e3 ) ) ).to.be.false() ;
			expect( [ ... tree ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveToTail( tree.nodeOf( e3 ) ) ).to.be.false() ;
			expect( [ ... tree ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			tree.sanityCheck() ;
		} ) ;
		
		it( ".moveBefore()/.moveToHead()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveBefore( tree.nodeOf( e1 ) , tree.nodeOf( e1 ) ) ).to.be.false() ;
			expect( [ ... tree ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveToHead( tree.nodeOf( e1 ) ) ).to.be.false() ;
			expect( [ ... tree ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveBefore( tree.nodeOf( e1 ) , tree.nodeOf( e2 ) ) ).to.be.false() ;
			expect( [ ... tree ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveBefore( tree.nodeOf( e1 ) , tree.nodeOf( e3 ) ) ).to.be.true() ;
			expect( [ ... tree ] ).to.equal( [ e2 , e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveBefore( tree.nodeOf( e2 ) , tree.nodeOf( e1 ) ) ).to.be.true() ;
			expect( [ ... tree ] ).to.equal( [ e2 , e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveToHead( tree.nodeOf( e2 ) ) ).to.be.true() ;
			expect( [ ... tree ] ).to.equal( [ e2 , e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveBefore( tree.nodeOf( e2 ) , tree.nodeOf( e2 ) ) ).to.be.false() ;
			expect( [ ... tree ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveBefore( tree.nodeOf( e2 ) , tree.nodeOf( e3 ) ) ).to.be.false() ;
			expect( [ ... tree ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveBefore( tree.nodeOf( e3 ) , tree.nodeOf( e1 ) ) ).to.be.true() ;
			expect( [ ... tree ] ).to.equal( [ e3 , e1 , e2 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveToHead( tree.nodeOf( e3 ) ) ).to.be.true() ;
			expect( [ ... tree ] ).to.equal( [ e3 , e1 , e2 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveBefore( tree.nodeOf( e3 ) , tree.nodeOf( e2 ) ) ).to.be.true() ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 , e2 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			expect( tree.moveBefore( tree.nodeOf( e3 ) , tree.nodeOf( e3 ) ) ).to.be.false() ;
			expect( [ ... tree ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			tree.sanityCheck() ;
		} ) ;
		
		it( ".insertAfter()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			
			tree.insertAfter( tree.nodeOf( e2 ) ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree.insertAfter( tree.nodeOf( e2 ) , e4 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e2 , e4 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree.insertAfter( tree.nodeOf( e1 ) , e4 , e4 , e4 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e4 , e4 , e4 , e2 , e4 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree.insertAfter( tree.nodeOf( e3 ) , e4 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e4 , e4 , e4 , e2 , e4 , e3 , e4 ] ) ;
			tree.sanityCheck() ;
		} ) ;
		
		it( ".insertBefore()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			tree = new BinaryTree( e1 , e2 , e3 ) ;
			
			tree.insertBefore( tree.nodeOf( e2 ) ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree.insertBefore( tree.nodeOf( e2 ) , e4 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e4 , e2 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree.insertBefore( tree.nodeOf( e1 ) , e4 , e4 , e4 ) ;
			expect( [ ... tree ] ).to.equal( [ e4 , e4 , e4 , e1 , e4 , e2 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree.insertBefore( tree.nodeOf( e3 ) , e4 ) ;
			expect( [ ... tree ] ).to.equal( [ e4 , e4 , e4 , e1 , e4 , e2 , e4 , e3 ] ) ;
			tree.sanityCheck() ;
		} ) ;
		
		it( ".inPlaceFilter()" , () => {
			var tree ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			tree = new BinaryTree( e2 , e2 , e2 ) ;
			expect( tree.inPlaceFilter( () => true ) ).to.be( tree ) ;
			
			tree = new BinaryTree().inPlaceFilter( element => element.v.length >= 4 ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 ).inPlaceFilter( element => element.v.length >= 4 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 ).inPlaceFilter( element => element.v.length < 4 ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ).inPlaceFilter( element => element.v.length >= 4 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e3 ).inPlaceFilter( element => element.v.length >= 4 ) ;
			expect( [ ... tree ] ).to.equal( [ e1 , e3 ] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e2 , e2 , e2 ).inPlaceFilter( element => element.v.length >= 4 ) ;
			expect( [ ... tree ] ).to.equal( [] ) ;
			tree.sanityCheck() ;
			
			tree = new BinaryTree( e1 , e2 , e3 ).inPlaceFilter( element => element.v.length < 4 ) ;
			expect( [ ... tree ] ).to.equal( [ e2 ] ) ;
			tree.sanityCheck() ;
		} ) ;
	} ) ;

} ) ;

