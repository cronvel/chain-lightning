
/* global benchmark, competitor */



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

	return closest ;
}



function rawDataArea( array , x , y , w , h ) {
	var element , result = [] ;

	for ( element of array ) {
		if ( element[ 0 ] >= x && element[ 0 ] <= x + w && element[ 1 ] >= y && element[ 1 ] <= y + h ) {
			result.push( element ) ;
		}
	}

	result.sort( ( a , b ) => a[ 0 ] === b[ 0 ] ? a[ 1 ] - b[ 1 ] : a[ 0 ] - b[ 0 ] ) ;

	return result ;
}



/*
	Benchmark
*/



function createClosestPointBenchmark( elementCount , testPointCount ) {
	benchmark( 'Closest point: QuadTree vs Array (' + elementCount + ' elements - ' + testPointCount + ' test points batch)' , () => {
		var rawData = generateRawData( elementCount ) ,
			testPoints = generateRandomPoints( testPointCount ) ,
			defaultTree = new QuadTree() ,
			tree4ppl = new QuadTree( { maxLeafPoints: 4 , minLeafPoints: 2 , minChildrenPoints: 3 } ) ,
			tree32ppl = new QuadTree( { maxLeafPoints: 32 } ) ;
			tree64ppl = new QuadTree( { maxLeafPoints: 64 } ) ;
			tree128ppl = new QuadTree( { maxLeafPoints: 128 } ) ;

		for ( let e of rawData ) {
			defaultTree.add( ... e ) ;
			tree4ppl.add( ... e ) ;
			tree32ppl.add( ... e ) ;
			tree64ppl.add( ... e ) ;
			tree128ppl.add( ... e ) ;
		}
		
		competitor( 'QuadTree with default values' , () => {
			var i , point ;

			for ( i = 0 ; i < testPointCount ; i ++ ) {
				point = defaultTree.getClosestPoint( testPoints[ i ][ 0 ] , testPoints[ i ][ 1 ] ) ;
			}
		} ) ;

		competitor( 'QuadTree with maxLeafPoints: 4' , () => {
			var i , point ;

			for ( i = 0 ; i < testPointCount ; i ++ ) {
				point = tree4ppl.getClosestPoint( testPoints[ i ][ 0 ] , testPoints[ i ][ 1 ] ) ;
			}
		} ) ;

		competitor( 'QuadTree with maxLeafPoints: 32' , () => {
			var i , point ;

			for ( i = 0 ; i < testPointCount ; i ++ ) {
				point = tree32ppl.getClosestPoint( testPoints[ i ][ 0 ] , testPoints[ i ][ 1 ] ) ;
			}
		} ) ;

		competitor( 'QuadTree with maxLeafPoints: 64' , () => {
			var i , point ;

			for ( i = 0 ; i < testPointCount ; i ++ ) {
				point = tree64ppl.getClosestPoint( testPoints[ i ][ 0 ] , testPoints[ i ][ 1 ] ) ;
			}
		} ) ;

		competitor( 'QuadTree with maxLeafPoints: 128' , () => {
			var i , point ;

			for ( i = 0 ; i < testPointCount ; i ++ ) {
				point = tree128ppl.getClosestPoint( testPoints[ i ][ 0 ] , testPoints[ i ][ 1 ] ) ;
			}
		} ) ;

		competitor( 'Array' , () => {
			var i , point ;

			for ( i = 0 ; i < testPointCount ; i ++ ) {
				point = rawDataClosest( rawData , testPoints[ i ][ 0 ] , testPoints[ i ][ 1 ] ) ;
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

