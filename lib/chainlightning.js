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



function Slot( list , previous , next , element ) {
	this.list = list ;
	this.previous = previous ;
	this.next = next ;
	this.element = element ;
}

List.Slot = Slot ;



List.prototype.values = function *() {
	var current = this.head ;

	while ( current ) {
		yield current.element ;
		current = current.next ;
	}
} ;

List.prototype[Symbol.iterator] = List.prototype.values ;



List.from = function from( iterable ) {
	var index , slot , element ,
		list = new List() ;

	for ( element of iterable ) {
		slot = new Slot( list , list.tail , null , element ) ;

		if ( ! list.head ) {
			// This is the first element
			list.head = list.tail = slot ;
		}
		else {
			list.tail.next = slot ;
			list.tail = slot ;
		}

		list.length ++ ;
	}

	return list ;
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
	Advanced Array-like features
*/



List.prototype.get = function get( slot ) {
	if ( ! slot || slot.list !== this ) { return ; }
	return slot.element ;
} ;



List.prototype.set = function set( slot , element ) {
	if ( ! slot || slot.list !== this ) { return ; }
	slot.element = element ;
} ;



List.prototype.slotOf = function slotOf( element , fromSlot ) {
	var current ;

	if ( fromSlot ) {
		if ( fromSlot.list !== this ) { return ; }
		current = fromSlot ;
	}
	else {
		current = this.head ;
	}

	while ( current ) {
		if ( current.element === element ) { return current ; }
		current = current.next ;
	}

	return null ;
} ;



List.prototype.lastSlotOf = function lastSlotOf( element , fromSlot ) {
	var current ;

	if ( fromSlot ) {
		if ( fromSlot.list !== this ) { return ; }
		current = fromSlot ;
	}
	else {
		current = this.tail ;
	}

	while ( current ) {
		if ( current.element === element ) { return current ; }
		current = current.previous ;
	}

	return null ;
} ;



// Array.prototype.includes() uses this for value equality
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
function sameValueZero( x , y ) {
	return x === y || ( typeof x === 'number' && typeof y === 'number' && isNaN( x ) && isNaN( y ) ) ;
}



// Almost like .indexOf()
List.prototype.includes = function includes( element , fromSlot ) {
	var current ;

	if ( fromSlot ) {
		if ( fromSlot.list !== this ) { return false ; }
		current = fromSlot ;
	}
	else {
		current = this.head ;
	}

	while ( current ) {
		if ( sameValueZero( current.element , element ) ) { return true ; }
		current = current.next ;
	}

	return false ;
} ;



List.prototype.forEach = function forEach( fn , thisArg ) {
	var current = this.head ;

	while ( current ) {
		fn.call( thisArg , current.element , current , this ) ;
		current = current.next ;
	}
} ;



List.prototype.some = function some( fn , thisArg ) {
	var current = this.head ;

	while ( current ) {
		if ( fn.call( thisArg , current.element , current , this ) ) { return true ; }
		current = current.next ;
	}

	return false ;
} ;



List.prototype.every = function every( fn , thisArg ) {
	var current = this.head ;

	while ( current ) {
		if ( ! fn.call( thisArg , current.element , current , this ) ) { return false ; }
		current = current.next ;
	}

	return true ;
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



List.prototype.map = function map( fn , thisArg ) {
	var newList = new List() ,
		newElement ,
		slot ,
		current = this.head ;

	while ( current ) {
		newElement = fn.call( thisArg , current.element , current , this ) ;

		slot = new Slot( newList , newList.tail , null , newElement ) ;

		if ( newList.tail ) {
			newList.tail.next = slot ;
			newList.tail = slot ;
		}
		else {
			newList.head = newList.tail = slot ;
		}

		current = current.next ;
	}

	newList.length = this.length ;

	return newList ;
} ;



List.prototype.reduce = function reduce( fn , accumulator ) {
	var current = this.head ;

	while ( current ) {
		accumulator = fn( accumulator , current.element , current , this ) ;
		current = current.next ;
	}

	return accumulator ;
} ;



List.prototype.reduceRight = function reduceRight( fn , accumulator ) {
	var current = this.tail ;

	while ( current ) {
		accumulator = fn( accumulator , current.element , current , this ) ;
		current = current.previous ;
	}

	return accumulator ;
} ;



List.prototype.filter = function filter( fn , thisArg ) {
	var newList = new List() ,
		slot ,
		current = this.head ;

	while ( current ) {
		if ( fn.call( thisArg , current.element , current , this ) ) {
			slot = new Slot( newList , newList.tail , null , current.element ) ;

			if ( newList.tail ) {
				newList.tail.next = slot ;
				newList.tail = slot ;
			}
			else {
				newList.head = newList.tail = slot ;
			}

			newList.length ++ ;
		}

		current = current.next ;
	}

	return newList ;
} ;



List.prototype.reverse = function reverse() {
	var tmp ,
		current = this.head ;

	while ( current ) {
		tmp = current.next ;
		current.next = current.previous ;
		current.previous = tmp ;

		// Note: it's already inverted, so use previous instead of next
		current = current.previous ;
	}

	tmp = this.head ;
	this.head = this.tail ;
	this.tail = tmp ;

	return this ;
} ;



/*
	Advanced custom features
*/



List.prototype.insertAfter = function insertAfter( afterSlot , ... elements ) {
	if ( afterSlot.list !== this || ! elements.length ) { return ; }

	var slot , index ,
		lastSlot = afterSlot ,
		beforeSlot = afterSlot.next ;

	for ( index = 0 ; index < elements.length ; index ++ ) {
		slot = new Slot( this , lastSlot , null , elements[ index ] ) ;
		lastSlot.next = slot ;
		lastSlot = slot ;
	}

	this.length += elements.length ;

	if ( beforeSlot ) {
		lastSlot.next = beforeSlot ;
		beforeSlot.previous = lastSlot ;
	}
	else {
		this.tail = lastSlot ;
	}
} ;



List.prototype.insertBefore = function insertBefore( beforeSlot , ... elements ) {
	if ( beforeSlot.list !== this || ! elements.length ) { return ; }

	var slot ,
		index = elements.length ,
		lastSlot = beforeSlot ,
		afterSlot = beforeSlot.previous ;

	while ( index -- ) {
		slot = new Slot( this , null , lastSlot , elements[ index ] ) ;
		lastSlot.previous = slot ;
		lastSlot = slot ;
	}

	this.length += elements.length ;

	if ( afterSlot ) {
		lastSlot.previous = afterSlot ;
		afterSlot.next = lastSlot ;
	}
	else {
		this.head = lastSlot ;
	}
} ;



List.prototype.inPlaceFilter = function inPlaceFilter( fn , thisArg ) {
	var lastSlot = null ,
		slot = this.head ;

	this.head = null ;

	while ( slot ) {
		slot.previous = lastSlot ;

		if ( fn.call( thisArg , slot.element , slot , this ) ) {
			if ( ! this.head ) { this.head = slot ; }
			lastSlot = slot ;
		}
		else {
			if ( lastSlot ) { lastSlot.next = slot.next ; }
			this.length -- ;
		}

		slot = slot.next ;
	}

	this.tail = lastSlot ;

	return this ;
} ;



