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



const arrayKit = require( 'array-kit' ) ;



/*
	For balancing, it uses the AVL algorithm.
	See: https://en.wikipedia.org/wiki/AVL_tree
	Visualization: https://www.cs.usfca.edu/~galles/visualization/AVLtree.html
*/

function BinaryTree( options , ... elements ) {
	var autoIndex = 0 ;

	this.trunc = null ;
	this.length = 0 ;
	this.keyFn = options && options.keyFn ;
	this.stack = !! ( options && options.stack ) ;

	if ( ! this.keyFn ) {
		this.keyFn = ( element , hint ) => hint !== undefined ? hint : autoIndex ++ ;
	}

	if ( elements.length ) {
		this.insert( ... elements ) ;
	}
}

module.exports = BinaryTree ;



BinaryTree.from = ( iterable , options ) => {
	var element ,
		tree = new BinaryTree( options ) ;

	for ( element of iterable ) {
		tree.insert( element ) ;
	}

	return tree ;
} ;



function Node( key , element , parent = null ) {
	this.key = key ;
	this.element = element ;
	this.parent = parent ;
	this.left = null ;
	this.right = null ;
	this.depth = 1 ;
}

BinaryTree.Node = Node ;



class Stack extends Array {}
BinaryTree.Stack = Stack ;



// /!\ DEPRECATED? .truncate*() does not call it /!\
// Used when a node is deleted
// Does it help garbage collection?
BinaryTree.prototype.destroyNode = function( node ) {
	node.key = null ;
	node.element = null ;
	node.parent = null ;
	node.left = null ;
	node.right = null ;
	node.depth = 0 ;
} ;



// Implementation dependant, this works for key as finite number, for things like key as string, those methods must be overloaded
BinaryTree.prototype.isOrdered = ( key1 , key2 ) => key1 <= key2 ;
BinaryTree.prototype.defaultKey = 0 ;
BinaryTree.prototype.increment = key => key + 1 ;
BinaryTree.prototype.decrement = key => key - 1 ;



BinaryTree.prototype.values = function *() {
	var element ,
		current = this.getHeadNode() ;

	while ( current ) {
		if ( current.element instanceof Stack ) {
			for ( element of current.element ) {
				yield element ;
			}
		}
		else {
			yield current.element ;
		}

		current = this.nextNode( current ) ;
	}
} ;

BinaryTree.prototype[Symbol.iterator] = BinaryTree.prototype.values ;



BinaryTree.prototype.keys = function() {
	var keys = new Array( this.length ) ,
		index = 0 ,
		current = this.getHeadNode() ;

	while ( current ) {
		keys[ index ++ ] = current.key ;
		current = this.nextNode( current ) ;
	}

	return keys ;
} ;



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



BinaryTree.prototype.get = function( key ) {
	var node = this.getNode( key ) ;
	if ( ! node ) { return undefined ; }
	return node.element ;
} ;



BinaryTree.prototype.getNode = function( key ) {
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



// Set: replace existing element
BinaryTree.prototype.set = function( key , element , noOverwrite ) {
	if ( ! this.trunc ) {
		this.trunc = new Node( key , element ) ;
		this.length ++ ;
		return ;
	}

	var node = this.trunc ;

	for ( ;; ) {
		if ( key === node.key ) {
			// Overwrite this key
			if ( noOverwrite ) {
				throw new Error( "Duplicated key '" + key + "'" ) ;
			}

			node.element = element ;
			return ;
		}

		if ( this.isOrdered( node.key , key ) ) {
			if ( ! node.right ) {
				node.right = new Node( key , element , node ) ;
				this.length ++ ;
				this.rebalance( node , true ) ;
				return ;
			}

			node = node.right ;
		}
		else {
			if ( ! node.left ) {
				node.left = new Node( key , element , node ) ;
				this.length ++ ;
				this.rebalance( node , true ) ;
				return ;
			}

			node = node.left ;
		}
	}
} ;



// Add: stack element if there is one already existing.
// If .stack is false, fallback to .set()
BinaryTree.prototype.add = function( key , element ) {
	if ( ! this.stack ) { return this.set( key , element ) ; }

	if ( ! this.trunc ) {
		this.trunc = new Node( key , element ) ;
		this.length ++ ;
		return ;
	}

	var node = this.trunc ;

	for ( ;; ) {
		if ( key === node.key ) {
			if ( node.element instanceof Stack ) {
				node.element.push( element ) ;
			}
			else {
				node.element = new Stack( node.element , element ) ;
			}

			return ;
		}

		if ( this.isOrdered( node.key , key ) ) {
			if ( ! node.right ) {
				node.right = new Node( key , element , node ) ;
				this.length ++ ;
				this.rebalance( node , true ) ;
				return ;
			}

			node = node.right ;
		}
		else {
			if ( ! node.left ) {
				node.left = new Node( key , element , node ) ;
				this.length ++ ;
				this.rebalance( node , true ) ;
				return ;
			}

			node = node.left ;
		}
	}
} ;



BinaryTree.prototype.insertUnique = function( ... elements ) {
	elements.forEach( element => this.set( this.keyFn( element ) , element , true ) ) ;
} ;



BinaryTree.prototype.insert = function( ... elements ) {
	elements.forEach( element => this.add( this.keyFn( element ) , element ) ) ;
} ;



// Divide and conquer algo, to avoid rotation when all elements are in the correct order.
// Each one should be unique.
BinaryTree.prototype.insertOrdered = function( ... elements ) {
	var start , end , middle , diff , listIndex ,
		list = [ 0 , elements.length - 1 ] ;

	for ( listIndex = 0 ; listIndex < list.length ; listIndex += 2 ) {
		start = list[ listIndex ] ;
		end = list[ listIndex + 1 ] ;
		diff = end - start ;

		switch ( diff ) {
			case 0 :
				//console.log( "===" , start ) ;
				this.set( this.keyFn( elements[ start ] , start ) , elements[ start ] , true ) ;
				break ;
			case 1 :
				//console.log( "start end" , start , end ) ;
				this.set( this.keyFn( elements[ start ] , start ) , elements[ start ] , true ) ;
				list.push( end , end ) ;
				//this.set( this.keyFn( elements[ end ] , end ) , elements[ end ] , true ) ;
				break ;
			case 2 :
				//console.log( "middle start end" , start + 1 , start , end ) ;
				this.set( this.keyFn( elements[ start + 1 ] , start + 1 ) , elements[ start + 1 ] , true ) ;
				list.push( start , start ) ;
				//this.set( this.keyFn( elements[ start ] , start ) , elements[ start ] , true ) ;
				list.push( end , end ) ;
				//this.set( this.keyFn( elements[ end ] , end ) , elements[ end ] , true ) ;
				break ;
			default :
				middle = Math.round( start + diff / 2 ) ;
				//console.log( "split" , middle , start , end ) ;
				this.set( this.keyFn( elements[ middle ] , middle ) , elements[ middle ] , true ) ;
				list.push( start , middle - 1 ) ;
				list.push( middle + 1 , end ) ;
				break ;
		}
	}
} ;



BinaryTree.prototype.delete = function( key ) {
	var node = this.getNode( key ) ;
	if ( ! node ) { return false ; }
	this.deleteNode( node ) ;
} ;



BinaryTree.prototype.deleteNode = function( node ) {
	var parent , referer , refererProp , replacerNode ;

	if ( node.left && node.right ) {
		// Ok, both node exist... it's the complicated case,

		// Find a replacerNode.
		// Note that the replacer has only one child, since it's either the min or the max of the subtree.

		/* OLD
		// Swap node's element, it's easier and faster, but it's also bad because the node could be referenced somewhere else,
		// so breaking the node-element relationship may cause really nasty bugs.
		// .inPlaceFilter() have had a bug because of this (it stored the .nextNode() before calling .deleteNode()).
		
		// Choose the heavier child
		if ( node.left.depth >= node.right.depth ) {
			// We will use the left subtree, the replacer is the maximum of this sub-tree
			replacerNode = this.getMaxNode( node.left ) ;
		}
		else {
			// We will use the right subtree, the replacer is the minimum of this sub-tree
			replacerNode = this.getMinNode( node.right ) ;
		}

		// Copy key/value...
		node.key = replacerNode.key ;
		node.element = replacerNode.element ;

		// ... and just delete the replacer using .deleteNode()
		this.deleteNode( replacerNode ) ;
		//*/

		//* NEW
		// Swap node's place in the tree. It's way more complicated and a bit slower, but it's safer because
		// it doesn't break the node-element relationship.

		// Choose the heavier child
		if ( node.left.depth >= node.right.depth ) {
			// We will use the left subtree, the replacer is the maximum of this sub-tree
			replacerNode = this.getMaxNode( node.left ) ;
		}
		else {
			// We will use the right subtree, the replacer is the minimum of this sub-tree
			replacerNode = this.getMinNode( node.right ) ;
		}

		this.swapNodes( node , replacerNode ) ;
		
		// Copy key/value...
		node.key = replacerNode.key ;

		// We would like to try to delete it again using .deleteNode().
		// But since it would branch in the "simple" case (because of .getMaxNode()/.getMinNode()),
		// we can continue to the rest of this function.
		//return this.deleteNode( replacerNode ) ;
		//*/
	}


	parent = node.parent ;

	if ( parent ) {
		referer = parent ;
		refererProp = node === parent.left ? 'left' : 'right' ;
	}
	else {
		referer = this ;
		refererProp = 'trunc' ;
	}

	if ( node.left ) {
		// Only a left child, attach its subtree to the parent
		referer[ refererProp ] = node.left ;
		node.left.parent = parent ;
		this.length -- ;
		this.rebalance( node , true ) ;
		this.destroyNode( node ) ;
	}
	else if ( node.right ) {
		// Only a right child, attach its subtree to the parent
		referer[ refererProp ] = node.right ;
		node.right.parent = parent ;
		this.length -- ;
		this.rebalance( node , true ) ;
		this.destroyNode( node ) ;
	}
	else {
		// No child, simply unlink it from the parent
		referer[ refererProp ] = null ;
		this.length -- ;
		this.rebalance( node , true ) ;
		this.destroyNode( node ) ;
	}
} ;



BinaryTree.prototype.truncateBefore = function( key , including ) {
	var lastTruncatedNode = this.getClosestNode( key , including , -1 ) ;
	//var firstKeptNode = this.nextNode( lastTruncatedNode ) ;

	if ( ! lastTruncatedNode ) { return 0 ; }

	var count = 0 ,
		truncatedSubTree = lastTruncatedNode ,
		current = lastTruncatedNode ,
		remainderNode = lastTruncatedNode.right ;

	// length reduction
	while ( current ) {
		count ++ ;
		current = this.previousNode( current ) ;
	}

	this.length -= count ;

	//console.log( "lastTruncatedNode:" , lastTruncatedNode.key ) ;
	//this.debug() ;

	//console.log( "truncatedSubTree is now" , truncatedSubTree.key ) ;
	while ( truncatedSubTree.parent && truncatedSubTree === truncatedSubTree.parent.right ) {
		truncatedSubTree = truncatedSubTree.parent ;
		//console.log( "truncatedSubTree is now" , truncatedSubTree.key ) ;
	}

	for ( ;; ) {
		if ( truncatedSubTree.parent ) {
			truncatedSubTree.parent.left = remainderNode ;

			if ( remainderNode ) {
				remainderNode.parent = truncatedSubTree.parent ;
			}

			// Loop conditions
			//console.log( ">>> rebalancing" , truncatedSubTree.parent.key ) ;
			remainderNode = this.rebalance( truncatedSubTree.parent ) ;
			truncatedSubTree = remainderNode ;

			//console.log( "- truncatedSubTree is now" , truncatedSubTree.key ) ;
			while ( truncatedSubTree.parent && truncatedSubTree === truncatedSubTree.parent.left ) {
				truncatedSubTree = truncatedSubTree.parent ;
				//console.log( "- truncatedSubTree is now" , truncatedSubTree.key ) ;
				//console.log( ">>> rebalancing" , truncatedSubTree.key ) ;
				truncatedSubTree = this.rebalance( truncatedSubTree ) ;
				//console.log( "  truncatedSubTree is now" , truncatedSubTree.key ) ;
			}

			if ( ! truncatedSubTree.parent ) { break ; }

			//console.log( "+ truncatedSubTree is now" , truncatedSubTree.key ) ;
			while ( truncatedSubTree.parent && truncatedSubTree === truncatedSubTree.parent.right ) {
				truncatedSubTree = truncatedSubTree.parent ;
				//console.log( "+ truncatedSubTree is now" , truncatedSubTree.key ) ;
				//console.log( ">>> rebalancing" , truncatedSubTree.key ) ;
				truncatedSubTree = this.rebalance( truncatedSubTree ) ;
				//console.log( "  truncatedSubTree is now" , truncatedSubTree.key ) ;
			}

			if ( truncatedSubTree === remainderNode ) { break ; }
		}
		else {
			//console.log( "trunc!" ) ;
			this.trunc = remainderNode ;

			if ( remainderNode ) {
				remainderNode.parent = null ;
				//console.log( ">>> rebalancing" , remainderNode.key ) ;
				this.rebalance( remainderNode ) ;
			}

			break ;
		}
	}

	return count ;
} ;



BinaryTree.prototype.truncateAfter = function( key , including ) {
	var firstTruncatedNode = this.getClosestNode( key , including , 1 ) ;
	//var firstKeptNode = this.nextNode( firstTruncatedNode ) ;

	if ( ! firstTruncatedNode ) { return 0 ; }

	var count = 0 ,
		truncatedSubTree = firstTruncatedNode ,
		current = firstTruncatedNode ,
		remainderNode = firstTruncatedNode.left ;

	// length reduction
	while ( current ) {
		count ++ ;
		current = this.nextNode( current ) ;
	}

	this.length -= count ;

	//console.log( "firstTruncatedNode:" , firstTruncatedNode.key ) ;
	//this.debug() ;

	//console.log( "truncatedSubTree is now" , truncatedSubTree.key ) ;
	while ( truncatedSubTree.parent && truncatedSubTree === truncatedSubTree.parent.left ) {
		truncatedSubTree = truncatedSubTree.parent ;
		//console.log( "truncatedSubTree is now" , truncatedSubTree.key ) ;
	}

	for ( ;; ) {
		if ( truncatedSubTree.parent ) {
			truncatedSubTree.parent.right = remainderNode ;

			if ( remainderNode ) {
				remainderNode.parent = truncatedSubTree.parent ;
			}

			// Loop conditions
			//console.log( ">>> rebalancing" , truncatedSubTree.parent.key ) ;
			remainderNode = this.rebalance( truncatedSubTree.parent ) ;
			truncatedSubTree = remainderNode ;

			//console.log( "- truncatedSubTree is now" , truncatedSubTree.key ) ;
			while ( truncatedSubTree.parent && truncatedSubTree === truncatedSubTree.parent.right ) {
				truncatedSubTree = truncatedSubTree.parent ;
				//console.log( "- truncatedSubTree is now" , truncatedSubTree.key ) ;
				//console.log( ">>> rebalancing" , truncatedSubTree.key ) ;
				truncatedSubTree = this.rebalance( truncatedSubTree ) ;
				//console.log( "  truncatedSubTree is now" , truncatedSubTree.key ) ;
			}

			if ( ! truncatedSubTree.parent ) { break ; }

			//console.log( "+ truncatedSubTree is now" , truncatedSubTree.key ) ;
			while ( truncatedSubTree.parent && truncatedSubTree === truncatedSubTree.parent.left ) {
				truncatedSubTree = truncatedSubTree.parent ;
				//console.log( "+ truncatedSubTree is now" , truncatedSubTree.key ) ;
				//console.log( ">>> rebalancing" , truncatedSubTree.key ) ;
				truncatedSubTree = this.rebalance( truncatedSubTree ) ;
				//console.log( "  truncatedSubTree is now" , truncatedSubTree.key ) ;
			}

			if ( truncatedSubTree === remainderNode ) { break ; }
		}
		else {
			//console.log( "trunc!" ) ;
			this.trunc = remainderNode ;

			if ( remainderNode ) {
				remainderNode.parent = null ;
				//console.log( ">>> rebalancing" , remainderNode.key ) ;
				this.rebalance( remainderNode ) ;
			}

			break ;
		}
	}

	return count ;
} ;



/*
	Advanced custom features
*/



// Delete all occurences of a value
BinaryTree.prototype.deleteValue =
BinaryTree.prototype.removeValue = function( value ) {
	this.inPlaceFilter( e => ! isIdenticalTo( e , value ) ) ;
} ;



BinaryTree.prototype.inPlaceFilter = function( fn , thisArg ) {
	var current = this.getHeadNode() ,
		next ;

	while ( current ) {
		if ( current.element instanceof Stack ) {
			arrayKit.inPlaceFilter( current.element , fn , thisArg , current.key ) ;

			if ( current.element.length ) {
				current = this.nextNode( current ) ;
			}
			else {
				next = this.nextNode( current ) ;
				this.deleteNode( current ) ;
				current = next ;
			}
		}
		else {
			if ( fn.call( thisArg , current.element , current.key , this ) ) {
				current = this.nextNode( current ) ;
			}
			else {
				next = this.nextNode( current ) ;
				this.deleteNode( current ) ;
				current = next ;
			}
		}
	}

	return this ;
} ;



/*
	Advanced Array-like features
*/



// Array.prototype.includes() uses this for value equality
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
function isIdenticalTo( x , y ) {
	return x === y || ( Number.isNaN( x ) && Number.isNaN( y ) ) ;
}



BinaryTree.prototype.keyOf = function( element , fromKey ) {
	var current = fromKey ? this.getNode( fromKey ) : this.getHeadNode() ;

	while ( current ) {
		if ( isIdenticalTo( current.element , element ) ) { return current.key ; }
		current = this.nextNode( current ) ;
	}

	return ;
} ;



BinaryTree.prototype.lastKeyOf = function( element , fromKey ) {
	var current = fromKey ? this.getNode( fromKey ) : this.getTailNode() ;

	while ( current ) {
		if ( isIdenticalTo( current.element , element ) ) { return current.key ; }
		current = this.previousNode( current ) ;
	}

	return ;
} ;



BinaryTree.prototype.includes = function( element ) {
	if ( ! this.trunc ) { return false ; }
	return this._recursiveIncludes( element , this.trunc ) ;
} ;



BinaryTree.prototype._recursiveIncludes = function( element , current ) {
	if ( isIdenticalTo( current.element , element ) ) { return true ; }
	if ( current.left && this._recursiveIncludes( element , current.left ) ) { return true ; }
	if ( current.right && this._recursiveIncludes( element , current.right ) ) { return true ; }
	return false ;
} ;



BinaryTree.prototype.forEach = function( fn , thisArg ) {
	var current = this.getHeadNode() ;

	while ( current ) {
		fn.call( thisArg , current.element , current.key , this ) ;
		current = this.nextNode( current ) ;
	}
} ;



BinaryTree.prototype.some = function( fn , thisArg ) {
	var current = this.getHeadNode() ;

	while ( current ) {
		if ( fn.call( thisArg , current.element , current.key , this ) ) { return true ; }
		current = this.nextNode( current ) ;
	}

	return false ;
} ;



BinaryTree.prototype.every = function( fn , thisArg ) {
	var current = this.getHeadNode() ;

	while ( current ) {
		if ( ! fn.call( thisArg , current.element , current.key , this ) ) { return false ; }
		current = this.nextNode( current ) ;
	}

	return true ;
} ;



BinaryTree.prototype.find = function( fn , thisArg ) {
	var current = this.getHeadNode() ;

	while ( current ) {
		if ( fn.call( thisArg , current.element , current.key , this ) ) {
			return current.element ;
		}

		current = this.nextNode( current ) ;
	}

	return ;
} ;



BinaryTree.prototype.findKey = function( fn , thisArg ) {
	var current = this.getHeadNode() ;

	while ( current ) {
		if ( fn.call( thisArg , current.element , current.key , this ) ) {
			return current.key ;
		}

		current = this.nextNode( current ) ;
	}

	return ;
} ;



// Map to an array
BinaryTree.prototype.arrayMap =
BinaryTree.prototype.map = function( fn , thisArg ) {
	var array = new Array( this.length ) ,
		index = 0 ,
		current = this.getHeadNode() ;

	while ( current ) {
		array[ index ++ ] = fn.call( thisArg , current.element , current.key , this ) ;
		current = this.nextNode( current ) ;
	}

	return array ;
} ;



BinaryTree.prototype.reduce = function( fn , accumulator ) {
	var current = this.getHeadNode() ;

	while ( current ) {
		accumulator = fn( accumulator , current.element , current.key , this ) ;
		current = this.nextNode( current ) ;
	}

	return accumulator ;
} ;



BinaryTree.prototype.reduceRight = function( fn , accumulator ) {
	var current = this.getTailNode() ;

	while ( current ) {
		accumulator = fn( accumulator , current.element , current.key , this ) ;
		current = this.previousNode( current ) ;
	}

	return accumulator ;
} ;



// Filter to an array
BinaryTree.prototype.arrayFilter =
BinaryTree.prototype.filter = function( fn , thisArg ) {
	var array = [] ,
		index = 0 ,
		current = this.getHeadNode() ;

	while ( current ) {
		if ( fn.call( thisArg , current.element , current.key , this ) ) {
			array[ index ++ ] = current.element ;
		}

		current = this.nextNode( current ) ;
	}

	return array ;
} ;



/*
	Internal, low-level
*/



// Propagate depth upward and balance the tree if necessary
BinaryTree.prototype.rebalance = function( node , upwardRecusive ) {
	var balance = this.updateDepth( node ) ;

	// After things like .truncate*(), it is possible that one node needs multiple rotations
	while ( balance > 1 || balance < -1 ) {
		if ( balance > 1 ) {
			if ( this.nodeBalance( node.right ) < 0 ) {
				//console.log( "right-left heavy" ) ;
				//console.log( "right-left rotations needed, keys: " + node.right.key + ' ; ' + node.key ) ;
				//console.log( "\nbefore:" ) ;
				//this.debug() ;
				// First rotate the child
				this.rotateNodeRight( node.right ) ;
				//console.log( "\nafter the child rotation:" ) ;
				//this.debug() ;
				node = this.rotateNodeLeft( node ) ;
				//console.log( "\nafter both rotations:" ) ;
				//this.debug() ;
				//console.log( "Node sanity check, key: " + node.key ) ;
				this.nodeSanityCheck( node , node.parent ) ;
			}
			else {
				//console.log( "right heavy" ) ;
				//console.log( "simple left rotation needed, key: " + node.key ) ;
				//console.log( "\nbefore:" ) ;
				//this.debug() ;
				node = this.rotateNodeLeft( node ) ;
				//console.log( "\nafter:" ) ;
				//this.debug() ;
				//console.log( "Node sanity check, key: " + node.key ) ;
				this.nodeSanityCheck( node , node.parent ) ;
			}
		}
		else if ( balance < -1 ) {
			if ( this.nodeBalance( node.left ) > 0 ) {
				//console.log( "left-right heavy" ) ;
				//console.log( "left-right rotations needed, keys: " + node.left.key + ' ; ' + node.key ) ;
				//console.log( "\nbefore:" ) ;
				//this.debug() ;
				// First rotate the child
				this.rotateNodeLeft( node.left ) ;
				//console.log( "\nafter the child rotation:" ) ;
				//this.debug() ;
				node = this.rotateNodeRight( node ) ;
				//console.log( "\nafter both rotations:" ) ;
				//this.debug() ;
				//console.log( "Node sanity check, key: " + node.key ) ;
				this.nodeSanityCheck( node , node.parent ) ;
			}
			else {
				//console.log( "left heavy" ) ;
				//console.log( "simple right rotation needed, key: " + node.key ) ;
				//console.log( "\nbefore:" ) ;
				//this.debug() ;
				node = this.rotateNodeRight( node ) ;
				//console.log( "\nafter:" ) ;
				//this.debug() ;
				//console.log( "Node sanity check, key: " + node.key ) ;
				this.nodeSanityCheck( node , node.parent ) ;
			}
		}

		balance = this.nodeBalance( node ) ;
	}

	if ( upwardRecusive && node.parent ) {
		this.rebalance( node.parent , true ) ;
	}

	return node ;
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
		return -node.left.depth ;
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
		return -node.left.depth ;
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
	including: include the current key if it exists
	direction: how to choose a node when excluding the key:
		* unset: don't care
		* 1: forward direction, choose the left-most node
		* -1: backward direction, choose the right-most node
*/
BinaryTree.prototype.getClosestNode = function( key , including , direction ) {
	if ( ! this.trunc ) { return null ; }

	var lastNode = null ,
		lastDirection = 0 ,
		lastLeftAncestor = null ,
		lastRightAncestor = null ,
		node = this.trunc ;

	for ( ;; ) {
		if ( node.key === key ) {
			if ( including ) { return node ; }
			if ( direction > 0 ) { return this.nextNode( node ) ; }
			return this.previousNode( node ) ;
		}
		else if ( this.isOrdered( node.key , key ) ) {
			if ( ! node.right ) {
				if ( direction < 0 ) { return node ; }
				if ( lastDirection < 0 ) { return lastNode ; }
				return lastRightAncestor ;
			}

			lastLeftAncestor = lastNode = node ;
			lastDirection = 1 ;
			node = node.right ;
		}
		else {
			if ( ! node.left ) {
				if ( direction > 0 ) { return node ; }
				if ( lastDirection > 0 ) { return lastNode ; }
				return lastLeftAncestor ;
			}

			lastRightAncestor = lastNode = node ;
			lastDirection = -1 ;
			node = node.left ;
		}
	}
} ;



// .deleteNode() uses it
BinaryTree.prototype.swapNodes = function( a , b ) {
	var aParent = a.parent ,
		bParent = b.parent ,
		aLeft = a.left ,
		bLeft = b.left ,
		aRight = a.right ,
		bRight = b.right ,
		aDepth = a.depth ,
		bDepth = b.depth ;

	
	// Swap nodes' refs
	a.parent = bParent !== a ? bParent : b ;
	b.parent = aParent !== b ? aParent : a ;
	a.left = bLeft !== a ? bLeft : b ;
	b.left = aLeft !== b ? aLeft : a ;
	a.right = bRight !== a ? bRight : b ;
	b.right = aRight !== b ? aRight : a ;
	a.depth = bDepth ;
	b.depth = aDepth ;

	
	// Swap parents' refs
	if ( bParent ) {
		if ( bParent !== a ) { bParent[ b === bParent.left ? 'left' : 'right' ] = a ; }
	}
	else {
		this.trunc = a ;
	}

	if ( aParent ) {
		if ( aParent !== b ) { aParent[ a === aParent.left ? 'left' : 'right' ] = b ; }
	}
	else {
		this.trunc = b ;
	}


	// Fix children's refs
	if ( a.left ) { a.left.parent = a ; }
	if ( a.right ) { a.right.parent = a ; }

	if ( b.left ) { b.left.parent = b ; }
	if ( b.right ) { b.right.parent = b ; }
} ;



// DEPRECATED?
// Delete subtree without re-balancing
BinaryTree.prototype.deleteSubTree = function( node , isRecursiveCall ) {
	if ( node.left ) { this.deleteSubTree( node.left , true ) ; }
	if ( node.right ) { this.deleteSubTree( node.right , true ) ; }

	if ( ! isRecursiveCall ) {
		if ( node.parent ) {
			if ( node.parent.left === node ) {
				node.parent.left = null ;
			}
			else {
				node.parent.right = null ;
			}
		}
		else {
			this.trunc = null ;
		}
	}

	this.length -- ;
	this.destroyNode( node ) ;
} ;



/*
	Debug stuffs
*/



const util = require( 'util' ) ;

BinaryTree.prototype.debug = function( node = this.trunc , spaces = 0 , prefix = '━' , showValue = false ) {
	if ( ! node ) {
		console.log( '(empty)' ) ;
		return ;
	}

	var str = ' '.repeat( spaces ) + prefix + node.key ;
	//var nextSpaces = str.length ? str.length - 1 : 0 ;
	var nextSpaces = spaces + 2 ;

	//str += ' (' + node.depth + ' | ' + this.nodeBalance( node ) + ')' ;
	str += ' (' + this.nodeBalance( node ) + ')' ;

	if ( showValue ) {
		str += ' => ' + util.inspect( node.element ) ;
	}

	if ( node.right ) {
		this.debug( node.right , nextSpaces , '┏' , showValue ) ;
	}

	console.log( str ) ;

	if ( node.left ) {
		this.debug( node.left , nextSpaces , '┗' , showValue ) ;
	}
} ;

BinaryTree.prototype.debugValues = function() { return this.debug( this.trunc , 0 , '━' , true ) ; }



const assert = require( 'assert' ).strict ;

BinaryTree.prototype.sanityCheck = function( onlyStructure ) {
	var runtime = {
		length: 0 ,
		onlyStructure: !! onlyStructure
	} ;

	if ( this.trunc ) {
		this.nodeSanityCheck( this.trunc , null , runtime ) ;
	}

	if ( ! runtime.onlyStructure ) {
		assert.strictEqual( this.length , runtime.length , "Length mismatch" ) ;
	}
} ;



BinaryTree.prototype.nodeSanityCheck = function( node , parentNode = null , runtime = null ) {
	if ( runtime ) {
		if ( ++ runtime.length > this.length && ! runtime.onlyStructure ) {
			assert.fail( "Length mismatch: exceeding, key: " + node.key ) ;
		}
	}

	assert.strictEqual( node.parent , parentNode , "Parent mismatch, key: " + node.key ) ;

	if ( node.left ) {
		if ( node.right ) {
			// There are 2 children

			if ( runtime && ! runtime.onlyStructure ) {
				assert.strictEqual( node.depth , 1 + Math.max( node.left.depth , node.right.depth ) , "Depth mismatch (RL), key: " + node.key ) ;
			}

			this.nodeSanityCheck( node.left , node , runtime ) ;
			this.nodeSanityCheck( node.right , node , runtime ) ;
		}
		else {
			// Only a left child

			if ( runtime && ! runtime.onlyStructure ) {
				assert.strictEqual( node.depth , 1 + node.left.depth , "Depth mismatch (L), key: " + node.key ) ;
			}

			this.nodeSanityCheck( node.left , node , runtime ) ;
		}
	}
	else if ( node.right ) {
		// Only a right child

		if ( runtime && ! runtime.onlyStructure ) {
			assert.strictEqual( node.depth , 1 + node.right.depth , "Depth mismatch (R), key: " + node.key ) ;
		}

		this.nodeSanityCheck( node.right , node , runtime ) ;
	}
	else if ( runtime && ! runtime.onlyStructure ) {
		// No child
		assert.strictEqual( node.depth , 1 , "Depth mismatch (), key: " + node.key ) ;
	}

	if ( runtime && ! runtime.onlyStructure ) {
		// Should be done after the recursive call, to avoid throwing the wrong error
		var balance = this.nodeBalance( node ) ;

		if ( Math.abs( balance ) > 1 ) {
			assert.fail( "Unbalanced node (" + balance + "), key: " + node.key ) ;
		}
	}
} ;

