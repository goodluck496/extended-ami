export function _isUndefined( value: any ): boolean {
	return value === undefined;
}

export function _isNull( value: any ): boolean {
	return value === null;
}

export function _isEmpty( value: any ): boolean {

	if( _isNull( value ) ) return true;
	if( _isUndefined( value ) ) return true;
	if( _isUndefined( value.length ) ) return true;
	else if( value.length == 0 ) return true;

	return false;
}

export function _isNaN( value: any ): boolean {
	return _isNumber( value ) && value != +value;
}

export function _isNumber( value: any ): boolean {
	return typeof  +value === "number";
}

export function _toNumber( value: any ): number {

	if( _isNull( value ) ) return null;
	if( _isUndefined( value ) ) return null;
	if( _isNaN( value ) ) return null;

	return ( _isNumber( value ) ) ? +value : null;
}

export function _isFinite( value: number ): boolean {
	if( _isUndefined( value ) ) return false;
	if( _isNull( value ) ) return false;
	if( _isNaN( value ) ) return false;

	if( _isNumber( value ) ) return true;
}

export function _indexOfArray( array: any[], value: any ): number {

	for( let i = 0; i < array.length; i++ ) {

		let item = array[ i ];

		for( let key in item ) {

			if( item[ key ] == value ) return i;

		}
	}

	return -1;
}