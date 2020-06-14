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
	This is a sort of Quad tree, splitting space in equal square region.
	Content (points) are only stored in leaves.
	The splitting point is never a content point and is always in the middle of the parent node.
	It is effective for dynamic objects, for effective area search of (more or less) constant size,
	it does not require balancing, ideal for 2D games.

	Options:
		minSquareSize `number` the min size of a node, should be a power of 2 like 1, 2, 4, or 0.5, 0.25, 0.125, ...
			No subdivision will occur below that size
		maxLeafPoints `number` above this number of points, the leaf will become a node with 4 child leaves (except if its size
			is already the min square size)
		minLeafPoints `number` below this number of points, the leaf will trigger the join-leaves mecanism
		minChildrenPoints `number` a node may merge all it children leaves and become the leaf itself if the sum of the points
			of all its direct children leaves is below this number
		x,y `number` the initial lower limit of the bounding box, should be a multiple of minSquareSize
		size `number` the initial side size of the bounding box, should be a power of 2 and greater than or equals to minSquareSize
*/

function SquareTree( options = {} ) {
	this.minSquareSize = options.minSquareSize || 1 ;
	this.maxLeafPoints = options.maxLeafPoints || 16 ;
	this.minLeafPoints = options.minLeafPoints || Math.floor( options.maxLeafPoints / 8 ) ;
	this.minChildrenPoints = options.minChildrenPoints || Math.floor( options.maxLeafPoints / 4 ) ;
	
	this.x = options.x || 0 ;
	this.y = options.y || 0 ;
	this.size = options.size || this.minSquareSize ;

	this.trunc = new Node() ;
	this.trunc.stack = new Set() ;
}

module.exports = SquareTree ;



function Node() {
	this.stack = null ;
	this.children = null ;
}

SquareTree.Node = Node ;



const BOTTOM_LEFT = 0 ;
const BOTTOM_RIGHT = 1 ;
const TOP_LEFT = 2 ;
const TOP_RIGHT = 3 ;



function Point( x , y , element ) {
	this.x = x ;
	this.y = y ;
	this.e = element ;
}

SquareTree.Point = Point ;



function Search( x = 0 , y = 0 , bbx = 0 , bby = 0 , bbs = 1 , node = null , parentNode = null , parentQuad = null ) {
	this.x = x ;
	this.y = y ;
	this.bbx = bbx ;
	this.bby = bby ;
	this.bbs = bbs ;
	this.node = node ;

	this.parentNode = parentNode ;
	this.parentQuad = parentQuad ;
}

SquareTree.Search = Search ;



Search.prototype.set = function( x = 0 , y = 0 , bbx = 0 , bby = 0 , bbs = 1 , node = null , parentNode = null , parentQuad = null ) {
	this.x = x ;
	this.y = y ;
	this.bbx = bbx ;
	this.bby = bby ;
	this.bbs = bbs ;
	this.node = node ;

	this.parentNode = parentNode ;
	this.parentQuad = parentQuad ;

	return this ;
} ;



Search.prototype.clone = function() {
	return new Search( this.x , this.y , this.bbx , this.bby , this.bbs , this.node , this.parent ) ;
} ;



// Check if the search is in the BBox
Search.prototype.inBBox = function() {
	return this.x >= this.bbx && this.x < this.bbx + this.bbs && this.y >= this.bby && this.y < this.bby + this.bbs ;
} ;



// Assume it's already in the BBox
Search.prototype.subQuadIndex = function() {
	var xSplit = this.bbx + this.bbs / 2 ,
		ySplit = this.bby + this.bbs / 2 ;
	
	return this.y < ySplit ?
		( this.x < xSplit ? BOTTOM_LEFT : BOTTOM_RIGHT ) :
		( this.x < xSplit ? TOP_LEFT : TOP_RIGHT ) ;
} ;



// Get the leaf from the current Search instance descent
// searchSteps is null or an array that will be populated with each steps of the search object
Search.prototype.toSubQuad = function( qIndex , searchSteps = null ) {
	if ( ! this.node || ! this.node.children ) { return false ; }

	// Storing all the steps is required
	if ( searchSteps ) { searchSteps.push( this.clone() ) ; }

	// Change the node
	this.parentQuad = qIndex ;
	this.parentNode = this.node ;
	this.node = this.node.children[ qIndex ] ;

	// Update the BBox
	this.bbs /= 2 ;
	if ( qIndex & 1 ) { this.bbx += this.bbs ; }
	if ( qIndex & 2 ) { this.bby += this.bbs ; }

	return true ;
} ;



Search.prototype.toNextSubQuad = function( searchSteps = null ) {
	return this.toSubQuad( this.subQuadIndex() , searchSteps ) ;
} ;



// Get the leaf from the current Search instance descent
SquareTree.prototype.getSearchLeaf = function( search , searchSteps = null ) {
	while ( search.toNextSubQuad( searchSteps ) ) ;
	return search ; 
} ;



// Search object cache for better perf
const GET_POINT_LEAF_SEARCH = new Search() ;

SquareTree.prototype.getPointLeaf = function( point ) {
	return this.getSearchLeaf( GET_POINT_LEAF_SEARCH.set( point.x , point.y , this.x , this.y , this.size , this.trunc ) ) ;
} ;



SquareTree.prototype.add = function( x , y , element ) {
	return this.addPoint( new Point( x , y , element ) ) ;
} ;



// Search object cache for better perf
const ADD_POINT_SEARCH = new Search() ;

SquareTree.prototype.addPoint = function( point , search = ADD_POINT_SEARCH ) {
	search.set( point.x , point.y , this.x , this.y , this.size , this.trunc ) ;

	if ( ! search.inBBox() ) {
		// TODO...
		this.resize() ;
	}

	this.getSearchLeaf( search ) ;

	if ( ! search.node ) {
		// The parent node has only partial children, so create the node
		search.parentNode.children[ search.parentQuad ] = search.node = new Node() ;
	}

	if ( ! search.node.stack ) {
		search.node.stack = new Set() ;
	}

	search.node.stack.add( point ) ;

	if ( search.node.stack.size > this.maxLeafPoints ) {
		this.subdivideNode( search ) ;
	}

	return point ;
} ;



// Search object cache for better perf
const REMOVE_POINT_SEARCH = new Search() ;

SquareTree.prototype.removePoint = function( point , search = REMOVE_POINT_SEARCH ) {
	var searchSteps = [] ;

	search.set( point.x , point.y , this.x , this.y , this.size , this.trunc ) ;
	
	this.getSearchLeaf( search , searchSteps ) ;

	if ( search.node.stack && search.node.stack.delete( point ) ) {
		//searchSteps.push( search ) ;	// ?
		this.joinNodes( searchSteps ) ;
		return true ;
	}
	else {
		// Not found...
		return false ;
	}
} ;



// Join nodes, if necessary
SquareTree.prototype.joinNodes = function( searchSteps ) {
	var search ,
		i = searchSteps.length ;
	
	while ( i -- ) {
		search = searchSteps[ i ] ;
		node = search.node ;

		if ( ! search.node.stack.size && search.parentNode ) {
			let siblings = search.parentNode.children ;
			let size =
				( siblings[ 0 ].stack ? siblings[ 0 ].stack.size : 0 )
				+ ( siblings[ 1 ].stack ? siblings[ 1 ].stack.size : 0 )
				+ ( siblings[ 2 ].stack ? siblings[ 2 ].stack.size : 0 )
				+ ( siblings[ 3 ].stack ? siblings[ 3 ].stack.size : 0 ) ;
			
			// This should be recursive
			this.join() ;
		}
	}
	
} ;



// Subdivide a node, if necessary
SquareTree.prototype.subdivideNode = function( search ) {
	if ( search.node.stack.size <= this.maxLeafPoints ) { return ; }

	var i , point , qIndex , children , child , searchChild ,
		node = search.node ;

	//children = node.children = [ new Node() , new Node() , new Node() , new Node() ] ;
	children = node.children = [ null , null , null , null ] ;

	for ( point of node.stack ) {
		search.x = point.x ;
		search.y = point.y ;
		qIndex = search.subQuadIndex() ;

		if ( ! children[ qIndex ] ) { children[ qIndex ] = new Node() ; }
		child = children[ qIndex ] ;

		if ( ! child.stack ) { child.stack = new Set() ; }
		child.stack.add( point ) ;
	}

	// Which is better? Clearing the Set can go easier on the GC when things change constantly,
	// but unsetting it free more memory.
	//node.stack.clear() ;
	node.stack = null ;

	for ( i = 0 ; i < 4 ; i ++ ) {
		child = children[ i ] ;

		if ( child && child.stack && child.stack.size > this.maxLeafPoints ) {
			searchChild = search.clone() ;
			searchChild.toSubQuad( i ) ;
			this.subdivideNode( searchChild ) ;
		}
	}
} ;



/*
	Debug stuffs
*/



const util = require( 'util' ) ;

SquareTree.prototype.debug = function( node = this.trunc , spaces = 0 , prefix = '━' , showValue = false ) {
	var i , iMax , str , point ,
		nextSpaces = spaces + 5 ;

	if ( ! node.children ) {
		if ( ! node.stack || ! node.stack.size ) {
			str = ' '.repeat( spaces ) + prefix + ' (empty)' ;
			console.log( str ) ;
			return ;
		}
		
		i = -1 ;
		iMax = node.stack.size ;
		for ( point of node.stack ) {
			i ++ ;
			str = ' '.repeat( spaces ) ;
			str += i === Math.floor( ( iMax - 1 ) / 2 ) ? prefix + ' ' : ' '.repeat( 1 + prefix.length ) ;
			str += 'x:' + point.x + ' y:' + point.y ;

			if ( showValue ) {
				str += ' => ' + util.inspect( point.e ) ;
			}

			console.log( str ) ;
		}

		return ;
	}

	if ( node.children[ 0 ] ) {
		this.debug( node.children[ 0 ] , nextSpaces , '┏BL━' , showValue ) ;
		console.log() ;
	}

	if ( node.children[ 1 ] ) {
		this.debug( node.children[ 1 ] , nextSpaces , '┏BR━' , showValue ) ;
		console.log() ;
	}

	str = ' '.repeat( spaces ) + prefix + ' ' ;
	console.log( str ) ;

	if ( node.children[ 2 ] ) {
		this.debug( node.children[ 2 ] , nextSpaces , '┗TL━' , showValue ) ;
		console.log() ;
	}

	if ( node.children[ 3 ] ) {
		this.debug( node.children[ 3 ] , nextSpaces , '┗TR━' , showValue ) ;
		console.log() ;
	}
} ;

SquareTree.prototype.debugValues = function() { return this.debug( this.trunc , 0 , '━' , true ) ; } ;

