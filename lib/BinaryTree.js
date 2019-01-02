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



/*
	For balancing, it uses the AVL algorithm.
	See: https://en.wikipedia.org/wiki/AVL_tree
	Visualization: https://www.cs.usfca.edu/~galles/visualization/AVLtree.html
*/

function BinaryTree( keyFn , ... elements ) {
	var autoIndex = 0 ;
	
	this.trunc = null ;
	this.length = 0 ;
	this.keyFn = keyFn ;
	
	if ( ! this.keyFn ) {
		this.keyFn = () => autoIndex ++ ;
	}
	
	if ( elements.length ) {
		this.insert( ... elements ) ;
	}
}

module.exports = BinaryTree ;



BinaryTree.from = ( iterable , keyFn ) => {
	var element ,
		tree = new BinaryTree( keyFn ) ;

	for ( element of iterable ) {
		tree.insert( element ) ;
	}
	
	return tree ;
} ;



function Slot( tree , key , element , parent = null ) {
	this.tree = tree ;
	this.key = key ;
	this.element = element ;
	this.parent = parent ;
	this.left = null ;
	this.right = null ;
	this.balance = 0 ;
}

BinaryTree.Slot = Slot ;



// Used when a slot is deleted
Slot.prototype.destroy = function() {
	this.tree = null ;
	this.key = null ;
	this.element = null ;
	this.parent = null ;
	this.left = null ;
	this.right = null ;
	this.balance = 0 ;
} ;



Slot.prototype.next = function() {
	var slot = this ;

	if ( slot.right ) {
		slot = slot.right ;

		while ( slot.left ) {
			slot = slot.left ;
		}

		return slot ;
	}

	while ( slot.parent ) {
		if ( slot === slot.parent.left ) {
			return slot.parent ;
		}
		
		slot = slot.parent ;
	}
	
	return null ;
} ;



// Implementation dependant, this works for key as finite number, for things like key as string, those methods must be overloaded
BinaryTree.prototype.isOrdered = ( key1 , key2 ) => key1 < key2 ;
BinaryTree.prototype.defaultKey = 0 ;
BinaryTree.prototype.increment = key => key + 1 ;
BinaryTree.prototype.decrement = key => key - 1 ;



BinaryTree.prototype.values = function *() {
	var current = this.getHeadSlot() ;
	
	while ( current ) {
		yield current.element ;
		current = current.next() ;
	}
} ;

BinaryTree.prototype[Symbol.iterator] = BinaryTree.prototype.values ;



BinaryTree.prototype.getKeySlot = function( key ) {
	if ( ! this.trunc ) { return null ; }
	
	var slot = this.trunc ;
	
	for ( ;; ) {
		if ( slot.key === key ) {
			return slot ;
		}
		
		if ( this.isOrdered( slot.key , key ) ) {
			if ( ! slot.right ) { return null ; }
			slot = slot.right ;
		}
		else {
			if ( ! slot.left ) { return null ; }
			slot = slot.left ;
		}
	}
} ;



BinaryTree.prototype.get = function( key ) {
	var slot = this.getKeySlot( key ) ;
	if ( ! slot ) { return undefined ; }
	return slot.element ;
} ;



BinaryTree.prototype.getHeadSlot =
BinaryTree.prototype.getMinSlot = function( slot = this.trunc ) {
	if ( ! slot ) { return null ; }
	while ( slot.left ) { slot = slot.left ; }
	return slot ;
} ;



BinaryTree.prototype.getTailSlot =
BinaryTree.prototype.getMaxSlot = function( slot = this.trunc ) {
	if ( ! slot ) { return null ; }
	while ( slot.right ) { slot = slot.right ; }
	return slot ;
} ;



BinaryTree.prototype.set = function( key , element ) {
	if ( ! this.trunc ) {
		this.trunc = new Slot( this , key , element ) ;
		this.length ++ ;
		return ;
	}
	
	var slot = this.trunc ;
	
	for ( ;; ) {
		if ( this.isOrdered( slot.key , key ) ) {
			slot.balance ++ ;
			
			if ( ! slot.right ) {
				slot.right = new Slot( this , key , element , slot ) ;
				this.length ++ ;
				return ;
			}
			
			slot = slot.right ;
		}
		else {
			slot.balance -- ;
			
			if ( ! slot.left ) {
				slot.left = new Slot( this , key , element , slot ) ;
				this.length ++ ;
				return ;
			}
			
			slot = slot.left ;
		}
	}
} ;



BinaryTree.prototype.insert = function( ... elements ) {
	elements.forEach( element => this.set( this.keyFn( element ) , element ) ) ;
} ;



// Propagate balance values up to the trunc
BinaryTree.prototype._propagateBalance = function( slot , value ) {
	if ( slot.parent ) { 
		if ( slot === slot.parent.left ) {
			slot.parent.balance -= value ;
			this._propagateBalance( slot.parent , value ) ;
		}
		else {
			slot.parent.balance += value ;
			this._propagateBalance( slot.parent , value ) ;
		}
	}
} ;



BinaryTree.prototype.deleteSlot = function( slot ) {
	var parent , parentProp , replacerSlot ;
	
	if ( slot.parent ) { 
		parent = slot.parent ;
		parentProp = slot === parent.left ? 'left' : 'right' ;
	}
	else {
		parent = this ;
		parentProp = 'trunc' ;
	}
			
	if ( slot.left ) {
		if ( slot.right ) {
			// Ok, both node exist... it's the complicated case,
			// Find a replacerSlot, copy its key and value in the current slot,
			// and delete the replacer instead of this one.
			// Note that the replacer has only one child
			
			if ( slot.balance <= 0 ) {
				// We will use the left subtree, the replacer is the maximum of this sub-tree
				replacerSlot = this.getMaxSlot( slot.left ) ;
			}
			else {
				// We will use the right subtree, the replacer is the minimum of this sub-tree
				replacerSlot = this.getMinSlot( slot.right ) ;
			}

			slot.key = replacerSlot.key ;
			slot.element = replacerSlot.value ;
			
			// Just use .deleteSlot() again
			this.deleteSlot( replacer ) ;
		}
		else {
			// Only a left child, attach its subtree to the parent
			parent[ parentProp ] = slot.left ;
			slot.left.parent = parent ;
			this._propagateBalance( slot , -1 ) ;
			slot.destroy() ;
		}
	}
	else if ( slot.right ) {
		// Only a right child, attach its subtree to the parent
		parent[ parentProp ] = slot.right ;
		slot.right.parent = parent ;
		this._propagateBalance( slot , -1 ) ;
		slot.destroy() ;
	}
	else {
		// No child, simply unlink it from the parent
		parent[ parentProp ] = null ;
		this._propagateBalance( slot , -1 ) ;
		slot.destroy() ;
	}
} ;



BinaryTree.prototype.delete = function( key ) {
	var slot = this.getKeySlot( key ) ;
	if ( ! slot ) { return false ; }
	this.deleteSlot( slot ) ;
} ;
















return ;







// Array.prototype.includes() uses this for value equality
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
function isIdenticalTo( x , y ) {
	return x === y || ( Number.isNaN( x ) && Number.isNaN( y ) ) ;
}



// Similar to .keys()
BinaryTree.prototype.slots = function slots() {
	var slots = new Array( this.length ) ,
		index = 0 ,
		current = this.head ;

	while ( current ) {
		slots[ index ++ ] = current ;
		current = current.next ;
	}

	return slots ;
} ;



BinaryTree.prototype.pop = function pop() {
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



BinaryTree.prototype.shift = function shift() {
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



BinaryTree.prototype.slotOf = function slotOf( element , fromSlot ) {
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



BinaryTree.prototype.lastSlotOf = function lastSlotOf( element , fromSlot ) {
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
BinaryTree.prototype.includes = function includes( element , fromSlot ) {
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



BinaryTree.prototype.forEach = function forEach( fn , thisArg ) {
	var current = this.head ;

	while ( current ) {
		fn.call( thisArg , current.element , current , this ) ;
		current = current.next ;
	}
} ;



BinaryTree.prototype.some = function some( fn , thisArg ) {
	var current = this.head ;

	while ( current ) {
		if ( fn.call( thisArg , current.element , current , this ) ) { return true ; }
		current = current.next ;
	}

	return false ;
} ;



BinaryTree.prototype.every = function every( fn , thisArg ) {
	var current = this.head ;

	while ( current ) {
		if ( ! fn.call( thisArg , current.element , current , this ) ) { return false ; }
		current = current.next ;
	}

	return true ;
} ;



BinaryTree.prototype.find = function find( fn , thisArg ) {
	var current = this.head ;

	while ( current ) {
		if ( fn.call( thisArg , current.element , current , this ) ) {
			return current.element ;
		}

		current = current.next ;
	}

	return ;
} ;



BinaryTree.prototype.findSlot = function findSlot( fn , thisArg ) {
	var current = this.head ;

	while ( current ) {
		if ( fn.call( thisArg , current.element , current , this ) ) {
			return current ;
		}

		current = current.next ;
	}

	return null ;
} ;



BinaryTree.prototype.map = function map( fn , thisArg ) {
	var newBinaryTree = new BinaryTree() ,
		newElement ,
		slot ,
		current = this.head ;

	while ( current ) {
		newElement = fn.call( thisArg , current.element , current , this ) ;

		slot = new Slot( newBinaryTree , newBinaryTree.tail , null , newElement ) ;

		if ( newBinaryTree.tail ) {
			newBinaryTree.tail.next = slot ;
			newBinaryTree.tail = slot ;
		}
		else {
			newBinaryTree.head = newBinaryTree.tail = slot ;
		}

		current = current.next ;
	}

	newBinaryTree.length = this.length ;

	return newBinaryTree ;
} ;



BinaryTree.prototype.reduce = function reduce( fn , accumulator ) {
	var current = this.head ;

	while ( current ) {
		accumulator = fn( accumulator , current.element , current , this ) ;
		current = current.next ;
	}

	return accumulator ;
} ;



BinaryTree.prototype.reduceRight = function reduceRight( fn , accumulator ) {
	var current = this.tail ;

	while ( current ) {
		accumulator = fn( accumulator , current.element , current , this ) ;
		current = current.previous ;
	}

	return accumulator ;
} ;



BinaryTree.prototype.filter = function filter( fn , thisArg ) {
	var newBinaryTree = new BinaryTree() ,
		slot ,
		current = this.head ;

	while ( current ) {
		if ( fn.call( thisArg , current.element , current , this ) ) {
			slot = new Slot( newBinaryTree , newBinaryTree.tail , null , current.element ) ;

			if ( newBinaryTree.tail ) {
				newBinaryTree.tail.next = slot ;
				newBinaryTree.tail = slot ;
			}
			else {
				newBinaryTree.head = newBinaryTree.tail = slot ;
			}

			newBinaryTree.length ++ ;
		}

		current = current.next ;
	}

	return newBinaryTree ;
} ;



BinaryTree.prototype.reverse = function reverse() {
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



BinaryTree.prototype.get = function get( slot ) {
	if ( ! slot || slot.list !== this ) { return ; }
	return slot.element ;
} ;



BinaryTree.prototype.set = function set( slot , element ) {
	if ( ! slot || slot.list !== this ) { return ; }
	slot.element = element ;
} ;



BinaryTree.prototype.deleteSlot =
BinaryTree.prototype.removeSlot = function removeSlot( slot ) {
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
BinaryTree.prototype.delete =
BinaryTree.prototype.remove = function remove( value ) {
	this.inPlaceFilter( e => ! isIdenticalTo( e , value ) ) ;
} ;



BinaryTree.prototype.moveAfter = function moveAfter( slot , afterSlot ) {
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



BinaryTree.prototype.moveBefore = function moveBefore( slot , beforeSlot ) {
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



BinaryTree.prototype.moveToTail = function moveToTail( slot ) { return this.moveAfter( slot , this.tail ) ; } ;
BinaryTree.prototype.moveToHead = function moveToHead( slot ) { return this.moveBefore( slot , this.head ) ; } ;



BinaryTree.prototype.insertAfter = function insertAfter( afterSlot , ... elements ) {
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



BinaryTree.prototype.insertBefore = function insertBefore( beforeSlot , ... elements ) {
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



BinaryTree.prototype.inPlaceFilter = function inPlaceFilter( fn , thisArg ) {
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

