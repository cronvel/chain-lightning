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
	this.trunc.stack = new Stack() ;
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



class Stack extends Array {}
SquareTree.Stack = Stack ;



function Point( x , y , element ) {
	this.x = x ;
	this.y = y ;
	this.e = element ;
} ;

SquareTree.Point = Point ;



Point.prototype.inBBox = function( bbx , bby , bbs ) {
	return this.x >= bbx && this.x < bbx + bbs && this.y >= bby && this.y < bby + bbs ;
} ;



// Assume it's already in the BBox
Point.prototype.subQuad = function( bbx , bby , bbs ) {
	var xSplit = bbx + bbs / 2 ,
		ySplit = bby + bbs / 2 ;
	
	return this.y < ySplit ?
		( this.x < xSplit ? BOTTOM_LEFT : BOTTOM_RIGHT ) :
		( this.x < xSplit ? TOP_LEFT : TOP_RIGHT ) ;
} ;



SquareTree.prototype.add = function( x , y , element ) {
	this.addPoint( new Point( x , y , element ) ;
} ;



SquareTree.prototype.addPoint = function( point ) {
	if ( ! point.inBBox( this.x , this.y , this.size ) ) {
		// TODO...
		this.resize() ;
	}
	
	this.addToNode( this.trunc , point , this.x , this.y , this.size ) ;
} ;



// Cache it for better perf
const SEARCH = { x: 0 , y: 0 , bbx: 0 , bby: 0 , bbs: 0 , node: null } ;

SquareTree.prototype.getNode = function( x , y , bbx , bby , bbs , node = this.trunc ) {
	SEARCH.x = x ;
	SEARCH.y = y ;
	SEARCH.bbx = bbx ;
	SEARCH.bby = bby ;
	SEARCH.bbs = bbs ;
	SEARCH.node = node ;
	return this.getNode_( search ) ;
} ;



// Assume it's already in the BBox
function subQuadOf( s ) {
	var xSplit = s.bbx + s.bbs / 2 ,
		ySplit = s.bby + s.bbs / 2 ;
	
	return s.y < ySplit ?
		( s.x < xSplit ? BOTTOM_LEFT : BOTTOM_RIGHT ) :
		( s.x < xSplit ? TOP_LEFT : TOP_RIGHT ) ;
} ;



SquareTree.prototype.getNode_ = function( search ) {
	var q ;

	while ( search.node.children ) {
		q = subQuadOf( search ) ;

		// Change the node
		search.node = search.node.children[ q ] ;

		// Update the BBox
		search.bbs /= 2 ;
		if ( q & 1 ) { search.bbx += search.bbs ; }
		if ( q & 2 ) { search.bby += search.bbs ; }
	}

	return ; 
} ;



SquareTree.prototype.addToNode = function( node , point , bbx , bby , bbs ) {
	if ( this.children ) {
		
	}

	if ( this.stack ) {
		this.stack[ this.stack.length - 1 ] = element ;
		
		if ( this.stack.length > this.maxStackSize ) {
			this.subdivide( node ) ;
		}
		
		return ;
	}
	
} ;

