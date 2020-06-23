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
	This is a sort of Quad tree, splitting space in equal square region.
	Content (points) are only stored in leaves, which are region of predictible size.
	The splitting point is never a content point and is always in the middle of the parent node.
	It is effective for dynamic objects, for effective area search of (more or less) constant size,
	it does not require balancing, ideal for 2D games.
	The structure is light-weight, because the bounding box of node are implicit.
	Each node only got a Set of points (for leaves) or an array of 4 pointers to each child.

	Options:
		minSquareSize `number` the min size of a node, should be a power of 2 like 1, 2, 4, or 0.5, 0.25, 0.125, ...
			No subdivision will occur below that size
		maxLeafPoints `number` above this number of points, the leaf will become a node with 4 child leaves (except if its size
			is already the min square size)
		minLeafPoints `number` below this number of points, the leaf will trigger the join-leaves mecanism
		minChildrenPoints `number` a node may merge all its children leaves and become the leaf itself if the sum of the points
			of all its direct children leaves is below this number
		x,y `number` the initial lower limit of the bounding box, should be a multiple of minSquareSize
		size `number` the initial side size of the bounding box, should be a power of 2 and greater than or equals to minSquareSize
*/

function QuadTree( options = {} ) {
	this.minSquareSize = options.minSquareSize || 1 / 1024 ;
	this.maxLeafPoints = options.maxLeafPoints || 16 ;
	this.minLeafPoints = options.minLeafPoints || Math.floor( options.maxLeafPoints / 8 ) || 1 ;
	this.minChildrenPoints = options.minChildrenPoints || Math.floor( options.maxLeafPoints / 4 ) || 1 ;
	
	this.x = options.x || 0 ;
	this.y = options.y || 0 ;
	this.size = options.size || 1 ;

	this.trunc = new Node() ;
	this.trunc.points = new Set() ;
}

module.exports = QuadTree ;



function Node() {
	this.points = null ;
	this.children = null ;
}

QuadTree.Node = Node ;



Node.prototype.recursiveAllPoints = function( points ) {
	var i , element ;

	if ( ! this.children ) {
		if ( this.points ) {
			// Don't use points.push( ... this.points ), it's way slower especially for big sets
			for ( element of this.points ) { points[ points.length ] = element ; }
		}

		return ;
	}

	/*
	for ( i = 0 ; i < 4 ; i ++ ) {
		if ( this.children[ i ] ) { this.children[ i ].recursiveAllPoints( points ) ; }
	}
	//*/

	//*	Unroll the loop for better perf
	if ( this.children[ 0 ] ) { this.children[ 0 ].recursiveAllPoints( points ) ; }
	if ( this.children[ 1 ] ) { this.children[ 1 ].recursiveAllPoints( points ) ; }
	if ( this.children[ 2 ] ) { this.children[ 2 ].recursiveAllPoints( points ) ; }
	if ( this.children[ 3 ] ) { this.children[ 3 ].recursiveAllPoints( points ) ; }
	//*/
} ;



const BOTTOM_LEFT = 0 ;
const BOTTOM_RIGHT = 1 ;
const TOP_LEFT = 2 ;
const TOP_RIGHT = 3 ;



function Point( x , y , element ) {
	this.x = x ;
	this.y = y ;
	this.e = element ;
}

QuadTree.Point = Point ;



class Stack extends Array {}
QuadTree.Stack = Stack ;



function Search( x = 0 , y = 0 , w = 0 , h = 0 , bbx = 0 , bby = 0 , bbs = 1 , node = null , parentNode = null , parentQuad = null ) {
	this.x = x ;
	this.y = y ;
	this.w = w ;
	this.h = h ;

	this.bbx = bbx ;
	this.bby = bby ;
	this.bbs = bbs ;

	this.node = node ;
	this.parentNode = parentNode ;
	this.parentQuad = parentQuad ;
}

QuadTree.Search = Search ;



Search.prototype.set = function( x = 0 , y = 0 , w = 0 , h = 0 , bbx = 0 , bby = 0 , bbs = 1 , node = null , parentNode = null , parentQuad = null ) {
	this.x = x ;
	this.y = y ;
	this.w = w ;
	this.h = h ;

	this.bbx = bbx ;
	this.bby = bby ;
	this.bbs = bbs ;

	this.node = node ;
	this.parentNode = parentNode ;
	this.parentQuad = parentQuad ;

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
	this.parentQuad = search.parentQuad ;

	return this ;
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
	else {
		// Here the point lie outside the BBox, on the "corner area", so it's the distance to the nearest corner that matter.
		// First we have to determine which corner.
		cornerX = this.x < this.bbx ? this.bbx : this.bbx + this.bbs ;
		cornerY = this.y < this.bby ? this.bby : this.bby + this.bbs ;

		return ( cornerX - this.x ) * ( cornerX - this.x ) + ( cornerY - this.y ) * ( cornerY - this.y ) < squaredDist ;
	}
} ;



// Assume it's already in the BBox
Search.prototype.subQuadIndex = function() {
	var xSplit = this.bbx + this.bbs / 2 ,
		ySplit = this.bby + this.bbs / 2 ;
	
	return this.y < ySplit ?
		( this.x < xSplit ? BOTTOM_LEFT : BOTTOM_RIGHT ) :
		( this.x < xSplit ? TOP_LEFT : TOP_RIGHT ) ;
} ;



// Octant 0 is between 0° and 45°, octant 1 is between 45° and 90°, and so on...
// It defines the order in which quad should be explored for optimal results.
const OCTANT_QUAD_ORDER = [
	[ TOP_RIGHT , BOTTOM_RIGHT , TOP_LEFT , BOTTOM_LEFT ] ,
	[ TOP_RIGHT , TOP_LEFT , BOTTOM_RIGHT , BOTTOM_LEFT ] ,

	[ TOP_LEFT , TOP_RIGHT , BOTTOM_LEFT , BOTTOM_RIGHT ] ,
	[ TOP_LEFT , BOTTOM_LEFT , TOP_RIGHT , BOTTOM_RIGHT ] ,

	[ BOTTOM_LEFT , TOP_LEFT , BOTTOM_RIGHT , TOP_RIGHT ] ,
	[ BOTTOM_LEFT , BOTTOM_RIGHT , TOP_LEFT , TOP_RIGHT ] ,

	[ BOTTOM_RIGHT , BOTTOM_LEFT , TOP_RIGHT , TOP_LEFT ] ,
	[ BOTTOM_RIGHT , TOP_RIGHT , BOTTOM_LEFT , TOP_LEFT ]
] ;



// For any point (inside OR outside the BBox), define the best order to iterate subQuad
Search.prototype.subQuadIndexOrder = function() {
	var dx = this.x - ( this.bbx + this.bbs / 2 ) ,
		dy = this.y - ( this.bby + this.bbs / 2 ) ,
		octant = ( 8 + Math.floor( Math.atan2( dy ,dx ) * 4 / Math.PI ) ) % 8 ;

	return OCTANT_QUAD_ORDER[ octant ] ;
} ;



// Descent into a sub-quad defined by its quad index
Search.prototype.toSubQuad = function( qIndex , searchSteps = null ) {
	if ( ! this.node || ! this.node.children ) { return false ; }

	// If storing all the steps is required...
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



// Ascend up to the parent quad, parentNode and parentQuad (index) should be defined.
// Not possible except for one step up: we do not store the complete node ancestry!
//Search.prototype.toParentQuad = function() {} ;



Search.prototype.toNextSubQuad = function( searchSteps = null ) {
	return this.toSubQuad( this.subQuadIndex() , searchSteps ) ;
} ;



Search.prototype.toLeaf = function( searchSteps = null ) {
	while ( this.toSubQuad( this.subQuadIndex() , searchSteps ) ) ;
} ;



// DEPRECATED?
Search.prototype.recursiveOverlappingLeaves = function( searchLeaves = [] ) {
	var i , subSearch ;

	if ( ! this.isOverlappingBBox() ) { return searchLeaves ; }
	//if ( this.isEncompassingBBox() ) { i = 1 ; }

	if ( ! this.node.children ) {
		searchLeaves.push( this ) ;
		return searchLeaves ;
	}

	for ( i = 0 ; i < 4 ; i ++ ) {
		if ( ! this.node.children[ i ] ) { continue ; }
		subSearch = this.clone() ;
		subSearch.toSubQuad( i ) ;
		subSearch.recursiveOverlappingLeaves( searchLeaves ) ;
	}

	return searchLeaves ;
} ;



Search.prototype.recursiveAreaPoints = function( points ) {
	var i , subSearch ;

	if ( ! this.isOverlappingBBox() ) { return ; }
	if ( this.isEncompassingBBox() ) { return this.node.recursiveAllPoints( points ) ; }

	if ( ! this.node.children ) {
		if ( this.node.points ) {
			findXYWHInSet( this.node.points , this.x , this.y , this.w , this.h , points ) ;
		}

		return ;
	}

	for ( i = 0 ; i < 4 ; i ++ ) {
		if ( ! this.node.children[ i ] ) { continue ; }
		subSearch = this.clone() ;
		subSearch.toSubQuad( i ) ;
		subSearch.recursiveAreaPoints( points ) ;
	}
} ;



const GET_LEAF_SEARCH = new Search() ;

QuadTree.prototype.getLeaf = function( x , y , search = GET_LEAF_SEARCH , searchSteps = null ) {
	search.set( x , y , 0 , 0 , this.x , this.y , this.size , this.trunc ).toLeaf( searchSteps ) ;
	return search ;
} ;



const GET_AREA_LEAVES_SEARCH = new Search() ;

QuadTree.prototype.getAreaLeaves = function( x , y , w , h , search = GET_AREA_LEAVES_SEARCH ) {
	search.set( x , y , w , h , this.x , this.y , this.size , this.trunc ) ;
	return search.recursiveOverlappingLeaves() ;
} ;



const GET_POINT_SEARCH = new Search() ;

QuadTree.prototype.getPoint = function( x , y , search = GET_POINT_SEARCH , searchSteps = null ) {
	search.set( x , y , 0 , 0 , this.x , this.y , this.size , this.trunc ).toLeaf( searchSteps ) ;
	if ( ! search.node || ! search.node.points ) { return ; }
	return findXYInSet( search.node.points , x , y ) ;
} ;



const GET_ONE_SEARCH = new Search() ;

QuadTree.prototype.getOne = function( x , y , search = GET_ONE_SEARCH ) {
	var point = this.getPoint( x , y , search ) ;
	if ( ! point ) { return ; }
	return point.e instanceof Stack ? point.e[ 0 ] : point.e ;
} ;



const GET_MANY_SEARCH = new Search() ;

QuadTree.prototype.getMany = function( x , y , search = GET_MANY_SEARCH ) {
	var point = this.getPoint( x , y , search ) ;
	if ( ! point ) { return ; }
	return point.e instanceof Stack ? [ ... point.e ] : [ point.e ] ;
} ;



const GET_CLOSEST_TO_SEARCH = new Search() ;

QuadTree.prototype.getClosestTo = function( x , y , search = GET_CLOSEST_TO_SEARCH ) {
	var point = this.getClosestPointTo( x , y , search ) ;
	if ( ! point ) { return ; }
	return point.e instanceof Stack ? point.e[ 0 ] : point.e ;
} ;



const GET_AREA_SEARCH = new Search() ;

QuadTree.prototype.getArea = function( x , y , w , h , search = GET_AREA_SEARCH ) {
	var i , iMax , elements = [] , point ,
		points = this.getAreaPoints( x , y , w , h , search ) ;

	for ( i = 0 , iMax = points.length ; i < iMax ; i ++ ) {
		point = points[ i ] ;
		if ( point.e instanceof Stack ) { elements.push( ... point.e ) ; }
		else { elements.push( point.e ) ; }
	}

	return elements ;
} ;



const GET_AREA_POINTS_SEARCH = new Search() ;

QuadTree.prototype.getAreaPoints = function( x , y , w , h , search = GET_AREA_POINTS_SEARCH ) {
	var points = [] ;
	search.set( x , y , w , h , this.x , this.y , this.size , this.trunc ) ;
	search.recursiveAreaPoints( points ) ;
	return points ;
} ;



const GET_CLOSEST_POINT_SEARCH = new Search() ;

// Get the nearest/closest point 
QuadTree.prototype.getClosestPointTo = function( x , y , search = GET_CLOSEST_POINT_SEARCH ) {
	var point , squaredDist , searchSteps = [] ,
		best = {
			minSquareDist: Infinity ,
			closestPoint: null
		} ;

	search.set( x , y , 0 , 0 , this.x , this.y , this.size , this.trunc ).toLeaf( searchSteps ) ;

	// First check if there is anything in the node and if a point exists and its distance
	if ( search.node && search.node.points && search.node.points.size ) {
		for ( point of search.node.points ) {
			squaredDist = ( point.x - x ) * ( point.x - x ) + ( point.y - y ) * ( point.y - y ) ;
			console.log( "squaredDist" , squaredDist , point ) ;
			if ( squaredDist < best.minSquareDist ) {
				best.minSquareDist = squaredDist ;
				best.closestPoint = point ;
			}
		}
		
		// Ok, we have something, now check if there is no point outside of this node that could possibly be closest
		if ( ! search.isCloserToBBoxAxisThanSquaredDistance( best.minSquareDist ) ) {
			console.log( "In da square!" ) ;
			return best.closestPoint ;
		}
	}


	// Now this is the complicated part... Iterate through all siblings and cousins, and so on...
	
	var depth , ancestorSearch ,
		excludedQuad = search.parentQuad ;

	for ( depth = searchSteps.length - 1 ; depth >= 0 ; depth -- ) {
		ancestorSearch = searchSteps[ depth ] ;
		this.recursiveClosestSibling( best , ancestorSearch , excludedQuad ) ;
		excludedQuad = ancestorSearch.parentQuad ;
	}

	return best.closestPoint ;
} ;



QuadTree.prototype.recursiveClosestSibling = function( best , fromSearch , excludedQuad = null ) {
	var i , qIndex , qIndexOrder , point , squaredDist ,
		subSearch = new Search() ;

	qIndexOrder = fromSearch.subQuadIndexOrder() ;
	console.log( "Sub-searching, from:" , fromSearch , qIndexOrder ) ;

	for ( i = 0 ; i < 4 ; i ++ ) {
		qIndex = qIndexOrder[ i ] ;
		if ( qIndex === excludedQuad || ! fromSearch.node.children[ qIndex ] ) { continue ; }

		subSearch.setFromSearch( fromSearch ).toSubQuad( qIndex ) ;
		console.log( "best:" , best , " ; Sub-searching, to:" , subSearch ) ;
		
		// Note: we know that the searched point is not inside the node.
		//if ( ! subSearch.isCloserToBBoxAxisThanSquaredDistance( best.minSquareDist ) ) {
		if ( ! subSearch.isCloserToBBoxThanSquaredDistance( best.minSquareDist ) ) {
			// This node and all its children are not closer to the search.
			// Furthermore, since quad indexes are ordered, all its sibling can be skipped too...
			console.log( "~~~~~~ BBox is farther, cutting other sibling too ~~~~~~" ) ;
			break ;
		}

		console.log( "########## BBox is a candidate ##########" ) ;

		if ( subSearch.node.children ) {
			console.log( "=> Recursive" ) ;
			this.recursiveClosestSibling( best , subSearch ) ;
			continue ;
		}

		if ( subSearch.node.points && subSearch.node.points.size ) {
			for ( point of subSearch.node.points ) {
				squaredDist = ( point.x - subSearch.x ) * ( point.x - subSearch.x ) + ( point.y - subSearch.y ) * ( point.y - subSearch.y ) ;
				if ( squaredDist < best.minSquareDist ) {
					best.minSquareDist = squaredDist ;
					best.closestPoint = point ;
				}
			}
		}
	}
} ;



// Search object cache for better perf
const ADD_SEARCH = new Search() ;

QuadTree.prototype.add = function( x , y , element , search = ADD_SEARCH ) {
	var point , existingElement ;
	
	search.set( x , y , 0 , 0 , this.x , this.y , this.size , this.trunc ) ;

	if ( ! search.isPointInBBox() ) {
		// TODO...
		this.resize() ;
	}

	search.toLeaf() ;

	if ( ! search.node ) {
		// The parent node has only partial children, so create the node
		search.parentNode.children[ search.parentQuad ] = search.node = new Node() ;
	}

	if ( ! search.node.points ) {
		search.node.points = new Set() ;
	}
	else if ( ( point = findXYInSet( search.node.points , x , y ) ) ) {
		if ( point.e instanceof Stack ) {
			point.e.push( element ) ;
		}
		else if ( point.e !== undefined ) {
			existingElement = point.e ;
			point.e = new Stack() ;
			point.e.push( existingElement , element ) ;
		}
		else {
			point.e = element ;
		}
		
		return point ;
	}

	point = new Point( x , y , element ) ;
	search.node.points.add( point ) ;

	if ( search.node.points.size > this.maxLeafPoints && search.bbs > this.minSquareSize ) {
		this.subdivideNode( search ) ;
	}

	return point ;
} ;



const REMOVE_POINT_SEARCH = new Search() ;

QuadTree.prototype.deletePoint =
QuadTree.prototype.removePoint = function( x , y , search = REMOVE_POINT_SEARCH ) {
	var searchSteps = [] ,
		point = this.getPoint( x , y , search , searchSteps ) ;

	if ( ! point ) { return false ; }

	search.node.points.delete( point ) ;

	//searchSteps.push( search ) ;	// ?
	if ( searchSteps.length ) {
		this.mergeNodes( searchSteps ) ;
	}

	return true ;
} ;



const REMOVE_ELEMENT_SEARCH = new Search() ;

// Instead of removing a point, it removes an element existing in the specified coordinate
QuadTree.prototype.deleteElement =
QuadTree.prototype.removeElement = function( x , y , element , search = REMOVE_ELEMENT_SEARCH ) {
	var length , searchSteps = [] ,
		point = this.getPoint( x , y , search , searchSteps ) ;

	if ( ! point ) { return false ; }

	if ( point.e instanceof Stack ) {
		length = point.e.length ;
		arrayKit.deleteValue( point.e , element ) ;
		if ( point.e.length ) { return length !== point.e.length ; }
		search.node.points.delete( point ) ;
	}
	else if ( point.e === element ) {
		search.node.points.delete( point ) ;
	}
	else {
		return false ;
	}

	if ( searchSteps.length ) {
		this.mergeNodes( searchSteps ) ;
	}

	return true ;
} ;



// Subdivide a node, if necessary
QuadTree.prototype.subdivideNode = function( search ) {
	if ( search.node.points.size <= this.maxLeafPoints && search.bbs > this.minSquareSize ) { return ; }

	var i , point , qIndex , children , child , searchChild ,
		node = search.node ;

	//children = node.children = [ new Node() , new Node() , new Node() , new Node() ] ;
	children = node.children = [ null , null , null , null ] ;

	for ( point of node.points ) {
		search.x = point.x ;
		search.y = point.y ;
		qIndex = search.subQuadIndex() ;

		if ( ! children[ qIndex ] ) { children[ qIndex ] = new Node() ; }
		child = children[ qIndex ] ;

		if ( ! child.points ) { child.points = new Set() ; }
		child.points.add( point ) ;
	}

	// Which is better? Clearing the Set can go easier on the GC when things change constantly,
	// but unsetting it free more memory.
	//node.points.clear() ;
	node.points = null ;

	// Check if we can subdivide those new children
	if ( search.bbs / 2 <= this.minSquareSize ) { return ; }

	for ( i = 0 ; i < 4 ; i ++ ) {
		child = children[ i ] ;

		if ( child && child.points && child.points.size > this.maxLeafPoints ) {
			searchChild = search.clone() ;
			searchChild.toSubQuad( i ) ;
			this.subdivideNode( searchChild ) ;
		}
	}
} ;



// Join nodes, if necessary
QuadTree.prototype.mergeNodes = function( searchSteps ) {
	var search , i , j , child , hasGrandChild , count , node , point ;

	i = searchSteps.length ;

	while ( i -- ) {
		search = searchSteps[ i ] ;
		node = search.node ;
		
		// We search a node that have children but not grand-children, which children (leaves) with not enough points
		if ( ! node.children ) { continue ; }
		
		hasGrandChild = false ;
		count = 0 ;
		for ( j = 0 ; j < 4 ; j ++ ) {
			child = node.children[ j ] ;
			//console.log( "child #" + j + ":" , child ) ;
			if ( ! child ) { continue ; }
			if ( child.children ) { hasGrandChild = true ; break ; }
			if ( child.points ) { count += child.points.size ; }
		}
		//console.log( "hasGrandChild:" , hasGrandChild , "count:" , count , "debug node:" ) ; this.debug( node ) ;

		// We break, if this node have a grand-child, so do the parent.
		// And if there is no merge, the parent will have grand-child.
		if ( hasGrandChild || count >= this.minChildrenPoints ) { break ; }
		//console.log( "Merge!" ) ;

		node.points = new Set() ;

		for ( j = 0 ; j < 4 ; j ++ ) {
			child = node.children[ j ] ;
			if ( ! child ) { continue ; }
			if ( child.points ) {
				for ( point of child.points ) {
					node.points.add( point ) ;
				}
				//child.points.clear() ;
				//child.points = null ;
			}
		}
		
		node.children = null ;
		//console.log( "AFT node:" ) ; this.debug( node ) ; console.log( "\n\n" ) ;
	}
} ;



/*
	Iterator and array-like.
*/



QuadTree.prototype.values = function *( node = this.trunc ) {
	if ( node.children ) {
		for ( let i = 0 ; i < 4 ; i ++ ) {
			// Recursive yield
			if ( node.children[ i ] ) { yield * this.values( node.children[ i ] ) ; }
		}
	}
	else {
		for ( let point of node.points ) {
			if ( point.e instanceof Stack ) {
				yield * point.e.values() ;
			}
			else {
				yield point.e ;
			}
		}
	}
} ;



QuadTree.prototype.entries = function *( node = this.trunc ) {
	if ( node.children ) {
		for ( let i = 0 ; i < 4 ; i ++ ) {
			// Recursive yield
			if ( node.children[ i ] ) { yield * this.entries( node.children[ i ] ) ; }
		}
	}
	else {
		for ( let point of node.points ) {
			if ( point.e instanceof Stack ) {
				for ( let value of point.e ) {
					yield [ { x: point.x , y: point.y } , value ] ;
				}
			}
			else {
				yield [ { x: point.x , y: point.y } , point.e ] ;
			}
		}
	}
} ;

QuadTree.prototype[Symbol.iterator] = QuadTree.prototype.entries ;



// Return keys, do not return the same key twice, even if there is multiple values on the same key
QuadTree.prototype.keys = function *( node = this.trunc ) {
	if ( node.children ) {
		for ( let i = 0 ; i < 4 ; i ++ ) {
			// Recursive yield
			if ( node.children[ i ] ) { yield * this.keys( node.children[ i ] ) ; }
		}
	}
	else {
		for ( let point of node.points ) {
			yield { x: point.x , y: point.y } ;
		}
	}
} ;



/*
	Set utilities.
*/



function findInSet( set_ , fn ) {
	for ( let element of set_ ) {
		if ( fn( element ) ) { return element ; }
	}
}

function findXYInSet( set_ , x , y ) {
	for ( let element of set_ ) {
		if ( element.x === x && element.y === y ) { return element ; }
	}
}

function findXYWHInSet( set_ , x , y , w , h , array = [] ) {
	for ( let element of set_ ) {
		if ( element.x >= x && element.x <= x + w && element.y >= y && element.y <= y + h ) {
			array.push( element ) ;
		}
	}

	return array ;
}



/*
	Debug stuffs
*/



const util = require( 'util' ) ;

QuadTree.prototype.debug = function( node = this.trunc , spaces = 0 , prefix = '━' , showValue = false ) {
	var i , iMax , str , point ,
		nextSpaces = spaces + 5 ;

	if ( ! node.children ) {
		if ( ! node.points || ! node.points.size ) {
			str = ' '.repeat( spaces ) + prefix + ' (empty)' ;
			console.log( str ) ;
			return ;
		}
		
		i = -1 ;
		iMax = node.points.size ;
		for ( point of node.points ) {
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

QuadTree.prototype.debugValues = function() { return this.debug( this.trunc , 0 , '━' , true ) ; } ;

