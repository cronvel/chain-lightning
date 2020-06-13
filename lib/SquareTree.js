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
		minSize `number` the min size of a node, should be a power of 2 like 1, 2, 4, or 0.5, 0.25, 0.125, ...
		x,y `number` the initial lower limit of the bounding box, should be a multiple of minSize
		size `number` the initial side size of the bounding box, should be a power of 2 and greater than or equals to minSize
		maxStackSize `number` the maximum number of elements in a node stack before subdividing it
*/

function SquareTree( options = {} ) {
	this.minSize = options.minSize || 1 ;
	
	this.x = options.x || 0 ;
	this.y = options.y || 0 ;
	this.size = options.size || this.minSize ;
	
	this.maxStackSize = options.maxStackSize || 16 ;

	this.trunc = new Node() ;
	this.trunc.stack = [] ;
}

module.exports = SquareTree ;



function Node() {
	this.stack = null ;
	this.children = null ;
	/*
	this.topLeft = null ;
	this.topRight = null ;
	this.bottomLeft = null ;
	this.bottomRight = null ;
	*/
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
} ;

SquareTree.Point = Point ;



function Search( x = 0 , y = 0 , bbx = 0 , bby = 0 , bbs = 1 , node = null ) {
	this.x = x ;
	this.y = y ;
	this.bbx = bbx ;
	this.bby = bby ;
	this.bbs = bbs ;
	this.node = node ;
}

SquareTree.Search = Search ;



Search.prototype.set = function( x = 0 , y = 0 , bbx = 0 , bby = 0 , bbs = 1 , node = null ) {
	this.x = x ;
	this.y = y ;
	this.bbx = bbx ;
	this.bby = bby ;
	this.bbs = bbs ;
	this.node = node ;
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
SquareTree.prototype.getLeaf = function( search ) {
	var qIndex ;

	while ( search.node.children ) {
		qIndex = subQuadIndex( search ) ;

		// Change the node
		search.node = search.node.children[ qIndex ] ;

		// Update the BBox
		search.bbs /= 2 ;
		if ( qIndex & 1 ) { search.bbx += search.bbs ; }
		if ( qIndex & 2 ) { search.bby += search.bbs ; }
	}

	return search ; 
} ;



SquareTree.prototype.add = function( x , y , element ) {
	this.addPoint( new Point( x , y , element ) ) ;
} ;



// Search object cache for better perf
const ADD_POINT_SEARCH = new Search() ;

SquareTree.prototype.addPoint = function( point , search = ADD_POINT_SEARCH ) {
	search.set( point.x , point.y , this.x , this.y , this.size , this.trunc ) ;
	
	if ( ! search.inBBox() ) {
		// TODO...
		this.resize() ;
	}
	
	//this.addToNode( point , search ) ;
	this.getLeaf( search ) ;

	if ( search.node.stack ) {
		search.node.stack[ search.node.stack.length ] = point ;
		
		if ( search.node.stack.length > this.maxStackSize ) {
			this.subdivide( search ) ;
		}
	}
	else {
		search.node.stack = [ point ] ;
	}
} ;



SquareTree.prototype.subdivide = function( search ) {
	var i , iMax , point , qIndex , children , child ,
		node = search.node ;

	children = node.children = [ new Node() , new Node() , new Node() , new Node() ] ;

	for ( i = 0 , iMax = search.node.stack.length ; i < iMax ; i ++ ) {
		point = node.stack[ i ] ;
		search.x = point.x ;
		search.y = point.y ;
		qIndex = search.subQuadIndex() ;
		child = children[ qIndex ] ;
		
		if ( child.stack ) {
			child.stack[ child.stack.length ] = point ;
		}
		else {
			child.stack = [ point ] ;
		}
	}
	
	// Which is better? Resetting length can go easier on the GC when things change constantly
	//node.stack.length = 0 ;
	node.stack = null ;
} ;

