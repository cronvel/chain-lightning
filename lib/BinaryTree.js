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



function Node( tree , key , element , parent = null ) {
	this.tree = tree ;
	this.key = key ;
	this.element = element ;
	this.parent = parent ;
	this.left = null ;
	this.right = null ;

	//this.balance = 0 ;
	this.depth = 1 ;
}

BinaryTree.Node = Node ;



// Used when a node is deleted
BinaryTree.prototype.destroyNode = function( node ) {
	node.tree = null ;
	node.key = null ;
	node.element = null ;
	node.parent = null ;
	node.left = null ;
	node.right = null ;
	//node.balance = 0 ;
	node.depth = 0 ;
} ;



// Implementation dependant, this works for key as finite number, for things like key as string, those methods must be overloaded
BinaryTree.prototype.isOrdered = ( key1 , key2 ) => key1 < key2 ;
BinaryTree.prototype.defaultKey = 0 ;
BinaryTree.prototype.increment = key => key + 1 ;
BinaryTree.prototype.decrement = key => key - 1 ;



BinaryTree.prototype.values = function *() {
	var current = this.getHeadNode() ;
	
	while ( current ) {
		yield current.element ;
		current = this.nextNode( current ) ;
	}
} ;

BinaryTree.prototype[Symbol.iterator] = BinaryTree.prototype.values ;



BinaryTree.prototype.getHeadNode =
BinaryTree.prototype.getMinNode = function( node = this.trunc ) {
	if ( ! node ) { return null ; }
	while ( node.left ) { node = node.left ; }
	return node ;
} ;



BinaryTree.prototype.getTailNode =
BinaryTree.prototype.getMaxNode = function( node = this.trunc ) {
	if ( ! node ) { return null ; }
	while ( node.right ) { node = node.right ; }
	return node ;
} ;



BinaryTree.prototype.nextNode = function( node ) {
	if ( node.right ) {
		node = node.right ;

		while ( node.left ) {
			node = node.left ;
		}

		return node ;
	}

	while ( node.parent ) {
		if ( node === node.parent.left ) {
			return node.parent ;
		}
		
		node = node.parent ;
	}
	
	return null ;
} ;



BinaryTree.prototype.previousNode = function( node ) {
	if ( node.left ) {
		node = node.left ;

		while ( node.right ) {
			node = node.right ;
		}

		return node ;
	}

	while ( node.parent ) {
		if ( node === node.parent.right ) {
			return node.parent ;
		}
		
		node = node.parent ;
	}
	
	return null ;
} ;



BinaryTree.prototype.getKeyNode = function( key ) {
	if ( ! this.trunc ) { return null ; }
	
	var node = this.trunc ;
	
	for ( ;; ) {
		if ( node.key === key ) {
			return node ;
		}
		
		if ( this.isOrdered( node.key , key ) ) {
			if ( ! node.right ) { return null ; }
			node = node.right ;
		}
		else {
			if ( ! node.left ) { return null ; }
			node = node.left ;
		}
	}
} ;



BinaryTree.prototype.get = function( key ) {
	var node = this.getKeyNode( key ) ;
	if ( ! node ) { return undefined ; }
	return node.element ;
} ;



BinaryTree.prototype.set = function( key , element ) {
	console.log( "entering set" ) ;
	if ( ! this.trunc ) {
		this.trunc = new Node( this , key , element ) ;
		this.length ++ ;
		return ;
	}
	
	var node = this.trunc ;
	
	for ( ;; ) {
		if ( this.isOrdered( node.key , key ) ) {
			//node.balance ++ ;
			
			if ( ! node.right ) {
				node.right = new Node( this , key , element , node ) ;
				this.length ++ ;
				this.upwardBalancing( node ) ;
				return ;
			}
			
			node = node.right ;
		}
		else {
			//node.balance -- ;
			
			if ( ! node.left ) {
				node.left = new Node( this , key , element , node ) ;
				this.length ++ ;
				this.upwardBalancing( node ) ;
				return ;
			}
			
			node = node.left ;
		}
	}
} ;



BinaryTree.prototype.insert = function( ... elements ) {
	elements.forEach( element => this.set( this.keyFn( element ) , element ) ) ;
} ;



BinaryTree.prototype.delete = function( key ) {
	var node = this.getKeyNode( key ) ;
	if ( ! node ) { return false ; }
	this.deleteNode( node ) ;
} ;



BinaryTree.prototype.deleteNode = function( node ) {
	var parent , parentProp , replacerNode ;
	
	if ( node.parent ) { 
		parent = node.parent ;
		parentProp = node === parent.left ? 'left' : 'right' ;
	}
	else {
		parent = this ;
		parentProp = 'trunc' ;
	}
			
	if ( node.left ) {
		if ( node.right ) {
			// Ok, both node exist... it's the complicated case,
			// Find a replacerNode, copy its key and value in the current node,
			// and delete the replacer instead of this one.
			// Note that the replacer has only one child
			
			if ( node.left.depth >= node.right.depth ) {
				// We will use the left subtree, the replacer is the maximum of this sub-tree
				replacerNode = this.getMaxNode( node.left ) ;
			}
			else {
				// We will use the right subtree, the replacer is the minimum of this sub-tree
				replacerNode = this.getMinNode( node.right ) ;
			}

			node.key = replacerNode.key ;
			node.element = replacerNode.value ;
			
			// Just use .deleteNode() again
			this.deleteNode( replacer ) ;
		}
		else {
			// Only a left child, attach its subtree to the parent
			parent[ parentProp ] = node.left ;
			node.left.parent = parent ;
			this.upwardBalancing( node ) ;
			this.destroyNode( node ) ;
		}
	}
	else if ( node.right ) {
		// Only a right child, attach its subtree to the parent
		parent[ parentProp ] = node.right ;
		node.right.parent = parent ;
		this.upwardBalancing( node ) ;
		this.destroyNode( node ) ;
	}
	else {
		// No child, simply unlink it from the parent
		parent[ parentProp ] = null ;
		this.upwardBalancing( node ) ;
		this.destroyNode( node ) ;
	}
} ;



// Propagate depth upward and balance the tree if necessary
BinaryTree.prototype.upwardBalancing = function( node ) {
	var balance = this.updateDepth( node ) ;
	
	if ( balance > 1 ) {
		if ( this.nodeBalance( node.right ) < 0 ) {
			console.log( "right-left heavy" ) ;
			console.log( "right-left rotations needed, keys: " + node.right.key + ' ; ' + node.key ) ;
			console.log( "\nbefore:" ) ;
			this.debug() ;
			// First rotate the child
			this.rotateNodeRight( node.right ) ;
			console.log( "\nafter the child rotation:" ) ;
			this.debug() ;
			node = this.rotateNodeLeft( node ) ;
			console.log( "\nafter both rotations:" ) ;
			this.debug() ;
			console.log( "Node sanity check, key: " + node.key ) ;
			this.nodeSanityCheck( node , node.parent ) ;
		}
		else {
			console.log( "right heavy" ) ;
			console.log( "simple left rotation needed, key: " + node.key ) ;
			console.log( "\nbefore:" ) ;
			this.debug() ;
			node = this.rotateNodeLeft( node ) ;
			console.log( "\nafter:" ) ;
			this.debug() ;
			console.log( "Node sanity check, key: " + node.key ) ;
			this.nodeSanityCheck( node , node.parent ) ;
		}
	}
	else if ( balance < -1 ) {
		if ( this.nodeBalance( node.left ) > 0 ) {
			console.log( "left-right heavy" ) ;
			console.log( "left-right rotations needed, keys: " + node.left.key + ' ; ' + node.key ) ;
			console.log( "\nbefore:" ) ;
			this.debug() ;
			// First rotate the child
			this.rotateNodeLeft( node.left ) ;
			console.log( "\nafter the child rotation:" ) ;
			this.debug() ;
			node = this.rotateNodeRight( node ) ;
			console.log( "\nafter both rotations:" ) ;
			this.debug() ;
			console.log( "Node sanity check, key: " + node.key ) ;
			this.nodeSanityCheck( node , node.parent ) ;
		}
		else {
			console.log( "left heavy" ) ;
			console.log( "simple right rotation needed, key: " + node.key ) ;
			console.log( "\nbefore:" ) ;
			this.debug() ;
			node = this.rotateNodeRight( node ) ;
			console.log( "\nafter:" ) ;
			this.debug() ;
			console.log( "Node sanity check, key: " + node.key ) ;
			this.nodeSanityCheck( node , node.parent ) ;
		}
	}
	
	if ( node.parent ) {
		this.upwardBalancing( node.parent ) ;
	}
} ;



// Update the depth of the node, return its balance
BinaryTree.prototype.updateDepth = function( node ) {
	if ( node.left ) {
		if ( node.right ) {
			// There are 2 children
			node.depth = 1 + Math.max( node.left.depth , node.right.depth ) ;
			return node.right.depth - node.left.depth ;
		}

		// Only a left child
		node.depth = 1 + node.left.depth ;
		return - node.left.depth ;
	}
	
	if ( node.right ) {
		// Only a right child
		node.depth = 1 + node.right.depth ;
		return node.right.depth ;
	}
	
	// No child
	node.depth = 1 ;
	return 0 ;
} ;



// Just return the node balance without recomputing depth
BinaryTree.prototype.nodeBalance = function( node ) {
	if ( node.left ) {
		if ( node.right ) {
			// There are 2 children
			return node.right.depth - node.left.depth ;
		}

		// Only a left child
		return - node.left.depth ;
	}
	
	if ( node.right ) {
		// Only a right child
		return node.right.depth ;
	}
	
	// No child
	return 0 ;
} ;



// Assume node.right existance
BinaryTree.prototype.rotateNodeLeft = function( node ) {
	var parent = node.parent ;
	var replacerNode = node.right ;

	// Attach the left of the right child to the current node's right
	node.right = replacerNode.left ;
	if ( node.right ) { node.right.parent = node ; }
	
	// Attach the current node as the replacer's left
	replacerNode.left = node ;
	node.parent = replacerNode ;
	
	// Attach the replacer to the parent node
	replacerNode.parent = parent ;

	if ( parent ) {
		if ( parent.left === node ) {
			parent.left = replacerNode ;
		}
		else {
			parent.right = replacerNode ;
		}
	}
	else {
		this.trunc = replacerNode ;
	}
	
	// Now update the depth in the correct order
	this.updateDepth( node ) ;
	this.updateDepth( replacerNode ) ;
	
	return replacerNode ;
} ;



// Same algo than rotateNodeRight, just swap all left/right
BinaryTree.prototype.rotateNodeRight = function( node ) {
	var parent = node.parent ;
	var replacerNode = node.left ;

	// Attach the right of the left child to the current node's left
	node.left = replacerNode.right ;
	if ( node.left ) { node.left.parent = node ; }
	
	// Attach the current node as the replacer's right
	replacerNode.right = node ;
	node.parent = replacerNode ;
	
	// Attach the replacer to the parent node
	replacerNode.parent = parent ;

	if ( parent ) {
		if ( parent.right === node ) {
			parent.right = replacerNode ;
		}
		else {
			parent.left = replacerNode ;
		}
	}
	else {
		this.trunc = replacerNode ;
	}
	
	// Now update the depth in the correct order
	this.updateDepth( node ) ;
	this.updateDepth( replacerNode ) ;
	
	return replacerNode ;
} ;



/*
	Debug stuffs
*/



BinaryTree.prototype.debug = function( node = this.trunc , spaces = 0 , prefix = '━' ) {
	var str = ' '.repeat( spaces ) + prefix + node.key ;
	//var nextSpaces = str.length ? str.length - 1 : 0 ;
	var nextSpaces = spaces + 2 ;

	//str += ' (' + node.depth + ' | ' + this.nodeBalance( node ) + ')' ;
	str += ' (' + this.nodeBalance( node ) + ')' ;
	
	if ( node.right ) {
		this.debug( node.right , nextSpaces , '┏' ) ;
	}
	
	console.log( str ) ;
	
	if ( node.left ) {
		this.debug( node.left , nextSpaces , '┗' ) ;
	}
} ;




const assert = require( 'assert' ).strict ;

BinaryTree.prototype.sanityCheck = function() {
	var runtime = {
		length: 0
	} ;

	if ( this.trunc ) {
		this.nodeSanityCheck( this.trunc , null , runtime ) ;
	}
	
	assert.strictEqual( this.length , runtime.length , "Length mismatch" ) ;
} ;



BinaryTree.prototype.nodeSanityCheck = function( node , parentNode = null , runtime = null ) {
	if ( runtime ) {
		if ( ++ runtime.length > this.length ) {
			assert.fail( "Length mismatch: exceeding, key: " + node.key ) ;
		}
	}
	
	assert.strictEqual( node.tree , this , "Current node doesn't belong to the current tree, key: " + node.key ) ;
	assert.strictEqual( node.parent , parentNode , "Parent mismatch, key: " + node.key ) ;
	
	if ( node.left ) {
		if ( node.right ) {
			// There are 2 children
			assert.strictEqual( node.depth , 1 + Math.max( node.left.depth , node.right.depth ) , "Depth mismatch (RL), key: " + node.key ) ;
			this.nodeSanityCheck( node.left , node , runtime ) ;
			this.nodeSanityCheck( node.right , node , runtime ) ;
		}
		else {
			// Only a left child
			assert.strictEqual( node.depth , 1 + node.left.depth , "Depth mismatch (L), key: " + node.key ) ;
			this.nodeSanityCheck( node.left , node , runtime ) ;
		}
	}
	else if ( node.right ) {
		// Only a right child
		assert.strictEqual( node.depth , 1 + node.right.depth , "Depth mismatch (R), key: " + node.key ) ;
		this.nodeSanityCheck( node.right , node , runtime ) ;
	}
	else {
		// No child
		assert.strictEqual( node.depth , 1 , "Depth mismatch (), key: " + node.key ) ;
	}

	// Should be done after the recursive call, to avoid throwing the wrong error
	var balance = this.nodeBalance( node ) ;
	
	if ( Math.abs( balance ) > 1 ) {
		assert.fail( "Unbalanced node (" + balance + "), key: " + node.key ) ;
	}
} ;
















return ;







// Array.prototype.includes() uses this for value equality
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
function isIdenticalTo( x , y ) {
	return x === y || ( Number.isNaN( x ) && Number.isNaN( y ) ) ;
}



// Similar to .keys()
BinaryTree.prototype.nodes = function nodes() {
	var nodes = new Array( this.length ) ,
		index = 0 ,
		current = this.head ;

	while ( current ) {
		nodes[ index ++ ] = current ;
		current = current.next ;
	}

	return nodes ;
} ;



BinaryTree.prototype.pop = function pop() {
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



BinaryTree.prototype.shift = function shift() {
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



BinaryTree.prototype.nodeOf = function nodeOf( element , fromNode ) {
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



BinaryTree.prototype.lastNodeOf = function lastNodeOf( element , fromNode ) {
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
BinaryTree.prototype.includes = function includes( element , fromNode ) {
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



BinaryTree.prototype.findNode = function findNode( fn , thisArg ) {
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
		node ,
		current = this.head ;

	while ( current ) {
		newElement = fn.call( thisArg , current.element , current , this ) ;

		node = new Node( newBinaryTree , newBinaryTree.tail , null , newElement ) ;

		if ( newBinaryTree.tail ) {
			newBinaryTree.tail.next = node ;
			newBinaryTree.tail = node ;
		}
		else {
			newBinaryTree.head = newBinaryTree.tail = node ;
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
		node ,
		current = this.head ;

	while ( current ) {
		if ( fn.call( thisArg , current.element , current , this ) ) {
			node = new Node( newBinaryTree , newBinaryTree.tail , null , current.element ) ;

			if ( newBinaryTree.tail ) {
				newBinaryTree.tail.next = node ;
				newBinaryTree.tail = node ;
			}
			else {
				newBinaryTree.head = newBinaryTree.tail = node ;
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



BinaryTree.prototype.get = function get( node ) {
	if ( ! node || node.list !== this ) { return ; }
	return node.element ;
} ;



BinaryTree.prototype.set = function set( node , element ) {
	if ( ! node || node.list !== this ) { return ; }
	node.element = element ;
} ;



BinaryTree.prototype.deleteNode =
BinaryTree.prototype.removeNode = function removeNode( node ) {
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
BinaryTree.prototype.delete =
BinaryTree.prototype.remove = function remove( value ) {
	this.inPlaceFilter( e => ! isIdenticalTo( e , value ) ) ;
} ;



BinaryTree.prototype.moveAfter = function moveAfter( node , afterNode ) {
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



BinaryTree.prototype.moveBefore = function moveBefore( node , beforeNode ) {
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



BinaryTree.prototype.moveToTail = function moveToTail( node ) { return this.moveAfter( node , this.tail ) ; } ;
BinaryTree.prototype.moveToHead = function moveToHead( node ) { return this.moveBefore( node , this.head ) ; } ;



BinaryTree.prototype.insertAfter = function insertAfter( afterNode , ... elements ) {
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



BinaryTree.prototype.insertBefore = function insertBefore( beforeNode , ... elements ) {
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



BinaryTree.prototype.inPlaceFilter = function inPlaceFilter( fn , thisArg ) {
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

