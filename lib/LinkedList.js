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



function Node( list , previous , next , element ) {
	this.list = list ;
	this.previous = previous ;
	this.next = next ;
	this.element = element ;
}

LinkedList.Node = Node ;



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
	var node , element ,
		list = new LinkedList() ;

	for ( element of iterable ) {
		node = new Node( list , list.tail , null , element ) ;

		if ( ! list.head ) {
			// This is the first element
			list.head = list.tail = node ;
		}
		else {
			list.tail.next = node ;
			list.tail = node ;
		}

		list.length ++ ;
	}

	return list ;
} ;



// Similar to .keys()
LinkedList.prototype.nodes = function() {
	var nodes = new Array( this.length ) ,
		index = 0 ,
		current = this.head ;

	while ( current ) {
		nodes[ index ++ ] = current ;
		current = current.next ;
	}

	return nodes ;
} ;



LinkedList.prototype.push =
LinkedList.prototype.append = function( ... elements ) {
	var index , node ;

	if ( ! elements.length ) { return ; }

	this.length += elements.length ;

	node = new Node( this , this.tail , null , elements[ 0 ] ) ;

	if ( this.tail ) {
		this.tail.next = node ;
		this.tail = node ;
	}
	else {
		this.head = this.tail = node ;
	}

	for ( index = 1 ; index < elements.length ; index ++ ) {
		node = new Node( this , this.tail , null , elements[ index ] ) ;
		this.tail.next = node ;
		this.tail = node ;
	}
} ;



LinkedList.prototype.unshift =
LinkedList.prototype.prepend = function( ... elements ) {
	var index , node ;

	if ( ! elements.length ) { return ; }

	this.length += elements.length ;
	index = elements.length - 1 ;
	node = new Node( this , null , this.head , elements[ index ] ) ;

	if ( this.head ) {
		this.head.previous = node ;
		this.head = node ;
	}
	else {
		this.head = this.tail = node ;
	}

	while ( index -- ) {
		node = new Node( this , null , this.head , elements[ index ] ) ;
		this.head.previous = node ;
		this.head = node ;
	}
} ;



LinkedList.prototype.pop = function() {
	if ( ! this.tail ) { return ; }

	var node = this.tail ;
	this.tail = node.previous ;

	if ( this.tail ) {
		this.tail.next = null ;
	}
	else {
		// That was the last element
		this.head = null ;
	}

	this.length -- ;

	return node.element ;
} ;



LinkedList.prototype.shift = function() {
	if ( ! this.head ) { return ; }

	var node = this.head ;
	this.head = node.next ;

	if ( this.head ) {
		this.head.previous = null ;
	}
	else {
		// That was the last element
		this.tail = null ;
	}

	this.length -- ;

	return node.element ;
} ;



/*
	Advanced Array-like features
*/



LinkedList.prototype.nodeOf = function( element , fromNode ) {
	var current ;

	if ( fromNode ) {
		if ( fromNode.list !== this ) { return ; }
		current = fromNode ;
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



LinkedList.prototype.lastNodeOf = function( element , fromNode ) {
	var current ;

	if ( fromNode ) {
		if ( fromNode.list !== this ) { return ; }
		current = fromNode ;
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
LinkedList.prototype.includes = function( element , fromNode ) {
	var current ;

	if ( fromNode ) {
		if ( fromNode.list !== this ) { return false ; }
		current = fromNode ;
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



LinkedList.prototype.findNode = function( fn , thisArg ) {
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
		node ,
		current = this.head ;

	while ( current ) {
		newElement = fn.call( thisArg , current.element , current , this ) ;

		node = new Node( newList , newList.tail , null , newElement ) ;

		if ( newList.tail ) {
			newList.tail.next = node ;
			newList.tail = node ;
		}
		else {
			newList.head = newList.tail = node ;
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
		node ,
		current = this.head ;

	while ( current ) {
		if ( fn.call( thisArg , current.element , current , this ) ) {
			node = new Node( newList , newList.tail , null , current.element ) ;

			if ( newList.tail ) {
				newList.tail.next = node ;
				newList.tail = node ;
			}
			else {
				newList.head = newList.tail = node ;
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



LinkedList.prototype.get = function( node ) {
	if ( ! node || node.list !== this ) { return ; }
	return node.element ;
} ;



LinkedList.prototype.set = function( node , element ) {
	if ( ! node || node.list !== this ) { return ; }
	node.element = element ;
} ;



LinkedList.prototype.deleteNode =
LinkedList.prototype.removeNode = function( node ) {
	if ( ! node || node.list !== this ) { return false ; }

	if ( node.previous ) { node.previous.next = node.next ; }
	if ( node.next ) { node.next.previous = node.previous ; }
	if ( this.head === node ) { this.head = node.next ; }
	if ( this.tail === node ) { this.tail = node.previous ; }

	node.list = node.previous = node.next = null ;
	this.length -- ;

	return true ;
} ;



// Delete all occurences of a value
LinkedList.prototype.delete =
LinkedList.prototype.remove = function( value ) {
	this.inPlaceFilter( e => ! isIdenticalTo( e , value ) ) ;
} ;



LinkedList.prototype.moveAfter = function( node , afterNode ) {
	if (
		! node || node.list !== this || ! afterNode || afterNode.list !== this ||
		node === afterNode || afterNode === node.previous
	) {
		return false ;
	}

	var beforeNode = afterNode.next ;

	if ( this.head === node ) { this.head = node.next ; }

	if ( this.tail === node ) { this.tail = node.previous ; }
	else if ( this.tail === afterNode ) { this.tail = node ; }

	if ( node.previous ) { node.previous.next = node.next ; }
	if ( node.next ) { node.next.previous = node.previous ; }

	node.previous = afterNode ;
	afterNode.next = node ;

	node.next = beforeNode ;
	if ( beforeNode ) { beforeNode.previous = node ; }

	return true ;
} ;



LinkedList.prototype.moveBefore = function( node , beforeNode ) {
	if (
		! node || node.list !== this || ! beforeNode || beforeNode.list !== this ||
		node === beforeNode || beforeNode === node.next
	) {
		return false ;
	}

	var afterNode = beforeNode.previous ;

	if ( this.head === node ) { this.head = node.next ; }
	else if ( this.head === beforeNode ) { this.head = node ; }

	if ( this.tail === node ) { this.tail = node.previous ; }

	if ( node.previous ) { node.previous.next = node.next ; }
	if ( node.next ) { node.next.previous = node.previous ; }

	node.next = beforeNode ;
	beforeNode.previous = node ;

	node.previous = afterNode ;
	if ( afterNode ) { afterNode.next = node ; }

	return true ;
} ;



LinkedList.prototype.moveToTail = function( node ) { return this.moveAfter( node , this.tail ) ; } ;
LinkedList.prototype.moveToHead = function( node ) { return this.moveBefore( node , this.head ) ; } ;



LinkedList.prototype.insertAfter = function( afterNode , ... elements ) {
	if ( afterNode.list !== this || ! elements.length ) { return ; }

	var node , index ,
		lastNode = afterNode ,
		beforeNode = afterNode.next ;

	for ( index = 0 ; index < elements.length ; index ++ ) {
		node = new Node( this , lastNode , null , elements[ index ] ) ;
		lastNode.next = node ;
		lastNode = node ;
	}

	this.length += elements.length ;

	if ( beforeNode ) {
		lastNode.next = beforeNode ;
		beforeNode.previous = lastNode ;
	}
	else {
		this.tail = lastNode ;
	}
} ;



LinkedList.prototype.insertBefore = function( beforeNode , ... elements ) {
	if ( beforeNode.list !== this || ! elements.length ) { return ; }

	var node ,
		index = elements.length ,
		lastNode = beforeNode ,
		afterNode = beforeNode.previous ;

	while ( index -- ) {
		node = new Node( this , null , lastNode , elements[ index ] ) ;
		lastNode.previous = node ;
		lastNode = node ;
	}

	this.length += elements.length ;

	if ( afterNode ) {
		lastNode.previous = afterNode ;
		afterNode.next = lastNode ;
	}
	else {
		this.head = lastNode ;
	}
} ;



LinkedList.prototype.inPlaceFilter = function( fn , thisArg ) {
	var lastNode = null ,
		nextNode ,
		node = this.head ;

	this.head = null ;

	while ( node ) {
		node.previous = lastNode ;
		nextNode = node.next ;	// backup that

		if ( fn.call( thisArg , node.element , node , this ) ) {
			if ( ! this.head ) { this.head = node ; }
			lastNode = node ;
		}
		else {
			if ( lastNode ) { lastNode.next = node.next ; }
			this.length -- ;
			node.list = node.previous = node.next = null ;
		}

		node = nextNode ;
	}

	this.tail = lastNode ;

	return this ;
} ;



/*
	Debug stuffs
*/



const assert = require( 'assert' ).strict ;

LinkedList.prototype.sanityCheck = function() {
	
	var length = 0 ,
		lastNode = null ,
		node = this.head ;

	while ( node && ++ length <= this.length ) {
		assert.strictEqual( node.list , this , "Current node doesn't belong to the current list" ) ;
		assert.strictEqual( node.previous , lastNode , "Current node's previous is the real previous node" ) ;

		// Useless because we precisely come from that lastNode
		//if ( lastNode ) { assert( lastNode.next , node ) ; }

		lastNode = node ;
		node = node.next ;
	}

	assert.strictEqual( this.length , length , "Length mismatch" ) ;
	assert.strictEqual( this.tail , lastNode , "The last node is not the tail" ) ;
} ;

