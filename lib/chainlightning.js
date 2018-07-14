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



function List( ... elements ) {
	this.head = null ;
	this.tail = null ;
	this.length = 0 ;

	if ( elements.length ) {
		this.push( ... elements ) ;
	}
}

module.exports = List ;



List.prototype[Symbol.iterator] = function *() {
	var current = this.head ;

	while ( current ) {
		yield current.element ;
		current = current.next ;
	}
} ;



List.prototype.push =
List.prototype.append = function append( ... elements ) {
	var index , slot ;

	if ( ! elements.length ) { return ; }

	this.length += elements.length ;

	slot = new Slot( this , this.tail , null , elements[ 0 ] ) ;

	if ( this.tail ) {
		this.tail.next = slot ;
		this.tail = slot ;
	}
	else {
		this.head = this.tail = slot ;
	}

	for ( index = 1 ; index < elements.length ; index ++ ) {
		slot = new Slot( this , this.tail , null , elements[ index ] ) ;
		this.tail.next = slot ;
		this.tail = slot ;
	}
} ;



List.prototype.unshift =
List.prototype.prepend = function prepend( ... elements ) {
	var index , slot ;

	if ( ! elements.length ) { return ; }

	this.length += elements.length ;
	index = elements.length - 1 ;
	slot = new Slot( this , null , this.head , elements[ index ] ) ;

	if ( this.head ) {
		this.head.previous = slot ;
		this.head = slot ;
	}
	else {
		this.head = this.tail = slot ;
	}

	while ( index -- ) {
		slot = new Slot( this , null , this.head , elements[ index ] ) ;
		this.head.previous = slot ;
		this.head = slot ;
	}
} ;



List.prototype.pop = function pop() {
	if ( ! this.tail ) { return ; }

	var slot = this.tail ;
	this.tail = slot.previous ;

	if ( this.tail ) {
		this.tail.next = null ;
	}
	else {
		// That was the last element
		this.head = null ;
	}

	this.length -- ;

	return slot.element ;
} ;



List.prototype.shift = function shift() {
	if ( ! this.head ) { return ; }

	var slot = this.head ;
	this.head = slot.next ;

	if ( this.head ) {
		this.head.previous = null ;
	}
	else {
		// That was the last element
		this.tail = null ;
	}

	this.length -- ;

	return slot.element ;
} ;



/*
	Advanced features
*/



List.prototype.get = function get( slot ) {
	if ( ! slot || slot.list !== this ) { return ; }
	return slot.element ;
} ;



List.prototype.set = function set( slot , element ) {
	if ( ! slot || slot.list !== this ) { return ; }
	slot.element = element ;
} ;



List.prototype.slotOf = function slotOf( element ) {
	var current = this.head ;

	while ( current ) {
		if ( current.element === element ) { return current ; }
		current = current.next ;
	}

	return null ;
} ;



List.prototype.lastSlotOf = function lastSlotOf( element ) {
	var current = this.tail ;

	while ( current ) {
		if ( current.element === element ) { return current ; }
		current = current.previous ;
	}

	return null ;
} ;



List.prototype.find = function find( fn , thisArg ) {
	var current = this.head ;

	while ( current ) {
		if ( fn.call( thisArg , current.element , current , this ) ) {
			return current.element ;
		}

		current = current.next ;
	}

	return ;
} ;



List.prototype.findSlot = function findSlot( fn , thisArg ) {
	var current = this.head ;

	while ( current ) {
		if ( fn.call( thisArg , current.element , current , this ) ) {
			return current ;
		}

		current = current.next ;
	}

	return null ;
} ;



/*
	Slot class
*/



function Slot( list , previous , next , element ) {
	this.list = list ;
	this.previous = previous ;
	this.next = next ;
	this.element = element ;
}

List.Slot = Slot ;

