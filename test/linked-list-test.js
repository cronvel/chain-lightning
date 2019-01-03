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
const LinkedList = lib.LinkedList ;





			/* Tests */



describe( "Linked List" , () => {

	describe( "Basic features" , () => {
		
		it( "constructor arguments should be added as elements" , () => {
			var list ;
			
			list = new LinkedList() ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( 'jack' ) ;
			expect( [ ... list ] ).to.equal( [ 'jack' ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( 'jack' , 'jean' , 'steve' ) ;
			expect( [ ... list ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
			list.sanityCheck() ;
		} ) ;
		
		it( "LinkedList.from() should create a list from any iterable" , () => {
			var list ;
			
			list = LinkedList.from( new Set() ) ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
			
			list = LinkedList.from( new Set( [ 'jack' ] ) ) ;
			expect( [ ... list ] ).to.equal( [ 'jack' ] ) ;
			list.sanityCheck() ;
			
			list = LinkedList.from( new Set( [ 'jack' , 'jean' , 'steve' ] ) ) ;
			list.sanityCheck() ;
			expect( [ ... list ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
		} ) ;
		
		it( ".push()/.append()" , () => {
			var list ;
			
			list = new LinkedList() ;
			expect( list ).to.have.length( 0 ) ;
			
			list.push( 'bob' ) ;
			list.append( 'bill' ) ;
			list.push( 'jack' , 'jean' , 'steve' ) ;
			expect( [ ... list ] ).to.equal( [ 'bob' , 'bill' , 'jack' , 'jean' , 'steve' ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList() ;
			list.push( 'jack' , 'jean' , 'steve' ) ;
			expect( [ ... list ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
			list.sanityCheck() ;
		} ) ;
		
		it( ".unshift()/.prepend()" , () => {
			var list ;
			
			list = new LinkedList() ;
			expect( list ).to.have.length( 0 ) ;
			
			list.unshift( 'bob' ) ;
			list.prepend( 'bill' ) ;
			list.unshift( 'jack' , 'jean' , 'steve' ) ;
			expect( [ ... list ] ).to.equal( [ 'jack' , 'jean' , 'steve' , 'bill' , 'bob' ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList() ;
			list.push( 'jack' , 'jean' , 'steve' ) ;
			expect( [ ... list ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
			list.sanityCheck() ;
		} ) ;
		
		it( ".pop()" , () => {
			var list ;
			
			list = new LinkedList() ;
			expect( list.pop() ).to.be( undefined ) ;
			expect( list ).to.have.length( 0 ) ;
			list.sanityCheck() ;
			
			list.push( 'jack' , 'jean' , 'steve' ) ;
			expect( [ ... list ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
			list.sanityCheck() ;
			
			expect( list.pop() ).to.be( 'steve' ) ;
			expect( [ ... list ] ).to.equal( [ 'jack' , 'jean' ] ) ;
			list.sanityCheck() ;
			
			expect( list.pop() ).to.be( 'jean' ) ;
			expect( [ ... list ] ).to.equal( [ 'jack' ] ) ;
			list.sanityCheck() ;
			
			expect( list.pop() ).to.be( 'jack' ) ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
			
			expect( list.pop() ).to.be( undefined ) ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
		} ) ;
		
		it( ".shift()" , () => {
			var list ;
			
			list = new LinkedList() ;
			expect( list.shift() ).to.be( undefined ) ;
			expect( list ).to.have.length( 0 ) ;
			list.sanityCheck() ;
			
			list.push( 'jack' , 'jean' , 'steve' ) ;
			expect( [ ... list ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
			list.sanityCheck() ;
			
			expect( list.shift() ).to.be( 'jack' ) ;
			expect( [ ... list ] ).to.equal( [ 'jean' , 'steve' ] ) ;
			list.sanityCheck() ;
			
			expect( list.shift() ).to.be( 'jean' ) ;
			expect( [ ... list ] ).to.equal( [ 'steve' ] ) ;
			list.sanityCheck() ;
			
			expect( list.shift() ).to.be( 'steve' ) ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
			
			expect( list.shift() ).to.be( undefined ) ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
		} ) ;
	} ) ;
		


	describe( "Advanced Array-like features" , () => {
		
		it( ".nodes()" , () => {
			var nodes ;
			var list ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			nodes = list.nodes() ;
			expect( nodes ).to.be.an( Array ) ;
			expect( nodes ).to.have.length( 3 ) ;
			expect( nodes.map( e => e.element ) ).to.equal( [ e1 , e2 , e3 ] ) ;
			
			list = new LinkedList() ;
			nodes = list.nodes() ;
			expect( nodes ).to.be.an( Array ) ;
			expect( nodes ).to.have.length( 0 ) ;
			expect( nodes.map( e => e.element ) ).to.equal( [] ) ;
			
			list = new LinkedList( e1 , e2 , e2 , e2 , e3 ) ;
			nodes = list.nodes() ;
			expect( nodes ).to.be.an( Array ) ;
			expect( nodes ).to.have.length( 5 ) ;
			expect( nodes.map( e => e.element ) ).to.equal( [ e1 , e2 , e2 , e2 , e3 ] ) ;
		} ) ;
		
		it( ".nodeOf()/.lastNodeOf()" , () => {
			var list ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.nodeOf( e2 ).element ).to.be( e2 ) ;
			expect( list.nodeOf( e4 ) ).to.be( null ) ;
			
			list.push( e2 , e2 , e2 ) ;
			list.set( list.nodeOf( e2 ) , e4 ) ;
			expect( [ ... list ] ).to.equal( [ { v: 'jack' } , { v: 'bobby' } , { v: 'steve' } , { v: 'bob' } , { v: 'bob' } , { v: 'bob' } ] ) ;
			list.set( list.lastNodeOf( e2 ) , e4 ) ;
			expect( [ ... list ] ).to.equal( [ { v: 'jack' } , { v: 'bobby' } , { v: 'steve' } , { v: 'bob' } , { v: 'bob' } , { v: 'bobby' } ] ) ;
		} ) ;
		
		it( ".includes()" , () => {
			var list ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			list = new LinkedList() ;
			expect( list.includes( e2 ) ).to.be.false() ;
			
			list = new LinkedList( e1 ) ;
			expect( list.includes( e2 ) ).to.be.false() ;
			
			list = new LinkedList( e1 , e3 ) ;
			expect( list.includes( e2 ) ).to.be.false() ;
			
			list = new LinkedList( e2 ) ;
			expect( list.includes( e2 ) ).to.be.true() ;
			
			list = new LinkedList( e2 , e2 ) ;
			expect( list.includes( e2 ) ).to.be.true() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.includes( e2 ) ).to.be.true() ;
			
			list = new LinkedList( e1 , e3 , e2 ) ;
			expect( list.includes( e2 ) ).to.be.true() ;
			
			list = new LinkedList( e2 , e1 , e3 ) ;
			expect( list.includes( e2 ) ).to.be.true() ;
		} ) ;

		it( ".forEach()" , () => {
			var list ,
				accumulator = [] ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			list = new LinkedList() ;
			list.forEach( element => accumulator.push( element.v ) ) ;
			expect( accumulator ).to.equal( [] ) ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			list.forEach( element => accumulator.push( element.v ) ) ;
			expect( accumulator ).to.equal( [ 'jack' , 'bob' , 'steve' ] ) ;
		} ) ;

		it( ".some()/.every()" , () => {
			var list ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			list = new LinkedList() ;
			expect( list.some( element => element.v === 'bob' ) ).to.be.false() ;
			expect( list.every( element => element.v === 'bob' ) ).to.be.true() ;
			
			list = new LinkedList( e1 ) ;
			expect( list.some( element => element.v === 'bob' ) ).to.be.false() ;
			expect( list.every( element => element.v === 'bob' ) ).to.be.false() ;
			
			list = new LinkedList( e2 ) ;
			expect( list.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( list.every( element => element.v === 'bob' ) ).to.be.true() ;
			
			list = new LinkedList( e1 , e2 ) ;
			expect( list.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( list.every( element => element.v === 'bob' ) ).to.be.false() ;
			
			list = new LinkedList( e2 , e1 ) ;
			expect( list.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( list.every( element => element.v === 'bob' ) ).to.be.false() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( list.every( element => element.v === 'bob' ) ).to.be.false() ;
			
			list = new LinkedList( e1 , e2 , e2 , e3 ) ;
			expect( list.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( list.every( element => element.v === 'bob' ) ).to.be.false() ;
			
			list = new LinkedList( e2 , e2 , e2 ) ;
			expect( list.some( element => element.v === 'bob' ) ).to.be.true() ;
			expect( list.every( element => element.v === 'bob' ) ).to.be.true() ;
		} ) ;
		
		it( ".find()" , () => {
			var list ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bob' } ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.find( element => element.v === 'bob' ) ).to.be( e2 ) ;
			expect( list.find( element => element.v === 'bobby' ) ).to.be( undefined ) ;
			
			list.push( e4 ) ;
			expect( list.find( element => element.v === 'bob' ) ).to.be( e2 ) ;
			
			list.unshift( e4 ) ;
			expect( list.find( element => element.v === 'bob' ) ).to.be( e4 ) ;
		} ) ;
		
		it( ".findNode()" , () => {
			var list ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bob' } ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.get( list.findNode( element => element.v === 'bob' ) ) ).to.be( e2 ) ;
			expect( list.findNode( element => element.v === 'bobby' ) ).to.be( null ) ;
			expect( list.get( list.findNode( element => element.v === 'bobby' ) ) ).to.be( undefined ) ;
			
			list.push( e4 ) ;
			expect( list.get( list.findNode( element => element.v === 'bob' ) ) ).to.be( e2 ) ;
			
			list.unshift( e4 ) ;
			expect( list.get( list.findNode( element => element.v === 'bob' ) ) ).to.be( e4 ) ;
		} ) ;
		
		it( ".map()" , () => {
			var list ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			list = new LinkedList().map( element => element.v + element.v ) ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 ).map( element => element.v + element.v ) ;
			expect( [ ... list ] ).to.equal( [ 'jackjack' ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ).map( element => element.v + element.v ) ;
			expect( [ ... list ] ).to.equal( [ 'jackjack' , 'bobbob' , 'stevesteve' ] ) ;
			list.sanityCheck() ;
		} ) ;
		
		it( ".reduce()/.reduceRight" , () => {
			var list ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			list = new LinkedList() ;
			expect( list.reduce( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( '' ) ;
			expect( list.reduceRight( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( '' ) ;
			
			list = new LinkedList( e1 ) ;
			expect( list.reduce( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( 'jack' ) ;
			expect( list.reduceRight( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( 'jack' ) ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.reduce( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( 'jackbobsteve' ) ;
			expect( list.reduceRight( ( accumulator , element ) => accumulator + element.v , '' ) ).to.equal( 'stevebobjack' ) ;
		} ) ;
		
		it( ".filter()" , () => {
			var list ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			list = new LinkedList( e2 , e2 , e2 ) ;
			expect( list.filter( () => true ) ).not.to.be( list ) ;
			
			list = new LinkedList().filter( element => element.v.length >= 4 ) ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 ).filter( element => element.v.length >= 4 ) ;
			expect( [ ... list ] ).to.equal( [ e1 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 ).filter( element => element.v.length < 4 ) ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ).filter( element => element.v.length >= 4 ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e3 ).filter( element => element.v.length >= 4 ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e2 , e2 , e2 ).filter( element => element.v.length >= 4 ) ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ).filter( element => element.v.length < 4 ) ;
			expect( [ ... list ] ).to.equal( [ e2 ] ) ;
			list.sanityCheck() ;
		} ) ;
		
		it( ".reverse()" , () => {
			var list ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			list = new LinkedList().reverse() ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 ).reverse() ;
			expect( [ ... list ] ).to.equal( [ e1 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ).reverse() ;
			expect( [ ... list ] ).to.equal( [ e3 , e2 , e1 ] ) ;
			list.sanityCheck() ;
		} ) ;
		
		it( "missing .concat()" ) ;
		it( "missing .copyWithin()" ) ;
		it( "missing .slice()" ) ;
		it( "missing .splice()" ) ;
		it( "missing .sort()" ) ;
	} ) ;



	describe( "Advanced custom features" , () => {
		
		it( ".removeNode()/.deleteNode()" , () => {
			var list ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			list.removeNode( list.nodeOf( e2 ) ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList() ;
			list.removeNode( list.nodeOf( e2 ) ) ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e2 ) ;
			list.removeNode( list.nodeOf( e2 ) ) ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e2 , e1 , e3 ) ;
			list.removeNode( list.nodeOf( e2 ) ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e3 , e2 ) ;
			list.removeNode( list.nodeOf( e2 ) ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e3 ] ) ;
			list.sanityCheck() ;
		} ) ;
		
		it( ".remove()/.delete()" , () => {
			var list ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			list.remove( e2 ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList() ;
			list.remove( e2 ) ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e2 ) ;
			list.remove( e2 ) ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e2 , e1 , e3 ) ;
			list.remove( e2 ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e3 , e2 ) ;
			list.remove( e2 ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e3 ] ) ;
			list.sanityCheck() ;
			
			// Remove all occurences
			list = new LinkedList( e2 , e2 , e2 , e1 , e2 , e3 , e2 ) ;
			list.remove( e2 ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e3 ] ) ;
			list.sanityCheck() ;
			
			// NaN test
			list = new LinkedList( NaN , NaN , NaN , e1 , NaN , e3 , NaN ) ;
			list.remove( NaN ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e3 ] ) ;
			list.sanityCheck() ;
		} ) ;
		
		it( ".moveAfter()/.moveToTail()" , () => {
			var list ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveAfter( list.nodeOf( e1 ) , list.nodeOf( e1 ) ) ).to.be.false() ;
			expect( [ ... list ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveAfter( list.nodeOf( e1 ) , list.nodeOf( e2 ) ) ).to.be.true() ;
			expect( [ ... list ] ).to.equal( [ e2 , e1 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveAfter( list.nodeOf( e1 ) , list.nodeOf( e3 ) ) ).to.be.true() ;
			expect( [ ... list ] ).to.equal( [ e2 , e3 , e1 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveToTail( list.nodeOf( e1 ) ) ).to.be.true() ;
			expect( [ ... list ] ).to.equal( [ e2 , e3 , e1 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveAfter( list.nodeOf( e2 ) , list.nodeOf( e1 ) ) ).to.be.false() ;
			expect( [ ... list ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveAfter( list.nodeOf( e2 ) , list.nodeOf( e2 ) ) ).to.be.false() ;
			expect( [ ... list ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveAfter( list.nodeOf( e2 ) , list.nodeOf( e3 ) ) ).to.be.true() ;
			expect( [ ... list ] ).to.equal( [ e1 , e3 , e2 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveToTail( list.nodeOf( e2 ) ) ).to.be.true() ;
			expect( [ ... list ] ).to.equal( [ e1 , e3 , e2 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveAfter( list.nodeOf( e3 ) , list.nodeOf( e1 ) ) ).to.be.true() ;
			expect( [ ... list ] ).to.equal( [ e1 , e3 , e2 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveAfter( list.nodeOf( e3 ) , list.nodeOf( e2 ) ) ).to.be.false() ;
			expect( [ ... list ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveAfter( list.nodeOf( e3 ) , list.nodeOf( e3 ) ) ).to.be.false() ;
			expect( [ ... list ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveToTail( list.nodeOf( e3 ) ) ).to.be.false() ;
			expect( [ ... list ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			list.sanityCheck() ;
		} ) ;
		
		it( ".moveBefore()/.moveToHead()" , () => {
			var list ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveBefore( list.nodeOf( e1 ) , list.nodeOf( e1 ) ) ).to.be.false() ;
			expect( [ ... list ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveToHead( list.nodeOf( e1 ) ) ).to.be.false() ;
			expect( [ ... list ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveBefore( list.nodeOf( e1 ) , list.nodeOf( e2 ) ) ).to.be.false() ;
			expect( [ ... list ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveBefore( list.nodeOf( e1 ) , list.nodeOf( e3 ) ) ).to.be.true() ;
			expect( [ ... list ] ).to.equal( [ e2 , e1 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveBefore( list.nodeOf( e2 ) , list.nodeOf( e1 ) ) ).to.be.true() ;
			expect( [ ... list ] ).to.equal( [ e2 , e1 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveToHead( list.nodeOf( e2 ) ) ).to.be.true() ;
			expect( [ ... list ] ).to.equal( [ e2 , e1 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveBefore( list.nodeOf( e2 ) , list.nodeOf( e2 ) ) ).to.be.false() ;
			expect( [ ... list ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveBefore( list.nodeOf( e2 ) , list.nodeOf( e3 ) ) ).to.be.false() ;
			expect( [ ... list ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveBefore( list.nodeOf( e3 ) , list.nodeOf( e1 ) ) ).to.be.true() ;
			expect( [ ... list ] ).to.equal( [ e3 , e1 , e2 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveToHead( list.nodeOf( e3 ) ) ).to.be.true() ;
			expect( [ ... list ] ).to.equal( [ e3 , e1 , e2 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveBefore( list.nodeOf( e3 ) , list.nodeOf( e2 ) ) ).to.be.true() ;
			expect( [ ... list ] ).to.equal( [ e1 , e3 , e2 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			expect( list.moveBefore( list.nodeOf( e3 ) , list.nodeOf( e3 ) ) ).to.be.false() ;
			expect( [ ... list ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			list.sanityCheck() ;
		} ) ;
		
		it( ".insertAfter()" , () => {
			var list ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			
			list.insertAfter( list.nodeOf( e2 ) ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			list.sanityCheck() ;
			
			list.insertAfter( list.nodeOf( e2 ) , e4 ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e2 , e4 , e3 ] ) ;
			list.sanityCheck() ;
			
			list.insertAfter( list.nodeOf( e1 ) , e4 , e4 , e4 ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e4 , e4 , e4 , e2 , e4 , e3 ] ) ;
			list.sanityCheck() ;
			
			list.insertAfter( list.nodeOf( e3 ) , e4 ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e4 , e4 , e4 , e2 , e4 , e3 , e4 ] ) ;
			list.sanityCheck() ;
		} ) ;
		
		it( ".insertBefore()" , () => {
			var list ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ,
				e4 = { v: 'bobby' } ;
			
			list = new LinkedList( e1 , e2 , e3 ) ;
			
			list.insertBefore( list.nodeOf( e2 ) ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e2 , e3 ] ) ;
			list.sanityCheck() ;
			
			list.insertBefore( list.nodeOf( e2 ) , e4 ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e4 , e2 , e3 ] ) ;
			list.sanityCheck() ;
			
			list.insertBefore( list.nodeOf( e1 ) , e4 , e4 , e4 ) ;
			expect( [ ... list ] ).to.equal( [ e4 , e4 , e4 , e1 , e4 , e2 , e3 ] ) ;
			list.sanityCheck() ;
			
			list.insertBefore( list.nodeOf( e3 ) , e4 ) ;
			expect( [ ... list ] ).to.equal( [ e4 , e4 , e4 , e1 , e4 , e2 , e4 , e3 ] ) ;
			list.sanityCheck() ;
		} ) ;
		
		it( ".inPlaceFilter()" , () => {
			var list ,
				e1 = { v: 'jack' } ,
				e2 = { v: 'bob' } ,
				e3 = { v: 'steve' } ;
			
			list = new LinkedList( e2 , e2 , e2 ) ;
			expect( list.inPlaceFilter( () => true ) ).to.be( list ) ;
			
			list = new LinkedList().inPlaceFilter( element => element.v.length >= 4 ) ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 ).inPlaceFilter( element => element.v.length >= 4 ) ;
			expect( [ ... list ] ).to.equal( [ e1 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 ).inPlaceFilter( element => element.v.length < 4 ) ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ).inPlaceFilter( element => element.v.length >= 4 ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e3 ).inPlaceFilter( element => element.v.length >= 4 ) ;
			expect( [ ... list ] ).to.equal( [ e1 , e3 ] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e2 , e2 , e2 ).inPlaceFilter( element => element.v.length >= 4 ) ;
			expect( [ ... list ] ).to.equal( [] ) ;
			list.sanityCheck() ;
			
			list = new LinkedList( e1 , e2 , e3 ).inPlaceFilter( element => element.v.length < 4 ) ;
			expect( [ ... list ] ).to.equal( [ e2 ] ) ;
			list.sanityCheck() ;
		} ) ;
	} ) ;

} ) ;
