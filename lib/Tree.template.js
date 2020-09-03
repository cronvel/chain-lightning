/*
	Chain Lightning

	Copyright (c) 2018 - 2020 Cédric Ronvel

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
	Template for QuadTree, with or without BoundingBox, and future Octree.
*/

/*
	This is a sort of Quad tree, splitting space in equal square region.
	Content (points/slots) are only stored in leaves, which are region of predictible size.
	The splitting point is never a content point/slot and is always in the middle of the parent node.
	It is effective for dynamic objects, for effective area search of (more or less) constant size,
	it does not require balancing, ideal for 2D games.
	The structure is light-weight, because the bounding box of node are implicit.
	Each node only got a Set of slots (for leaves) or an array of 4 pointers to each child.

	Options:
		minNodeAreaSize `number` the min size of the area of a node, i.e. the square side, should be a power of 2 like 1, 2, 4, or 0.5, 0.25, 0.125, ...
			No subdivision will occur below that area size
		maxLeafSlots `number` above this number of slots, the leaf will become a node with 4 child leaves (except if its size
			is already the min area size)
		minLeafSlots `number` below this number of slots, the leaf will trigger the join-leaves mecanism
		minChildrenSlots `number` a node may merge all its children leaves and become the leaf itself if the sum of the slots
			of all its direct children leaves is below this number
		x,y `number` the initial lower limit of the bounding box, should be a multiple of minNodeAreaSize
		areaSize `number` the initial side size of the bounding box, should be a power of 2 and greater than or equals to minNodeAreaSize
		autoResize `boolean` if set, the original BBox can be modified, e.g.: expand when adding out of bounds elements, or adapt to the first elements inserted
*/

function Tree( options = {} ) {
	this.minNodeAreaSize = options.minNodeAreaSize || 1 / 1024 ;
	this.maxLeafSlots = options.maxLeafSlots || 16 ;
	this.minLeafSlots = options.minLeafSlots || Math.floor( options.maxLeafSlots / 8 ) || 1 ;
	this.minChildrenSlots = options.minChildrenSlots || Math.floor( options.maxLeafSlots / 4 ) || 1 ;

	this.x = options.x || 0 ;
	this.y = options.y || 0 ;
	this.areaSize = options.areaSize || 1 ;
	this.autoResize = !! options.autoResize ;

	this.trunk = new Node() ;
	this.trunk.slots = new Set() ;

	// Number of elements stored
	this.size = 0 ;
}

module.exports = Tree ;



function Node() {
	this.slots = null ;
	this.children = null ;

	// This track the number of bboxes that overlap the center: they do not produce split, they are substracted from this.boundingBoxes.size
	//# bbox : this.centerOverlapCount = 0 ;
}

Tree.Node = Node ;



Node.prototype.recursiveNodeCount = function() {
	var count = 1 ;

	if ( ! this.children ) { return count ; }

	//	Unroll the loop for better perf on this critical part of the code
	if ( this.children[ 0 ] ) { count += this.children[ 0 ].recursiveNodeCount() ; }
	if ( this.children[ 1 ] ) { count += this.children[ 1 ].recursiveNodeCount() ; }
	if ( this.children[ 2 ] ) { count += this.children[ 2 ].recursiveNodeCount() ; }
	if ( this.children[ 3 ] ) { count += this.children[ 3 ].recursiveNodeCount() ; }

	return count ;
} ;



Node.prototype.recursiveLeafCount = function() {
	if ( ! this.children ) { return 1 ; }

	var count = 0 ;

	//	Unroll the loop for better perf on this critical part of the code
	if ( this.children[ 0 ] ) { count += this.children[ 0 ].recursiveLeafCount() ; }
	if ( this.children[ 1 ] ) { count += this.children[ 1 ].recursiveLeafCount() ; }
	if ( this.children[ 2 ] ) { count += this.children[ 2 ].recursiveLeafCount() ; }
	if ( this.children[ 3 ] ) { count += this.children[ 3 ].recursiveLeafCount() ; }

	return count ;
} ;



// Argument 'leaves' is an array of leaves to be populated
Node.prototype.recursiveAllLeaves = function( leaves ) {
	if ( ! this.children ) {
		leaves[ leaves.length ] = this ;
		return ;
	}

	//	Unroll the loop for better perf on this critical part of the code
	if ( this.children[ 0 ] ) { this.children[ 0 ].recursiveAllLeaves( leaves ) ; }
	if ( this.children[ 1 ] ) { this.children[ 1 ].recursiveAllLeaves( leaves ) ; }
	if ( this.children[ 2 ] ) { this.children[ 2 ].recursiveAllLeaves( leaves ) ; }
	if ( this.children[ 3 ] ) { this.children[ 3 ].recursiveAllLeaves( leaves ) ; }
} ;



// Argument 'slots' is an array of slots to be populated
Node.prototype.recursiveAllSlots = function( slots ) {
	var slot ;

	//Tree.seen ++ ; Tree.encompass ++ ;
	if ( ! this.children ) {
		if ( this.slots ) {
			// Don't use slots.push( ... this.slots ), it's way slower especially for big sets
			for ( slot of this.slots ) { slots[ slots.length ] = slot ; }
		}

		return ;
	}

	//	Unroll the loop for better perf on this critical part of the code
	if ( this.children[ 0 ] ) { this.children[ 0 ].recursiveAllSlots( slots ) ; }
	if ( this.children[ 1 ] ) { this.children[ 1 ].recursiveAllSlots( slots ) ; }
	if ( this.children[ 2 ] ) { this.children[ 2 ].recursiveAllSlots( slots ) ; }
	if ( this.children[ 3 ] ) { this.children[ 3 ].recursiveAllSlots( slots ) ; }
} ;
//*/



// Argument 'elements' is an array of elements to be populated
Node.prototype.recursiveAllElements = function( elements ) {
	var slot ;

	if ( ! this.children ) {
		if ( this.slots ) {
			for ( slot of this.slots ) {
				elements[ elements.length ] = slot.e ;	//# stack!
				/*# stack :
				for ( let i = 0 , iMax = slot.s.length ; i < iMax ; i ++ ) {
					elements[ elements.length ] = slot.s[ i ] ;
				}
				//*/
			}
		}

		return ;
	}

	//*	Unroll the loop for better perf on this critical part of the code
	if ( this.children[ 0 ] ) { this.children[ 0 ].recursiveAllElements( elements ) ; }
	if ( this.children[ 1 ] ) { this.children[ 1 ].recursiveAllElements( elements ) ; }
	if ( this.children[ 2 ] ) { this.children[ 2 ].recursiveAllElements( elements ) ; }
	if ( this.children[ 3 ] ) { this.children[ 3 ].recursiveAllElements( elements ) ; }
} ;



const BOTTOM_LEFT = 0 ;
const BOTTOM_RIGHT = 1 ;
const TOP_LEFT = 2 ;
const TOP_RIGHT = 3 ;



function Slot(
	x , y
	//# bbox : , w , h
	, element = null	//# stack!
	//# stack : , ... elements
) {
	this.x = x ;
	this.y = y ;
	
	/*# bbox :
	this.w = w ;
	this.h = h ;
	//*/
	
	this.e = element ;	//# stack!
	//# stack : this.s = elements ;
}

Tree.Slot = Slot ;



function Search( x = 0 , y = 0 , w = 0 , h = 0 , bbx = 0 , bby = 0 , bbs = 1 , node = null , parentNode = null , parentChild = null ) {
	this.x = x ;
	this.y = y ;
	this.w = w ;
	this.h = h ;

	this.bbx = bbx ;
	this.bby = bby ;
	this.bbs = bbs ;

	this.node = node ;
	this.parentNode = parentNode ;
	this.parentChild = parentChild ;
}

Tree.Search = Search ;



Search.prototype.set = function( x = 0 , y = 0 , w = 0 , h = 0 , bbx = 0 , bby = 0 , bbs = 1 , node = null , parentNode = null , parentChild = null ) {
	this.x = x ;
	this.y = y ;
	this.w = w ;
	this.h = h ;

	this.bbx = bbx ;
	this.bby = bby ;
	this.bbs = bbs ;

	this.node = node ;
	this.parentNode = parentNode ;
	this.parentChild = parentChild ;

	return this ;
} ;



Search.prototype.setFromSearch = function( search ) {
	this.x = search.x ;
	this.y = search.y ;
	this.w = search.w ;
	this.h = search.h ;

	this.bbx = search.bbx ;
	this.bby = search.bby ;
	this.bbs = search.bbs ;

	this.node = search.node ;
	this.parentNode = search.parentNode ;
	this.parentChild = search.parentChild ;

	return this ;
} ;



// Restore modified values when searching the tree recursively
Search.prototype.restore = function( bbx , bby , bbs , node ) {
	this.bbx = bbx ;
	this.bby = bby ;
	this.bbs = bbs ;
	this.node = node ;
	//this.parentNode = parentNode ;
	//this.parentChild = parentChild ;
} ;

Search.prototype.restoreAll = function( bbx , bby , bbs , node , parentNode , parentChild ) {
	this.bbx = bbx ;
	this.bby = bby ;
	this.bbs = bbs ;
	this.node = node ;
	this.parentNode = parentNode ;
	this.parentChild = parentChild ;
} ;



Search.prototype.clone = function() {
	return new Search( this.x , this.y , this.w , this.h , this.bbx , this.bby , this.bbs , this.node , this.parent ) ;
} ;



// Check if the point of the search is in the current BBox
Search.prototype.isPointInBBox = function() {
	// Some are strictly greater/lesser than
	return this.x >= this.bbx && this.x < this.bbx + this.bbs &&
		this.y >= this.bby && this.y < this.bby + this.bbs ;
} ;



// Check if the BBox of the search is overlapping with the current BBox, this is the classic 2D AABB check
Search.prototype.isOverlappingBBox = function() {
	// Some are strictly greater/lesser than
	return this.x + this.w >= this.bbx && this.x < this.bbx + this.bbs &&
		this.y + this.h >= this.bby && this.y < this.bby + this.bbs ;
} ;



// Check if the BBox of the search is fully encompassing the current BBox
Search.prototype.isEncompassingBBox = function() {
	// All are gte/lte
	return this.x <= this.bbx && this.x + this.w >= this.bbx + this.bbs &&
		this.y <= this.bby && this.y + this.h >= this.bby + this.bbs ;
} ;



// Check if there is one side (axis) of the current BBox which is closer than the current search point
Search.prototype.isCloserToBBoxAxisThanSquaredDistance = function( squaredDist ) {
	return ( this.bbx - this.x ) * ( this.bbx - this.x ) < squaredDist ||
		( this.bbx + this.bbs - this.x ) * ( this.bbx + this.bbs - this.x ) < squaredDist ||
		( this.bby - this.y ) * ( this.bby - this.y ) < squaredDist ||
		( this.bby + this.bbs - this.y ) * ( this.bby + this.bbs - this.y ) < squaredDist ;
} ;



// Check if the current BBox is closer than the current search point
Search.prototype.isCloserToBBoxThanSquaredDistance = function( squaredDist ) {
	var cornerX , cornerY ,
		// check if the search is between the X-axis of the BBox, then for the Y-Axis
		betweenX = this.x >= this.bbx && this.x < this.bbx + this.bbs ,
		betweenY = this.y >= this.bby && this.y < this.bby + this.bbs ;

	if ( betweenX ) {
		// If so, it's inside the BBox, so yes
		if ( betweenY ) { return true ; }

		// Only the y-axis distance matter
		return ( this.bby - this.y ) * ( this.bby - this.y ) < squaredDist ||
			( this.bby + this.bbs - this.y ) * ( this.bby + this.bbs - this.y ) < squaredDist ;
	}
	else if ( betweenY ) {
		// Only the x-axis distance matter
		return ( this.bbx - this.x ) * ( this.bbx - this.x ) < squaredDist ||
			( this.bbx + this.bbs - this.x ) * ( this.bbx + this.bbs - this.x ) < squaredDist ;
	}

	// Here the point lie outside the BBox, on the "corner area", so it's the distance to the nearest corner that matter.
	// First we have to determine which corner.
	cornerX = this.x < this.bbx ? this.bbx : this.bbx + this.bbs ;
	cornerY = this.y < this.bby ? this.bby : this.bby + this.bbs ;

	return ( cornerX - this.x ) * ( cornerX - this.x ) + ( cornerY - this.y ) * ( cornerY - this.y ) < squaredDist ;

} ;



// Assume it's already in the BBox
Search.prototype.childIndex = function() {
	var xSplit = this.bbx + this.bbs / 2 ,
		ySplit = this.bby + this.bbs / 2 ;

	return this.y < ySplit ?
		( this.x < xSplit ? BOTTOM_LEFT : BOTTOM_RIGHT ) :
		( this.x < xSplit ? TOP_LEFT : TOP_RIGHT ) ;
} ;



// Octant 0 is between 0° and 45°, octant 1 is between 45° and 90°, and so on...
// It defines the order in which quad should be explored for optimal results.
const OCTANT_CHILD_ORDER = [
	[ TOP_RIGHT , BOTTOM_RIGHT , TOP_LEFT , BOTTOM_LEFT ] ,
	[ TOP_RIGHT , TOP_LEFT , BOTTOM_RIGHT , BOTTOM_LEFT ] ,

	[ TOP_LEFT , TOP_RIGHT , BOTTOM_LEFT , BOTTOM_RIGHT ] ,
	[ TOP_LEFT , BOTTOM_LEFT , TOP_RIGHT , BOTTOM_RIGHT ] ,

	[ BOTTOM_LEFT , TOP_LEFT , BOTTOM_RIGHT , TOP_RIGHT ] ,
	[ BOTTOM_LEFT , BOTTOM_RIGHT , TOP_LEFT , TOP_RIGHT ] ,

	[ BOTTOM_RIGHT , BOTTOM_LEFT , TOP_RIGHT , TOP_LEFT ] ,
	[ BOTTOM_RIGHT , TOP_RIGHT , BOTTOM_LEFT , TOP_LEFT ]
] ;



// For any point (inside OR outside the BBox), define the best order to iterate child
Search.prototype.childIndexOrder = function() {
	var dx = this.x - ( this.bbx + this.bbs / 2 ) ,
		dy = this.y - ( this.bby + this.bbs / 2 ) ,
		octant = ( 8 + Math.floor( Math.atan2( dy , dx ) * 4 / Math.PI ) ) % 8 ;

	return OCTANT_CHILD_ORDER[ octant ] ;
} ;



// Descent into a sub-quad defined by its quad index
Search.prototype.toChild = function( qIndex ) {
	if ( ! this.node || ! this.node.children ) { return false ; }

	// Change the node
	this.parentChild = qIndex ;
	this.parentNode = this.node ;
	this.node = this.node.children[ qIndex ] ;

	// Update the BBox
	this.bbs /= 2 ;
	if ( qIndex & 1 ) { this.bbx += this.bbs ; }
	if ( qIndex & 2 ) { this.bby += this.bbs ; }

	return true ;
} ;

// Like .toChild() but expect node and children, and do not change things that won't be restored anyway (Area search algo)
Search.prototype.fastToChild = function( qIndex ) {
	this.node = this.node.children[ qIndex ] ;
	this.bbs /= 2 ;
	if ( qIndex & 1 ) { this.bbx += this.bbs ; }
	if ( qIndex & 2 ) { this.bby += this.bbs ; }
} ;

Search.prototype.toChildSaveSteps = function( qIndex , searchSteps ) {
	if ( ! this.node || ! this.node.children ) { return false ; }

	// Storing all the steps is required...
	searchSteps[ searchSteps.length ] = this.clone() ;

	// Change the node
	this.parentChild = qIndex ;
	this.parentNode = this.node ;
	this.node = this.node.children[ qIndex ] ;

	// Update the BBox
	this.bbs /= 2 ;
	if ( qIndex & 1 ) { this.bbx += this.bbs ; }
	if ( qIndex & 2 ) { this.bby += this.bbs ; }

	return true ;
} ;



// Ascend up to the parent quad, parentNode and parentChild (index) should be defined.
// Not possible except for one step up: we do not store the complete node ancestry!
//Search.prototype.toParentChild = function() {} ;



Search.prototype.toNextChild = function() {
	return this.toChild( this.childIndex() ) ;
} ;



Search.prototype.toLeaf = function() {
	while ( this.toChild( this.childIndex() ) ) ;
} ;

Search.prototype.toLeafSaveSteps = function( searchSteps ) {
	while ( this.toChildSaveSteps( this.childIndex() , searchSteps ) ) ;
} ;



Search.prototype.recursiveAreaLeaves = function( leaves ) {
	var bbx , bby , bbs , node ;

	if ( ! this.isOverlappingBBox() ) { return ; }

	node = this.node ;
	if ( this.isEncompassingBBox() ) { return node.recursiveAllLeaves( leaves ) ; }

	bbx = this.bbx ;
	bby = this.bby ;
	bbs = this.bbs ;

	if ( ! node.children ) {
		leaves[ leaves.length ] = this.node ;
		return ;
	}

	// Unroll the loop
	if ( node.children[ 0 ] ) { this.fastToChild( 0 ) ; this.recursiveAreaLeaves( leaves ) ; this.restore( bbx , bby , bbs , node ) ; }
	if ( node.children[ 1 ] ) { this.fastToChild( 1 ) ; this.recursiveAreaLeaves( leaves ) ; this.restore( bbx , bby , bbs , node ) ; }
	if ( node.children[ 2 ] ) { this.fastToChild( 2 ) ; this.recursiveAreaLeaves( leaves ) ; this.restore( bbx , bby , bbs , node ) ; }
	if ( node.children[ 3 ] ) { this.fastToChild( 3 ) ; this.recursiveAreaLeaves( leaves ) ; this.restore( bbx , bby , bbs , node ) ; }
} ;



// Same than .recursiveAreaLeaves(), but if nodes have partial children, any missing but matching one are *CREATED*.
// Used for BoundingBox insertion.
// Fn is called for each leaf.
Search.prototype.recursiveAreaCompleteLeavesCB = function( fn ) {
	var bbx , bby , bbs , parentNode , parentChild , node ;

	if ( ! this.isOverlappingBBox() ) { return ; }

	node = this.node ;
	
	if ( ! node ) {
		// The parent node had only partial children, so create the node and exit
		node = this.node = new Node() ;
		this.parentNode.children[ this.parentChild ] = node ;
		fn( this ) ;
		return ;
	}
	
	// Even if encompassing, it still needs almost all the computing except for the overlapping check
	//if ( this.isEncompassingBBox() ) { return node.recursiveCompleteLeavesCB( fn ) ; }

	bbx = this.bbx ;
	bby = this.bby ;
	bbs = this.bbs ;
	parentNode = this.parentNode ;
	parentChild = this.parentChild ;

	if ( ! node.children ) {
		fn( this ) ;
		return ;
	}

	// Unroll the loop
	this.toChild( 0 ) ; this.recursiveAreaCompleteLeavesCB( fn ) ; this.restoreAll( bbx , bby , bbs , node , parentNode , parentChild ) ;
	this.toChild( 1 ) ; this.recursiveAreaCompleteLeavesCB( fn ) ; this.restoreAll( bbx , bby , bbs , node , parentNode , parentChild ) ;
	this.toChild( 2 ) ; this.recursiveAreaCompleteLeavesCB( fn ) ; this.restoreAll( bbx , bby , bbs , node , parentNode , parentChild ) ;
	this.toChild( 3 ) ; this.recursiveAreaCompleteLeavesCB( fn ) ; this.restoreAll( bbx , bby , bbs , node , parentNode , parentChild ) ;
} ;



//Tree.seen = Tree.overlap = Tree.encompass = 0 ;
Search.prototype.recursiveAreaSlots = function( slots ) {
	//Tree.seen ++ ;
	var bbx , bby , bbs , node ;

	if ( ! this.isOverlappingBBox() ) { return ; }

	node = this.node ;
	if ( this.isEncompassingBBox() ) { return node.recursiveAllSlots( slots ) ; }
	//Tree.overlap ++ ;

	bbx = this.bbx ;
	bby = this.bby ;
	bbs = this.bbs ;

	if ( ! node.children ) {
		if ( node.slots ) {
			findPointsInXYWHInSet( node.slots , this.x , this.y , this.w , this.h , slots ) ;
		}

		return ;
	}

	// Unroll the loop
	if ( node.children[ 0 ] ) { this.fastToChild( 0 ) ; this.recursiveAreaSlots( slots ) ; this.restore( bbx , bby , bbs , node ) ; }
	if ( node.children[ 1 ] ) { this.fastToChild( 1 ) ; this.recursiveAreaSlots( slots ) ; this.restore( bbx , bby , bbs , node ) ; }
	if ( node.children[ 2 ] ) { this.fastToChild( 2 ) ; this.recursiveAreaSlots( slots ) ; this.restore( bbx , bby , bbs , node ) ; }
	if ( node.children[ 3 ] ) { this.fastToChild( 3 ) ; this.recursiveAreaSlots( slots ) ; this.restore( bbx , bby , bbs , node ) ; }
} ;



Search.prototype.recursiveAreaElements = function( elements ) {
	var bbx , bby , bbs , node ;

	if ( ! this.isOverlappingBBox() ) { return ; }

	node = this.node ;
	if ( this.isEncompassingBBox() ) { return node.recursiveAllElements( elements ) ; }

	bbx = this.bbx ;
	bby = this.bby ;
	bbs = this.bbs ;

	if ( ! node.children ) {
		if ( this.node.slots ) {
			findPointElementsInXYWHInSet( node.slots , this.x , this.y , this.w , this.h , elements ) ;
		}

		return ;
	}

	// Unroll the loop
	if ( node.children[ 0 ] ) { this.fastToChild( 0 ) ; this.recursiveAreaElements( elements ) ; this.restore( bbx , bby , bbs , node ) ; }
	if ( node.children[ 1 ] ) { this.fastToChild( 1 ) ; this.recursiveAreaElements( elements ) ; this.restore( bbx , bby , bbs , node ) ; }
	if ( node.children[ 2 ] ) { this.fastToChild( 2 ) ; this.recursiveAreaElements( elements ) ; this.restore( bbx , bby , bbs , node ) ; }
	if ( node.children[ 3 ] ) { this.fastToChild( 3 ) ; this.recursiveAreaElements( elements ) ; this.restore( bbx , bby , bbs , node ) ; }
} ;



Tree.prototype.nodeCount = function() {
	return this.trunk.recursiveNodeCount() ;
} ;



Tree.prototype.leafCount = function() {
	return this.trunk.recursiveLeafCount() ;
} ;



const GET_LEAF_SEARCH = new Search() ;

Tree.prototype.getLeaf = function( x , y , search = GET_LEAF_SEARCH ) {
	search.set( x , y , 0 , 0 , this.x , this.y , this.areaSize , this.trunk ).toLeaf() ;
	return search ;
} ;



const GET_SLOT_SEARCH = new Search() ;

Tree.prototype.getSlot = function(
	x , y ,
	//# bbox : w , h ,
	search = GET_SLOT_SEARCH
) {
	search.set( x , y , 0 , 0 , this.x , this.y , this.areaSize , this.trunk ).toLeaf() ;
	if ( ! search.node || ! search.node.slots ) { return ; }
	return findPointsByXYInSet( search.node.slots , x , y ) ;
} ;

Tree.prototype.getSlotSaveSteps = function(
	x , y ,
	//# bbox : w , h ,
	search , searchSteps
) {
	search.set( x , y , 0 , 0 , this.x , this.y , this.areaSize , this.trunk ).toLeafSaveSteps( searchSteps ) ;
	if ( ! search.node || ! search.node.slots ) { return ; }
	return findPointsByXYInSet( search.node.slots , x , y ) ;
} ;



const GET_ONE_SEARCH = new Search() ;

Tree.prototype.getOne = function( x , y , search = GET_ONE_SEARCH ) {
	var slot = this.getSlot( x , y , search ) ;
	if ( ! slot ) { return ; }

	return slot.e ;	//# stack!
	//# stack : return slot.s[ 0 ] ;
} ;



const GET_MANY_SEARCH = new Search() ;

Tree.prototype.getMany = function( x , y , search = GET_MANY_SEARCH ) {
	var slot = this.getSlot( x , y , search ) ;
	if ( ! slot ) { return ; }

	return [ slot.e ] ;	//# stack!
	//# stack : return [ ... slot.s ] ;
} ;



const GET_AREA_LEAVES_SEARCH = new Search() ;

Tree.prototype.getAreaLeaves = function( x , y , w , h , search = GET_AREA_LEAVES_SEARCH ) {
	var leaves = [] ;
	search.set( x , y , w , h , this.x , this.y , this.areaSize , this.trunk ) ;
	search.recursiveAreaLeaves( leaves ) ;
	return leaves ;
} ;



const GET_AREA_SLOTS_SEARCH = new Search() ;

Tree.prototype.getAreaSlots = function( x , y , w , h , search = GET_AREA_SLOTS_SEARCH ) {
	var slots = [] ;
	search.set( x , y , w , h , this.x , this.y , this.areaSize , this.trunk ) ;
	search.recursiveAreaSlots( slots ) ;
	return slots ;
} ;



const GET_AREA_SEARCH = new Search() ;

Tree.prototype.getArea = function( x , y , w , h , search = GET_AREA_SEARCH ) {
	var elements = [] ;
	search.set( x , y , w , h , this.x , this.y , this.areaSize , this.trunk ) ;
	search.recursiveAreaElements( elements ) ;
	return elements ;
} ;



const GET_CLOSEST_SLOT_TO_SEARCH = new Search() ;

// Get the nearest/closest slot
Tree.prototype.getClosestSlotTo = function( x , y , search = GET_CLOSEST_SLOT_TO_SEARCH ) {
	var slot , squaredDist , searchSteps = [] ,
		best = {
			minSquareDist: Infinity ,
			closestSlot: null
		} ;

	search.set( x , y , 0 , 0 , this.x , this.y , this.areaSize , this.trunk ).toLeafSaveSteps( searchSteps ) ;

	// First check if there is anything in the node and if a slot exists and its distance
	if ( search.node && search.node.slots && search.node.slots.size ) {
		for ( slot of search.node.slots ) {
			squaredDist = ( slot.x - x ) * ( slot.x - x ) + ( slot.y - y ) * ( slot.y - y ) ;
			//console.log( "squaredDist" , squaredDist , slot ) ;
			if ( squaredDist < best.minSquareDist ) {
				best.minSquareDist = squaredDist ;
				best.closestSlot = slot ;
			}
		}

		// Ok, we have something, now check if there is no slot outside of this node that could possibly be closest
		if ( ! search.isCloserToBBoxAxisThanSquaredDistance( best.minSquareDist ) ) {
			//console.log( "In da square!" ) ;
			return best.closestSlot ;
		}
	}


	// Now this is the complicated part... Iterate through all siblings and cousins, and so on...

	var depth , ancestorSearch ,
		excludedChild = search.parentChild ;

	for ( depth = searchSteps.length - 1 ; depth >= 0 ; depth -- ) {
		ancestorSearch = searchSteps[ depth ] ;
		this.recursiveClosestSibling( best , ancestorSearch , excludedChild ) ;
		excludedChild = ancestorSearch.parentChild ;
	}

	return best.closestSlot ;
} ;



const GET_CLOSEST_TO_SEARCH = new Search() ;

Tree.prototype.getClosestTo = function( x , y , search = GET_CLOSEST_TO_SEARCH ) {
	var slot = this.getClosestSlotTo( x , y , search ) ;
	if ( ! slot ) { return ; }

	return slot.e ;	//# stack!
	//# stack : return slot.s[ 0 ] ;
} ;



Tree.prototype.recursiveClosestSibling = function( best , fromSearch , excludedChild = null ) {
	var i , qIndex , qIndexOrder , slot , squaredDist ,
		subSearch = new Search() ;

	qIndexOrder = fromSearch.childIndexOrder() ;
	//console.log( "Sub-searching, from:" , fromSearch , qIndexOrder ) ;

	for ( i = 0 ; i < 4 ; i ++ ) {
		qIndex = qIndexOrder[ i ] ;
		if ( qIndex === excludedChild || ! fromSearch.node.children[ qIndex ] ) { continue ; }

		subSearch.setFromSearch( fromSearch ).toChild( qIndex ) ;
		//console.log( "best:" , best , " ; Sub-searching, to:" , subSearch ) ;

		// Note: we know that the searched slot is not inside the node.
		//if ( ! subSearch.isCloserToBBoxAxisThanSquaredDistance( best.minSquareDist ) ) {
		if ( ! subSearch.isCloserToBBoxThanSquaredDistance( best.minSquareDist ) ) {
			// This node and all its children are not closer to the search.
			// Furthermore, since quad indexes are ordered, all its sibling can be skipped too...
			//console.log( "~~~~~~ BBox is farther, cutting other sibling too ~~~~~~" ) ;
			break ;
		}

		//console.log( "########## BBox is a candidate ##########" ) ;

		if ( subSearch.node.children ) {
			//console.log( "=> Recursive" ) ;
			this.recursiveClosestSibling( best , subSearch ) ;
			continue ;
		}

		if ( subSearch.node.slots && subSearch.node.slots.size ) {
			for ( slot of subSearch.node.slots ) {
				squaredDist = ( slot.x - subSearch.x ) * ( slot.x - subSearch.x ) + ( slot.y - subSearch.y ) * ( slot.y - subSearch.y ) ;
				if ( squaredDist < best.minSquareDist ) {
					best.minSquareDist = squaredDist ;
					best.closestSlot = slot ;
				}
			}
		}
	}
} ;



// Search object cache for better perf
const ADD_SEARCH = new Search() ;

Tree.prototype.addPoint = function( x , y , element , search = ADD_SEARCH ) {
	var slot ;

	// We don't add undefined values, because undefined = no value
	if ( element === undefined ) { return ; }

	// There should be some mecanisms for when there is nothing stored, or when everything is stored in the trunk node
	//if ( ! this.trunk.children && ( this.trunk.slots || ! this.trunk.slots.size ) ) {}

	// While out of the trunk BBox, zoom-out the whole tree...
	if ( x < this.x || y < this.y || x >= this.x + this.areaSize || y >= this.y + this.areaSize ) {
		if ( ! this.autoResize ) { return ; }
		this.resizeBBoxFor( x , y ) ;
	}

	search.set( x , y , 0 , 0 , this.x , this.y , this.areaSize , this.trunk ) ;
	search.toLeaf() ;

	if ( ! search.node ) {
		// The parent node has only partial children, so create the node
		search.parentNode.children[ search.parentChild ] = search.node = new Node() ;
	}

	if ( ! search.node.slots ) {
		search.node.slots = new Set() ;
	}
	else if ( ( slot = findPointsByXYInSet( search.node.slots , x , y ) ) ) {
		slot.e = element ;	//# stack!

		/*# stack :
		if ( slot.s ) {
			slot.s[ slot.s.length ] = element ;
		}

		this.size ++ ;
		//*/

		return slot ;
	}

	slot = new Slot( x , y , element ) ;
	search.node.slots.add( slot ) ;
	this.size ++ ;

	if ( search.node.slots.size > this.maxLeafSlots && search.bbs > this.minNodeAreaSize ) {
		this.subdivideNode( search ) ;
	}

	return slot ;
} ;



Tree.prototype.addBoundingBox = function( x , y , w , h , element , search = ADD_SEARCH ) {
	var slot ;

	// We don't add undefined values, because undefined = no value
	if ( element === undefined ) { return ; }

	// There should be some mecanisms for when there is nothing stored, or when everything is stored in the trunk node
	//if ( ! this.trunk.children && ( this.trunk.slots || ! this.trunk.slots.size ) ) {}

	// While out of the trunk BBox, zoom-out the whole tree...
	if ( x < this.x || y < this.y || x + w >= this.x + this.areaSize || y + h >= this.y + this.areaSize ) {
		if ( ! this.autoResize ) { return ; }
// ------------------------------------------------------------- HERE ----------------------------------------------------
		this.resizeBBoxForBBox( x , y , w , h ) ;
	}

	var leaves = [] ;

	search.set( x , y , w , h , this.x , this.y , this.areaSize , this.trunk ) ;

	search.recursiveAreaCompleteLeavesCB( () => {
		var node = search.node ;

		if ( ! node.slots ) {
			node.slots = new Set() ;
		}
		else if ( ( slot = findBBoxByXYWHInSet( search.node.slots , x , y , w , h ) ) ) {
			slot.e = element ;	//# stack!

			/*# stack :
			if ( slot.s ) {
				slot.s[ slot.s.length ] = element ;
			}

			this.size ++ ;
			//*/

			return ;
		}

		slot = new Slot( x , y , w , h , element ) ;
		node.slots.add( slot ) ;
		
		var cx = search.bbx + search.bbs / 2 ,
			cy = search.bby + search.bbs / 2 ;

		if ( cx > x && cx <= x + w && cy > y && cy <= y + h ) {
			// The center of the node is inside the bounding box
			node.centerOverlapCount ++ ;
		}

		if ( node.slots.size - node.centerOverlapCount > this.maxLeafSlots && search.bbs > this.minNodeAreaSize ) {
			this.subdivideNodeForBBox( search ) ;
		}
	} ) ;

	this.size ++ ;

	//return slot ;
} ;



Tree.prototype.add = Tree.prototype.addPoint ;	//# bbox!
//# bbox : Tree.prototype.add = Tree.prototype.addBoundingBox ;



const REMOVE_SLOT_SEARCH = new Search() ;

Tree.prototype.deleteSlot =
Tree.prototype.removeSlot = function( x , y , search = REMOVE_SLOT_SEARCH ) {
	var searchSteps = [] ,
		slot = this.getSlotSaveSteps( x , y , search , searchSteps ) ;

	if ( ! slot ) { return false ; }

	// Adjust the size
	this.size -- ;	//# stack!
	//# stack : this.size -= slot.s.length ;

	search.node.slots.delete( slot ) ;

	//searchSteps.push( search ) ;	// ?
	if ( searchSteps.length ) {
		this.mergeNodes( searchSteps ) ;
	}

	return true ;
} ;



const REMOVE_ELEMENT_SEARCH = new Search() ;

// Instead of removing a slot, it removes an element existing in the specified coordinate
Tree.prototype.deleteElement =
Tree.prototype.removeElement = function( x , y , element , search = REMOVE_ELEMENT_SEARCH ) {
	var deletedCount = 0 , slot , searchSteps = [] ;

	if ( element === undefined ) { return 0 ; }

	slot = this.getSlotSaveSteps( x , y , search , searchSteps ) ;

	if ( ! slot ) { return 0 ; }

	//*# stack!
	if ( slot.e === element ) {
		deletedCount = 1 ;
		this.size -- ;
		search.node.slots.delete( slot ) ;
	}
	else {
		return 0 ;
	}
	//*/
	
	/*# stack :
	deletedCount = arrayKit.deleteValue( slot.s , element ) ;
	this.size -= deletedCount ;
	if ( slot.s.length ) { return deletedCount ; }
	search.node.slots.delete( slot ) ;
	//*/
	

	if ( searchSteps.length ) {
		this.mergeNodes( searchSteps ) ;
	}

	return deletedCount ;
} ;



// We assume that x,y is already out of bounds
Tree.prototype.resizeBBoxFor = function( x , y ) {
	if ( this.trunk.children || ( this.trunk.slots && this.trunk.slots.size ) ) {
		// There are already elements, so we will just create a super node replacing the trunk
		do {
			this.superNodeToward( x , y ) ;
		} while ( x < this.x || x >= this.x + this.areaSize || y < this.y || y >= this.y + this.areaSize ) ;

		return ;
	}

	// No content already, just adjust the trunk for the element to be inserted
	this.translateBBoxTo( x , y ) ;
} ;



// We assume that x,y is already out of bounds
Tree.prototype.translateBBoxTo = function( x , y ) {
	this.x += Math.floor( ( x - this.x ) / this.areaSize ) * this.areaSize ;
	this.y += Math.floor( ( y - this.y ) / this.areaSize ) * this.areaSize ;
} ;



// Create a new trunk having current trunk as one quad-child, do it for a specific direction
Tree.prototype.superNodeToward = function( x , y ) {
	var qIndex ,
		newTrunc = new Node() ,
		xSplit = this.x + this.areaSize / 2 ,
		ySplit = this.y + this.areaSize / 2 ;

	// Note that we are doing the REVERSE of .childIndex()
	if ( y < ySplit ) {
		this.y -= this.areaSize ;

		if ( x < xSplit ) {
			qIndex = TOP_RIGHT ;
			this.x -= this.areaSize ;
		}
		else {
			qIndex = TOP_LEFT ;
		}
	}
	else if ( x < xSplit ) {
		qIndex = BOTTOM_RIGHT ;
		this.x -= this.areaSize ;
	}
	else {
		qIndex = BOTTOM_LEFT ;
	}

	newTrunc.children = [ null , null , null , null ] ;
	newTrunc.children[ qIndex ] = this.trunk ;
	this.trunk = newTrunc ;
	this.areaSize *= 2 ;
} ;



// Subdivide a node, if necessary
Tree.prototype.subdivideNode = function( search ) {
	if ( search.node.slots.size <= this.maxLeafSlots && search.bbs > this.minNodeAreaSize ) {
		return ;
	}

	var i , slot , qIndex , children , child , searchChild ,
		node = search.node ;

	children = node.children = [ null , null , null , null ] ;

	for ( slot of node.slots ) {
		search.x = slot.x ;
		search.y = slot.y ;
		qIndex = search.childIndex() ;

		if ( ! children[ qIndex ] ) { children[ qIndex ] = new Node() ; }
		child = children[ qIndex ] ;

		if ( ! child.slots ) { child.slots = new Set() ; }
		child.slots.add( slot ) ;
	}

	// Which is better? Clearing the Set can go easier on the GC when things change constantly,
	// but unsetting it free more memory.
	//node.slots.clear() ;
	node.slots = null ;

	// Check if we can subdivide those new children
	if ( search.bbs / 2 <= this.minNodeAreaSize ) { return ; }

	for ( i = 0 ; i < 4 ; i ++ ) {
		child = children[ i ] ;

		if ( child && child.slots && child.slots.size > this.maxLeafSlots ) {
			searchChild = search.clone() ;
			searchChild.toChild( i ) ;
			this.subdivideNode( searchChild ) ;
		}
	}
} ;



// Subdivide a node, if necessary
Tree.prototype.subdivideNodeForBBox = function( search ) {
	if ( search.node.slots.size - search.node.centerOverlapCount <= this.maxLeafSlots && search.bbs > this.minNodeAreaSize ) {
		return ;
	}

	var i , slot , qIndex , children , child , searchChild ,
		node = search.node ;

	node.centerOverlapCount = 0 ;
	children = node.children = [ null , null , null , null ] ;

	for ( slot of node.slots ) {
		// /!\ Optimization?
		searchChild = search.clone() ;
		searchChild.x = slot.x ;
		searchChild.y = slot.y ;
		searchChild.w = slot.w ;
		searchChild.h = slot.h ;
		
		searchChild.recursiveAreaCompleteLeavesCB( () => {
			if ( ! searchChild.node.slots ) { searchChild.node.slots = new Set() ; }

			searchChild.node.slots.add( slot ) ;
			
			var cx = searchChild.bbx + searchChild.bbs / 2 ,
				cy = searchChild.bby + searchChild.bbs / 2 ;

			if ( cx > slot.x && cx <= slot.x + slot.w && cy > slot.y && cy <= slot.y + slot.h ) {
				// The center of the node is inside the bounding box
				searchChild.node.centerOverlapCount ++ ;
			}
		} ) ;
	}

	// Which is better? Clearing the Set can go easier on the GC when things change constantly,
	// but unsetting it free more memory.
	//node.slots.clear() ;
	node.slots = null ;

	// Check if we can subdivide those new children
	if ( search.bbs / 2 <= this.minNodeAreaSize ) { return ; }

	for ( i = 0 ; i < 4 ; i ++ ) {
		child = children[ i ] ;

		if ( child && child.slots && child.slots.size > this.maxLeafSlots ) {
			// /!\ Optimization?
			searchChild = search.clone() ;
			searchChild.toChild( i ) ;
			this.subdivideNode( searchChild ) ;
		}
	}
} ;



// Join nodes, if necessary
Tree.prototype.mergeNodes = function( searchSteps ) {
	var search , i , j , child , hasGrandChild , count , node , slot ;

	i = searchSteps.length ;

	while ( i -- ) {
		search = searchSteps[ i ] ;
		node = search.node ;

		// We search a node that have children but not grand-children, which children (leaves) with not enough slots
		if ( ! node.children ) { continue ; }

		hasGrandChild = false ;
		count = 0 ;
		for ( j = 0 ; j < 4 ; j ++ ) {
			child = node.children[ j ] ;
			//console.log( "child #" + j + ":" , child ) ;
			if ( ! child ) { continue ; }
			if ( child.children ) { hasGrandChild = true ; break ; }
			if ( child.slots ) { count += child.slots.size ; }
		}
		//console.log( "hasGrandChild:" , hasGrandChild , "count:" , count , "debug node:" ) ; this.debug( node ) ;

		// We break, if this node have a grand-child, so do the parent.
		// And if there is no merge, the parent will have grand-child.
		if ( hasGrandChild || count >= this.minChildrenSlots ) { break ; }
		//console.log( "Merge!" ) ;

		node.slots = new Set() ;

		for ( j = 0 ; j < 4 ; j ++ ) {
			child = node.children[ j ] ;
			if ( ! child ) { continue ; }
			if ( child.slots ) {
				for ( slot of child.slots ) {
					node.slots.add( slot ) ;
				}
				//child.slots.clear() ;
				//child.slots = null ;
			}
		}

		node.children = null ;
		//console.log( "AFT node:" ) ; this.debug( node ) ; console.log( "\n\n" ) ;
	}
} ;



/*
	Iterator and array-like.
*/



Tree.prototype.values = function *( node = this.trunk ) {
	if ( node.children ) {
		for ( let i = 0 ; i < 4 ; i ++ ) {
			// Recursive yield
			if ( node.children[ i ] ) { yield * this.values( node.children[ i ] ) ; }
		}
	}
	else {
		for ( let slot of node.slots ) {
			yield slot.e ;	//# stack!
			//# stack : yield * slot.s.values() ;
		}
	}
} ;



Tree.prototype.entries = function *( node = this.trunk ) {
	if ( node.children ) {
		for ( let i = 0 ; i < 4 ; i ++ ) {
			// Recursive yield
			if ( node.children[ i ] ) { yield * this.entries( node.children[ i ] ) ; }
		}
	}
	else {
		for ( let slot of node.slots ) {
			yield [ { x: slot.x , y: slot.y } , slot.e ] ;	//# stack!
			/*# stack :
			for ( let value of slot.s ) {
				yield [ { x: slot.x , y: slot.y } , value ] ;
			}
			//*/
		}
	}
} ;

Tree.prototype[Symbol.iterator] = Tree.prototype.entries ;



// Return keys, do not return the same key twice, even if there is multiple values on the same key
Tree.prototype.keys = function *( node = this.trunk ) {
	if ( node.children ) {
		for ( let i = 0 ; i < 4 ; i ++ ) {
			// Recursive yield
			if ( node.children[ i ] ) { yield * this.keys( node.children[ i ] ) ; }
		}
	}
	else {
		for ( let slot of node.slots ) {
			yield { x: slot.x , y: slot.y } ;
		}
	}
} ;



/*
	Set utilities.
*/



function findInSet( set_ , fn ) {
	var element ;

	for ( element of set_ ) {
		if ( fn( element ) ) { return element ; }
	}
}

function findPointsByXYInSet( set_ , x , y ) {
	var element ;

	for ( element of set_ ) {
		if ( element.x === x && element.y === y ) { return element ; }
	}
}

function findPointsInXYWHInSet( set_ , x , y , w , h , array = [] ) {
	var element ;

	for ( element of set_ ) {
		if ( element.x >= x && element.x <= x + w && element.y >= y && element.y <= y + h ) {
			array[ array.length ] = element ;
		}
	}

	return array ;
}

// Same than findPointsInXYWHInSet, but assume it's a Set of slots and populate an array of elements
function findPointElementsInXYWHInSet( slots , x , y , w , h , elements ) {
	var slot ;

	for ( slot of slots ) {
		if ( slot.x >= x && slot.x <= x + w && slot.y >= y && slot.y <= y + h ) {
			elements[ elements.length ] = slot.e ;	//# stack!
			/*# stack :
			for ( let i = 0 , iMax = slot.s.length ; i < iMax ; i ++ ) {
				elements[ elements.length ] = slot.s[ i ] ;
			}
			//*/
		}
	}
}

function findBBoxByXYWHInSet( set_ , x , y , w , h ) {
	var element ;

	for ( element of set_ ) {
		if ( element.x === x && element.y === y && element.w === w && element.h === h ) { return element ; }
	}
}



/*
	Debug stuffs
*/



const util = require( 'util' ) ;

Tree.prototype.debug = function( node = this.trunk , spaces = 0 , prefix = '━' , showValue = false ) {
	var i , iMax , str , slot ,
		nextSpaces = spaces + 5 ;

	if ( ! node.children ) {
		if ( ! node.slots || ! node.slots.size ) {
			str = ' '.repeat( spaces ) + prefix + ' (empty)' ;
			console.log( str ) ;
			return ;
		}

		i = -1 ;
		iMax = node.slots.size ;
		for ( slot of node.slots ) {
			i ++ ;
			str = ' '.repeat( spaces ) ;
			str += i === Math.floor( ( iMax - 1 ) / 2 ) ? prefix + ' ' : ' '.repeat( 1 + prefix.length ) ;

			str += 'x:' + slot.x + ' y:' + slot.y ;
			//# bbox : str += ' w:' + slot.w + ' h:' + slot.h ;

			if ( showValue ) {
				str += ' => ' + util.inspect( slot.e ) ;	//# stack !
				//# stack : str += ' => ' + util.inspect( slot.s ) ;
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

Tree.prototype.debugValues = function() { return this.debug( this.trunk , 0 , '━' , true ) ; } ;

