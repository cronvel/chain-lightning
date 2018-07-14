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



var List = require( '..' ) ;





			/* Tests */



describe( "Basic features tests" , () => {
	
	it( "constructor arguments should be added as elements" , () => {
		var list ;
		
		list = new List() ;
		expect( list ).to.have.length( 0 ) ;
		expect( [ ... list ] ).to.equal( [] ) ;
		expect( list.head ).to.be( null ) ;
		expect( list.tail ).to.be( null ) ;
		
		list = new List( 'jack' ) ;
		expect( list ).to.have.length( 1 ) ;
		expect( [ ... list ] ).to.equal( [ 'jack' ] ) ;
		expect( list.head.element ).to.be( 'jack' ) ;
		expect( list.tail.element ).to.be( 'jack' ) ;
		
		list = new List( 'jack' , 'jean' , 'steve' ) ;
		expect( list ).to.have.length( 3 ) ;
		expect( [ ... list ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
		expect( list.head.element ).to.be( 'jack' ) ;
		expect( list.tail.element ).to.be( 'steve' ) ;
	} ) ;
	
	it( "List.from() should create a list from any iterable" , () => {
		var list ;
		
		list = List.from( new Set() ) ;
		expect( list ).to.have.length( 0 ) ;
		expect( [ ... list ] ).to.equal( [] ) ;
		expect( list.head ).to.be( null ) ;
		expect( list.tail ).to.be( null ) ;
		
		list = List.from( new Set( [ 'jack' ] ) ) ;
		expect( list ).to.have.length( 1 ) ;
		expect( [ ... list ] ).to.equal( [ 'jack' ] ) ;
		expect( list.head.element ).to.be( 'jack' ) ;
		expect( list.tail.element ).to.be( 'jack' ) ;
		
		list = List.from( new Set( [ 'jack' , 'jean' , 'steve' ] ) ) ;
		expect( list ).to.have.length( 3 ) ;
		expect( [ ... list ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
		expect( list.head.element ).to.be( 'jack' ) ;
		expect( list.tail.element ).to.be( 'steve' ) ;
	} ) ;
	
	it( ".push()/.append()" , () => {
		var list ;
		
		list = new List() ;
		expect( list ).to.have.length( 0 ) ;
		
		list.push( 'bob' ) ;
		expect( list ).to.have.length( 1 ) ;
		
		list.append( 'bill' ) ;
		expect( list ).to.have.length( 2 ) ;
		
		list.push( 'jack' , 'jean' , 'steve' ) ;
		expect( list ).to.have.length( 5 ) ;
		expect( [ ... list ] ).to.equal( [ 'bob' , 'bill' , 'jack' , 'jean' , 'steve' ] ) ;
		expect( list.head.element ).to.be( 'bob' ) ;
		expect( list.tail.element ).to.be( 'steve' ) ;
		
		list = new List() ;
		list.push( 'jack' , 'jean' , 'steve' ) ;
		expect( list ).to.have.length( 3 ) ;
		expect( [ ... list ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
		expect( list.head.element ).to.be( 'jack' ) ;
		expect( list.tail.element ).to.be( 'steve' ) ;
	} ) ;
	
	it( ".unshift()/.prepend()" , () => {
		var list ;
		
		list = new List() ;
		expect( list ).to.have.length( 0 ) ;
		
		list.unshift( 'bob' ) ;
		expect( list ).to.have.length( 1 ) ;
		
		list.prepend( 'bill' ) ;
		expect( list ).to.have.length( 2 ) ;
		
		list.unshift( 'jack' , 'jean' , 'steve' ) ;
		expect( list ).to.have.length( 5 ) ;
		expect( [ ... list ] ).to.equal( [ 'jack' , 'jean' , 'steve' , 'bill' , 'bob' ] ) ;
		expect( list.head.element ).to.be( 'jack' ) ;
		expect( list.tail.element ).to.be( 'bob' ) ;
		
		list = new List() ;
		list.push( 'jack' , 'jean' , 'steve' ) ;
		expect( list ).to.have.length( 3 ) ;
		expect( [ ... list ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
		expect( list.head.element ).to.be( 'jack' ) ;
		expect( list.tail.element ).to.be( 'steve' ) ;
	} ) ;
	
	it( ".pop()" , () => {
		var list ;
		
		list = new List() ;
		expect( list.pop() ).to.be( undefined ) ;
		expect( list ).to.have.length( 0 ) ;
		expect( list.head ).to.be( null ) ;
		expect( list.tail ).to.be( null ) ;
		
		list.push( 'jack' , 'jean' , 'steve' ) ;
		expect( list ).to.have.length( 3 ) ;
		expect( [ ... list ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
		expect( list.head.element ).to.be( 'jack' ) ;
		expect( list.tail.element ).to.be( 'steve' ) ;
		
		expect( list.pop() ).to.be( 'steve' ) ;
		expect( list ).to.have.length( 2 ) ;
		expect( [ ... list ] ).to.equal( [ 'jack' , 'jean' ] ) ;
		expect( list.head.element ).to.be( 'jack' ) ;
		expect( list.tail.element ).to.be( 'jean' ) ;
		
		expect( list.pop() ).to.be( 'jean' ) ;
		expect( list ).to.have.length( 1 ) ;
		expect( [ ... list ] ).to.equal( [ 'jack' ] ) ;
		
		expect( list.pop() ).to.be( 'jack' ) ;
		expect( list ).to.have.length( 0 ) ;
		expect( [ ... list ] ).to.equal( [] ) ;
		expect( list.head ).to.be( null ) ;
		expect( list.tail ).to.be( null ) ;
		
		expect( list.pop() ).to.be( undefined ) ;
		expect( list ).to.have.length( 0 ) ;
		expect( [ ... list ] ).to.equal( [] ) ;
	} ) ;
	
	it( ".shift()" , () => {
		var list ;
		
		list = new List() ;
		expect( list.shift() ).to.be( undefined ) ;
		expect( list ).to.have.length( 0 ) ;
		expect( list.head ).to.be( null ) ;
		expect( list.tail ).to.be( null ) ;
		
		list.push( 'jack' , 'jean' , 'steve' ) ;
		expect( list ).to.have.length( 3 ) ;
		expect( [ ... list ] ).to.equal( [ 'jack' , 'jean' , 'steve' ] ) ;
		expect( list.head.element ).to.be( 'jack' ) ;
		expect( list.tail.element ).to.be( 'steve' ) ;
		
		expect( list.shift() ).to.be( 'jack' ) ;
		expect( list ).to.have.length( 2 ) ;
		expect( [ ... list ] ).to.equal( [ 'jean' , 'steve' ] ) ;
		expect( list.head.element ).to.be( 'jean' ) ;
		expect( list.tail.element ).to.be( 'steve' ) ;
		
		expect( list.shift() ).to.be( 'jean' ) ;
		expect( list ).to.have.length( 1 ) ;
		expect( [ ... list ] ).to.equal( [ 'steve' ] ) ;
		
		expect( list.shift() ).to.be( 'steve' ) ;
		expect( list ).to.have.length( 0 ) ;
		expect( [ ... list ] ).to.equal( [] ) ;
		expect( list.head ).to.be( null ) ;
		expect( list.tail ).to.be( null ) ;
		
		expect( list.shift() ).to.be( undefined ) ;
		expect( list ).to.have.length( 0 ) ;
		expect( [ ... list ] ).to.equal( [] ) ;
	} ) ;
} ) ;
	


describe( "Advanced features tests" , () => {
	
	it( ".slotOf()/.lastSlotOf()" , () => {
		var list ,
			e1 = { v: 'jack' } ,
			e2 = { v: 'bob' } ,
			e3 = { v: 'steve' } ,
			e4 = { v: 'bobby' } ;
		
		list = new List( e1 , e2 , e3 ) ;
		expect( list.slotOf( e2 ).element ).to.be( e2 ) ;
		expect( list.slotOf( e4 ) ).to.be( null ) ;
		
		list.push( e2 , e2 , e2 ) ;
		list.set( list.slotOf( e2 ) , e4 ) ;
		expect( [ ... list ] ).to.equal( [ { v: 'jack' } , { v: 'bobby' } , { v: 'steve' } , { v: 'bob' } , { v: 'bob' } , { v: 'bob' } ] ) ;
		list.set( list.lastSlotOf( e2 ) , e4 ) ;
		expect( [ ... list ] ).to.equal( [ { v: 'jack' } , { v: 'bobby' } , { v: 'steve' } , { v: 'bob' } , { v: 'bob' } , { v: 'bobby' } ] ) ;
	} ) ;
	
	it( ".includes()" , () => {
		var list ,
			e1 = { v: 'jack' } ,
			e2 = { v: 'bob' } ,
			e3 = { v: 'steve' } ;
		
		list = new List() ;
		expect( list.includes( e2 ) ).to.be.false() ;
		
		list = new List( e1 ) ;
		expect( list.includes( e2 ) ).to.be.false() ;
		
		list = new List( e1 , e3 ) ;
		expect( list.includes( e2 ) ).to.be.false() ;
		
		list = new List( e2 ) ;
		expect( list.includes( e2 ) ).to.be.true() ;
		
		list = new List( e2 , e2 ) ;
		expect( list.includes( e2 ) ).to.be.true() ;
		
		list = new List( e1 , e2 , e3 ) ;
		expect( list.includes( e2 ) ).to.be.true() ;
		
		list = new List( e1 , e3 , e2 ) ;
		expect( list.includes( e2 ) ).to.be.true() ;
		
		list = new List( e2 , e1 , e3 ) ;
		expect( list.includes( e2 ) ).to.be.true() ;
	} ) ;

	it( ".forEach()" , () => {
		var list ,
			accumulator = [] ,
			e1 = { v: 'jack' } ,
			e2 = { v: 'bob' } ,
			e3 = { v: 'steve' } ;
		
		list = new List() ;
		list.forEach( element => accumulator.push( element.v ) ) ;
		expect( accumulator ).to.equal( [] ) ;
		
		list = new List( e1 , e2 , e3 ) ;
		list.forEach( element => accumulator.push( element.v ) ) ;
		expect( accumulator ).to.equal( [ 'jack' , 'bob' , 'steve' ] ) ;
	} ) ;

	it( ".some()/.every()" , () => {
		var list ,
			e1 = { v: 'jack' } ,
			e2 = { v: 'bob' } ,
			e3 = { v: 'steve' } ;
		
		list = new List() ;
		expect( list.some( element => element.v === 'bob' ) ).to.be.false() ;
		expect( list.every( element => element.v === 'bob' ) ).to.be.true() ;
		
		list = new List( e1 ) ;
		expect( list.some( element => element.v === 'bob' ) ).to.be.false() ;
		expect( list.every( element => element.v === 'bob' ) ).to.be.false() ;
		
		list = new List( e2 ) ;
		expect( list.some( element => element.v === 'bob' ) ).to.be.true() ;
		expect( list.every( element => element.v === 'bob' ) ).to.be.true() ;
		
		list = new List( e1 , e2 ) ;
		expect( list.some( element => element.v === 'bob' ) ).to.be.true() ;
		expect( list.every( element => element.v === 'bob' ) ).to.be.false() ;
		
		list = new List( e2 , e1 ) ;
		expect( list.some( element => element.v === 'bob' ) ).to.be.true() ;
		expect( list.every( element => element.v === 'bob' ) ).to.be.false() ;
		
		list = new List( e1 , e2 , e3 ) ;
		expect( list.some( element => element.v === 'bob' ) ).to.be.true() ;
		expect( list.every( element => element.v === 'bob' ) ).to.be.false() ;
		
		list = new List( e1 , e2 , e2 , e3 ) ;
		expect( list.some( element => element.v === 'bob' ) ).to.be.true() ;
		expect( list.every( element => element.v === 'bob' ) ).to.be.false() ;
		
		list = new List( e2 , e2 , e2 ) ;
		expect( list.some( element => element.v === 'bob' ) ).to.be.true() ;
		expect( list.every( element => element.v === 'bob' ) ).to.be.true() ;
	} ) ;
	
	it( ".find()" , () => {
		var list ,
			e1 = { v: 'jack' } ,
			e2 = { v: 'bob' } ,
			e3 = { v: 'steve' } ,
			e4 = { v: 'bob' } ;
		
		list = new List( e1 , e2 , e3 ) ;
		expect( list.find( element => element.v === 'bob' ) ).to.be( e2 ) ;
		expect( list.find( element => element.v === 'bobby' ) ).to.be( undefined ) ;
		
		list.push( e4 ) ;
		expect( list.find( element => element.v === 'bob' ) ).to.be( e2 ) ;
		
		list.unshift( e4 ) ;
		expect( list.find( element => element.v === 'bob' ) ).to.be( e4 ) ;
	} ) ;
	
	it( ".findSlot()" , () => {
		var list ,
			e1 = { v: 'jack' } ,
			e2 = { v: 'bob' } ,
			e3 = { v: 'steve' } ,
			e4 = { v: 'bob' } ;
		
		list = new List( e1 , e2 , e3 ) ;
		expect( list.get( list.findSlot( element => element.v === 'bob' ) ) ).to.be( e2 ) ;
		expect( list.findSlot( element => element.v === 'bobby' ) ).to.be( null ) ;
		expect( list.get( list.findSlot( element => element.v === 'bobby' ) ) ).to.be( undefined ) ;
		
		list.push( e4 ) ;
		expect( list.get( list.findSlot( element => element.v === 'bob' ) ) ).to.be( e2 ) ;
		
		list.unshift( e4 ) ;
		expect( list.get( list.findSlot( element => element.v === 'bob' ) ) ).to.be( e4 ) ;
	} ) ;
} ) ;

