
/* global benchmark, competitor */

"use strict" ;



const QuadTree = require( '../lib/QuadTree.js' ) ;



/*
	Helpers
*/



// Generate data
function generateRawData( n ) {
	var i , array = new Array( n ) ;

	for ( i = 0 ; i < n ; i ++ ) {
		array[ i ] = [ Math.random() , Math.random() , '#' + i ] ;
	}

	return array ;
}



function generateRandomPoints( n ) {
	var i , array = new Array( n ) ;

	for ( i = 0 ; i < n ; i ++ ) {
		array[ i ] = [ Math.random() , Math.random() ] ;
	}

	return array ;
}



function generateRandomAreas( n , sizeLimit = 0.2 ) {
	var i , randomX , randomX2 , randomW , randomY , randomY2 , randomH ,
		array = new Array( n ) ;

	for ( i = 0 ; i < n ; i ++ ) {
		randomW = Math.random() * sizeLimit ;
		randomX = Math.random() * ( 1 - randomW ) ;

		randomH = Math.random() * sizeLimit ;
		randomY = Math.random() * ( 1 - randomH ) ;

		array[ i ] = [ randomX , randomY , randomW , randomH ] ;
	}

	return array ;
}



function rawDataClosest( array , x , y ) {
	var i , iMax , element , closest , squareDist , minSquareDist = Infinity ;

	for ( i = 0 , iMax = array.length ; i < iMax ; i ++ ) {
		element = array[ i ] ;
		squareDist = ( x - element[ 0 ] ) * ( x - element[ 0 ] ) + ( y - element[ 1 ] ) * ( y - element[ 1 ] ) ;
		if ( squareDist < minSquareDist ) {
			minSquareDist = squareDist ;
			closest = element ;
		}
	}

	return closest[ 2 ] ;
}



function rawDataArea( array , x , y , w , h ) {
	var i , iMax , element , result = [] ;

	for ( i = 0 , iMax = array.length ; i < iMax ; i ++ ) {
		element = array[ i ] ;
		if ( element[ 0 ] >= x && element[ 0 ] <= x + w && element[ 1 ] >= y && element[ 1 ] <= y + h ) {
			result[ result.length ] = element[ 2 ] ;
		}
	}

	return result ;
}



/*
	Benchmark
*/



function createClosestPointBenchmark( elementCount , testPointCount ) {
	benchmark( 'Closest point/element: QuadTree vs Array (' + elementCount + ' elements - ' + testPointCount + ' test points batch)' , () => {
		var rawData = generateRawData( elementCount ) ,
			testPoints = generateRandomPoints( testPointCount ) ,
			defaultTree = new QuadTree() ,
			tree4ppl = new QuadTree( { maxLeafPoints: 4 , minLeafPoints: 2 , minChildrenPoints: 3 } ) ,
			tree32ppl = new QuadTree( { maxLeafPoints: 32 } ) ,
			tree64ppl = new QuadTree( { maxLeafPoints: 64 } ) ,
			tree128ppl = new QuadTree( { maxLeafPoints: 128 } ) ;

		for ( let e of rawData ) {
			defaultTree.add( ... e ) ;
			tree4ppl.add( ... e ) ;
			tree32ppl.add( ... e ) ;
			tree64ppl.add( ... e ) ;
			tree128ppl.add( ... e ) ;
		}
		
		competitor( 'QuadTree with default params' , () => {
			var i , element ;

			for ( i = 0 ; i < testPointCount ; i ++ ) {
				element = defaultTree.getClosestTo( testPoints[ i ][ 0 ] , testPoints[ i ][ 1 ] ) ;
			}
		} ) ;

		competitor( 'QuadTree with maxLeafPoints: 4' , () => {
			var i , element ;

			for ( i = 0 ; i < testPointCount ; i ++ ) {
				element = tree4ppl.getClosestTo( testPoints[ i ][ 0 ] , testPoints[ i ][ 1 ] ) ;
			}
		} ) ;

		competitor( 'QuadTree with maxLeafPoints: 32' , () => {
			var i , element ;

			for ( i = 0 ; i < testPointCount ; i ++ ) {
				element = tree32ppl.getClosestTo( testPoints[ i ][ 0 ] , testPoints[ i ][ 1 ] ) ;
			}
		} ) ;

		competitor( 'QuadTree with maxLeafPoints: 64' , () => {
			var i , element ;

			for ( i = 0 ; i < testPointCount ; i ++ ) {
				element = tree64ppl.getClosestTo( testPoints[ i ][ 0 ] , testPoints[ i ][ 1 ] ) ;
			}
		} ) ;

		competitor( 'QuadTree with maxLeafPoints: 128' , () => {
			var i , element ;

			for ( i = 0 ; i < testPointCount ; i ++ ) {
				element = tree128ppl.getClosestTo( testPoints[ i ][ 0 ] , testPoints[ i ][ 1 ] ) ;
			}
		} ) ;

		competitor( 'Array' , () => {
			var i , element ;

			for ( i = 0 ; i < testPointCount ; i ++ ) {
				element = rawDataClosest( rawData , testPoints[ i ][ 0 ] , testPoints[ i ][ 1 ] ) ;
			}
		} ) ;
	} ) ;
}

createClosestPointBenchmark( 10 , 100 ) ;
createClosestPointBenchmark( 100 , 100 ) ;
createClosestPointBenchmark( 300 , 100 ) ;
createClosestPointBenchmark( 1000 , 100 ) ;
createClosestPointBenchmark( 10000 , 100 ) ;
createClosestPointBenchmark( 100000 , 100 ) ;



function createAreaPointsBenchmark( elementCount , testAreaCount , areaSize ) {
	benchmark( 'Area points/elements (axis aligned rectangular region): QuadTree vs Array (' + elementCount + ' elements - area side at most ' + Math.round( areaSize * 100 ) + '% of the total size - ' + testAreaCount + ' test areas batch)' , () => {
		var rawData = generateRawData( elementCount ) ,
			testAreas = generateRandomAreas( testAreaCount ) ,
			defaultTree = new QuadTree() ,
			tree4ppl = new QuadTree( { maxLeafPoints: 4 , minLeafPoints: 2 , minChildrenPoints: 3 } ) ,
			tree32ppl = new QuadTree( { maxLeafPoints: 32 } ) ,
			tree64ppl = new QuadTree( { maxLeafPoints: 64 } ) ,
			tree128ppl = new QuadTree( { maxLeafPoints: 128 } ) ;

		for ( let e of rawData ) {
			defaultTree.add( ... e ) ;
			tree4ppl.add( ... e ) ;
			tree32ppl.add( ... e ) ;
			tree64ppl.add( ... e ) ;
			tree128ppl.add( ... e ) ;
		}
		
		competitor( 'QuadTree with default params' , () => {
			var i , points ;

			for ( i = 0 ; i < testAreaCount ; i ++ ) {
				points = defaultTree.getAreaPoints( testAreas[ i ][ 0 ] , testAreas[ i ][ 1 ] , testAreas[ i ][ 2 ] , testAreas[ i ][ 3 ] ) ;
			}
		} ) ;

		competitor( 'QuadTree with default params getting the elements instead of the points' , () => {
			var i , elements ;

			for ( i = 0 ; i < testAreaCount ; i ++ ) {
				elements = defaultTree.getArea( testAreas[ i ][ 0 ] , testAreas[ i ][ 1 ] , testAreas[ i ][ 2 ] , testAreas[ i ][ 3 ] ) ;
			}
		} ) ;

		competitor( 'QuadTree with maxLeafPoints: 4' , () => {
			var i , points ;

			for ( i = 0 ; i < testAreaCount ; i ++ ) {
				points = tree4ppl.getAreaPoints( testAreas[ i ][ 0 ] , testAreas[ i ][ 1 ] , testAreas[ i ][ 2 ] , testAreas[ i ][ 3 ] ) ;
			}
		} ) ;

		competitor( 'QuadTree with maxLeafPoints: 32' , () => {
			var i , points ;

			for ( i = 0 ; i < testAreaCount ; i ++ ) {
				points = tree32ppl.getAreaPoints( testAreas[ i ][ 0 ] , testAreas[ i ][ 1 ] , testAreas[ i ][ 2 ] , testAreas[ i ][ 3 ] ) ;
			}
		} ) ;

		competitor( 'QuadTree with maxLeafPoints: 64' , () => {
			var i , points ;

			for ( i = 0 ; i < testAreaCount ; i ++ ) {
				points = tree64ppl.getAreaPoints( testAreas[ i ][ 0 ] , testAreas[ i ][ 1 ] , testAreas[ i ][ 2 ] , testAreas[ i ][ 3 ] ) ;
			}
		} ) ;

		competitor( 'QuadTree with maxLeafPoints: 128' , () => {
			var i , points ;

			for ( i = 0 ; i < testAreaCount ; i ++ ) {
				points = tree128ppl.getAreaPoints( testAreas[ i ][ 0 ] , testAreas[ i ][ 1 ] , testAreas[ i ][ 2 ] , testAreas[ i ][ 3 ] ) ;
			}
		} ) ;

		//*
		competitor( 'Array' , () => {
			var i , points ;

			for ( i = 0 ; i < testAreaCount ; i ++ ) {
				points = rawDataArea( rawData , testAreas[ i ][ 0 ] , testAreas[ i ][ 1 ] , testAreas[ i ][ 2 ] , testAreas[ i ][ 3 ] ) ;
			}
		} ) ;
		//*/
	} ) ;
}



createAreaPointsBenchmark( 10 , 100 , 0.01 ) ;
createAreaPointsBenchmark( 100 , 100 , 0.01 ) ;
createAreaPointsBenchmark( 300 , 100 , 0.01 ) ;
createAreaPointsBenchmark( 1000 , 100 , 0.01 ) ;
createAreaPointsBenchmark( 10000 , 100 , 0.01 ) ;
createAreaPointsBenchmark( 100000 , 100 , 0.01 ) ;

createAreaPointsBenchmark( 10 , 100 , 0.05 ) ;
createAreaPointsBenchmark( 100 , 100 , 0.05 ) ;
createAreaPointsBenchmark( 300 , 100 , 0.05 ) ;
createAreaPointsBenchmark( 1000 , 100 , 0.05 ) ;
createAreaPointsBenchmark( 10000 , 100 , 0.05 ) ;
createAreaPointsBenchmark( 100000 , 100 , 0.05 ) ;

createAreaPointsBenchmark( 10 , 100 , 0.2 ) ;
createAreaPointsBenchmark( 100 , 100 , 0.2 ) ;
createAreaPointsBenchmark( 300 , 100 , 0.2 ) ;
createAreaPointsBenchmark( 1000 , 100 , 0.2 ) ;
createAreaPointsBenchmark( 10000 , 100 , 0.2 ) ;
createAreaPointsBenchmark( 100000 , 100 , 0.2 ) ;



// Really slow tests

//*/
createClosestPointBenchmark( 400000 , 100 ) ;
createAreaPointsBenchmark( 400000 , 100 , 0.01 ) ;
createAreaPointsBenchmark( 400000 , 100 , 0.05 ) ;
createAreaPointsBenchmark( 400000 , 100 , 0.2 ) ;
//*/

