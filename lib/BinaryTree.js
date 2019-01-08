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

function BinaryTree( options , ... elements ) {
	var autoIndex = 0 ;
	
	this.trunc = null ;
	this.length = 0 ;
	this.keyFn = options && options.keyFn ;
	this.uniqueKeys = !! ( options && options.uniqueKeys ) ;
	
	if ( ! this.keyFn ) {
		this.keyFn = () => autoIndex ++ ;
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



function Node( tree , key , element , parent = null ) {
	this.tree = tree ;
	this.key = key ;
	this.element = element ;
	this.parent = parent ;
	this.left = null ;
	this.right = null ;
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
	node.depth = 0 ;
} ;



// Implementation dependant, this works for key as finite number, for things like key as string, those methods must be overloaded
BinaryTree.prototype.isOrdered = ( key1 , key2 ) => key1 <= key2 ;
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



BinaryTree.prototype.set = function( key , element , noOverwrite ) {
	if ( ! this.trunc ) {
		this.trunc = new Node( this , key , element ) ;
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
			
			if ( this.uniqueKeys ) {
				node.element = element ;
				return ;
			}

			// No uniqueKey? So insert it after
			if ( ! node.right ) {
				node.right = new Node( this , key , element , node ) ;
				this.length ++ ;
				this.upwardBalancing( node ) ;
				return ;
			}
			
			node = node.right ;
		}
		
		if ( this.isOrdered( node.key , key ) ) {
			if ( ! node.right ) {
				node.right = new Node( this , key , element , node ) ;
				this.length ++ ;
				this.upwardBalancing( node ) ;
				return ;
			}
			
			node = node.right ;
		}
		else {
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
	elements.forEach( element => this.set( this.keyFn( element ) , element , true ) ) ;
} ;



BinaryTree.prototype.delete = function( key ) {
	var node = this.getNode( key ) ;
	if ( ! node ) { return false ; }
	this.deleteNode( node ) ;
} ;



BinaryTree.prototype.deleteNode = function( node ) {
	var parent , referer , refererProp , replacerNode ;
	
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
		if ( node.right ) {
			// Ok, both node exist... it's the complicated case,
			
			// Find a replacerNode, copy its key and value in the current node,
			// and delete the replacer instead of this one.
			// Note that the replacer has only one child, since it's either the min or the max of the subtree.
			
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
		}
		else {
			// Only a left child, attach its subtree to the parent
			referer[ refererProp ] = node.left ;
			node.left.parent = parent ;
			this.length -- ;
			this.upwardBalancing( node ) ;
			this.destroyNode( node ) ;
		}
	}
	else if ( node.right ) {
		// Only a right child, attach its subtree to the parent
		referer[ refererProp ] = node.right ;
		node.right.parent = parent ;
		this.length -- ;
		this.upwardBalancing( node ) ;
		this.destroyNode( node ) ;
	}
	else {
		// No child, simply unlink it from the parent
		referer[ refererProp ] = null ;
		this.length -- ;
		this.upwardBalancing( node ) ;
		this.destroyNode( node ) ;
	}
} ;



BinaryTree.prototype.truncateBefore = function( key , including ) {
	var lastTruncatedNode = this.getClosestNode( key , ! including , -1 ) ;
	//var firstKeptNode = this.nextNode( lastTruncatedNode ) ;
	
	var parent ,
		truncatedSubTree = lastTruncatedNode ,
		remainderNode = lastTruncatedNode.right ;
	
	console.log( "lastTruncatedNode:" , lastTruncatedNode.key ) ;
	this.debug() ;
	
	for ( ;; ) {
		while ( truncatedSubTree.parent && truncatedSubTree === truncatedSubTree.parent.right ) {
			truncatedSubTree = truncatedSubTree.parent ;
		}
		
		if ( truncatedSubTree.parent ) {
			truncatedSubTree.parent.left = remainderNode ;
			
			if ( remainderNode ) {
				remainderNode.parent = truncatedSubTree.parent.left ;
			}
			
			// Loop conditions
			remainderNode = truncatedSubTree.parent ;
			truncatedSubTree = remainderNode ;
			
			while ( truncatedSubTree.parent && truncatedSubTree === truncatedSubTree.parent.left ) {
				truncatedSubTree = truncatedSubTree.parent ;
			}
			
			if ( truncatedSubTree === remainderNode || ! truncatedSubTree.parent ) { break ; }
		}
		else {
			this.trunc = remainderNode ;
			remainderNode.parent = null ;
			break ;
		}
	}
	
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
		if ( fn.call( thisArg , current.element , current.key , this ) ) {
			current = this.nextNode( current ) ;
		}
		else {
			next = this.nextNode( current ) ;
			this.deleteNode( current ) ;
			current = next ;
		}
	}

	return this ;
} ;



/*
	Internal, low-level
*/



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
	excluding: exclude the current key
	direction: how to choose a node for a non uniqueKeys tree or when excluding the key:
		* unset: don't care
		* 1: forward direction, choose the left-most node
		* -1: backward direction, choose the right-most node
*/
BinaryTree.prototype.getClosestNode = function( key , excluding , direction ) {
	if ( ! this.trunc ) { return null ; }
	
	var lastNode = null ,
		lastDirection = 0 ,
		lastLeftAncestor = null ,
		lastRightAncestor = null ,
		node = this.trunc ;
	
	for ( ;; ) {
		if ( node.key === key ) {
			if ( excluding ) {
				if ( ! lastNode ) { return null ; }
				
				if ( direction > 0 ) {
					if ( node.right ) {
						lastLeftAncestor = lastNode = node ;
						lastDirection = 1 ;
						node = node.right ;
					}
					else if ( lastDirection < 0 ) {
						return lastNode ;
					}
					else {
						return null ;
					}
				}
				else {	// if ( direction < 0 ) {
					if ( node.left ) {
						lastRightAncestor = lastNode = node ;
						lastDirection = -1 ;
						node = node.left ;
					}
					else if ( lastDirection > 0 ) {
						return lastNode ;
					}
					else {
						return null ;
					}
				}
			}
			else if ( this.uniqueKeys || ! direction ) {
				return node ;
			}
			else if ( direction > 0 ) {
				if ( ! node.left || node.left.key !== key ) { return node ; }
				
				lastRighttAncestor = lastNode = node ;
				lastDirection = -1 ;
				node = node.left ;
			}
			else {	// if ( direction < 0 ) {
				if ( ! node.right || node.right.key !== key ) { return node ; }
				
				lastLeftAncestor = lastNode = node ;
				lastDirection = 1 ;
				node = node.right ;
			}
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

