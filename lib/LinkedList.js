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



// This is a “Doubly” Linked List

function LinkedList( ... elements ) {
	this.head = null ;
	this.tail = null ;
	this.length = 0 ;

	if ( elements.length ) {
		this.push( ... elements ) ;
	}
}

module.exports = LinkedList ;



function Slot( list , previous , next , element ) {
	this.list = list ;
	this.previous = previous ;
	this.next = next ;
	this.element = element ;
}

LinkedList.Slot = Slot ;



// Array.prototype.includes() uses this for value equality
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
function isIdenticalTo( x , y ) {
	return x === y || ( Number.isNaN( x ) && Number.isNaN( y ) ) ;
}



LinkedList.prototype.values = function *() {
	var current = this.head ;

	while ( current ) {
		yield current.element ;
		current = current.next ;
	}
} ;

LinkedList.prototype[Symbol.iterator] = LinkedList.prototype.values ;



LinkedList.from = function( iterable ) {
	var slot , element ,
		list = new LinkedList() ;

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



// Similar to .keys()
LinkedList.prototype.slots = function() {
	var slots = new Array( this.length ) ,
		index = 0 ,
		current = this.head ;

	while ( current ) {
		slots[ index ++ ] = current ;
		current = current.next ;
	}

	return slots ;
} ;



LinkedList.prototype.push =
LinkedList.prototype.append = function( ... elements ) {
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



LinkedList.prototype.unshift =
LinkedList.prototype.prepend = function( ... elements ) {
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



LinkedList.prototype.pop = function() {
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



LinkedList.prototype.shift = function() {
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



LinkedList.prototype.slotOf = function( element , fromSlot ) {
	var current ;

	if ( fromSlot ) {
		if ( fromSlot.list !== this ) { return ; }
		current = fromSlot ;
	}
	else {
		current = this.head ;
	}

	while ( current ) {
		if ( isIdenticalTo( current.element , element ) ) { return current ; }
		current = current.next ;
	}

	return null ;
} ;



LinkedList.prototype.lastSlotOf = function( element , fromSlot ) {
	var current ;

	if ( fromSlot ) {
		if ( fromSlot.list !== this ) { return ; }
		current = fromSlot ;
	}
	else {
		current = this.tail ;
	}

	while ( current ) {
		if ( isIdenticalTo( current.element , element ) ) { return current ; }
		current = current.previous ;
	}

	return null ;
} ;



// Almost like .indexOf()
LinkedList.prototype.includes = function( element , fromSlot ) {
	var current ;

	if ( fromSlot ) {
		if ( fromSlot.list !== this ) { return false ; }
		current = fromSlot ;
	}
	else {
		current = this.head ;
	}

	while ( current ) {
		if ( isIdenticalTo( current.element , element ) ) { return true ; }
		current = current.next ;
	}

	return false ;
} ;



LinkedList.prototype.forEach = function( fn , thisArg ) {
	var current = this.head ;

	while ( current ) {
		fn.call( thisArg , current.element , current , this ) ;
		current = current.next ;
	}
} ;



LinkedList.prototype.some = function( fn , thisArg ) {
	var current = this.head ;

	while ( current ) {
		if ( fn.call( thisArg , current.element , current , this ) ) { return true ; }
		current = current.next ;
	}

	return false ;
} ;



LinkedList.prototype.every = function( fn , thisArg ) {
	var current = this.head ;

	while ( current ) {
		if ( ! fn.call( thisArg , current.element , current , this ) ) { return false ; }
		current = current.next ;
	}

	return true ;
} ;



LinkedList.prototype.find = function( fn , thisArg ) {
	var current = this.head ;

	while ( current ) {
		if ( fn.call( thisArg , current.element , current , this ) ) {
			return current.element ;
		}

		current = current.next ;
	}

	return ;
} ;



LinkedList.prototype.findSlot = function( fn , thisArg ) {
	var current = this.head ;

	while ( current ) {
		if ( fn.call( thisArg , current.element , current , this ) ) {
			return current ;
		}

		current = current.next ;
	}

	return null ;
} ;



LinkedList.prototype.map = function( fn , thisArg ) {
	var newList = new LinkedList() ,
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



LinkedList.prototype.reduce = function( fn , accumulator ) {
	var current = this.head ;

	while ( current ) {
		accumulator = fn( accumulator , current.element , current , this ) ;
		current = current.next ;
	}

	return accumulator ;
} ;



LinkedList.prototype.reduceRight = function( fn , accumulator ) {
	var current = this.tail ;

	while ( current ) {
		accumulator = fn( accumulator , current.element , current , this ) ;
		current = current.previous ;
	}

	return accumulator ;
} ;



LinkedList.prototype.filter = function( fn , thisArg ) {
	var newList = new LinkedList() ,
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



LinkedList.prototype.reverse = function() {
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



LinkedList.prototype.get = function( slot ) {
	if ( ! slot || slot.list !== this ) { return ; }
	return slot.element ;
} ;



LinkedList.prototype.set = function( slot , element ) {
	if ( ! slot || slot.list !== this ) { return ; }
	slot.element = element ;
} ;



LinkedList.prototype.deleteSlot =
LinkedList.prototype.removeSlot = function( slot ) {
	if ( ! slot || slot.list !== this ) { return false ; }

	if ( slot.previous ) { slot.previous.next = slot.next ; }
	if ( slot.next ) { slot.next.previous = slot.previous ; }
	if ( this.head === slot ) { this.head = slot.next ; }
	if ( this.tail === slot ) { this.tail = slot.previous ; }

	slot.list = slot.previous = slot.next = null ;
	this.length -- ;

	return true ;
} ;



// Delete all occurences of a value
LinkedList.prototype.delete =
LinkedList.prototype.remove = function( value ) {
	this.inPlaceFilter( e => ! isIdenticalTo( e , value ) ) ;
} ;



LinkedList.prototype.moveAfter = function( slot , afterSlot ) {
	if (
		! slot || slot.list !== this || ! afterSlot || afterSlot.list !== this ||
		slot === afterSlot || afterSlot === slot.previous
	) {
		return false ;
	}

	var beforeSlot = afterSlot.next ;

	if ( this.head === slot ) { this.head = slot.next ; }

	if ( this.tail === slot ) { this.tail = slot.previous ; }
	else if ( this.tail === afterSlot ) { this.tail = slot ; }

	if ( slot.previous ) { slot.previous.next = slot.next ; }
	if ( slot.next ) { slot.next.previous = slot.previous ; }

	slot.previous = afterSlot ;
	afterSlot.next = slot ;

	slot.next = beforeSlot ;
	if ( beforeSlot ) { beforeSlot.previous = slot ; }

	return true ;
} ;



LinkedList.prototype.moveBefore = function( slot , beforeSlot ) {
	if (
		! slot || slot.list !== this || ! beforeSlot || beforeSlot.list !== this ||
		slot === beforeSlot || beforeSlot === slot.next
	) {
		return false ;
	}

	var afterSlot = beforeSlot.previous ;

	if ( this.head === slot ) { this.head = slot.next ; }
	else if ( this.head === beforeSlot ) { this.head = slot ; }

	if ( this.tail === slot ) { this.tail = slot.previous ; }

	if ( slot.previous ) { slot.previous.next = slot.next ; }
	if ( slot.next ) { slot.next.previous = slot.previous ; }

	slot.next = beforeSlot ;
	beforeSlot.previous = slot ;

	slot.previous = afterSlot ;
	if ( afterSlot ) { afterSlot.next = slot ; }

	return true ;
} ;



LinkedList.prototype.moveToTail = function( slot ) { return this.moveAfter( slot , this.tail ) ; } ;
LinkedList.prototype.moveToHead = function( slot ) { return this.moveBefore( slot , this.head ) ; } ;



LinkedList.prototype.insertAfter = function( afterSlot , ... elements ) {
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



LinkedList.prototype.insertBefore = function( beforeSlot , ... elements ) {
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



LinkedList.prototype.inPlaceFilter = function( fn , thisArg ) {
	var lastSlot = null ,
		nextSlot ,
		slot = this.head ;

	this.head = null ;

	while ( slot ) {
		slot.previous = lastSlot ;
		nextSlot = slot.next ;	// backup that

		if ( fn.call( thisArg , slot.element , slot , this ) ) {
			if ( ! this.head ) { this.head = slot ; }
			lastSlot = slot ;
		}
		else {
			if ( lastSlot ) { lastSlot.next = slot.next ; }
			this.length -- ;
			slot.list = slot.previous = slot.next = null ;
		}

		slot = nextSlot ;
	}

	this.tail = lastSlot ;

	return this ;
} ;

